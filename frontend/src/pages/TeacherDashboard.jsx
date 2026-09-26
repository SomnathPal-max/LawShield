import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const TeacherDashboard = ({ setCurrentTab }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // New Course Form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [courseData, setCourseData] = useState({ title: '', description: '', price: 0 });
  
  // AI Video Generation Form
  const [showAiVideoModal, setShowAiVideoModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [aiData, setAiData] = useState({ title: '', scriptText: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user?.role === 'teacher' || user?.role === 'admin') {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses/teacher', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(courseData)
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateForm(false);
        setCourseData({ title: '', description: '', price: 0 });
        fetchCourses();
      }
    } catch (err) {
      console.error('Error creating course', err);
    }
  };

  const handleGenerateAiVideo = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/courses/${selectedCourseId}/ai-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(aiData)
      });
      const data = await res.json();
      if (data.success) {
        alert('AI Video generated successfully!');
        setShowAiVideoModal(false);
        setAiData({ title: '', scriptText: '' });
      }
    } catch (err) {
      console.error('Error generating AI video', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center">Please login as a teacher to view this page.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your courses and AI generated lessons</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 font-medium"
        >
          {showCreateForm ? 'Cancel' : 'Create New Course'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create a Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
              <input type="text" value={courseData.title} onChange={e => setCourseData({...courseData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={courseData.description} onChange={e => setCourseData({...courseData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows="3" required></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($) - 0 for Free</label>
              <input type="number" min="0" value={courseData.price} onChange={e => setCourseData({...courseData, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Save Course</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="h-40 bg-slate-200 w-full object-cover">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{course.title}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2 flex-1">{course.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="font-medium text-indigo-600">{course.price === 0 ? 'Free' : `$${course.price}`}</span>
                <span className="text-xs text-slate-400">{course.enrolledCount} enrolled</span>
              </div>
              <button 
                onClick={() => { setSelectedCourseId(course._id); setShowAiVideoModal(true); }}
                className="mt-4 w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium transition-colors text-sm"
              >
                + Add AI Video Lesson
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAiVideoModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Studio</h2>
            <p className="text-sm text-slate-500 mb-6">Type a script and our AI avatar will generate a teaching video.</p>
            
            <form onSubmit={handleGenerateAiVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lesson Title</label>
                <input type="text" value={aiData.title} onChange={e => setAiData({...aiData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Script Text</label>
                <textarea value={aiData.scriptText} onChange={e => setAiData({...aiData, scriptText: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows="5" placeholder="Welcome to this lesson on fundamental rights..." required></textarea>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowAiVideoModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={isGenerating} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-70 flex justify-center items-center">
                  {isGenerating ? (
                    <><span className="animate-spin mr-2 border-2 border-white/20 border-t-white rounded-full w-4 h-4"></span> Generating...</>
                  ) : 'Generate Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
