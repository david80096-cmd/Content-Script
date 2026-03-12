export type UserRole = 'admin' | 'creator';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  photoURL: string;
  role: UserRole;
  createdAt: string;
}

export type ScriptStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'published';

export interface ScriptSection {
  id: string;
  struktur: string;
  footage: string;
  scriptTeks: string;
  keterangan: string;
  order: number;
}

export interface Script {
  id: string;
  judul: string;
  brand: string;
  creatorId: string;
  creatorName: string;
  linkReferensi: string;
  tanggal: string;
  status: ScriptStatus;
  rejectionReason?: string;
  createdAt: any;
  sections?: ScriptSection[];
}

export const STRUKTUR_OPTIONS = [
  'Hook',
  'Sub-headline',
  'Product Knowledge',
  'Benefit',
  'CTA',
  'Problem',
  'Solution',
  'Testimonial',
  'Comparison'
];

export const STATUS_COLORS: Record<ScriptStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  published: 'bg-blue-100 text-blue-800'
};
