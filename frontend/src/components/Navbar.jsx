import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Scale, 
  AlertTriangle, 
  FileText, 
  FolderLock, 
  BookOpen, 
  MapPin, 
  UserCheck, 
  Video, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X, 
  Briefcase,
  Mic, 
  Globe, 
  Check, 
  LogIn,
  MoreHorizontal,
  Languages
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';

export const Navbar = ({ currentTab, setCurrentTab, onOpenAuth, onOpenVoiceModal }) => {
  const { user, logout, demoLogin, setActiveSOS } = useAuth();
  const { language, setLanguage, currentLangConfig, supportedLanguages, t } = useLanguage();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const moreMenuRef = useRef(null);
  const langMenuRef = useRef(null);
  const personaMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
      if (personaMenuRef.current && !personaMenuRef.current.contains(event.target)) {
        setShowPersonaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary navigation tabs shown on desktop
  const primaryNavItems = [];

  if (user?.role === 'lawyer') {
    primaryNavItems.push({ 
      id: 'lawyer-dashboard', 
      label: 'Chamber', 
      icon: Scale,
      isSpecial: true
    });
  }

  if (user?.role === 'teacher') {
    primaryNavItems.push({
      id: 'teacher-dashboard',
      label: 'Teacher Studio',
      icon: Video,
      isSpecial: true
    });
  }

  primaryNavItems.push(
    { id: 'case-intelligence', label: 'Case Dossiers', icon: Briefcase },
    { id: 'ai-assistant', label: 'Statutory AI', icon: Scale },
    { id: 'lawyers', label: 'Advocates', icon: UserCheck },
    { id: 'education-hub', label: 'Education Hub', icon: BookOpen },
    { id: 'documents', label: 'Legal Drafts', icon: FileText }
  );

  // Secondary tools housed in the "More" dropdown
  const secondaryNavItems = [
    { 
      id: 'evidence', 
      label: 'Evidence Locker (Sec 65B)', 
      description: 'Cryptographic hash & tamper audit trails', 
      icon: FolderLock 
    },
    { 
      id: 'safetymap', 
      label: 'Live Safety GPS & Routes', 
      description: 'Track safe routes and high-crime heatmaps', 
      icon: MapPin 
    },
    { 
      id: 'rights', 
      label: 'Statutory Rights', 
      description: 'BNS, BNSS, POSH & Constitutional law', 
      icon: BookOpen 
    },
    {
      id: 'translator',
      label: 'AR Legalese Translator',
      description: 'Scan documents to plain simple English',
      icon: Languages
    }
  ];

  if (user?.role === 'admin') {
    secondaryNavItems.push({ 
      id: 'admin', 
      label: 'Chamber Admin', 
      description: 'System telemetry, advocate audits & logs', 
      icon: Shield 
    });
  }

  // Combined navigation items for mobile drawer
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  // Active state for secondary items
  const isSecondaryActive = secondaryNavItems.some((item) => item.id === currentTab);
  const activeSecondaryItem = secondaryNavItems.find((item) => item.id === currentTab);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/90 transition-all select-none">
      {/* Sleek, Dignified Emergency Helpline Ribbon */}
      <div className="bg-[#faf9f6] text-[11px] py-1 px-4 border-b border-stone-200/80 text-slate-600 flex items-center justify-center">
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar font-medium">
          <span className="flex items-center text-slate-500 font-bold uppercase tracking-wider text-[10px] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 inline-block animate-pulse"></span>
            24/7 Emergency:
          </span>
          <span className="shrink-0 hover:text-slate-900 transition">Police: <strong className="text-slate-900 font-bold">112</strong></span>
          <span className="text-stone-300">•</span>
          <span className="shrink-0 hover:text-slate-900 transition">Women Helpline: <strong className="text-slate-900 font-bold">1091</strong></span>
          <span className="text-stone-300">•</span>
          <span className="shrink-0 hover:text-slate-900 transition">NCW: <strong className="text-slate-900 font-bold">7827170170</strong></span>
          <span className="text-stone-300">•</span>
          <span className="shrink-0 hover:text-slate-900 transition">Cyber Crime: <strong className="text-slate-900 font-bold">1930</strong></span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Crisp & Compact */}
          <div 
            onClick={() => setCurrentTab('home')} 
            className="cursor-pointer select-none shrink-0"
          >
            <Logo size="md" variant="dark" subtitle="" />
          </div>

          {/* Center Desktop Navigation Tabs - shrink-0 to NEVER collide or overlap */}
          <nav className="hidden xl:flex items-center space-x-1 shrink-0">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-stone-100 text-[#0f172a] border border-stone-300/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-stone-100/70'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[#854d0e]' : 'text-slate-400'} />
                  <span>{item.label}</span>
                  {item.isSpecial && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-900 font-bold ml-0.5">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}

            {/* "More ▾" Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSecondaryActive
                    ? 'bg-stone-100 text-[#0f172a] border border-stone-300/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-stone-100/70'
                }`}
                title="Additional Legal Tools"
              >
                <MoreHorizontal size={14} className={isSecondaryActive ? 'text-[#854d0e]' : 'text-slate-400'} />
                <span>{isSecondaryActive ? activeSecondaryItem?.label : 'More'}</span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`} />
                {isSecondaryActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#854d0e]" />
                )}
              </button>

              {showMoreMenu && (
                <div className="absolute left-0 mt-2 w-72 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 border-b border-stone-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Additional Legal Services
                  </div>
                  <div className="py-1 space-y-1">
                    {secondaryNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentTab(item.id);
                            setShowMoreMenu(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-start space-x-2.5 transition ${
                            isActive
                              ? 'bg-stone-100 text-slate-950 font-bold border border-stone-200'
                              : 'text-slate-700 hover:bg-stone-50 hover:text-slate-900'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-[#0f172a] text-white' : 'bg-stone-100 text-slate-600'}`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900">{item.label}</span>
                              {isActive && <Check size={13} className="text-[#854d0e]" />}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 font-normal">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Suite: Language, Voice, SOS, Persona & Standalone Log Out */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Multi-Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg transition shadow-2xs font-semibold"
                title="Change Language"
              >
                <Globe size={13} className="text-slate-500" />
                <span className="text-slate-900 uppercase tracking-wide text-xs">{currentLangConfig.code}</span>
                <ChevronDown size={11} className="text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-2.5 py-1.5 border-b border-stone-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Select Language / भाषा
                  </div>
                  <div className="py-1 space-y-0.5">
                    {supportedLanguages.map((lang) => {
                      const isSelected = language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setShowLangMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-stone-100 text-slate-950 font-semibold'
                              : 'text-slate-600 hover:bg-stone-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{lang.nativeName}</span>
                            <span className="text-[10px] text-slate-400">({lang.name})</span>
                          </div>
                          {isSelected && <Check size={12} className="text-[#854d0e]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Voice Dictation Icon Button */}
            {onOpenVoiceModal && (
              <button
                onClick={onOpenVoiceModal}
                className="p-1.5 sm:p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-slate-700 transition shadow-2xs"
                title="Voice Dictation Studio"
              >
                <Mic size={14} className="text-[#854d0e]" />
              </button>
            )}

            {/* Emergency SOS Button - Compact, Bold Red */}
            <button
              onClick={() => setActiveSOS(true)}
              className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-xs active:scale-95 transition"
              title="24/7 Emergency SOS Hotlines"
            >
              <AlertTriangle size={12} className="text-white" />
              <span className="tracking-wider uppercase">SOS</span>
            </button>

            {/* Persona Switcher / Profile Dropdown */}
            <div className="relative" ref={personaMenuRef}>
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center space-x-1.5 bg-white hover:bg-stone-50 border border-stone-200 text-slate-800 text-xs px-2.5 py-1.5 rounded-lg transition shadow-2xs font-semibold"
                title="Switch User Persona / View Profile"
              >
                <div className="w-5 h-5 rounded-full bg-[#0f172a] flex items-center justify-center text-white font-bold text-[10px]">
                  {user ? user.name.charAt(0) : '?'}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">
                  {user ? user.name.split(' ')[0] : 'Guest'}
                </span>
                <ChevronDown size={11} className="text-slate-400" />
              </button>

              {/* Persona Dropdown Menu */}
              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Guest'}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{user?.email || 'No email'}</p>
                  </div>

                  <div className="py-2">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Switch Role (Simulator)
                    </p>
                    <button
                      onClick={() => { demoLogin('citizen'); setCurrentTab('home'); setShowPersonaMenu(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-stone-50 text-slate-700 flex items-center justify-between"
                    >
                      <span>Citizen Client (Ananya)</span>
                      {user?.role === 'user' && <span className="text-[10px] text-[#854d0e] font-semibold">Active</span>}
                    </button>
                    <button
                      onClick={() => { demoLogin('lawyer'); setCurrentTab('lawyer-dashboard'); setShowPersonaMenu(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-stone-50 text-slate-700 flex items-center justify-between"
                    >
                      <span>Advocate Counsel (Rajesh)</span>
                      {user?.role === 'lawyer' && <span className="text-[10px] text-[#854d0e] font-semibold">Active</span>}
                    </button>
                    <button
                      onClick={() => { demoLogin('admin'); setCurrentTab('admin'); setShowPersonaMenu(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-stone-50 text-slate-700 flex items-center justify-between"
                    >
                      <span>Chamber Admin (Meera)</span>
                      {user?.role === 'admin' && <span className="text-[10px] text-[#854d0e] font-semibold">Active</span>}
                    </button>
                  </div>

                  <div className="border-t border-stone-100 pt-1 space-y-1">
                    <button
                      onClick={() => { setCurrentTab('login'); setShowPersonaMenu(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#0f172a] hover:bg-stone-50 flex items-center space-x-2 font-semibold"
                    >
                      <LogIn size={13} className="text-[#854d0e]" />
                      <span>Dedicated Sign In Page</span>
                    </button>
                    <button
                      onClick={() => { logout(); setCurrentTab('login'); setShowPersonaMenu(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-red-600 font-bold hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut size={13} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Standalone Visible Log Out Button */}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setCurrentTab('login');
                }}
                className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 text-xs px-2.5 py-1.5 rounded-lg transition shadow-2xs font-bold active:scale-95"
                title="Log Out of your account"
              >
                <LogOut size={13} className="text-rose-600" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs ${
                  currentTab === 'login' || currentTab === 'auth' || currentTab === 'register'
                    ? 'bg-[#0f172a] text-white border border-[#0f172a]'
                    : 'bg-white hover:bg-stone-50 border border-stone-200 text-slate-800'
                }`}
                title="Sign In or Create Account"
              >
                <LogIn size={13} className={currentTab === 'login' || currentTab === 'auth' ? 'text-amber-300' : 'text-[#854d0e]'} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-stone-100"
              title="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {user ? (
            <button
              onClick={() => {
                logout();
                setCurrentTab('login');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 mb-2 shadow-xs transition"
            >
              <LogOut size={18} className="text-rose-600" />
              <span>Log Out ({user.name.split(' ')[0]})</span>
            </button>
          ) : (
            <button
              onClick={() => { setCurrentTab('login'); setMobileMenuOpen(false); }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold bg-[#0f172a] text-white mb-2 shadow-xs"
            >
              <LogIn size={18} className="text-amber-300" />
              <span>Sign In / Create Account</span>
            </button>
          )}

          {onOpenVoiceModal && (
            <button
              onClick={() => { onOpenVoiceModal(); setMobileMenuOpen(false); }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-stone-100 text-slate-800 border border-stone-200 mb-2"
            >
              <Mic size={18} className="text-[#854d0e]" />
              <span>Voice Dictation ({currentLangConfig.nativeName})</span>
            </button>
          )}

          <div className="py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
              Navigation & Services
            </span>
          </div>

          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentTab(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-stone-100 text-slate-950 font-bold' : 'text-slate-600 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={18} className={isActive ? 'text-[#854d0e]' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.isSpecial && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
