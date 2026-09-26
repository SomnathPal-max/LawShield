const { Course, VideoLesson, Enrollment } = require('../models');

// @route   GET /api/courses
// @desc    Get all published courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'published' }).populate('teacherId', 'name email');
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   GET /api/courses/teacher
// @desc    Get courses created by the logged-in teacher
// @access  Private (Teacher)
exports.getTeacherCourses = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized as a teacher' });
    }
    const courses = await Course.find({ teacherId: req.user._id });
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   GET /api/courses/:id
// @desc    Get course by ID along with its video lessons
// @access  Public/Private
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacherId', 'name email');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const lessons = await VideoLesson.find({ courseId: course._id });
    res.json({ success: true, data: { ...course._doc, lessons } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Teacher)
exports.createCourse = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized as a teacher' });
    }
    const { title, description, price, thumbnail, status } = req.body;
    
    const course = await Course.create({
      teacherId: req.user._id,
      title,
      description,
      price: price || 0,
      thumbnail: thumbnail || 'https://via.placeholder.com/600x400?text=Course+Thumbnail',
      status: status || 'draft'
    });
    
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   POST /api/courses/:id/ai-video
// @desc    Generate AI Video Lesson from text script
// @access  Private (Teacher)
exports.addVideoLesson = async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized as a teacher' });
    }
    
    const { title, scriptText } = req.body;
    const courseId = req.params.id;
    
    // Simulate AI Video Generation Delay & Mock URL (as requested by user "use free model")
    console.log(`[AI Video Mock] Simulating generation for script: "${scriptText.substring(0, 30)}..."`);
    
    // In a real scenario, this would call HeyGen/D-ID API
    const mockVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    
    const lesson = await VideoLesson.create({
      courseId,
      title,
      scriptText,
      videoUrl: mockVideoUrl,
      isAiGenerated: true,
      status: 'completed'
    });
    
    res.status(201).json({ success: true, data: lesson, message: 'AI Video Generated successfully (Mock)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private (User)
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId: req.user.id, courseId: course._id });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }
    
    // Simulate Payment Gateway (as requested by user "for now add simulation")
    if (course.price > 0) {
      console.log(`[Payment Mock] Processing payment of $${course.price} for user ${req.user.id}`);
      // Simulate successful payment...
    }
    
    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId: course._id,
      progress: 0
    });
    
    // Increment course enroll count
    course.enrolledCount += 1;
    await course.save();
    
    res.status(201).json({ success: true, data: enrollment, message: 'Successfully enrolled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
