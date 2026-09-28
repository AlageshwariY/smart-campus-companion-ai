import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OfflineBanner } from './components/common/OfflineBanner';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { MobileNav } from './components/common/MobileNav';
import { AuthModal } from './components/auth/AuthModal';
import { CommandPalette } from './components/common/CommandPalette';

// Student & Shared Modules
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { AttendanceView } from './components/attendance/AttendanceView';
import { AcademicManagementView } from './components/academic/AcademicManagementView';
import { AIStudyPlannerView } from './components/planner/AIStudyPlannerView';
import { NotesAnalyzerView } from './components/notes/NotesAnalyzerView';
import { CareerPlacementView } from './components/career/CareerPlacementView';
import { CampusKnowledgeCenter } from './components/ai/CampusKnowledgeCenter';
import { CampusServicesView } from './components/services/CampusServicesView';
import { TimetableSchedule } from './components/timetable/TimetableSchedule';
import { AssignmentList } from './components/assignments/AssignmentList';
import { ExamCenter } from './components/exams/ExamCenter';
import { StudyMaterialHub } from './components/materials/StudyMaterialHub';
import { CampusEventsView } from './components/events/CampusEventsView';
import { AnnouncementBoard } from './components/announcements/AnnouncementBoard';
import { PersonalizedStudentInsights } from './components/insights/PersonalizedStudentInsights';
import { AICampusAssistant } from './components/ai/AICampusAssistant';
import { AdminManagementCenter } from './components/admin/AdminManagementCenter';

const MainLayout: React.FC = () => {
  const { user, role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse flex items-center justify-center text-white font-bold text-xl mb-4">
          SC
        </div>
        <p className="text-xs text-slate-400 font-medium">Initializing Smart Campus Companion AI...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Network Offline Indicator Banner */}
      <OfflineBanner />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
        onNavigateTab={setActiveTab} 
      />

      <div className="flex flex-1">
        {/* Responsive Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
          {/* Top Navbar */}
          <Navbar 
            onOpenAI={() => setActiveTab('ai')} 
            onNavigateTab={setActiveTab} 
            onOpenCommandPalette={() => setIsCmdOpen(true)}
          />

          {/* Main Content Body */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            <ErrorBoundary>
              {activeTab === 'dashboard' && (
                role === 'admin' 
                  ? <AdminDashboard onNavigateTab={setActiveTab} /> 
                  : <StudentDashboard onNavigateTab={setActiveTab} />
              )}

              {activeTab === 'academic' && <AcademicManagementView />}
              {activeTab === 'attendance' && <AttendanceView />}
              {activeTab === 'planner' && <AIStudyPlannerView />}
              {activeTab === 'notes' && <NotesAnalyzerView />}
              {activeTab === 'career' && <CareerPlacementView />}
              {activeTab === 'knowledge' && <CampusKnowledgeCenter />}
              {activeTab === 'services' && <CampusServicesView />}
              {activeTab === 'timetable' && <TimetableSchedule />}
              {activeTab === 'assignments' && <AssignmentList />}
              {activeTab === 'exams' && <ExamCenter />}
              {activeTab === 'materials' && <StudyMaterialHub />}
              {activeTab === 'events' && <CampusEventsView />}
              {activeTab === 'announcements' && <AnnouncementBoard />}
              {activeTab === 'insights' && <PersonalizedStudentInsights onNavigateTab={setActiveTab} />}
              {activeTab === 'ai' && <AICampusAssistant />}
              {activeTab === 'admin' && <AdminManagementCenter />}
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RealtimeProvider>
          <MainLayout />
        </RealtimeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
