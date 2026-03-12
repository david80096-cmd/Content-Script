import React, { useEffect, useState } from 'react';
import { db, collection, query, where, getDocs, orderBy, onSnapshot } from '../firebase';
import { useAuth } from './AuthGuard';
import { Script, STATUS_COLORS } from '../types';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle,
  FileSpreadsheet,
  FileText as FileIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const ScriptArchive: React.FC = () => {
  const { profile } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');

  useEffect(() => {
    const scriptsRef = collection(db, 'scripts');
    let q = query(scriptsRef, orderBy('createdAt', 'desc'));

    if (profile?.role === 'creator') {
      q = query(scriptsRef, where('creatorId', '==', profile.userId), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scriptsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Script));
      setScripts(scriptsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.judul.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          script.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          script.creatorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || script.status === statusFilter;
    const matchesBrand = brandFilter === 'all' || script.brand === brandFilter;
    return matchesSearch && matchesStatus && matchesBrand;
  });

  const brands = Array.from(new Set(scripts.map(s => s.brand)));

  const exportToExcel = () => {
    const data = filteredScripts.map(s => ({
      Tanggal: s.tanggal,
      Brand: s.brand,
      Judul: s.judul,
      Creator: s.creatorName,
      Status: s.status,
      'Link Referensi': s.linkReferensi,
      'Dibuat Pada': format(new Date(s.createdAt), 'dd/MM/yyyy HH:mm')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scripts");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `Arsip_Script_${format(new Date(), 'ddMMyyyy')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Arsip Script Konten</h2>
          <p className="text-slate-500">Kelola dan pantau seluruh database script konten.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <FileSpreadsheet size={18} />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari judul, brand, atau creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-600"
            >
              <option value="all">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>
          </div>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-600"
          >
            <option value="all">Semua Brand</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Judul</th>
                <th className="px-6 py-4">Creator</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredScripts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Tidak ada script ditemukan.</td>
                </tr>
              ) : (
                filteredScripts.map((script) => (
                  <tr key={script.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-600">{script.tanggal}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{script.brand}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{script.judul}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{script.creatorName}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[script.status]}`}>
                        {script.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/script/${script.id}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        {profile?.role === 'admin' && script.status === 'pending' && (
                          <>
                            <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Approve">
                              <CheckCircle size={18} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Reject">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
