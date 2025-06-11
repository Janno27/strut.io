export interface AgentSlot {
  id: string;
  agent_id: string;
  start_datetime: string;
  end_datetime: string;
  title?: string;
  description?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  slot_id: string;
  start_datetime: string;
  end_datetime: string;
  model_name: string;
  model_email?: string;
  model_phone?: string;
  model_instagram?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SlotWithAppointment extends AgentSlot {
  appointment?: Appointment;
}

export interface CreateSlotData {
  start_datetime: string;
  end_datetime: string;
  title?: string;
  description?: string;
  is_available?: boolean;
}

export interface CreateAppointmentData {
  slot_id: string;
  start_datetime: string;
  end_datetime: string;
  model_name: string;
  model_email?: string;
  model_phone?: string;
  model_instagram?: string;
  notes?: string;
} 