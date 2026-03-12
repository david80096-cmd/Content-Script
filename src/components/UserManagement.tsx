import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, updateDoc, doc, onSnapshot, query, orderBy } from '../firebase';
import { useAuth } from './AuthGuard';
import { UserProfile, UserRole } from '../types';
import { Shield, User, Mail, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export const UserManagement: React.FC = () => {
  const { profile: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (currentUser?.role !== 'admin') return;

    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success('Role user berhasil diperbarui');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Gagal memperbarui role');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-slate-900">Akses Ditolak</h2>
        <p className="text-slate-500">Hanya admin yang dapat mengakses halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
        <p className="text-slate-500">Kelola role dan akses tim konten Anda.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : filteredUsers.map((user) => (
          <div key={user.userId} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name}`} 
                alt={user.name} 
                className="w-12 h-12 rounded-full border border-slate-100"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{user.name}</h3>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Shield size={16} className="text-slate-400" />
                <span className="font-medium">Role:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span className="font-medium">Joined:</span>
                <span>{format(new Date(user.createdAt), 'dd MMM yyyy')}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Ubah Role</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRoleChange(user.userId, 'creator')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    user.role === 'creator' 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Creator
                </button>
                <button
                  onClick={() => handleRoleChange(user.userId, 'admin')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    user.role === 'admin' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
