import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Award,
  Trophy,
  FileSpreadsheet,
  Bell,
  MapPin,
  Users,
  Palette,
  History,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sun,
  Moon,
  ShieldAlert,
  Shield,
  Flame,
  Activity
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { admin, isAuthenticated, loading, logout } = useAuth();
  const { settings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-stone-900">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Verifying administrative credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-stone-900 p-4">
        <div className="bg-white dark:bg-stone-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-4 border border-stone-200 dark:border-stone-700">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">Administrative Access Required</h2>
          <p className="text-sm text-stone-600 dark:text-stone-300">
            You must authenticate with approved SBU administrator credentials to access the sports management control center.
          </p>
          <Link
            to="/admin/login"
            className="inline-block w-full py-2.5 px-4 bg-brand-primary hover:bg-stone-800 text-white rounded-lg font-medium transition-colors"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Sports Disciplines', path: '/admin/sports', icon: Flame },
    { name: 'Matches & Fixtures', path: '/admin/events', icon: Calendar },
    { name: 'Schedule Timetable', path: '/admin/schedule', icon: Clock },
    { name: 'The 4 Houses', path: '/admin/teams', icon: Users },
    { name: 'Results & Scoring', path: '/admin/results', icon: Award },
    { name: 'Leaderboard', path: '/admin/leaderboard', icon: Trophy },
    { name: 'Google Forms', path: '/admin/forms', icon: FileSpreadsheet },
    { name: 'Announcements', path: '/admin/announcements', icon: Bell },
    { name: 'Sports Venues', path: '/admin/venues', icon: MapPin },
    { name: 'Leadership & Incharges', path: '/admin/leadership', icon: Shield },
    { name: 'Past Years Archive', path: '/admin/archives', icon: Award },
    { name: 'Settings & Scoring', path: '/admin/settings', icon: Palette },
    { name: 'Audit Logs', path: '/admin/audit', icon: History },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-stone-900 text-stone-200 flex flex-col transition-transform duration-200 ease-in-out border-r border-stone-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-3">
            <img src="/sbu-emblem.png" alt="SBU Logo" className="w-10 h-10 rounded-full object-contain bg-white p-0.5 shadow" />
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide font-serif">SBU UMANG</h1>
              <p className="text-[11px] text-amber-400 font-semibold tracking-wider uppercase">Sports Meet Admin</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-stone-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-primary text-white font-semibold shadow-sm'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                  }`
                }
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <div className="truncate">
              <p className="font-semibold text-stone-200 truncate">{admin?.username || 'Administrator'}</p>
              <p className="text-[10px] text-stone-500">Official Sports Officer</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center space-x-1 text-[11px] text-stone-400 hover:text-amber-400 transition-colors"
            >
              <span>View Public Portal</span>
              <ExternalLink size={10} />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-1 rounded text-stone-400 hover:text-white"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="h-16 px-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between lg:hidden sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <Menu size={20} />
            </button>
            <span className="font-serif font-bold text-sm text-stone-900 dark:text-white">SBU UMANG Admin</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-stone-600 dark:text-stone-300"
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-stone-600 dark:text-stone-300 hover:text-red-500"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Dynamic Route Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
