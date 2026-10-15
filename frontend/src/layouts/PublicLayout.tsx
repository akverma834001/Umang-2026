import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import {
  Trophy,
  MapPin,
  Menu,
  X,
  Sun,
  Moon,
  ShieldCheck,
  ExternalLink,
  Radio,
  Activity,
  Flame,
  FileText,
  Calendar,
  Info
} from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { settings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Sports', path: '/sports' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Results', path: '/results' },
    { name: 'Archives (5 Yrs)', path: '/archives' },
    { name: 'Registrations', path: '/registrations' },
    { name: 'Announcements', path: '/announcements' },
    { name: 'Venues', path: '/venues' },
    { name: 'About UMANG', path: '/about' },
  ];

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Top Institutional Bar */}
      <div className="bg-stone-950 text-stone-300 text-xs py-2 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-bold text-amber-400 uppercase tracking-wider font-serif">Sarala Birla University</span>
            <span className="text-stone-600">•</span>
            <span className="text-stone-400 hidden sm:inline">Birla Campus, Mahilong, Ranchi-Purulia Highway, Ranchi - 835103</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-stone-400 hidden md:inline-flex items-center space-x-1.5 text-[11px]">
              <Flame size={12} className="text-amber-500" />
              <span>UMANG Annual Sports Festival</span>
            </span>
            <span className="text-stone-700 hidden md:inline">|</span>
            <span className="text-amber-300 hidden lg:inline text-[11px] font-mono">Toll Free: 1800 120 1020</span>
            <span className="text-stone-700 hidden lg:inline">|</span>
            <a
              href="https://sbu.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 flex items-center space-x-1 transition-colors text-[11px]"
            >
              <span>sbu.ac.in</span>
              <ExternalLink size={10} />
            </a>
            <button
              onClick={toggleTheme}
              className="p-1 rounded text-stone-400 hover:text-white transition-colors"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* SBU Ranchi Official Monogram & Brand */}
            <Link to="/" className="flex items-center space-x-3.5 group">
              <div className="relative flex-shrink-0">
                <img
                  src="/sbu-emblem.png"
                  alt="Sarala Birla University Logo"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-full shadow-md group-hover:scale-105 transition-transform bg-white dark:bg-stone-800 p-0.5 border border-amber-500/30"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight text-stone-950 dark:text-white leading-tight font-serif">
                  SARALA BIRLA UNIVERSITY
                </span>
                <span className="text-[11px] font-bold text-brand-primary dark:text-amber-400 tracking-wider uppercase flex items-center space-x-1.5">
                  <span className="text-stone-600 dark:text-stone-300">RANCHI</span>
                  <span className="text-amber-500">•</span>
                  <span>UMANG SPORTS MEET</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                      isActive
                        ? 'text-brand-primary dark:text-amber-400 bg-stone-100 dark:bg-stone-800 font-semibold'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800/60'
                    }`
                  }
                >
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="Open Navigation Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 pt-2 pb-6 space-y-1 animate-in slide-in-from-top-2 duration-150 shadow-lg">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-md text-base font-medium ${
                    isActive
                      ? 'text-brand-primary dark:text-amber-400 bg-stone-100 dark:bg-stone-800 font-semibold'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                  }`
                }
              >
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main Page Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Institutional Footer */}
      <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* University Identity */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center space-x-3.5">
                <img src="/sbu_footer-logo.png" alt="Sarala Birla University Logo" className="h-10 w-auto bg-white/90 p-1 rounded object-contain" />
                <img src="/sbu-emblem.png" alt="SBU Emblem" className="w-10 h-10 rounded-full object-contain bg-white p-0.5" />
                <div>
                  <h3 className="font-serif font-bold text-white text-lg leading-snug">
                    {settings?.university_name || "Sarala Birla University, Ranchi"}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium tracking-wide uppercase">
                    {settings?.fest_name || "SBU UMANG 2026 — Annual Sports Festival"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-400 max-w-lg leading-relaxed">
                Sarala Birla University is a self-financed unitary university established under <span className="text-stone-300 font-medium">The Sarala Birla University Act, 2017 (Jharkhand Act. No. 13, 2017)</span>. Sponsored by <span className="text-stone-300 font-medium">Bharat Arogya & Gyan Mandir</span>. Department of Art, Culture & Sports.
              </p>
              <div className="flex items-start space-x-2 text-xs text-stone-400">
                <MapPin size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Birla Campus, Vill.- Ara, P.O.- Mahilong, Ranchi-Purulia Highway, Ranchi - 835103, Jharkhand, India</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Tournament Links</h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><Link to="/sports" className="hover:text-amber-400 transition-colors">Sports Disciplines</Link></li>
                <li><Link to="/schedule" className="hover:text-amber-400 transition-colors">Fixtures & Schedule</Link></li>
                <li><Link to="/leaderboard" className="hover:text-amber-400 transition-colors">House Championship Table</Link></li>
                <li><Link to="/results" className="hover:text-amber-400 transition-colors">Official Results</Link></li>
                <li><Link to="/registrations" className="hover:text-amber-400 transition-colors">Google Form Registrations</Link></li>
                <li><Link to="/venues" className="hover:text-amber-400 transition-colors">Sports Facilities</Link></li>
                <li><Link to="/about" className="hover:text-amber-400 transition-colors">About SBU UMANG</Link></li>
              </ul>
            </div>

            {/* Contact & Administration */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">University Sports Desk</h4>
              <p className="text-xs text-stone-400">
                Email: <a href="mailto:info@sburanchi.ac.in" className="text-stone-200 hover:text-amber-400 hover:underline">info@sburanchi.ac.in</a>
              </p>
              <p className="text-xs text-stone-400 mt-1.5">
                Sports Office: <a href="mailto:sports@sburanchi.ac.in" className="text-stone-200 hover:text-amber-400 hover:underline">sports@sburanchi.ac.in</a>
              </p>
              <p className="text-xs text-stone-400 mt-1.5">
                Toll Free: <span className="text-amber-400 font-mono font-bold">1800 120 1020</span>
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Helpdesk: <span className="text-stone-200 font-mono">+91 95080 03108 / 09</span>
              </p>
              <div className="pt-3 border-t border-stone-800 mt-3">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center space-x-1.5 text-xs text-stone-400 hover:text-white transition-colors py-1 px-2 rounded hover:bg-stone-900 border border-stone-800"
                >
                  <ShieldCheck size={13} className="text-amber-500" />
                  <span>Admin Command Center</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-900 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-400">
            <p>{settings?.copyright_text || "© 2026 Sarala Birla University, Ranchi. All rights reserved."}</p>
            <p className="mt-2 sm:mt-0 flex items-center space-x-1">
              <span>Timezone:</span>
              <span className="text-stone-300 font-mono">Asia/Kolkata (IST)</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
