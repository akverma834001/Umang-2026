import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { SportsPage } from './pages/public/SportsPage';
import { AboutPage } from './pages/public/AboutPage';
import { SchedulePage } from './pages/public/SchedulePage';
import { LeaderboardPage } from './pages/public/LeaderboardPage';
import { ResultsPage } from './pages/public/ResultsPage';
import { RegistrationsPage } from './pages/public/RegistrationsPage';
import { AnnouncementsPage } from './pages/public/AnnouncementsPage';
import { VenuesPage } from './pages/public/VenuesPage';
import { ArchivesPage } from './pages/public/ArchivesPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSportsPage } from './pages/admin/AdminSportsPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminSchedulePage } from './pages/admin/AdminSchedulePage';
import { AdminResultsPage } from './pages/admin/AdminResultsPage';
import { AdminFormsPage } from './pages/admin/AdminFormsPage';
import { AdminTeamsPage } from './pages/admin/AdminTeamsPage';
import { AdminVenuesPage } from './pages/admin/AdminVenuesPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { AdminArchivesPage } from './pages/admin/AdminArchivesPage';
import { AdminLeadershipPage } from './pages/admin/AdminLeadershipPage';

const NotFound: React.FC = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
    <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-2xl font-serif font-bold text-brand-primary dark:text-amber-400">
      404
    </div>
    <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">Page Not Found</h2>
    <p className="text-sm text-stone-500 max-w-md">
      The requested sports fixture, notice, or platform page does not exist or may have been relocated.
    </p>
    <Link
      to="/"
      className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
    >
      Return to SBU UMANG Portal
    </Link>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <Routes>
              {/* Public Portal Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="sports" element={<SportsPage />} />
                <Route path="sports/:slug" element={<SportsPage />} />
                <Route path="events" element={<Navigate to="/sports" replace />} />
                <Route path="events/:slug" element={<Navigate to="/sports" replace />} />
                <Route path="live" element={<Navigate to="/schedule" replace />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="results" element={<ResultsPage />} />
                <Route path="registrations" element={<RegistrationsPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="venues" element={<VenuesPage />} />
                <Route path="archives" element={<ArchivesPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Admin Login */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="sports" element={<AdminSportsPage />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="schedule" element={<AdminSchedulePage />} />
                <Route path="results" element={<AdminResultsPage />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="forms" element={<AdminFormsPage />} />
                <Route path="teams" element={<AdminTeamsPage />} />
                <Route path="venues" element={<AdminVenuesPage />} />
                <Route path="announcements" element={<AdminAnnouncementsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="leadership" element={<AdminLeadershipPage />} />
                <Route path="archives" element={<AdminArchivesPage />} />
                <Route path="audit" element={<AdminAuditPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};
