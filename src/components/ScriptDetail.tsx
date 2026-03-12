import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, doc, getDoc, updateDoc, collection, getDocs, query, orderBy } from '../firebase';
import { useAuth } from './AuthGuard';
import { Script, ScriptSection, STATUS_COLORS } from '../types';
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  User, 
  Tag, 
  CheckCircle, 
  XCircle,
  Download,
  FileText as FileIcon,
  Clock,
  Copy,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export const ScriptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [script, setScript] = useState<Script | null>(null);
  const [sections, setSections] = useState<ScriptSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchScript = async () => {
      if (!id) return;
      try {
        const scriptDoc = await getDoc(doc(db, 'scripts', id));
        if (scriptDoc.exists()) {
          setScript({ id: scriptDoc.id, ...scriptDoc.data() } as Script);
          
          const sectionsSnap = await getDocs(query(collection(db, `scripts/${id}/sections`), orderBy('order', 'asc')));
          const sectionsData = sectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScriptSection));
          setSections(sectionsData);
        } else {
          toast.error('Script tidak ditemukan');
          router.push('/archive');
        }
      } catch (error) {
        console.error('Error fetching script:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [id, router]);

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected', reason?: string) => {
    if (!id || !script) return;
    setIsSubmitting(true);
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'rejected' && reason) {
        updateData.rejectionReason = reason;
      }
      
      await updateDoc(doc(db, 'scripts', id), updateData);
      setScript({ ...script, ...updateData });
      setShowRejectModal(false);
      setRejectionReason('');
      toast.success(`Script ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Gagal memperbarui status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!script) return;
    
    let text = `${script.judul}\n`;
    text += `Brand: ${script.brand}\n`;
    text += `Creator: ${script.creatorName}\n`;
    text += `Tanggal: ${script.tanggal}\n\n`;
    text += `STRUKTUR SCRIPT\n`;
    text += `================\n\n`;
    
    sections.forEach((section, index) => {
      text += `${index + 1}. ${section.struktur}\n`;
      text += `Visual: ${section.footage || '-'}\n`;
      text += `Audio: ${section.scriptTeks}\n`;
      if (section.keterangan) text += `Ket: ${section.keterangan}\n`;
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    toast.success('Script disalin ke clipboard! Siap di-paste ke Google Docs.');
  };

  const exportToDocx = () => {
    if (!script) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: script.judul,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Brand: ${script.brand}`, bold: true }),
              new TextRun({ text: `\nCreator: ${script.creatorName}`, break: 1 }),
              new TextRun({ text: `\nTanggal: ${script.tanggal}`, break: 1 }),
              new TextRun({ text: `\nStatus: ${script.status}`, break: 1 }),
            ],
            spacing: { after: 400 },
          }),
          ...sections.flatMap(section => [
            new Paragraph({
              text: `${section.order + 1}. ${section.struktur}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Footage: ", bold: true }),
                new TextRun({ text: section.footage }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Script: ", bold: true }),
                new TextRun({ text: section.scriptTeks }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Keterangan: ", italics: true }),
                new TextRun({ text: section.keterangan }),
              ],
              spacing: { after: 200 },
            }),
          ])
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${script.judul.replace(/\s+/g, '_')}_Script.docx`);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!script) return null;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push('/archive')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Kembali ke Arsip
        </button>
        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            <Copy size={18} />
            Copy for Google Docs
          </button>
          <button
            onClick={exportToDocx}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            <Download size={18} />
            Export Word
          </button>
          {profile?.role === 'admin' && script.status === 'pending' && (
            <>
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                <XCircle size={18} />
                Reject
              </button>
              <button
                onClick={() => handleStatusUpdate('approved')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-colors"
              >
                <CheckCircle size={18} />
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      {script.status === 'rejected' && script.rejectionReason && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-red-800 mb-1">Alasan Penolakan</h4>
            <p className="text-red-700 text-sm">{script.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block ${STATUS_COLORS[script.status]}`}>
                {script.status}
              </span>
              <h1 className="text-3xl font-bold text-slate-900">{script.judul}</h1>
            </div>
            {script.linkReferensi && (
              <a 
                href={script.linkReferensi} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                <ExternalLink size={16} />
                Link Referensi
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Tag size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Brand</p>
                <p className="font-semibold text-slate-700">{script.brand}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Creator</p>
                <p className="font-semibold text-slate-700">{script.creatorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Tanggal</p>
                <p className="font-semibold text-slate-700">{script.tanggal}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Dibuat</p>
                <p className="font-semibold text-slate-700">{format(new Date(script.createdAt), 'dd/MM/yyyy')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <h3 className="text-xl font-bold text-slate-900">Struktur Script</h3>
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={section.id} className="relative pl-8 border-l-2 border-slate-100 pb-6 last:pb-0">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm" />
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-indigo-600 uppercase tracking-wide text-sm">{section.struktur}</h4>
                    <span className="text-xs font-bold text-slate-400">Section {index + 1}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Footage / Visual</h5>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{section.footage || '-'}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Script Teks / Audio</h5>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">{section.scriptTeks}</p>
                    </div>
                  </div>
                  {section.keterangan && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs italic text-slate-500">
                        <span className="font-bold not-italic mr-1">Ket:</span> {section.keterangan}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <MessageSquare size={24} />
              <h3 className="text-xl font-bold">Alasan Penolakan</h3>
            </div>
            <p className="text-slate-500 text-sm">
              Berikan alasan kenapa script ini ditolak agar creator dapat memperbaikinya.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Tulis alasan di sini..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected', rejectionReason)}
                disabled={!rejectionReason.trim() || isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
