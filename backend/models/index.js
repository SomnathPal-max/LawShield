const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'lawyer', 'admin', 'teacher'], default: 'user' },
  phone: { type: String, default: '' },
  emergencyContacts: [
    {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relationship: { type: String, default: 'Family' },
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

// Course Schema
const courseSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, default: 0 },
  thumbnail: { type: String, default: '' },
  enrolledCount: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
});

// VideoLesson Schema
const videoLessonSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  scriptText: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  isAiGenerated: { type: Boolean, default: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'completed' },
  createdAt: { type: Date, default: Date.now },
});

// Enrollment Schema
const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Lawyer Profile Schema
const lawyerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  specialization: { type: String, required: true },
  barId: { type: String, required: true },
  experience: { type: Number, required: true },
  fee: { type: Number, default: 500 },
  rating: { type: Number, default: 4.8 },
  bio: { type: String, default: '' },
  location: { type: String, default: 'New Delhi, India' },
  avatar: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  availability: { type: String, default: 'Available Today' },
  languages: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

// Law Schema
const lawSchema = new mongoose.Schema({
  name: { type: String, required: true },
  section: { type: String, required: true },
  category: { type: String, required: true },
  explanation: { type: String, required: true },
  applicability: { type: String, required: true },
  rights: [{ type: String }],
  recommendedAction: { type: String, required: true },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'], default: 'MEDIUM' },
});

// Conversation Schema
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participantNames: [{ type: String }],
  lastMessage: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

// Message Schema
const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  text: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileType: { type: String, default: '' },
  isAudio: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Consultation Schema
const consultationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lawyerName: { type: String, required: true },
  specialization: { type: String, default: 'General Legal Aid' },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  type: { type: String, enum: ['chat', 'video'], default: 'video' },
  status: { type: String, enum: ['requested', 'accepted', 'rejected', 'completed'], default: 'requested' },
  fee: { type: Number, default: 500 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Evidence Schema
const evidenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  uploadDate: { type: Date, default: Date.now },
});

// Emergency Incident Schema
const emergencyIncidentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: 'Citizen' },
  userPhone: { type: String, default: '' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: 'Current GPS Location' },
  },
  contactsAlerted: [
    {
      name: { type: String },
      phone: { type: String },
      status: { type: String, default: 'Notification Dispatched' },
    }
  ],
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  notes: { type: String, default: 'SOS Emergency Signal Triggered via LawShield' },
  createdAt: { type: Date, default: Date.now },
});

// Generated Document Schema
const generatedDocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  docType: { type: String, required: true },
  title: { type: String, required: true },
  formData: { type: Object, default: {} },
  compiledContent: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Case Intelligence Schema
const caseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  incidentType: { type: String, default: 'General Incident' },
  incidentDate: { type: String, default: '' },
  location: { type: String, default: '' },
  description: { type: String, required: true },
  peopleInvolved: { type: String, default: '' },
  additionalNotes: { type: String, default: '' },
  status: { type: String, enum: ['active', 'in-review', 'closed'], default: 'active' },
  informationCompleteness: { type: Number, default: 0 },
  evidenceCoverage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Case Event Schema
