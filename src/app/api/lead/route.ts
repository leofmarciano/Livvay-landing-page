import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

interface Lead {
  id: string;
  email: string;
  source: string;
  answers?: Record<string, string>;
  createdAt: string;
}

interface LeadsData {
  leads: Lead[];
}

// Ensure data directory and file exist
async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await fs.access(LEADS_FILE);
  } catch {
    await fs.writeFile(LEADS_FILE, JSON.stringify({ leads: [] }, null, 2));
  }
}

// Read leads from file
async function readLeads(): Promise<LeadsData> {
  await ensureDataFile();
  const data = await fs.readFile(LEADS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Write leads to file
async function writeLeads(data: LeadsData): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(LEADS_FILE, JSON.stringify(data, null, 2));
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, answers } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validate source
    if (!source || typeof source !== 'string') {
      return NextResponse.json(
        { error: 'Source é obrigatório' },
        { status: 400 }
      );
    }

    // Create new lead
    const newLead: Lead = {
      id: generateId(),
      email: email.toLowerCase().trim(),
      source,
      answers: answers || undefined,
      createdAt: new Date().toISOString(),
    };

    // Read existing leads
    const data = await readLeads();

    // Check for duplicate email with same source
    const existingLead = data.leads.find(
      (lead) => lead.email === newLead.email && lead.source === newLead.source
    );

    if (existingLead) {
      // Update existing lead with new answers if provided
      if (answers) {
        existingLead.answers = answers;
        await writeLeads(data);
      }
      return NextResponse.json(
        { message: 'Lead já cadastrado', id: existingLead.id },
        { status: 200 }
      );
    }

    // Add new lead
    data.leads.push(newLead);
    await writeLeads(data);

    console.log(`[Lead] New lead captured: ${newLead.email} from ${source}`);

    return NextResponse.json(
      { message: 'Lead cadastrado com sucesso', id: newLead.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Lead] Error processing lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const data = await readLeads();
    return NextResponse.json({
      total: data.leads.length,
      leads: data.leads,
    });
  } catch (error) {
    console.error('[Lead] Error reading leads:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

