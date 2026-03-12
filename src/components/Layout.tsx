import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthGuard';
import { 
  LayoutDashboard, 
  Archive, 
  PlusCircle, 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem: React.FC<{ 
  to: string; 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}> = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
      active 
        ? "bg-indigo-600 text-white shadow-md" 
        : "text-slate-600 hover:bg-slate-100"
    )}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/archive', icon: <Archive size={20} />, label: 'Arsip Script' },
    { to: '/submit', icon: <PlusCircle size={20} />, label: 'Pengajuan Script' },
    { to: '/calendar', icon: <Calendar size={20} />, label: 'Kalender Konten' },
    { to: '/templates', icon: <FileText size={20} />, label: 'Template Script' },
  ];

  if (profile?.role === 'admin') {
    menuItems.push({ to: '/users', icon: <Users size={20} />, label: 'Users' });
  }

  menuItems.push({ to: '/settings', icon: <Settings size={20} />, label: 'Settings' });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-4 fixed h-full">
        <div className="flex items-center gap-3 px-4 py-6 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            AI
          </div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            Content<br/><span className="text-indigo-600">Script</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to} 
            />
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <img 
              src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.name}`} 
              alt={profile?.name} 
              className="w-10 h-10 rounded-full border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{profile?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            AI
          </div>
          <span className="font-bold text-slate-900">Content Script</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out p-4",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 px-4 py-6 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            AI
          </div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            Content<br/><span className="text-indigo-600">Script</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
