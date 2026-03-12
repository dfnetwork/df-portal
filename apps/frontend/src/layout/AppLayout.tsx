import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import React from 'react';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/projects', label: 'Projects' },
  { path: '/users', label: 'Users' },
  { path: '/activity', label: 'Activity' },
  { path: '/settings', label: 'Settings' },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const clear = useAuthStore((s) => s.clear);
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex">
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 space-y-4">
        <div className="text-xl font-semibold text-slate-100">DF Portal</div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-lg ${
                location.pathname === item.path
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => {
            clear();
            navigate('/login');
          }}
          className="w-full mt-8 text-left px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200"
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
};

export default AppLayout;
