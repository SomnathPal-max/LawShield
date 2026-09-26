import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Search, 
  Filter, 
  CheckCircle, 
  Star, 
  MapPin, 
  Briefcase, 
  Video, 
  MessageSquare, 
  Calendar,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConsultationsPage } from './ConsultationsPage';

export const LawyerDirectory = ({ setCurrentTab, onSelectLawyerForCall, initialSection = 'directory' }) => {
  const { user, showToast } = useAuth();
  const [activeSection, setActiveSection] = useState(initialSection);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedLawyerForBooking, setSelectedLawyerForBooking] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('04:00 PM - 04:30 PM');
  const [bookingType, setBookingType] = useState('video');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lawyers');
      if (res.data.success) {
        setLawyers(res.data.lawyers);
      }
    } catch (err) {
      showToast('Failed to load lawyers directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const specializations = [
    'All',
    'Women Safety',
    'POSH Act',
    'Domestic Violence',
    'Cyber Crime',
    'Property & Tenancy',
    'Criminal Defense',
    'Civil Rights',
  ];

  const filteredLawyers = lawyers.filter((lawyer) => {
    const matchesSpec =
      selectedSpecialization === 'All' ||
      lawyer.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase());

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      lawyer.name.toLowerCase().includes(term) ||
      lawyer.specialization.toLowerCase().includes(term) ||
      lawyer.location.toLowerCase().includes(term) ||
      lawyer.bio.toLowerCase().includes(term);

    return matchesSpec && matchesSearch;
  });

  const handleBookConsultation = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      showToast('Please pick a consultation date', 'error');
      return;
    }

    setBookingSubmitting(true);
    try {
      const payload = {
        lawyerId: selectedLawyerForBooking.userId || selectedLawyerForBooking._id,
        date: bookingDate,
        timeSlot: bookingTime,
        type: bookingType,
        notes: bookingNotes,
      };

      const res = await api.post('/consultations', payload);
      if (res.data.success) {
        showToast('🎉 Consultation confirmed! Redirecting to consultations panel...', 'success');
        setSelectedLawyerForBooking(null);
        setCurrentTab('consultations');
      }
    } catch (err) {
      showToast('Booking failed. Please check details.', 'error');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleStartChat = async (lawyer) => {
    try {
      const recipientId = lawyer.userId || lawyer._id;
      const res = await api.post('/chat/conversations', { recipientId });
      if (res.data.success) {
        localStorage.setItem('lawshield_active_conv_id', res.data.conversation._id);
        setCurrentTab('consultations');
      }
    } catch (err) {
      showToast('Could not open chat room', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => {
            setActiveSection('directory');
            setCurrentTab('lawyers');
          }}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
            activeSection === 'directory'
              ? 'border-[#0f172a] text-[#0f172a]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Advocates Directory
        </button>
        <button
          onClick={() => {
            setActiveSection('consultations');
            setCurrentTab('consultations');
          }}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center space-x-2 ${
            activeSection === 'consultations'
              ? 'border-[#0f172a] text-[#0f172a]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Video size={16} />
          <span>My Consultations & Chat</span>
        </button>
      </div>

      {activeSection === 'consultations' ? (
        <ConsultationsPage setCurrentTab={setCurrentTab} />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-extrabold text-[#854d0e] bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2">
                <ShieldCheck size={14} className="text-[#854d0e]" />
                <span>Bar Council Verified Advocates</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
                Find Legal Advocates & Safety Counsel
              </h1>
              <p className="text-sm text-slate-800 mt-1 font-medium">
                Empanelled advocates offering secure WebRTC video consultations, legal advice, and court representation.
              </p>
            </div>
          </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-stone-200 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by advocate name, city, or specialty..."
            className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-4 py-2 text-xs text-[#0f172a] font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#0f172a] focus:bg-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full no-scrollbar pb-1 md:pb-0">
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialization(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-xs ${
                selectedSpecialization === spec
                  ? 'bg-[#0f172a] text-white'
                  : 'bg-stone-100 text-slate-800 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Lawyers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-stone-200 p-6 rounded-2xl h-64 animate-pulse"></div>
          ))}
        </div>
      ) : filteredLawyers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-stone-200 rounded-3xl space-y-3">
          <Scale size={36} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-[#0f172a]">No Advocates Found</h3>
          <p className="text-xs text-slate-600">Try adjusting your search criteria or specialization filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer) => (
            <div
              key={lawyer._id}
              className="bg-white border border-stone-200 p-6 rounded-3xl hover:border-stone-400 transition flex flex-col justify-between space-y-5 shadow-sm group"
            >
              <div className="space-y-4">
                {/* Avatar & Badges */}
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img
                      src={lawyer.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'}
                      alt={lawyer.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-stone-300 shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Available"></span>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    {lawyer.verificationStatus === 'verified' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black">
                        <CheckCircle size={11} />
                        <span>Verified Bar Council</span>
                      </span>
                    )}
                    <span className="text-[10px] text-slate-700 font-bold font-mono">
                      {lawyer.barId}
                    </span>
                  </div>
                </div>

                {/* Name & Specialization */}
                <div>
                  <h3 className="text-base font-extrabold text-[#0f172a] group-hover:text-[#854d0e] transition">
                    {lawyer.name}
                  </h3>
                  <p className="text-xs text-[#854d0e] font-bold">
                    {lawyer.specialization}
                  </p>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-y-2 text-[11px] text-slate-800 font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <Briefcase size={12} className="text-[#854d0e]" />
                    <span>{lawyer.experience}+ Years Exp.</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span>{lawyer.rating} ({lawyer.reviewsCount || 50} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin size={12} className="text-[#854d0e]" />
                    <span>{lawyer.location}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#0f172a] font-bold">₹</span>
                    <span className="font-extrabold text-[#0f172a]">{lawyer.fee} / consult</span>
                  </div>
                  <div className="col-span-2 mt-1.5 bg-stone-50 p-2 rounded-lg border border-stone-200">
                     🏆 <span className="font-bold text-slate-900">{lawyer.totalCasesSolved || '150+'} Total Cases Solved</span>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed font-normal">
                  {lawyer.bio}
                </p>

                {/* Languages */}
                <div className="flex flex-wrap gap-1">
                  {(lawyer.languages || ['English', 'Hindi']).map((lang, idx) => (
                    <span key={idx} className="text-[10px] bg-stone-100 text-slate-900 border border-stone-200 px-2 py-0.5 rounded font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedLawyerForBooking(lawyer)}
                  className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Calendar size={13} />
                  <span>Book Slot</span>
                </button>

                <button
                  onClick={() => handleStartChat(lawyer)}
                  className="bg-stone-100 hover:bg-stone-200 text-slate-900 text-xs font-bold py-2 px-3 rounded-xl border border-stone-300 transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <MessageSquare size={13} className="text-[#854d0e]" />
                  <span>Chat Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedLawyerForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Book Legal Consultation</h3>
                <p className="text-xs text-slate-400">With {selectedLawyerForBooking.name} ({selectedLawyerForBooking.specialization})</p>
              </div>
              <button
                onClick={() => setSelectedLawyerForBooking(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookConsultation} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingType('video')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                      bookingType === 'video'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Video size={15} />
                    <span>Encrypted Video Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('chat')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                      bookingType === 'chat'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <MessageSquare size={15} />
                    <span>Real-Time Legal Chat</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Select Time Slot
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                    <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                    <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                    <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                    <option value="06:00 PM - 06:30 PM">06:00 PM - 06:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Brief Summary of Legal Issue (Confidential)
                </label>
                <textarea
                  rows={3}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Outline key facts, dates, and what assistance you require..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex justify-between items-center">
                <span className="text-slate-400">Consultation Honorarium:</span>
                <span className="text-emerald-400 font-bold text-sm">₹{selectedLawyerForBooking.fee} (Auto-Approved Demo)</span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLawyerForBooking(null)}
                  className="text-xs text-slate-400 hover:text-white px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {bookingSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};
