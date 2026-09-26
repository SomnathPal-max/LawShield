const express = require('express');
const router = express.Router();
const { 
  getCourses, 
  getTeacherCourses, 
  getCourseById, 
  createCourse, 
  addVideoLesson, 
  enrollCourse 
} = require('../controllers/courseController');
const { authenticate } = require('../middleware/auth');

router.get('/', getCourses);
router.get('/teacher', authenticate, getTeacherCourses);
router.get('/:id', getCourseById);
router.post('/', authenticate, createCourse);
router.post('/:id/ai-video', authenticate, addVideoLesson);
router.post('/:id/enroll', authenticate, enrollCourse);

module.exports = router;
