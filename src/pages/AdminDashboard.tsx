import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, Activity, Settings, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-red-600" />
              <span className="ml-3 text-xl font-bold text-slate-800">Admin Portal</span>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Administrator Dashboard</h1>
          <p className="text-slate-600">Manage users, settings, and system configuration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">156</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600">Total Users</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">89%</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600">System Health</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">24</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600">Active Services</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Admin Features</h2>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-700">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                User Management
              </li>
              <li className="flex items-center text-slate-700">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                System Configuration
              </li>
              <li className="flex items-center text-slate-700">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                Access Control
              </li>
              <li className="flex items-center text-slate-700">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                Audit Logs
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Admin Access</h2>
            <p className="text-red-100 mb-4">
              You have full administrative privileges. Handle with care.
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-red-50">
                This dashboard is only accessible to administrators. Patients and doctors cannot view this page.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
