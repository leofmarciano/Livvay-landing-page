import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getClientIp } from '@/lib/rate-limit';

const trackSchema = z.object({
  code: z
    .string()
    .min(1, { message: 'Código é obrigatório' })
    .transform((val) => val.toUpperCase().trim()),
  referrer: z.string().optional(),
});

/**
 * Parse user agent to extract device info
 */
function parseUserAgent(userAgent: string | null): {
  deviceType: string;
  browser: string;
  os: string;
} {
  if (!userAgent) {
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  const ua = userAgent.toLowerCase();

  // Device type
  let deviceType = 'desktop';
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
    deviceType = /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile';
  }

  // Browser
  let browser = 'unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'safari';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('edg')) browser = 'edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'opera';

  // OS
  let os = 'unknown';
  if (ua.includes('windows')) os = 'windows';
  else if (ua.includes('mac os') || ua.includes('macos')) os = 'macos';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'ios';
  else if (ua.includes('android')) os = 'android';
  else if (ua.includes('linux')) os = 'linux';

  return { deviceType, browser, os };
}

/**
 * POST /api/referral/track
 * Public endpoint to track a visit to a referral link
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = trackSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const { code, referrer } = result.data;

    // Get client info
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent');
    const { deviceType, browser, os } = parseUserAgent(userAgent);

    // Track the visit using the database function
    const { data, error } = await supabaseAdmin.rpc('track_referral_visit', {
      p_code: code,
      p_ip_address: ip,
      p_user_agent: userAgent,
      p_referrer: referrer || null,
      p_country: null, // Could be enriched with IP geolocation service
      p_city: null,
      p_device_type: deviceType,
      p_browser: browser,
      p_os: os,
    });

    if (error) {
      console.error('[Track] Error tracking visit:', error);
      return NextResponse.json({ error: 'Erro ao registrar visita' }, { status: 500 });
    }

    // Check if code was found
    if (!data || data.length === 0 || !data[0].success) {
      return NextResponse.json(
        { valid: false, message: 'Código inválido ou inativo' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: data[0].code,
    });
  } catch (error) {
    console.error('[Track] Error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
