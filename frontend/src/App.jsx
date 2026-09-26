import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { AuthModal } from './components/AuthModal';
import { VoiceToTextModal } from './components/VoiceToTextModal';
import { FloatingVoiceButton } from './components/FloatingVoiceButton';

import { LandingPage } from './pages/LandingPage';
import { AILegalAssistant } from './pages/AILegalAssistant';
import { LawyerDirectory } from './pages/LawyerDirectory';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { DocumentGenerator } from './pages/DocumentGenerator';
import { EvidenceVault } from './pages/EvidenceVault';
import { NearbyHelpMap } from './pages/NearbyHelpMap';
import { LegalLibrary } from './pages/LegalLibrary';
import { AdminDashboard } from './pages/AdminDashboard';
import { CaseIntelligencePage } from './pages/CaseIntelligencePage';
import { AuthPage } from './pages/AuthPage';
import { LawyerDashboard } from './pages/LawyerDashboard';
import { EducationHub } from './pages/EducationHub';
import { TeacherDashboard } from './pages/TeacherDashboard';
import LiveSafetyMap from './pages/LiveSafetyMap';
import { DecoyMode } from './components/DecoyMode';
import { LegaleseTranslator } from './pages/LegaleseTranslator';

const MainApp = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const { activeSOS, setActiveSOS } = useAuth();

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <LandingPage 
            setCurrentTab={setCurrentTab} 
            onOpenVoiceModal={() => setShowVoiceModal(true)} 
          />
        );
      case 'auth':
      case 'login':
        return <AuthPage initialMode="login" setCurrentTab={setCurrentTab} />;
      case 'register':
        return <AuthPage initialMode="register" setCurrentTab={setCurrentTab} />;
      case 'case-intelligence':
        return <CaseIntelligencePage setCurrentTab={setCurrentTab} />;
      case 'ai-assistant':
        return <AILegalAssistant setCurrentTab={setCurrentTab} />;
      case 'translator':
        return <LegaleseTranslator />;
      case 'lawyer-dashboard':
        return <LawyerDashboard setCurrentTab={setCurrentTab} />;
      case 'lawyers':
      case 'consultations':
        return <LawyerDirectory setCurrentTab={setCurrentTab} initialSection={currentTab === 'consultations' ? 'consultations' : 'directory'} />;
      case 'documents':
        return <DocumentGenerator />;
      case 'evidence':
        return <EvidenceVault />;
      case 'map':
        return <NearbyHelpMap />;
      case 'safetymap':
        return <LiveSafetyMap />;
      case 'rights':
        return <LegalLibrary setCurrentTab={setCurrentTab} />;
      case 'admin':
        return <AdminDashboard />;
      case 'education-hub':
        return <EducationHub />;
      case 'teacher-dashboard':
        return <TeacherDashboard setCurrentTab={setCurrentTab} />;
      default:
        return (
          <LandingPage 
            setCurrentTab={setCurrentTab} 
            onOpenVoiceModal={() => setShowVoiceModal(true)} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-slate-800 font-sans selection:bg-amber-100 selection:text-slate-900 w-full max-w-full overflow-x-hidden">
      {/* Navigation Header with Multi-Language Switcher & Voice Trigger */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenVoiceModal={() => setShowVoiceModal(true)}
      />

      {/* Main View Body */}
      <main className="flex-1 w-full animate-in fade-in duration-200">
        {renderContent()}
      </main>

      {/* Footer */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* Floating 1-Tap Voice Dictation Button */}
      <FloatingVoiceButton onOpenVoiceModal={() => setShowVoiceModal(true)} />

      {/* Global Voice-to-Text Studio Modal */}
      <VoiceToTextModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        setCurrentTab={setCurrentTab}
      />

      {/* Global Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={activeSOS}
        onClose={() => setActiveSOS(false)}
      />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Stealth / Decoy Mode (Anti-Coercion UI) */}
      <DecoyMode />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </AuthProvider>
  );
}
