import React, { useEffect, useState } from 'react';
import { db, collection, query, where, getDocs, orderBy, limit } from '../firebase';
import { useAuth } from './AuthGuard';
import { Script } from '../types';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Users as UsersIcon,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Archive
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const StatCard: React.FC<{ 
  label: string; 
  value: number | string; 
  icon: React.ReactNode; 
  color: string;
  subtext?: string;
}> = ({ label, value, icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={StatCard.displayName}>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
    {subtext && (
      <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
        <TrendingUp size={14} />
        <span>{subtext}</span>
      </div>
    )}
  </div>
);

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    approved: 0,
    totalCreators: 0
  });
  const [recentScripts, setRecentScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const scriptsRef = collection(db, 'scripts');
        
        // Today's scripts
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayQuery = query(scriptsRef, where('createdAt', '>=', today.toISOString()));
        const todaySnap = await getDocs(todayQuery);
        
        // Pending scripts
        const pendingQuery = query(scriptsRef, where('status', '==', 'pending'));
        const pendingSnap = await getDocs(pendingQuery);
        
        // Approved scripts
        const approvedQuery = query(scriptsRef, where('status', '==', 'approved'));
        const approvedSnap = await getDocs(approvedQuery);
        
        // Total creators (admin only)
        let creatorCount = 0;
        if (profile?.role === 'admin') {
          const usersRef = collection(db, 'users');
          const usersSnap = await getDocs(usersRef);
          creatorCount = usersSnap.size;
        }

        // Recent scripts
        const recentQuery = query(scriptsRef, orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(recentQuery);
        const scripts = recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Script));

        setStats({
          today: todaySnap.size,
          pending: pendingSnap.size,
          approved: approvedSnap.size,
          totalCreators: creatorCount
        });
        setRecentScripts(scripts);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Selamat datang kembali, {profile?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Script Hari Ini" 
          value={stats.today} 
          icon={<FileText className="text-indigo-600" size={24} />} 
          color="bg-indigo-50"
          subtext="Baru diajukan hari ini"
        />
        <StatCard 
          label="Script Pending" 
          value={stats.pending} 
          icon={<Clock className="text-yellow-600" size={24} />} 
          color="bg-yellow-50"
          subtext="Menunggu review"
        />
        <StatCard 
          label="Script Approved" 
          value={stats.approved} 
          icon={<CheckCircle2 className="text-green-600" size={24} />} 
          color="bg-green-50"
          subtext="Siap diproduksi"
        />
        <StatCard 
          label="Total Creator" 
          value={stats.totalCreators} 
          icon={<UsersIcon className="text-blue-600" size={24} />} 
          color="bg-blue-50"
          subtext="Tim konten aktif"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Script Terbaru</h3>
            <Link to="/archive" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3">Judul</th>
                  <th className="px-6 py-3">Brand</th>
                  <th className="px-6 py-3">Creator</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentScripts.map((script) => (
                  <tr key={script.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/script/${script.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                        {script.judul}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{script.brand}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{script.creatorName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        script.status === 'approved' ? 'bg-green-100 text-green-700' :
                        script.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        script.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {script.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentScripts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada script yang diajukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-6">Aktivitas Cepat</h3>
          <div className="space-y-4">
            <Link 
              to="/submit" 
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
            >
              <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <PlusCircle size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Buat Script Baru</p>
                <p className="text-xs text-slate-500">Ajukan pengajuan konten baru</p>
              </div>
            </Link>
            <Link 
              to="/archive" 
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
            >
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Archive size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Arsip Script</p>
                <p className="text-xs text-slate-500">Lihat database konten</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
