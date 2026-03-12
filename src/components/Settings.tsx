import React from 'react';
import { useAuth } from './AuthGuard';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export const Settings: React.FC = () => {
  const { profile, logout } = useAuth();

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500">Kelola profil dan preferensi akun Anda.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-indigo-600" />
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6">
            <img 
              src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.name}`} 
              alt={profile.name} 
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white"
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
              <p className="text-slate-500">{profile.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <Shield className="text-indigo-600" size={20} />
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Role</p>
                  <p className="font-semibold text-slate-700 capitalize">{profile.role}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <Calendar className="text-emerald-600" size={20} />
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Joined</p>
                  <p className="font-semibold text-slate-700">{format(new Date(profile.createdAt), 'dd MMM yyyy')}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
              >
                <LogOut size={20} />
                Logout dari Akun
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900">Informasi Aplikasi</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Versi</span>
            <span className="font-medium">1.0.0 (MVP)</span>
          </div>
          <div className="flex justify-between">
            <span>Environment</span>
            <span className="font-medium">Production</span>
          </div>
          <div className="flex justify-between">
            <span>Database</span>
            <span className="font-medium">Firebase Firestore</span>
          </div>
        </div>
      </div>
    </div>
  );
};
