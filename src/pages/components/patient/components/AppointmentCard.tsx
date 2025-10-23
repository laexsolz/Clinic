
import { Calendar, Clock, MapPin, Edit3, Trash2 } from 'lucide-react';
import { Appointment } from '../types';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
}

export default function AppointmentCard({ appointment, onEdit, onDelete }: AppointmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
            <h3 className="text-lg font-semibold text-slate-800">{appointment.doctorName}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)} mt-2 sm:mt-0`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>
          
          <p className="text-slate-600 mb-2">{appointment.doctorSpecialty}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              <span>{formatDate(appointment.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              <span>{appointment.time}</span>
            </div>
          </div>
          
          {appointment.reason && (
            <div className="mt-3">
              <p className="text-sm text-slate-700">
                <strong>Reason:</strong> {appointment.reason}
              </p>
            </div>
          )}
          
          {appointment.notes && (
            <div className="mt-2">
              <p className="text-sm text-slate-600">
                <strong>Notes:</strong> {appointment.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-100">
        <button
          onClick={() => onEdit(appointment)}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Reschedule
        </button>
        <button
          onClick={() => onDelete(appointment.id)}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );
}