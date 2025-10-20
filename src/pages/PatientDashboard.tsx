import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, FileText, Heart, LogOut } from 'lucide-react';

export default function PatientDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-blue-600" />
              <span className="ml-3 text-xl font-bold text-slate-800">Patient Portal</span>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back!</h1>
          <p className="text-slate-600">View your appointments and health records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">3</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600">Upcoming Appointments</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">7</span>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Patient Features</h2>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                View Appointments
              </li>
              <li className="flex items-center text-slate-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                Access Medical Records
              </li>
              <li className="flex items-center text-slate-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                Book New Appointments
              </li>
              <li className="flex items-center text-slate-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                View Prescriptions
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Patient Access</h2>
            <p className="text-blue-100 mb-4">
              You have access to your personal health information and appointments.
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-50">
                This dashboard is personalized for patients. You cannot access doctor or admin areas.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
