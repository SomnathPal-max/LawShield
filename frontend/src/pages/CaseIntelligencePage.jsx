import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  Scale, 
  FileText, 
  FolderLock, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Plus, 
  Share2, 
  Download, 
  Trash2, 
  Edit3, 
  Link2, 
  ExternalLink, 
  Layers, 
  Eye, 
  FileCheck, 
  HelpCircle, 
  MessageSquare, 
  Video, 
  ChevronRight, 
  ShieldAlert, 
  Activity, 
  UploadCloud, 
  FileQuestion, 
  Check, 
  X,
  File,
  Printer,
  ChevronDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { api, API_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VisualStoryboard from '../components/VisualStoryboard';

export const CaseIntelligencePage = ({ setCurrentTab }) => {
  const { user, showToast } = useAuth();
  const isLawyer = user?.role === 'lawyer';

  // Workspace State
  const [cases, setCases] = useState([]);
  const [activeCaseId, setActiveCaseId] = useState('');
  const [caseDetails, setCaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'analyzer' | 'evidence' | 'timeline' | 'mapping' | 'gaps' | 'brief' | 'questions' | 'lawyer'

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedEvidenceForInspect, setSelectedEvidenceForInspect] = useState(null);

  // Forms
  const [newCaseForm, setNewCaseForm] = useState({
    title: '',
    incidentType: 'Cybercrime & Harassment',
    incidentDate: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    peopleInvolved: '',
    additionalNotes: '',
  });

  const [newEventForm, setNewEventForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Threat Received',
    description: '',
    attachedEvidenceIds: [],
    notes: '',
  });

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Digital Evidence');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadRelatedEventId, setUploadRelatedEventId] = useState('');
  const [uploading, setUploading] = useState(false);

  // Brief Editing
  const [briefContent, setBriefContent] = useState('');
  const [editingBrief, setEditingBrief] = useState(false);
  const [savingBrief, setSavingBrief] = useState(false);

  // Sharing Confirmation State
  const [shareConfig, setShareConfig] = useState({
    summary: true,
    timeline: true,
    evidence: true,
    questions: true,
    privateNotes: false,
  });
  const [selectedLawyerId, setSelectedLawyerId] = useState('usr_demo_lawyer_001');

  // Lawyer View State
  const [sharedCasesForLawyer, setSharedCasesForLawyer] = useState([]);
  const [newLawyerNote, setNewLawyerNote] = useState('');

  // Relationship Map selection
  const [selectedMapNode, setSelectedMapNode] = useState(null);

  // 1. Fetch user cases
  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cases');
      if (res.data.success) {
        setCases(res.data.cases);
        if (res.data.cases.length > 0) {
          const targetId = activeCaseId || res.data.cases[0]._id;
          setActiveCaseId(targetId);
          fetchCaseDetails(targetId);
        } else {
          setCaseDetails(null);
          setLoading(false);
        }
      }
    } catch (err) {
      console.warn('Could not fetch cases:', err.message);
      setLoading(false);
    }
  };

  // 2. Fetch specific case details
  const fetchCaseDetails = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/cases/${id}`);
      if (res.data.success) {
        setCaseDetails(res.data);
        if (res.data.brief) {
          setBriefContent(res.data.brief.userEditedContent || compileBriefText(res.data.brief));
        }
      }
    } catch (err) {
      console.warn('Case details error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch shared cases if in lawyer mode
  const fetchLawyerSharedCases = async () => {
    if (!isLawyer) return;
    try {
      const res = await api.get('/cases/shared/lawyer');
      if (res.data.success) {
        setSharedCasesForLawyer(res.data.sharedCases);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchCases();
    if (isLawyer) fetchLawyerSharedCases();
  }, [user]);

  // Check if speech dictation prefill was passed from Voice Studio
  useEffect(() => {
    const prefill = localStorage.getItem('lawshield_initial_case_desc');
    if (prefill) {
      localStorage.removeItem('lawshield_initial_case_desc');
      setNewCaseForm(prev => ({
        ...prev,
        title: 'Voice Grievance Record - ' + new Date().toLocaleDateString(),
        description: prefill
      }));
      setShowCreateModal(true);
    }
  }, []);

  const compileBriefText = (b) => {
    if (!b) return '';
    return `# CASE BRIEF: ${b.caseTitle}\n\n## 1. Incident Summary\n${b.incidentSummary}\n\n## 2. Key Facts\n${(b.keyFacts || []).map(f => `- ${f}`).join('\n')}\n\n## 3. Important Dates\n${(b.importantDates || []).map(d => `- ${d}`).join('\n')}\n\n## 4. Potential Legal Topics\n${(b.potentialLegalTopics || []).map(t => `- ${t}`).join('\n')}\n\n## 5. Evidence Preserved\n${(b.evidenceAvailable || []).map(e => `- ${e}`).join('\n')}\n\n## 6. Evidence Gaps & Missing Records\n${(b.evidenceGaps || []).map(g => `- ${g}`).join('\n')}\n\n## 7. Questions For Legal Counsel\n${(b.questionsForLawyer || []).map(q => `- ${q}`).join('\n')}\n\n## 8. Suggested Next Steps\n${(b.suggestedNextSteps || []).map(s => `- ${s}`).join('\n')}`;
  };

  // Handle Case Creation
  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newCaseForm.title.trim() || !newCaseForm.description.trim()) {
      showToast('Please provide both case title and incident description.', 'error');
      return;
    }
    try {
      const res = await api.post('/cases', newCaseForm);
      if (res.data.success) {
        showToast('🎉 Case Intelligence workspace created!', 'success');
        setShowCreateModal(false);
        setNewCaseForm({
          title: '',
          incidentType: 'Cybercrime & Harassment',
          incidentDate: new Date().toISOString().split('T')[0],
          location: '',
          description: '',
          peopleInvolved: '',
          additionalNotes: '',
        });
        await fetchCases();
        setActiveCaseId(res.data.case._id);
        fetchCaseDetails(res.data.case._id);
      }
    } catch (err) {
      showToast('Failed to create case', 'error');
    }
  };

  // Handle Evidence Upload
  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast('Please select an evidence file', 'error');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('title', uploadTitle || uploadFile.name);
    fd.append('incidentCategory', uploadCategory);
    fd.append('userDescription', uploadDescription);
    fd.append('relatedEventId', uploadRelatedEventId);

    try {
      const res = await api.post(`/cases/${activeCaseId}/evidence`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        showToast('Evidence securely archived & analyzed', 'success');
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTitle('');
        setUploadDescription('');
        setUploadRelatedEventId('');
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      showToast('Evidence upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle Add Timeline Event
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEventForm.title.trim() || !newEventForm.date) {
      showToast('Title and date are required for timeline event.', 'error');
      return;
    }
    try {
      const res = await api.post(`/cases/${activeCaseId}/events`, newEventForm);
      if (res.data.success) {
        showToast('Timeline event recorded', 'success');
        setShowEventModal(false);
        setNewEventForm({
          title: '',
          date: new Date().toISOString().split('T')[0],
          category: 'Threat Received',
          description: '',
          attachedEvidenceIds: [],
          notes: '',
        });
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      showToast('Failed to record timeline event', 'error');
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async (eventId) => {
    try {
      const res = await api.delete(`/cases/${activeCaseId}/events/${eventId}`);
      if (res.data.success) {
        showToast('Timeline event removed', 'info');
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      showToast('Delete event failed', 'error');
    }
  };

  // Handle Generate Brief
  const handleGenerateBrief = async () => {
    try {
      showToast('AI is synthesizing the visual storyboard...', 'info');
      const payload = {
        rawDescription: caseDetails.case.description,
        evidence: caseDetails.evidence.map(e => ({ title: e.title, description: e.userDescription, category: e.incidentCategory }))
      };
      const res = await api.post('/ai/synthesize-brief', payload);
      if (res.data.success) {
        showToast('Visual Storyboard Generated Successfully', 'success');
        setBriefContent(res.data.storyboard);
        setActiveTab('brief');
      }
    } catch (err) {
      showToast('Brief generation failed', 'error');
    }
  };

  // Handle Save Brief
  const handleSaveBrief = async () => {
    setSavingBrief(true);
    try {
      const res = await api.put(`/cases/${activeCaseId}/brief`, { userEditedContent: briefContent });
      if (res.data.success) {
        showToast('Case Brief changes saved', 'success');
        setEditingBrief(false);
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      showToast('Failed to save brief', 'error');
    } finally {
      setSavingBrief(false);
    }
  };

  // Handle Question Status Toggle
  const handleToggleQuestionStatus = async (questionId, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'discussed' : currentStatus === 'discussed' ? 'resolved' : 'pending';
    try {
      const res = await api.put(`/cases/${activeCaseId}/questions/${questionId}`, { status: nextStatus });
      if (res.data.success) {
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      showToast('Failed to update question status', 'error');
    }
  };

  // Handle Share Case with Lawyer
  const handleShareCase = async () => {
    try {
      const res = await api.post(`/cases/${activeCaseId}/share`, {
        lawyerId: selectedLawyerId,
        sharedSections: shareConfig,
      });
      if (res.data.success) {
        showToast(`🎉 Case Brief securely shared with ${res.data.share.lawyerName}!`, 'success');
        setShowShareModal(false);
        fetchCaseDetails(activeCaseId);
      }
    } catch (err) {
      showToast('Failed to share case', 'error');
    }
  };

  // Handle Lawyer Consultation Note
  const handleAddLawyerNote = async (shareId) => {
    if (!newLawyerNote.trim()) return;
    try {
      const res = await api.post(`/cases/shared/${shareId}/notes`, { text: newLawyerNote });
      if (res.data.success) {
        showToast('Consultation note recorded', 'success');
        setNewLawyerNote('');
        fetchLawyerSharedCases();
      }
    } catch (err) {
      showToast('Failed to add note', 'error');
    }
  };

  // Generate Complete Case Package PDF
  const handleGeneratePdfPackage = async () => {
    try {
      showToast('Generating official Case Intelligence Dossier PDF...', 'info');
      const res = await api.get(`/cases/${activeCaseId}/package`);
      if (!res.data.success) throw new Error('Package compilation failed');

      const pkg = res.data.packageData;
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const margin = 18;
      let y = 22;

      // Header Banner
      doc.setFillColor(11, 19, 43); // Dark slate
      doc.rect(0, 0, 210, 36, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('LAWSHIELD CASE INTELLIGENCE DOSSIER', margin, 16);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(147, 197, 253);
      doc.text(`Reference: ${pkg.dossierId} | Generated: ${new Date().toLocaleDateString()}`, margin, 24);
      doc.text('Confidential Client Legal Preparation Document', margin, 30);

      y = 46;

      // Mandatory Court Prediction Disclaimer Box
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(239, 68, 68);
      doc.roundedRect(margin, y, 174, 16, 2, 2, 'FD');
      doc.setTextColor(185, 28, 28);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('LEGAL NOTICE & STATUTORY DISCLAIMER:', margin + 4, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.text('LawShield provides AI-assisted legal information and case organization. It does not predict court outcomes', margin + 4, y + 10);
      doc.text('or replace advice from a qualified lawyer. This dossier is organized to facilitate advocate consultation.', margin + 4, y + 14);

      y += 24;

      // Case Particulars
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Case: ${pkg.caseTitle}`, margin, y);
      y += 7;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Client: ${pkg.clientName} (${pkg.clientEmail})`, margin, y);
      doc.text(`Incident Type: ${pkg.incidentType}`, margin + 95, y);
      y += 5;
      doc.text(`Reported Date: ${pkg.incidentDate || 'N/A'}`, margin, y);
      doc.text(`Location: ${pkg.location || 'Jurisdiction to be confirmed'}`, margin + 95, y);
      y += 5;
      doc.text(`Information Completeness: ${pkg.completenessScore}/100`, margin, y);
      doc.text(`Evidence Coverage: ${pkg.evidenceCoverageScore}/100`, margin + 95, y);
      y += 9;

      // Section 1: Incident Description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('1. Incident Narrative & Summary', margin, y);
      y += 5;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const splitDesc = doc.splitTextToSize(pkg.description, 174);
      doc.text(splitDesc, margin, y);
      y += (splitDesc.length * 4) + 6;

      // Section 2: Chronological Timeline
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('2. Case Timeline & Chronology', margin, y);
      y += 6;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      (pkg.timeline || []).forEach((ev) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text(`• ${ev.date}: ${ev.title} [${ev.category}]`, margin, y);
        y += 4;
        if (ev.description) {
          doc.setFont('helvetica', 'normal');
          const evDesc = doc.splitTextToSize(ev.description, 165);
          doc.text(evDesc, margin + 4, y);
          y += (evDesc.length * 3.5);
        }
        y += 2;
      });
      y += 4;

      // Section 3: Evidence Index
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('3. Evidence Inventory & Preservation Status', margin, y);
      y += 6;

      doc.setFontSize(8);
      (pkg.evidenceIndex || []).forEach((evd) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`${evd.code}: ${evd.title} (${evd.type}, ${evd.category})`, margin, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        if (evd.relevanceNote) {
          doc.text(`Relevance: ${evd.relevanceNote}`, margin + 4, y);
          y += 4;
        }
        y += 2;
      });
      y += 4;

      // Section 4: Evidence Gaps
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(185, 28, 28);
      doc.text('4. Evidence Gaps & Missing Information', margin, y);
      y += 6;

      doc.setFontSize(8);
      (pkg.evidenceGaps || []).forEach((gap) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28);
        doc.text(`! Missing: ${gap.missingItem}`, margin, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(`Preservation Guidance: ${gap.suggestedPreservation}`, margin + 4, y);
        y += 6;
      });

      // Section 5: Relevant Legal Topics
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('5. Potential Legal Topics (Statutory Mapping)', margin, y);
      y += 6;

      doc.setFontSize(8);
      (pkg.legalTopics || []).forEach((lt) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`§ ${lt.name} - ${lt.statute}`, margin, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(lt.relevanceExplanation, margin + 4, y);
        y += 6;
      });

      // Section 6: Questions for Lawyer
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('6. Recommended Questions For Legal Counsel', margin, y);
      y += 6;

      doc.setFontSize(8);
      (pkg.questionsForLawyer || []).forEach((q) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(`[${q.status.toUpperCase()}] ${q.question}`, margin, y);
        y += 4.5;
      });

      // Save PDF
      doc.save(`LawShield_Case_Dossier_${pkg.caseTitle.replace(/\s+/g, '_')}.pdf`);
      showToast('🎉 Case Intelligence Dossier PDF downloaded!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate case package PDF', 'error');
    }
  };

  const currentCase = caseDetails?.case;
  const events = caseDetails?.events || [];
  const evidence = caseDetails?.evidence || [];
  const legalTopics = caseDetails?.legalTopics || [];
  const evidenceGaps = caseDetails?.evidenceGaps || [];
  const questions = caseDetails?.questions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-in fade-in duration-200">
      {/* 1. Header Banner & Case Selector */}
      <div className="bg-white border-2 border-stone-200 p-6 sm:p-7 rounded-3xl relative overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-[#854d0e] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Brain size={14} className="text-[#854d0e]" />
                <span>CASE INTELLIGENCE ENGINE</span>
              </span>
              <span className="text-xs bg-stone-100 text-slate-800 font-bold px-2.5 py-0.5 rounded-full border border-stone-300 font-mono">
                v2.4
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
                {currentCase?.title || 'Legal Case Workspace'}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 max-w-2xl leading-relaxed font-medium">
              Synthesize factual incident narratives, evaluate evidence coverage, detect crucial information gaps, and prepare structured, attorney-ready dossiers.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Case Selector Dropdown */}
            {cases.length > 0 && (
              <div className="relative">
                <select
                  value={activeCaseId}
                  onChange={(e) => {
                    setActiveCaseId(e.target.value);
                    fetchCaseDetails(e.target.value);
                  }}
                  className="bg-white border-2 border-stone-300 text-[#0f172a] text-xs font-bold rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:border-[#0f172a] appearance-none cursor-pointer shadow-xs"
                >
                  {cases.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              </div>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
            >
              <Plus size={14} />
              <span>New Case</span>
            </button>

            {currentCase && (
              <>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-stone-100 hover:bg-stone-200 text-slate-900 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-stone-300 transition flex items-center space-x-1.5 shadow-xs"
                  title="Share structured case brief with qualified advocate"
                >
                  <Share2 size={14} className="text-[#854d0e]" />
                  <span>Share Brief</span>
                </button>

                <button
                  onClick={handleGeneratePdfPackage}
                  className="bg-[#854d0e] hover:bg-[#713f12] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                  title="Generate downloadable 10-section case package PDF"
                >
                  <Download size={14} />
                  <span>Case Package (PDF)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mandatory Court Outcome Disclaimer Alert */}
        <div className="mt-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-center space-x-3 text-xs text-amber-950 shadow-xs">
          <AlertTriangle size={18} className="text-amber-700 shrink-0" />
          <div className="flex-1 font-medium">
            <span className="font-extrabold text-amber-950">Statutory Notice: </span>
            <span>«LawShield provides AI-assisted legal information and case organization. It does not predict court outcomes or replace advice from a qualified lawyer.»</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs Inside Case Intelligence */}
      <div className="border-b border-stone-300 flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'overview', label: 'Executive Dashboard', icon: Activity },
          { id: 'analyzer', label: 'AI Case Analyzer', icon: Brain },
          { id: 'evidence', label: `Evidence Vault (${evidence.length})`, icon: FolderLock },
          { id: 'timeline', label: `Smart Timeline (${events.length})`, icon: Clock },
          { id: 'mapping', label: 'Law-to-Evidence Map', icon: Layers },
          { id: 'gaps', label: `Evidence Gaps (${evidenceGaps.length})`, icon: AlertTriangle, badge: evidenceGaps.length > 0 },
          { id: 'brief', label: 'AI Case Brief', icon: FileText },
          { id: 'questions', label: `Lawyer Questions (${questions.length})`, icon: HelpCircle },
          ...(isLawyer ? [{ id: 'lawyer', label: 'Lawyer Consultation View', icon: Scale }] : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
                isActive
                  ? 'bg-[#0f172a] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#0f172a] hover:bg-stone-100 border border-transparent'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-amber-300' : 'text-slate-600'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* If No Case Created Yet */}
      {cases.length === 0 && !loading && (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-xl mx-auto">
          <Brain size={48} className="mx-auto text-blue-400" />
          <h3 className="text-lg font-bold text-white">No Cases Initialized Yet</h3>
          <p className="text-xs text-slate-400">
            Create your first legal case workspace to organize incidents, catalog evidence, and generate advocate-ready briefs.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition inline-flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Create First Case</span>
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      {currentCase && (
        <div className="space-y-6">

          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Information Completeness */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3 hover:border-stone-300 transition">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold uppercase tracking-wider text-[11px] text-slate-900">Case Completeness</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                      <FileCheck size={16} />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-[#0f172a]">{currentCase.informationCompleteness || 78}</span>
                    <span className="text-xs font-bold text-slate-600">/ 100</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${currentCase.informationCompleteness || 78}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Measurable data organization — not a court prediction.
                  </p>
                </div>

                {/* Evidence Strength & Coverage */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3 hover:border-stone-300 transition">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold uppercase tracking-wider text-[11px] text-slate-900">Evidence Coverage</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                      <FolderLock size={16} />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-[#0f172a]">{currentCase.evidenceCoverage || 73}</span>
                    <span className="text-xs font-bold text-slate-600">/ 100</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${currentCase.evidenceCoverage || 73}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Documentation factor evaluation.
                  </p>
                </div>

                {/* Timeline Events */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3 hover:border-stone-300 transition">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold uppercase tracking-wider text-[11px] text-slate-900">Timeline Events</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
                      <Clock size={16} />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-[#0f172a]">{events.length}</span>
                    <span className="text-xs font-bold text-slate-600">logged</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="bg-amber-600 h-full rounded-full"
                      style={{ width: `${Math.min(events.length * 20, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Earliest: {events[0]?.date || 'N/A'} | Latest: {events[events.length - 1]?.date || 'N/A'}
                  </p>
                </div>

                {/* Evidence Gaps */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3 hover:border-stone-300 transition">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold uppercase tracking-wider text-[11px] text-slate-900">Flagged Gaps</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
                      <AlertTriangle size={16} />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-rose-700">{evidenceGaps.length}</span>
                    <span className="text-xs font-bold text-slate-600">items to preserve</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${Math.min(evidenceGaps.length * 25, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Crucial records recommended for advocate review.
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Evidence Strength Breakdown */}
                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div className="flex items-center space-x-2">
                      <Scale size={16} className="text-[#854d0e]" />
                      <h3 className="text-sm font-extrabold text-[#0f172a]">Evidence Factor Assessment</h3>
                    </div>
                    <span className="text-[10px] text-slate-800 bg-stone-100 border border-stone-300 font-bold px-2 py-0.5 rounded">
                      Structural Metric
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    AI-assisted evidence organization assessment — not a prediction of court outcome.
                  </p>

                  <div className="space-y-3.5">
                    {[
                      { factor: 'Relevance', value: 85, color: 'bg-blue-600' },
                      { factor: 'Documentation', value: 74, color: 'bg-emerald-600' },
                      { factor: 'Timeline consistency', value: 78, color: 'bg-amber-600' },
                      { factor: 'Corroboration', value: 61, color: 'bg-indigo-600' },
                      { factor: 'Completeness', value: 68, color: 'bg-cyan-600' },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-800">{item.factor}</span>
                          <span className="text-[#0f172a] font-mono">{item.value} / 100</span>
                        </div>
                        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
                          <div
                            className={`${item.color} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${item.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium flex items-start space-x-2.5 shadow-xs">
                    <Sparkles size={16} className="text-[#854d0e] shrink-0 mt-0.5" />
                    <span>
                      Adding secondary witness records and raw carrier timestamps will optimize documentation completeness before legal consultation.
                    </span>
                  </div>
                </div>

                {/* Right: Quick Action Hub & Intelligence Summary */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Case Summary Card */}
                  <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                      <h3 className="text-sm font-extrabold text-[#0f172a]">Case Particulars</h3>
                      <span className="text-xs font-bold text-[#854d0e] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {currentCase.incidentType}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-800">
                      <p className="line-clamp-4 leading-relaxed font-medium">
                        {currentCase.description}
                      </p>
                      {currentCase.peopleInvolved && (
                        <p className="text-slate-700 font-medium pt-1">
                          <strong className="text-[#0f172a]">Parties Identified: </strong> {currentCase.peopleInvolved}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setActiveTab('brief')}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5"
                      >
                        <FileText size={13} />
                        <span>Generate AI Visual Storyboard</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('evidence')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
                      >
                        <FolderLock size={13} className="text-blue-400" />
                        <span>Upload Evidence</span>
                      </button>
                    </div>
                  </div>

                  {/* Potential Legal Topics Preview */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Statutory Provisions Mapped</h3>
                      <button
                        onClick={() => setActiveTab('analyzer')}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Explore Details →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {legalTopics.map((topic) => (
                        <div key={topic._id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-200 block">{topic.name}</span>
                            <span className="text-[11px] text-slate-400">{topic.statute}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            topic.severity === 'EMERGENCY'
                              ? 'bg-red-950 text-red-400 border border-red-500/30'
                              : 'bg-blue-950 text-blue-400 border border-blue-500/30'
                          }`}>
                            {topic.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI CASE ANALYZER */}
          {activeTab === 'analyzer' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-7">
              <div>
                <h2 className="text-xl font-bold text-white">AI Case Analyzer & Legal Issue Mapping</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesized breakdown of reported events, statutory provisions, and verified legal encyclopaedia links.
                </p>
              </div>

              {/* Incident Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                  <FileText size={14} />
                  <span>Reported Incident Summary</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentCase.description}
                </p>
              </div>

              {/* Legal Topics Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Scale size={16} className="text-blue-400" />
                  <span>Potential Legal Topics Identified</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {legalTopics.map((lt) => (
                    <div key={lt._id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{lt.name}</span>
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {lt.severity}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400">{lt.statute}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{lt.relevanceExplanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facts, Dates & Entities */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Important Facts */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Important Facts</span>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>Dispute onset documented on {currentCase.incidentDate || 'recent date'}.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>Targeting occurred through digital electronic communications.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>Demand or harassment persisted despite clear lack of consent.</span>
                    </li>
                  </ul>
                </div>

                {/* Important Dates */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Important Dates</span>
                  <ul className="space-y-2 text-xs text-slate-400">
                    {events.map((ev) => (
                      <li key={ev._id} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>{ev.date}:</strong> {ev.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* People & Entities */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">People / Entities</span>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-start space-x-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>Complainant: {user?.name}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>Counterparty: {currentCase.peopleInvolved || 'Unidentified individual'}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>Jurisdiction: {currentCase.location || 'Local Police Jurisdiction'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Recommended Information */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-200">Recommended Information to Discuss With Advocate:</span>
                <p className="text-slate-400 leading-relaxed">
                  Bring uncompressed digital backup archives, Section 65B electronic certification affidavit, any prior complaints registered with police or intermediaries, and witness contacts.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE VAULT & INTELLIGENCE */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Case Evidence Vault & AI Intelligence</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Encrypted vault for files, chat backups, audio voicemails, and medical/police notices.
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-blue-600/30"
                >
                  <UploadCloud size={14} />
                  <span>Upload Evidence</span>
                </button>
              </div>

              {/* Evidence Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {evidence.map((item) => (
                  <div key={item._id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3.5 bg-slate-900/60 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {item.evidenceCode}
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                        {item.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.userDescription || 'Archived digital record.'}</p>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                      <div>File: {item.fileName}</div>
                      <div>Category: {item.incidentCategory}</div>
                      {item.relatedEventTitle && (
                        <div className="text-blue-300">Event: {item.relatedEventTitle}</div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedEvidenceForInspect(item)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                      >
                        <Sparkles size={12} />
                        <span>Inspect AI Extract</span>
                      </button>

                      <a
                        href={`${API_BASE_URL}${item.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                      >
                        <span>Open File</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SMART CASE TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Smart Chronological Case Timeline</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connect evidence to exact event dates to establish incontrovertible factual progression.
                  </p>
                </div>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5"
                >
                  <Plus size={14} />
                  <span>Add Timeline Event</span>
                </button>
              </div>

              {/* Timeline Tree View */}
              <div className="relative pl-6 border-l-2 border-blue-500/40 space-y-8 my-4">
                {events.map((ev, idx) => (
                  <div key={ev._id} className="relative group">
                    {/* Node Dot */}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-950 shadow-md"></div>

                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 group-hover:border-slate-700 transition">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-blue-400 font-mono bg-blue-500/10 px-2.5 py-0.5 rounded">
                            {ev.date}
                          </span>
                          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {ev.category}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteEvent(ev._id)}
                          className="text-slate-500 hover:text-red-400 transition"
                          title="Delete Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>

                      {/* Attached Evidence Pills */}
                      {ev.attachedEvidenceIds && ev.attachedEvidenceIds.length > 0 && (
                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                            <Link2 size={12} />
                            <span>Linked Evidence:</span>
                          </span>
                          {ev.attachedEvidenceIds.map((eid) => {
                            const linked = evidence.find(e => e._id === eid);
                            return (
                              <button
                                key={eid}
                                onClick={() => linked && setSelectedEvidenceForInspect(linked)}
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 px-2.5 py-0.5 rounded-md transition"
                              >
                                {linked ? `${linked.evidenceCode} (${linked.title})` : eid}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LAW-TO-EVIDENCE RELATIONSHIP MAP */}
          {activeTab === 'mapping' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Interactive Law-to-Evidence Relationship Map</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Visualize the relational network connecting your case narrative, statutory provisions, timeline events, and preserved evidence.
                </p>
              </div>

              {/* Interactive Network / Tree Diagram */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto">
                <div className="min-w-[700px] flex flex-col items-center space-y-8">
                  {/* Root Case Node */}
                  <div className="p-4 rounded-2xl bg-blue-600 text-white text-center shadow-xl shadow-blue-600/30 border border-blue-400 max-w-md w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Root Case Workspace</span>
                    <h3 className="text-sm font-extrabold">{currentCase.title}</h3>
                  </div>

                  {/* Level 2: Two Pillars (Legal Issues & Timeline Incidents) */}
                  <div className="grid grid-cols-2 gap-16 w-full max-w-3xl relative">
                    {/* Left: Legal Issues */}
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Statutory Legal Issues</span>
                        <span className="text-xs font-bold text-white">Relevant Penal Codes & Acts</span>
                      </div>

                      <div className="space-y-2">
                        {legalTopics.map((lt) => (
                          <div
                            key={lt._id}
                            onClick={() => setSelectedMapNode(lt)}
                            className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 cursor-pointer text-xs transition"
                          >
                            <span className="font-bold text-slate-200 block">{lt.name}</span>
                            <span className="text-[10px] text-slate-400">{lt.statute}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Incident Timeline */}
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Incident Timeline</span>
                        <span className="text-xs font-bold text-white">Factual Event Progression</span>
                      </div>

                      <div className="space-y-2">
                        {events.map((ev) => (
                          <div
                            key={ev._id}
                            onClick={() => setSelectedMapNode(ev)}
                            className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 cursor-pointer text-xs transition"
                          >
                            <span className="font-mono text-[10px] text-emerald-400">{ev.date}</span>
                            <span className="font-bold text-slate-200 block line-clamp-1">{ev.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Level 3: Evidence Anchor */}
                  <div className="w-full max-w-4xl pt-4 border-t border-slate-800 space-y-4 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                      Corroborating Evidence Inventory ({evidence.length} Linked Items)
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {evidence.map((evd) => (
                        <div
                          key={evd._id}
                          onClick={() => setSelectedEvidenceForInspect(evd)}
                          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 cursor-pointer text-xs space-y-1 text-left transition"
                        >
                          <span className="text-[10px] font-mono font-bold text-blue-400 block">{evd.evidenceCode}</span>
                          <span className="font-semibold text-white block line-clamp-1 text-[11px]">{evd.title}</span>
                          <span className="text-[10px] text-slate-400 block">{evd.incidentCategory}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EVIDENCE GAPS */}
          {activeTab === 'gaps' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-7">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <AlertTriangle size={22} className="text-amber-400" />
                  <span>Evidence Gap Detector & Suggested Preservation</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  The AI identifies missing or unclear electronic and physical records so you can preserve them before meeting your advocate.
                </p>
              </div>

              {/* Missing Records List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Missing / Unclear Information Identified
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {evidenceGaps.map((gap) => (
                    <div key={gap._id} className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
                      <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                        <AlertTriangle size={15} />
                        <span>⚠ {gap.missingItem}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{gap.reason}</p>
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                        <strong className="text-slate-200">Preservation Step: </strong>
                        {gap.suggestedPreservation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Preservation Checklist */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Standard Evidence Preservation Checklist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-300">
                  {[
                    'Original uncompressed WhatsApp / Telegram exports',
                    'High-resolution screenshots showing system clock',
                    'Call detail records (CDR) with call duration',
                    'Copies of bank / UPI transaction reference receipts',
                    'URL links saved with Wayback Machine / archive.today',
                    'Names and contact numbers of corroborating witnesses',
                  ].map((chk, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{chk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: AI CASE BRIEF */}
          {activeTab === 'brief' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">AI Case Brief For Advocate Consultation</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Structured 10-section briefing document. You can edit this text directly and save updates.
                  </p>
                </div>
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={handleGenerateBrief}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-md"
                  >
                    <Sparkles size={14} />
                    <span>✨ Auto-Generate Storyboard</span>
                  </button>

                  {editingBrief ? (
                    <button
                      onClick={handleSaveBrief}
                      disabled={savingBrief}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5"
                    >
                      <Check size={14} />
                      <span>{savingBrief ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingBrief(true)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
                    >
                      <Edit3 size={14} />
                      <span>Edit Brief</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Editor / Markdown Viewer / Visual Storyboard */}
              {typeof briefContent === 'object' && briefContent !== null ? (
                <VisualStoryboard storyboard={briefContent} />
              ) : editingBrief ? (
                <textarea
                  value={briefContent}
                  onChange={(e) => setBriefContent(e.target.value)}
                  rows={20}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-blue-500"
                />
              ) : (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 whitespace-pre-wrap text-xs text-slate-300 font-mono leading-relaxed max-h-[600px] overflow-y-auto">
                  {briefContent || 'Click "Regenerate Brief" to auto-generate a Visual Storyboard of your case.'}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: QUESTIONS FOR LAWYER */}
          {activeTab === 'questions' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Questions to Discuss With Your Lawyer</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-formulated legal questions tailored to your case situation. Track discussion status interactively.
                </p>
              </div>

              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q._id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded">
                        {q.category}
                      </span>
                      <p className="text-xs font-medium text-white">{q.question}</p>
                      {q.lawyerAnswer && (
                        <p className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2 rounded-lg mt-2 border border-emerald-500/20">
                          <strong>Advocate Note: </strong> {q.lawyerAnswer}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleQuestionStatus(q._id, q.status)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition shrink-0 ${
                        q.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : q.status === 'discussed'
                          ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      Status: {q.status.toUpperCase()}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: LAWYER CONSULTATION VIEW (If Lawyer Persona) */}
          {activeTab === 'lawyer' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex items-center space-x-2 text-rose-400">
                <Scale size={20} />
                <h2 className="text-xl font-bold text-white">Advocate Consultation Portal</h2>
              </div>
              <p className="text-xs text-slate-400">
                Review client-shared Case Intelligence dossiers, evaluate factual progression, inspect evidence, and attach professional advice notes.
              </p>

              {sharedCasesForLawyer.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 rounded-2xl">
                  No cases have been shared with your advocate account yet. Use the "Share Brief" action as Citizen to test this view.
                </div>
              ) : (
                <div className="space-y-6">
                  {sharedCasesForLawyer.map((item) => (
                    <div key={item.share._id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <span className="text-xs text-blue-400 font-bold">Client: {item.share.userName}</span>
                          <h3 className="text-base font-bold text-white">{item.case.title}</h3>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentTab('consultations')}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                          >
                            <MessageSquare size={13} />
                            <span>Start Chat</span>
                          </button>
                          <button
                            onClick={() => setCurrentTab('consultations')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                          >
                            <Video size={13} />
                            <span>Start Video</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300">
                        <p>{item.case.description}</p>
                      </div>

                      {/* Lawyer Consultation Notes */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-slate-300">Consultation Notes:</span>
                        {(item.share.lawyerNotes || []).map((note, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                            {note.text}
                          </div>
                        ))}

                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            value={newLawyerNote}
                            onChange={(e) => setNewLawyerNote(e.target.value)}
                            placeholder="Add advocate consultation note..."
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => handleAddLawyerNote(item.share._id)}
                            className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-1.5 rounded-xl border border-slate-700"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE CASE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Create Case Intelligence Workspace</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Case Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Online Harassment and Cyber Extortion"
                  value={newCaseForm.title}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Incident Type</label>
                  <select
                    value={newCaseForm.incidentType}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, incidentType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Cybercrime & Harassment">Cybercrime & Harassment</option>
                    <option value="Workplace Harassment (POSH)">Workplace Harassment (POSH)</option>
                    <option value="Domestic Violence">Domestic Violence</option>
                    <option value="Consumer Fraud">Consumer Fraud</option>
                    <option value="Property & Tenancy Dispute">Property & Tenancy Dispute</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Incident Date</label>
                  <input
                    type="date"
                    value={newCaseForm.incidentDate}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, incidentDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Incident Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe what occurred, dates, threats, demands, or messages received..."
                  value={newCaseForm.description}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">People / Entities Involved</label>
                <input
                  type="text"
                  placeholder="e.g. Unknown caller from VoIP +1-555-0199, Handle @Shadow"
                  value={newCaseForm.peopleInvolved}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, peopleInvolved: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD EVIDENCE */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Upload Evidence to Case Vault</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUploadEvidence} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select File (Image, PDF, Audio, Video) *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Evidence Title</label>
                <input
                  type="text"
                  placeholder="e.g. Threatening WhatsApp screenshot"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Digital Evidence">Digital Evidence</option>
                    <option value="Audio Recording">Audio Recording</option>
                    <option value="Chat Screenshot">Chat Screenshot</option>
                    <option value="Official Notice">Official Notice</option>
                    <option value="Medical Certificate">Medical Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Related Timeline Event</label>
                  <select
                    value={uploadRelatedEventId}
                    onChange={(e) => setUploadRelatedEventId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">None / General</option>
                    {events.map((ev) => (
                      <option key={ev._id} value={ev._id}>{ev.date} - {ev.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description & Context</label>
                <textarea
                  rows={2}
                  placeholder="Explain what this file proves and who sent it..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl"
                >
                  {uploading ? 'Processing AI...' : 'Upload & Analyze'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TIMELINE EVENT */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Smart Timeline Event</h3>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Explicit threat received via message"
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newEventForm.date}
                    onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <input
                    type="text"
                    value={newEventForm.category}
                    onChange={(e) => setNewEventForm({ ...newEventForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Factual notes of what occurred..."
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl"
                >
                  Record Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SHARE CASE WITH LAWYER */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Share2 size={18} className="text-blue-400" />
                <h3 className="text-base font-bold text-white">Share Case Brief with Advocate</h3>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <p>
                You are about to share your organized case intelligence dossier with an empaneled advocate. You retain complete control over which sections to disclose:
              </p>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Advocate</label>
                <select
                  value={selectedLawyerId}
                  onChange={(e) => setSelectedLawyerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="usr_demo_lawyer_001">Adv. Rajesh Verma (Supreme Court & High Court Bar)</option>
                  <option value="usr_demo_lawyer_002">Adv. Priya Deshmukh (POSH & Corporate Specialist)</option>
                  <option value="usr_demo_lawyer_003">Adv. Kabir Merchant (Cyber Crime & IT Act)</option>
                  <option value="usr_demo_lawyer_004">Adv. Sunita Rao (Consumer Rights & Tenancy)</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="font-bold text-white block">Choose What to Share:</span>

                {[
                  { key: 'summary', label: 'Case Summary & Narrative' },
                  { key: 'timeline', label: 'Chronological Timeline' },
                  { key: 'evidence', label: 'Selected Evidence Index & Extracts' },
                  { key: 'questions', label: 'Questions for Legal Counsel' },
                  { key: 'privateNotes', label: 'Personal Private Notes (Off by default)' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareConfig[item.key]}
                      onChange={(e) => setShareConfig({ ...shareConfig, [item.key]: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className={item.key === 'privateNotes' ? 'text-amber-300' : 'text-slate-300'}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                🔒 Advocate access is read-only. Your original encrypted evidence files cannot be modified.
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setShowShareModal(false)}
                className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleShareCase}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl flex items-center space-x-1.5"
              >
                <Check size={14} />
                <span>Confirm & Share</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EVIDENCE INTELLIGENCE INSPECT */}
      {selectedEvidenceForInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {selectedEvidenceForInspect.evidenceCode}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedEvidenceForInspect.title}</h3>
              </div>
              <button onClick={() => setSelectedEvidenceForInspect(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              {/* OCR Text */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Extracted Text / Transcript</span>
                <p className="text-slate-200 font-mono text-xs leading-relaxed">
                  {selectedEvidenceForInspect.extractedInfo?.text || 'No text extracted.'}
                </p>
              </div>

              {/* Relevance Rationale */}
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-1.5">
                <span className="text-blue-300 font-bold uppercase tracking-wider text-[10px]">Why It May Be Relevant</span>
                <p className="text-blue-100 text-xs leading-relaxed">
                  {selectedEvidenceForInspect.extractedInfo?.relevanceNote || 'Provides direct electronic record of incident sequence.'}
                </p>
              </div>

              {/* Metadata tags */}
              <div className="grid grid-cols-2 gap-3 text-slate-400 text-xs">
                <div><strong>Category: </strong> {selectedEvidenceForInspect.incidentCategory}</div>
                <div><strong>File Type: </strong> {selectedEvidenceForInspect.fileType}</div>
                <div><strong>Status: </strong> {selectedEvidenceForInspect.status}</div>
                <div><strong>Uploaded: </strong> {new Date(selectedEvidenceForInspect.uploadDate).toLocaleDateString()}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 italic">
                «AI extraction is for organization and review only. Original files should be preserved.»
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEvidenceForInspect(null)}
                className="bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
