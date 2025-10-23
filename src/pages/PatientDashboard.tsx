import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, FileText, Heart, LogOut, Search } from 'lucide-react';
import { Appointment, Doctor } from './components/patient/types';
import { storageService } from './components/patient/storage';
import { doctors, initialAppointments, medicalRecords } from './components/patient/mockData';
import DoctorCard from './components/patient/components/DoctorCard';
import AppointmentCard from './components/patient/components/AppointmentCard';
import BookingModal from './components/patient/components/BookingModal';


type View = 'dashboard' | 'doctors' | 'appointments' | 'records';

export default function PatientDashboard() {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const items = [
    { id: "dashboard", label: "Dashboard", icon: Heart },
    { id: "doctors", label: "Find Doctors", icon: Users },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "records", label: "Medical Records", icon: FileText },
  ] as const;

  useEffect(() => {
    // Load appointments from localStorage or use initial data
    const storedAppointments = storageService.getAppointments();
    if (storedAppointments.length > 0) {
      setAppointments(storedAppointments);
    } else {
      setAppointments(initialAppointments);
      initialAppointments.forEach(app => storageService.saveAppointment(app));
    }
  }, []);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingAppointments = appointments.filter(apt =>
    apt.status === 'scheduled' && new Date(apt.date) >= new Date()
  );

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setEditingAppointment(null);
    setIsBookingModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    const doctor = doctors.find(d => d.id === appointment.doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setEditingAppointment(appointment);
      setIsBookingModalOpen(true);
    }
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      storageService.deleteAppointment(appointmentId);
    }
  };

  const handleConfirmBooking = (appointmentData: Omit<Appointment, 'id' | 'patientId'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: editingAppointment ? editingAppointment.id : `apt-${Date.now()}`,
      patientId: profile?.id || 'patient1'
    };

    setAppointments(prev => {
      const filtered = editingAppointment
        ? prev.filter(apt => apt.id !== editingAppointment.id)
        : prev;
      return [...filtered, newAppointment];
    });

    storageService.saveAppointment(newAppointment);
    setIsBookingModalOpen(false);
    setSelectedDoctor(null);
    setEditingAppointment(null);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-slate-800">{upcomingAppointments.length}</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Upcoming Appointments</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-slate-800">{medicalRecords.length}</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Medical Records</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-slate-800">Good</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Health Status</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-slate-800">{doctors.length}</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Available Doctors</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Appointments</h2>
          <div className="space-y-4">
            {upcomingAppointments.slice(0, 3).map(appointment => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{appointment.doctorName}</p>
                  <p className="text-sm text-slate-600">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Scheduled
                </span>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <p className="text-slate-500 text-center py-4">No upcoming appointments</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentView('doctors')}
              className="w-full bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left hover:bg-white/30 transition-colors"
            >
              <h3 className="font-medium">Book New Appointment</h3>
              <p className="text-blue-100 text-sm mt-1">Find and book with available doctors</p>
            </button>
            <button
              onClick={() => setCurrentView('appointments')}
              className="w-full bg-white/20 backdrop-blur-sm rounded-lg p-4 text-left hover:bg-white/30 transition-colors"
            >
              <h3 className="font-medium">View My Appointments</h3>
              <p className="text-blue-100 text-sm mt-1">Manage your scheduled visits</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDoctors = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-800">Find a Doctor</h2>
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, specialty, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDoctors.map(doctor => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onBookAppointment={handleBookAppointment}
          />
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No doctors found</h3>
          <p className="text-slate-500">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">My Appointments</h2>
        <p className="text-slate-600">Manage your scheduled visits and medical appointments</p>
      </div>

      <div className="space-y-4">
        {appointments.map(appointment => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onEdit={handleEditAppointment}
            onDelete={handleDeleteAppointment}
          />
        ))}

        {appointments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No appointments scheduled</h3>
            <p className="text-slate-500 mb-4">Book your first appointment to get started</p>
            <button
              onClick={() => setCurrentView('doctors')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Find a Doctor
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderMedicalRecords = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Medical Records</h2>
        <p className="text-slate-600">Your health history and medical documents</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {medicalRecords.map(record => (
          <div key={record.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{record.diagnosis}</h3>
                <p className="text-slate-600 mb-1">Seen by {record.doctor}</p>
                <p className="text-sm text-slate-500">
                  {new Date(record.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-slate-700 mb-1">Treatment</h4>
                <p className="text-slate-600">{record.treatment}</p>
              </div>

              {record.prescriptions.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">Prescriptions</h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {record.prescriptions.map((prescription, index) => (
                      <li key={index}>{prescription}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200 p-1">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-row justify-between items-center sm:h-16 gap-3 sm:gap-0 py-2 sm:py-0">

            {/* Left: Logo and Title */}
            <div className="flex items-center">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-slate-800">
                Patient Portal
              </span>
            </div>

            {/* Right: Profile + Button */}
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <div className="text-center sm:text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-800 truncate max-w-[140px] sm:max-w-none">
                  {profile?.full_name}
                </p>
                <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
              </div>

              <button
                onClick={() => signOut()}
                className="flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-8">
          <div className="flex justify-between sm:justify-start sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible -mx-1 px-1">
            {items.map(({ id, label, icon: Icon }) => {
              const active = currentView === id;
              return (
                <button
                  key={id}
                  onClick={() => setCurrentView(id as View)}
                  className={`
                flex flex-col items-center justify-center sm:flex-row sm:justify-start
                text-sm font-medium rounded-lg transition-colors flex-shrink-0
                ${active ? "text-blue-600" : "text-slate-700 hover:text-blue-600"}
                px- py-2 sm:px-4 sm:py-2
              `}
                >
                  <Icon
                    className={`w-5 h-5 mb-1 sm:mb-0 sm:mr-2 ${active ? "text-blue-600" : "text-slate-500"
                      }`}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] sm:text-lg">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main>
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'doctors' && renderDoctors()}
          {currentView === 'appointments' && renderAppointments()}
          {currentView === 'records' && renderMedicalRecords()}
        </main>
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <BookingModal

          doctor={selectedDoctor}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedDoctor(null);
            setEditingAppointment(null);
          }}
          onConfirm={handleConfirmBooking}
          existingAppointment={editingAppointment || undefined}
        />
      )}
    </div>
  );
}