const caseEventSchema = new mongoose.Schema({
  caseId: { type: String, required: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  category: { type: String, default: 'Communication' },
  description: { type: String, default: '' },
  attachedEvidenceIds: [{ type: String }],
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Case Evidence Schema
const caseEvidenceSchema = new mongoose.Schema({
  caseId: { type: String, required: true },
  userId: { type: String, required: true },
  evidenceCode: { type: String, required: true },
  title: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, default: 'document' },
  fileSize: { type: Number, default: 0 },
  uploadDate: { type: Date, default: Date.now },
  userDescription: { type: String, default: '' },
  incidentCategory: { type: String, default: 'Digital Evidence' },
  relatedEventId: { type: String, default: '' },
  relatedEventTitle: { type: String, default: '' },
  status: { type: String, default: 'Available' },
  extractedInfo: {
    text: { type: String, default: '' },
    dates: [{ type: String }],
    names: [{ type: String }],
    organizations: [{ type: String }],
    keywords: [{ type: String }],
    statements: [{ type: String }],
    relevanceNote: { type: String, default: '' },
  },
  isAiAnalyzed: { type: Boolean, default: false },
});

// Case Legal Topic Schema
const caseLegalTopicSchema = new mongoose.Schema({
  caseId: { type: String, required: true },
  name: { type: String, required: true },
  statute: { type: String, required: true },
  relevanceExplanation: { type: String, required: true },
  severity: { type: String, default: 'HIGH' },
  matchedLawId: { type: String, default: '' },
});

// Case Evidence Gap Schema
const caseEvidenceGapSchema = new mongoose.Schema({
  caseId: { type: String, required: true },
  missingItem: { type: String, required: true },
  reason: { type: String, required: true },
  suggestedPreservation: { type: String, required: true },
  status: { type: String, default: 'missing' },
});

// Case Brief Schema
const caseBriefSchema = new mongoose.Schema({
  caseId: { type: String, required: true },
  userId: { type: String, required: true },
  caseTitle: { type: String, required: true },
  incidentSummary: { type: String, default: '' },
  keyFacts: [{ type: String }],
  importantDates: [{ type: String }],
  peopleEntities: [{ type: String }],
  potentialLegalTopics: [{ type: String }],
  evidenceAvailable: [{ type: String }],
  evidenceGaps: [{ type: String }],
  timelineHighlights: [{ type: String }],
  questionsForLawyer: [{ type: String }],
  suggestedNextSteps: [{ type: String }],
  userEditedContent: { type: String, default: '' },
  generatedAt: { type: Date, default: Date.now },
  lastEditedAt: { type: Date, default: Date.now },
});

// Case Question Schema
const caseQuestionSchema = new mongoose.Schema({
  caseId: { type: String, required: true },
  userId: { type: String, required: true },
  question: { type: String, required: true },
  category: { type: String, default: 'General' },
  status: { type: String, enum: ['pending', 'discussed', 'resolved'], default: 'pending' },
  lawyerAnswer: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Case Share Schema
const caseShareSchema = new mongoose.Schema({
  caseId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, default: '' },
  lawyerId: { type: String, required: true },
  lawyerName: { type: String, default: '' },
  sharedSections: {
    summary: { type: Boolean, default: true },
    timeline: { type: Boolean, default: true },
    evidence: { type: Boolean, default: true },
    questions: { type: Boolean, default: true },
    privateNotes: { type: Boolean, default: false },
  },
  lawyerNotes: [
    {
      text: { type: String },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  sharedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'active' },
});

module.exports = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
  LawyerProfile: mongoose.models.LawyerProfile || mongoose.model('LawyerProfile', lawyerProfileSchema),
  Law: mongoose.models.Law || mongoose.model('Law', lawSchema),
  Conversation: mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema),
  Message: mongoose.models.Message || mongoose.model('Message', messageSchema),
  Consultation: mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema),
  Evidence: mongoose.models.Evidence || mongoose.model('Evidence', evidenceSchema),
  EmergencyIncident: mongoose.models.EmergencyIncident || mongoose.model('EmergencyIncident', emergencyIncidentSchema),
  GeneratedDocument: mongoose.models.GeneratedDocument || mongoose.model('GeneratedDocument', generatedDocumentSchema),
  Notification: mongoose.models.Notification || mongoose.model('Notification', notificationSchema),
  Case: mongoose.models.Case || mongoose.model('Case', caseSchema),
  CaseEvent: mongoose.models.CaseEvent || mongoose.model('CaseEvent', caseEventSchema),
  CaseEvidence: mongoose.models.CaseEvidence || mongoose.model('CaseEvidence', caseEvidenceSchema),
  CaseLegalTopic: mongoose.models.CaseLegalTopic || mongoose.model('CaseLegalTopic', caseLegalTopicSchema),
  CaseEvidenceGap: mongoose.models.CaseEvidenceGap || mongoose.model('CaseEvidenceGap', caseEvidenceGapSchema),
  CaseBrief: mongoose.models.CaseBrief || mongoose.model('CaseBrief', caseBriefSchema),
  CaseQuestion: mongoose.models.CaseQuestion || mongoose.model('CaseQuestion', caseQuestionSchema),
  CaseShare: mongoose.models.CaseShare || mongoose.model('CaseShare', caseShareSchema),
  Course: mongoose.models.Course || mongoose.model('Course', courseSchema),
  VideoLesson: mongoose.models.VideoLesson || mongoose.model('VideoLesson', videoLessonSchema),
  Enrollment: mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema),
};

