import React, { useState } from 'react';
import { db, collection, addDoc, serverTimestamp, writeBatch, doc } from '../firebase';
import { useAuth } from './AuthGuard';
import { STRUKTUR_OPTIONS, ScriptSection } from '../types';
import { Plus, Trash2, Save, Send, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const ScriptForm: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [judul, setJudul] = useState('');
  const [brand, setBrand] = useState('');
  const [linkReferensi, setLinkReferensi] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [sections, setSections] = useState<Omit<ScriptSection, 'id'>[]>([
    { struktur: 'Hook', footage: '', scriptTeks: '', keterangan: '', order: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSection = () => {
    setSections([...sections, { 
      struktur: 'Hook', 
      footage: '', 
      scriptTeks: '', 
      keterangan: '', 
      order: sections.length 
    }]);
  };

  const removeSection = (index: number) => {
    if (sections.length === 1) return;
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const updateSection = (index: number, field: keyof Omit<ScriptSection, 'id'>, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return;
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const handleSubmit = async (status: 'draft' | 'pending') => {
    if (!judul || !brand) {
      toast.error('Judul dan Brand harus diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      const scriptData = {
        judul,
        brand,
        linkReferensi,
        tanggal,
        status,
        creatorId: profile?.userId,
        creatorName: profile?.name,
        createdAt: new Date().toISOString()
      };

      const scriptRef = await addDoc(collection(db, 'scripts'), scriptData);
      
      const batch = writeBatch(db);
      sections.forEach((section, index) => {
        const sectionRef = doc(collection(db, `scripts/${scriptRef.id}/sections`));
        batch.set(sectionRef, { ...section, order: index });
      });
      
      await batch.commit();
      
      toast.success(status === 'pending' ? 'Script berhasil diajukan!' : 'Script disimpan sebagai draft');
      navigate('/archive');
    } catch (error) {
      console.error('Error submitting script:', error);
      toast.error('Gagal menyimpan script');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pengajuan Script Baru</h2>
          <p className="text-slate-500">Buat script konten kreatif untuk brand Anda.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            Simpan Draft
          </button>
          <button
            onClick={() => handleSubmit('pending')}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
          >
            <Send size={18} />
            Ajukan Script
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Judul Konten</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Review Produk Skincare Viral"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Contoh: Wardah"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Link Referensi</label>
            <input
              type="url"
              value={linkReferensi}
              onChange={(e) => setLinkReferensi(e.target.value)}
              placeholder="https://tiktok.com/..."
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Tanggal Target</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Struktur Script</h3>
          <button
            onClick={addSection}
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            <Plus size={18} />
            Tambah Section
          </button>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <select
                    value={section.struktur}
                    onChange={(e) => updateSection(index, 'struktur', e.target.value)}
                    className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    {STRUKTUR_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => moveSection(index, 'up')} className="p-1 text-slate-400 hover:text-indigo-600"><ChevronUp size={18}/></button>
                  <button onClick={() => moveSection(index, 'down')} className="p-1 text-slate-400 hover:text-indigo-600"><ChevronDown size={18}/></button>
                  <button 
                    onClick={() => removeSection(index)}
                    className="p-1 text-slate-400 hover:text-red-600 ml-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Footage / Visual</label>
                  <textarea
                    value={section.footage}
                    onChange={(e) => updateSection(index, 'footage', e.target.value)}
                    placeholder="Deskripsikan visual yang akan ditampilkan..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Script Teks / Audio</label>
                  <textarea
                    value={section.scriptTeks}
                    onChange={(e) => updateSection(index, 'scriptTeks', e.target.value)}
                    placeholder="Tulis dialog atau voiceover di sini..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan Tambahan</label>
                  <input
                    type="text"
                    value={section.keterangan}
                    onChange={(e) => updateSection(index, 'keterangan', e.target.value)}
                    placeholder="Catatan untuk editor atau talent..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
