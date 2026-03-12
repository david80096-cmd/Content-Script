import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ScriptArchive } from './components/ScriptArchive';
import { ScriptForm } from './components/ScriptForm';
import { ScriptDetail } from './components/ScriptDetail';
import { UserManagement } from './components/UserManagement';
import { Settings } from './components/Settings';
import { Toaster } from 'react-hot-toast';
import { LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12 text-center space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-lg shadow-indigo-200 mb-6">
            AI
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Content<span className="text-indigo-600">Script</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Platform Manajemen Konten Terpusat</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-100 transition-all group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Masuk dengan Google
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
        </p>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/archive" element={<ProtectedRoute><ScriptArchive /></ProtectedRoute>} />
          <Route path="/submit" element={<ProtectedRoute><ScriptForm /></ProtectedRoute>} />
          <Route path="/script/:id" element={<ProtectedRoute><ScriptDetail /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          {/* Fallback routes */}
          <Route path="/calendar" element={<ProtectedRoute><div className="text-center py-20 text-slate-500">Fitur Kalender Konten segera hadir!</div></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><div className="text-center py-20 text-slate-500">Fitur Template Script segera hadir!</div></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
