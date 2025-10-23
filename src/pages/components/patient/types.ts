export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'patient';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  image: string;
  rating: number;
  experience: number;
  education: string;
  availability: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  doctor: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
}