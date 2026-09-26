import React, { useState, useEffect } from 'react';
import { 
  FolderLock, 
  UploadCloud, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Video, 
  File, 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle,
  Download, 
  ExternalLink,
  Lock,
  Plus
} from 'lucide-react';
import { api, API_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EvidenceVault = () => {
  const { showToast } = useAuth();
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Digital Evidence');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const categories = [
    'All',
    'Digital Evidence',
    'Chat Screenshot',
    'Audio Recording',
    'Medical Certificate',
    'Photographic',
    'Official Notice',
  ];

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      const res = await api.get('/evidence/my', {
        params: { category: selectedCategory !== 'All' ? selectedCategory : undefined }
      });
      if (res.data.success) {
        setEvidenceList(res.data.evidence);
      }
    } catch (err) {
      console.warn('Evidence fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [selectedCategory]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a file to upload', 'error');
      return;
    }
    if (!title.trim()) {
      showToast('Please enter an evidence title', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('category', category);
    formData.append('description', description.trim());

    try {
      const res = await api.post('/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        showToast('Evidence securely archived in vault', 'success');
        setShowUploadModal(false);
        setFile(null);
        setTitle('');
        setDescription('');
        fetchEvidence();
      }
    } catch (err) {
      showToast('Upload failed. Please ensure file is valid.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/evidence/${id}`);
      if (res.data.success) {
        showToast('Evidence item removed', 'info');
        setEvidenceList((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      showToast('Failed to delete evidence item', 'error');
    }
  };

  const getFileIcon = (fileType = '') => {
    if (fileType.includes('image')) return <ImageIcon size={22} className="text-blue-400" />;
    if (fileType.includes('image')) return <ImageIcon size={22} className="text-blue-600" />;
    if (fileType.includes('audio')) return <Music size={22} className="text-emerald-600" />;
    if (fileType.includes('video')) return <Video size={22} className="text-rose-600" />;
    return <FileText size={22} className="text-[#854d0e]" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-extrabold text-[#854d0e] bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2">
            <Lock size={14} className="text-[#854d0e]" />
            <span>Encrypted Custody Vault</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
            Cryptographic Evidence Locker
          </h1>
          <p className="text-xs sm:text-sm text-slate-800 mt-1 font-medium">
            Store contemporaneous digital records, call archives, and screenshots with timestamps for Section 65B preparation.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-2 shrink-0"
        >
          <Plus size={15} />
          <span>Upload Evidence File</span>
        </button>
      </div>

      {/* Statutory Section 65B Advisory Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start space-x-3 text-xs leading-relaxed text-amber-950 shadow-xs">
        <ShieldCheck size={20} className="text-[#854d0e] mt-0.5 shrink-0" />
        <div>
          <h4 className="font-extrabold text-amber-950 text-sm">
            Admissibility of Electronic Evidence (Section 65B / Bharatiya Sakshya Adhiniyam)
          </h4>
          <p className="text-amber-900 mt-0.5 font-medium">
            Files stored in this vault maintain timestamped cryptographic metadata. For formal judicial submission in Indian Courts, contemporaneous preservation of raw devices, printouts, and an advocate-endorsed Section 65B Certificate is statutory.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-xs ${
              selectedCategory === cat
                ? 'bg-[#0f172a] text-white'
                : 'bg-stone-100 text-slate-800 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Evidence Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-stone-200 p-6 rounded-3xl h-52"></div>
          ))}
        </div>
      ) : evidenceList.length === 0 ? (
        <div className="text-center py-16 bg-white border border-stone-200 rounded-3xl space-y-3">
          <FolderLock size={44} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-[#0f172a]">No Evidence Uploaded in this Category</h3>
          <p className="text-xs text-slate-600 font-medium">
            Upload screenshots, PDF notices, FIR copies, or call recordings to start.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs"
          >
            Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evidenceList.map((item) => (
            <div
              key={item._id}
              className="bg-white p-5 rounded-3xl border border-stone-200 hover:border-stone-400 transition flex flex-col justify-between space-y-4 shadow-xs group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-2">
                    <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-[#854d0e]">
                      {getFileIcon(item.fileType)}
                    </div>
                    {item.isForgedOrAI ? (
                      <div className="flex items-center space-x-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg text-[10px] font-bold h-fit mt-1 cursor-help" title={item.forgeryReason || 'Suspected AI or Forged Media'}>
                        <AlertTriangle size={12} />
                        <span>AI / Forged Warning</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-bold h-fit mt-1 cursor-help" title="No AI manipulation detected. EXIF data intact.">
                        <ShieldCheck size={12} />
                        <span>Authentic</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 flex-wrap justify-end gap-y-1 w-32">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#854d0e] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Delete from locker"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-[#0f172a] group-hover:text-[#854d0e] transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-800 mt-1 line-clamp-2 leading-relaxed font-normal">
                    {item.description || 'No notes provided.'}
                  </p>
                </div>
              </div>

              {/* Metadata & Actions */}
              <div className="pt-3 border-t border-stone-200 space-y-2 text-[11px] text-slate-700 font-medium">
                <div className="flex items-center justify-between">
                  <span>File: <code className="text-slate-900 font-mono text-[10px] font-bold">{item.fileName}</code></span>
                  <span className="font-bold">{item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : ''}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Archived: {new Date(item.uploadDate).toLocaleDateString()}</span>
                  <a
                    href={`${API_BASE_URL}${item.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0f172a] hover:text-[#854d0e] underline flex items-center space-x-1 font-extrabold"
                  >
                    <span>View / Open</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Upload to Evidence Vault</h3>
                <p className="text-xs text-slate-400">Attach files, chat exports, audio, or medical records</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Evidence Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. WhatsApp threat screenshots, Incident audio recording"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Digital Evidence">Digital Evidence</option>
                  <option value="Chat Screenshot">Chat Screenshot</option>
                  <option value="Audio Recording">Audio Recording</option>
                  <option value="Medical Certificate">Medical Certificate</option>
                  <option value="Photographic">Photographic Evidence</option>
                  <option value="Official Notice">Official Notice / Communication</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Incident Narrative / Details (Contemporaneous Notes)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Record exact date, participants, circumstances, and device from which this evidence was captured..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Select File (Images, PDF, Audio, Video, Docs - up to 25MB)
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-white px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {uploading ? 'Archiving & Encrypting...' : 'Upload & Encrypt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
