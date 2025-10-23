const APPOINTMENTS_KEY = 'patient_appointments';

export const storageService = {
  getAppointments: (): any[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(APPOINTMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveAppointment: (appointment: any) => {
    const appointments = storageService.getAppointments();
    const existingIndex = appointments.findIndex(a => a.id === appointment.id);
    
    if (existingIndex >= 0) {
      appointments[existingIndex] = appointment;
    } else {
      appointments.push(appointment);
    }
    
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  },

  deleteAppointment: (appointmentId: string) => {
    const appointments = storageService.getAppointments();
    const filtered = appointments.filter(a => a.id !== appointmentId);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(filtered));
  }
};