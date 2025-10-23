import { Doctor, Appointment, MedicalRecord } from './types';

export const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    department: 'Heart Center',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    experience: 15,
    education: 'MD, Harvard Medical School',
    availability: [
      { id: '1', date: '2026-01-15', startTime: '09:00', endTime: '10:00', available: true },
      { id: '2', date: '2026-01-15', startTime: '14:00', endTime: '15:00', available: true },
      { id: '3', date: '2026-01-16', startTime: '10:00', endTime: '11:00', available: true },
    ]
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Neurology',
    department: 'Brain & Spine',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    experience: 12,
    education: 'MD, Stanford University',
    availability: [
      { id: '4', date: '2026-01-15', startTime: '11:00', endTime: '12:00', available: true },
      { id: '5', date: '2026-01-16', startTime: '09:00', endTime: '10:00', available: true },
    ]
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrics',
    department: "Children's Health",
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    rating: 4.7,
    experience: 10,
    education: 'MD, Johns Hopkins University',
    availability: [
      { id: '6', date: '2026-01-17', startTime: '13:00', endTime: '14:00', available: true },
      { id: '7', date: '2026-01-18', startTime: '10:00', endTime: '11:00', available: true },
    ]
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: '1',
    patientId: 'patient1',
    doctorId: '1',
    doctorName: 'Dr. Sarah Johnson',
    doctorSpecialty: 'Cardiology',
    date: '2026-01-20',
    time: '10:00',
    status: 'scheduled',
    reason: 'Regular heart checkup',
    notes: 'Bring previous test results'
  },
  {
    id: '2',
    patientId: 'patient1',
    doctorId: '2',
    doctorName: 'Dr. Michael Chen',
    doctorSpecialty: 'Neurology',
    date: '2026-01-25',
    time: '14:00',
    status: 'scheduled',
    reason: 'Headache consultation'
  }
];

export const medicalRecords: MedicalRecord[] = [
  {
    id: '1',
    date: '2026-01-10',
    doctor: 'Dr. Sarah Johnson',
    diagnosis: 'Hypertension',
    treatment: 'Medication and lifestyle changes',
    prescriptions: ['Lisinopril 10mg', 'Amlodipine 5mg']
  },
  {
    id: '2',
    date: '2025-12-15',
    doctor: 'Dr. Michael Chen',
    diagnosis: 'Migraine',
    treatment: 'Preventive medication',
    prescriptions: ['Sumatriptan 50mg']
  }
];
