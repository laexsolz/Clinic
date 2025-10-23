import { useState } from 'react';
import { Doctor, TimeSlot, Appointment } from '../types';
import { X, Calendar, Clock } from 'lucide-react';

interface BookingModalProps {
  doctor: Doctor;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appointment: Omit<Appointment, 'id' | 'patientId'>) => void;
  existingAppointment?: Appointment;
}

export default function BookingModal({ 
  doctor, 
  isOpen, 
  onClose, 
  onConfirm,
  existingAppointment 
}: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(
    existingAppointment ? {
      id: 'existing',
      date: existingAppointment.date,
      startTime: existingAppointment.time,
      endTime: '',
      available: true
    } : null
  );
  const [reason, setReason] = useState(existingAppointment?.reason || '');
  const [notes, setNotes] = useState(existingAppointment?.notes || '');

  if (!isOpen) return null;

  // Creates a DOM toast so it survives modal unmount
  const createToast = (message: string, variant: 'success' | 'info' = 'success') => {
    if (typeof document === 'undefined') return;
    const toast = document.createElement('div');

    // Tailwind classes — these assume Tailwind is available globally
    const base = 'fixed z-[9999] right-6 bottom-6 rounded-lg px-4 py-2 shadow-lg transition-all duration-300 transform';
    const variants: Record<string,string> = {
      success: 'bg-green-600 text-white',
      info: 'bg-blue-600 text-white'
    };
    toast.className = `${base} ${variants[variant]} opacity-0 translate-y-2`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // trigger enter transition
    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', 'translate-y-2');
      toast.classList.add('opacity-100', 'translate-y-0');
    });

    // hide after 3s
    setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'translate-y-2');
      // remove after transition
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    // Prepare appointment payload (same shape you used before)
    const payload: Omit<Appointment, 'id' | 'patientId'> = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      date: selectedSlot.date,
      time: selectedSlot.startTime,
      status: 'scheduled',
      reason,
      notes: notes || undefined
    };

    // Call parent handler (this may close the modal)
    onConfirm(payload);

    // Show toast — text differs for new booking vs reschedule
    if (existingAppointment) {
      createToast('Appointment rescheduled successfully', 'info');
    } else {
      createToast('Appointment booked successfully', 'success');
    }
  };

  const groupSlotsByDate = () => {
    const grouped: { [key: string]: TimeSlot[] } = {};
    doctor.availability.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const groupedSlots = groupSlotsByDate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            {existingAppointment ? 'Reschedule Appointment' : 'Book Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-slate-800">{doctor.name}</h3>
              <p className="text-slate-600">{doctor.specialty}</p>
              <p className="text-sm text-slate-500">{doctor.department}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select Date & Time
              </label>
              <div className="space-y-4">
                {Object.entries(groupedSlots).map(([date, slots]) => (
                  <div key={date} className="border border-slate-200 rounded-lg">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <div className="flex items-center text-slate-700 font-medium">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {slots.map(slot => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            selectedSlot?.id === slot.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-center text-sm font-medium">
                            <Clock className="w-4 h-4 mr-1" />
                            {slot.startTime}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-2">
                Reason for Visit
              </label>
              <input
                type="text"
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Briefly describe the reason for your visit"
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional information you'd like to share..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedSlot || !reason}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {existingAppointment ? 'Reschedule Appointment' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
