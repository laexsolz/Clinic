import { Star, MapPin, Clock } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment: (doctor: Doctor) => void;
}

export default function DoctorCard({ doctor, onBookAppointment }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-20 h-20 rounded-full object-cover flex-shrink-0 mx-auto sm:mx-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 truncate">{doctor.name}</h3>
              <p className="text-blue-600 font-medium">{doctor.specialty}</p>
            </div>
            <div className="flex items-center mt-2 sm:mt-0">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-slate-700 ml-1">{doctor.rating}</span>
              <span className="text-sm text-slate-500 ml-2">({doctor.experience} yrs)</span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{doctor.department}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{doctor.availability.length} slots available</span>
            </div>
            <p className="text-xs text-slate-500">{doctor.education}</p>
          </div>

          <button
            onClick={() => onBookAppointment(doctor)}
            className="w-full sm:w-auto mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}