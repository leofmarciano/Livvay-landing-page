/**
 * Clinic Scheduling System Types
 *
 * Types for appointments, blocks, and schedule management.
 */

// ============================================================================
// Status Enums
// ============================================================================

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export type CancellationInitiator = 'patient' | 'professional' | 'system';

export type BlockType = 'vacation' | 'holiday' | 'personal' | 'other';

export type ProfessionalType = 'doctor' | 'nutritionist' | 'therapist';

// ============================================================================
// Appointment Types
// ============================================================================

export interface Appointment {
  id: string;
  livvay_user_id: string;
  clinic_profile_id: string;
  professional_type: ProfessionalType;
  appointment_date: string; // YYYY-MM-DD
  slot_start: string; // HH:MM
  slot_end: string; // HH:MM
  timezone: string;
  video_link: string | null;
  status: AppointmentStatus;
  cancelled_at: string | null;
  cancelled_by: CancellationInitiator | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentListItem {
  id: string;
  livvay_user_id: string;
  appointment_date: string;
  slot_start: string;
  slot_end: string;
  status: AppointmentStatus;
  video_link: string | null;
  created_at: string;
}

// ============================================================================
// Schedule Types
// ============================================================================

export interface ScheduleEntry {
  appointment_id: string;
  livvay_user_id: string;
  appointment_date: string;
  slot_start: string;
  slot_end: string;
  status: AppointmentStatus;
  video_link: string | null;
  created_at: string;
}

export interface AvailableSlot {
  date: string;
  start: string;
  end: string;
  available_spots: number;
}

// ============================================================================
// Block Types
// ============================================================================

export interface Block {
  id: string;
  block_date: string;
  start_time: string | null; // null = full day block
  end_time: string | null;
  block_type: BlockType;
  reason: string | null;
  created_at: string;
}

export interface CreateBlockInput {
  block_date: string;
  start_time?: string | null;
  end_time?: string | null;
  block_type: BlockType;
  reason?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ProfessionalInfo {
  id: string;
  full_name: string;
  professional_type: ProfessionalType;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// GET /api/clinic/schedule
export interface ScheduleResponse {
  schedule: ScheduleEntry[];
  professional: ProfessionalInfo;
}

// GET /api/clinic/schedule/availability
export interface AvailabilityResponse {
  slots: AvailableSlot[];
  professional: ProfessionalInfo;
  query: {
    start_date: string;
    end_date: string;
  };
}

// GET /api/clinic/appointments
export interface AppointmentsResponse {
  appointments: AppointmentListItem[];
  pagination: Pagination;
  professional: ProfessionalInfo;
}

// GET /api/clinic/appointments/[id]
export interface AppointmentDetailResponse {
  appointment: Appointment;
}

// DELETE /api/clinic/appointments/[id]
export interface CancelAppointmentResponse {
  success: boolean;
  message: string;
}

// GET /api/clinic/blocks
export interface BlocksResponse {
  blocks: Block[];
}

// POST /api/clinic/blocks
export interface CreateBlockResponse {
  success: boolean;
  block_id: string;
  message: string;
}

// DELETE /api/clinic/blocks/[id]
export interface DeleteBlockResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Patient Types
// ============================================================================

export interface PatientClaim {
  claim_id: string;
  livvay_user_id: string;
  professional_type: ProfessionalType;
  claimed_at: string;
  can_change_at: string;
  scheduled_count: number;
  completed_count: number;
  cancelled_count: number;
  last_appointment_date: string | null;
}

// GET /api/clinic/patients
export interface PatientsResponse {
  patients: PatientClaim[];
  pagination: Pagination;
  professional: ProfessionalInfo;
}

// ============================================================================
// UI Helper Types
// ============================================================================

export interface AppointmentStats {
  today: number;
  week: number;
  month: number;
  total: number;
}

export interface DayScheduleSummary {
  date: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  isFullyBlocked: boolean;
}

// Status badge configuration
export const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: string; bgColor: string }
> = {
  scheduled: {
    label: 'Agendado',
    color: 'text-brand',
    bgColor: 'bg-brand/10',
  },
  completed: {
    label: 'Concluído',
    color: 'text-foreground-muted',
    bgColor: 'bg-surface-200',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  no_show: {
    label: 'Não compareceu',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
};

// Block type labels
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  vacation: 'Férias',
  holiday: 'Feriado',
  personal: 'Pessoal',
  other: 'Outro',
};

// ============================================================================
// Date/Time Helpers
// ============================================================================

/**
 * Format date for display (DD/MM/YYYY)
 */
export function formatDateBR(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Format time for display (HH:MM)
 */
export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date N days from now in YYYY-MM-DD format
 */
export function getDateOffsetISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Check if a date is in the past
 */
export function isPastDate(dateStr: string): boolean {
  const today = getTodayISO();
  return dateStr < today;
}

/**
 * Check if a date is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayISO();
}
