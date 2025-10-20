import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, Calendar, Users, ClipboardList, LogOut } from 'lucide-react';

export default function DoctorDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Stethoscope className="w-8 h-8 text-green-600" />
              <span className="ml-3 text-xl font-bold text-slate-800">Doctor Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{profile?.full_name}</p>
                <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Doctor Dashboard</h1>
          <p className="text-slate-600">Manage appointments and patient care</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">12</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600">Today's Appointments</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">45</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600">Active Patients</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <ClipboardList className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">8</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600">Pending Reports</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Doctor Features</h2>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-700">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                Patient Records
              </li>
              <li className="flex items-center text-slate-700">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                Appointment Management
              </li>
              <li className="flex items-center text-slate-700">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                Prescription Writing
              </li>
              <li className="flex items-center text-slate-700">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                Medical Reports
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Doctor Access</h2>
            <p className="text-green-100 mb-4">
              You have access to patient management and medical tools.
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-green-50">
                This dashboard is only accessible to doctors. Patients and admins cannot access doctor-specific features.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
