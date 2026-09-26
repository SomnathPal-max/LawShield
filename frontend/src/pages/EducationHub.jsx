import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MockTrialSimulator } from '../components/MockTrialSimulator';
import { Gavel } from 'lucide-react';

export const EducationHub = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showMockTrial, setShowMockTrial] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleViewCourse = async (courseId) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedCourse(data.data);
      }
    } catch (err) {
      console.error('Error fetching course details', err);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      alert("Please login first to enroll.");
      return;
    }
    
    setIsEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert('Enrolled successfully!');
        handleViewCourse(courseId); // Refresh
      } else {
        alert(data.message || 'Failed to enroll');
      }
    } catch (err) {
      console.error('Error enrolling', err);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (playingVideo) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <button onClick={() => setPlayingVideo(null)} className="mb-4 text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
          ← Back to Course
        </button>
        <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video shadow-2xl relative">
          <video src={playingVideo.videoUrl} controls autoPlay className="w-full h-full object-contain" />
          {playingVideo.isAiGenerated && (
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm border border-white/10 flex items-center">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse mr-2"></span>
              AI Generated Teacher
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold mt-6">{playingVideo.title}</h2>
        <div className="mt-4 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Lesson Transcript (Script)</h3>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{playingVideo.scriptText}</p>
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <button onClick={() => setSelectedCourse(null)} className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
          ← Back to All Courses
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row mb-8">
          <div className="md:w-1/3 bg-slate-200">
            <img src={selectedCourse.thumbnail} alt={selectedCourse.title} className="w-full h-full object-cover" />
          </div>
          <div className="p-8 md:w-2/3 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{selectedCourse.title}</h1>
            <p className="text-slate-600 mb-6 text-lg">{selectedCourse.description}</p>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleEnroll(selectedCourse._id)}
                disabled={isEnrolling}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 font-medium text-lg disabled:opacity-70"
              >
                {isEnrolling ? 'Processing...' : (selectedCourse.price === 0 ? 'Enroll for Free' : `Enroll for $${selectedCourse.price}`)}
              </button>
              <div className="text-sm text-slate-500 font-medium bg-slate-100 px-4 py-2 rounded-lg">
                {selectedCourse.enrolledCount} already enrolled
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">Course Curriculum ({selectedCourse.lessons?.length || 0} Lessons)</h3>
        <div className="space-y-3">
          {selectedCourse.lessons?.map((lesson, idx) => (
            <div key={lesson._id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center hover:shadow-md transition-shadow group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mr-4">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{lesson.title}</h4>
                  {lesson.isAiGenerated && <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">AI Video</span>}
                </div>
              </div>
              <button 
                onClick={() => setPlayingVideo(lesson)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm"
              >
                Play Video
              </button>
            </div>
          ))}
          {(!selectedCourse.lessons || selectedCourse.lessons.length === 0) && (
            <div className="text-center p-8 bg-slate-50 rounded-xl text-slate-500 border border-dashed border-slate-300">
              Lessons are being prepared by the teacher. Check back soon!
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-200">
      
      {showMockTrial ? (
        <div className="mb-10">
          <MockTrialSimulator onClose={() => setShowMockTrial(false)} />
        </div>
      ) : (
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-tight">Citizen Education Hub</h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-500 font-medium">Equip yourself with practical legal knowledge. Practice testimonies and face realistic cross-examinations in our interactive AI-powered Mock Trial Simulator.</p>
          
          <div className="mt-8 max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between text-left shadow-sm">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Gavel size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-950">AI "Mock Trial" Simulator</h3>
                <p className="text-sm text-amber-900/80">Practice your testimony and face cross-examination from an AI opposing counsel.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowMockTrial(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-xl shadow-xs transition w-full sm:w-auto shrink-0"
            >
              Start Simulator
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map(course => (
          <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-xl transition-shadow" onClick={() => handleViewCourse(course._id)}>
            <div className="h-48 bg-slate-200 w-full relative overflow-hidden">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-sm font-bold text-slate-900 shadow-sm">
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight">{course.title}</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-2 flex-1">{course.description}</p>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center text-xs font-medium text-slate-500">
                  <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {course.enrolledCount} Students
                </div>
                <span className="text-indigo-600 font-medium text-sm group-hover:underline">View Course</span>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-slate-900">No courses available yet</h3>
            <p className="text-slate-500 mt-1">Our teachers are working on new materials.</p>
          </div>
        )}
      </div>
    </div>
  );
};
