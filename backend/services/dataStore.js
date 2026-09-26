const { randomUUID: uuidv4 } = require('crypto');
const { seedUsers, seedLawyerProfiles, seedLaws, seedEmergencyResources } = require('./../data/seedData');
const { isMongoActive } = require('../config/db');
const models = require('../models');

// In-Memory resilient store
const store = {
  users: [...seedUsers],
  lawyers: [...seedLawyerProfiles],
  laws: [...seedLaws],
  conversations: [
    {
      _id: 'conv_001',
      participants: ['usr_demo_citizen_001', 'usr_demo_lawyer_001'],
      participantNames: ['Ananya Sharma', 'Adv. Rajesh Verma'],
      lastMessage: 'I have reviewed your inquiry. Please upload the incident details.',
      updatedAt: new Date(),
    }
  ],
  messages: [
    {
      _id: 'msg_001',
      conversationId: 'conv_001',
      senderId: 'usr_demo_citizen_001',
      senderName: 'Ananya Sharma',
      text: 'Hello Adv. Rajesh, I need urgent legal guidance regarding domestic harassment and my tenancy rights.',
      fileUrl: '',
      fileName: '',
      fileType: '',
      isAudio: false,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      _id: 'msg_002',
      conversationId: 'conv_001',
      senderId: 'usr_demo_lawyer_001',
      senderName: 'Adv. Rajesh Verma',
      text: 'I have reviewed your inquiry. Please upload the incident details and any relevant documents to your Evidence Locker so I can advise you accurately.',
      fileUrl: '',
      fileName: '',
      fileType: '',
      isAudio: false,
      createdAt: new Date(Date.now() - 1800000),
    }
  ],
  consultations: [
    {
      _id: 'cons_001',
      userId: 'usr_demo_citizen_001',
      userName: 'Ananya Sharma',
      lawyerId: 'usr_demo_lawyer_001',
      lawyerName: 'Adv. Rajesh Verma',
      specialization: 'Women Safety & Domestic Violence',
      date: '2026-09-18',
      timeSlot: '04:00 PM - 04:30 PM',
      type: 'video',
      status: 'accepted',
      fee: 800,
      notes: 'Initial emergency legal assessment regarding shared household rights.',
      createdAt: new Date(),
    }
  ],
  evidence: [
    {
      _id: 'ev_001',
      userId: 'usr_demo_citizen_001',
      title: 'Harassment WhatsApp Export & Call Records',
      category: 'Digital Evidence',
      description: 'Screenshots of threatening messages received between Sept 10 and Sept 14.',
      fileUrl: '/uploads/sample_evidence_call_log.png',
      fileName: 'sample_evidence_call_log.png',
      fileType: 'image/png',
      fileSize: 428000,
      uploadDate: new Date(),
    }
  ],
  emergencyIncidents: [
    {
      _id: 'inc_001',
      userId: 'usr_demo_citizen_001',
      userName: 'Ananya Sharma',
      userPhone: '+91 98765 43210',
      location: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, Central Delhi' },
      contactsAlerted: [
        { name: 'Dr. Ramesh Sharma (Father)', phone: '+91 98765 00001', status: 'Delivered' },
        { name: 'Pooja Verma (Friend)', phone: '+91 98765 00002', status: 'Delivered' },
      ],
      status: 'active',
      notes: 'Automated SOS Triggered with Geolocation',
      createdAt: new Date(),
    }
  ],
  documents: [
    {
      _id: 'doc_001',
      userId: 'usr_demo_citizen_001',
      docType: 'Police Complaint (Zero FIR)',
      title: 'Formal Police Complaint under Section 354 IPC',
      formData: {
        complainantName: 'Ananya Sharma',
        accusedName: 'Unknown Caller',
        incidentDate: '2026-09-14',
        incidentPlace: 'Public Metro Station / Digital',
        incidentDetails: 'Repeated offensive phone calls and online stalking.',
      },
      compiledContent: 'TO THE STATION HOUSE OFFICER (SHO),\n\nSubject: Formal Complaint under Section 354D (Stalking) and IT Act 66E.\n\nRespected Sir/Madam,\nI, Ananya Sharma, wish to state that since 14th September 2026, I have been continuously harassed and followed...',
      createdAt: new Date(),
    }
  ],
  notifications: [
    {
      _id: 'notif_001',
      userId: 'usr_demo_citizen_001',
      title: 'Consultation Confirmed',
      message: 'Adv. Rajesh Verma accepted your video consultation for Sept 18 at 04:00 PM.',
      type: 'consultation',
      read: false,
      createdAt: new Date(),
    }
  ],
  emergencyResources: seedEmergencyResources,
  crimeZones: [
    {
      _id: 'zone_001',
      name: 'Central Avenue & Metro Station Path',
      type: 'High Risk',
      description: 'Multiple reports of snatching and harassment after 9 PM. Poor street lighting.',
      lat: 28.6135,
      lng: 77.2095,
      radiusMeters: 300,
    },
    {
      _id: 'zone_002',
      name: 'North Ring Road Underpass',
      type: 'Severe Risk',
      description: 'Isolated underpass with no CCTV coverage. Avoid walking alone.',
      lat: 28.6150,
      lng: 77.2150,
      radiusMeters: 200,
    }
  ],

  // Case Intelligence Collections
  cases: [
    {
      _id: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      title: 'Online Harassment & Cyber Extortion',
      incidentType: 'Cybercrime & Harassment',
      incidentDate: '2026-09-12',
      location: 'South Delhi / Digital Platforms',
      description: 'Received repeated anonymous extortion threats demanding ₹50,000 under threat of distributing non-consensual altered photographs across social networks. Multiple unknown VoIP phone calls and fake social media accounts created targeting family and colleagues.',
      peopleInvolved: 'Unknown Perpetrator (Handle @ShadowCyber99), Family members receiving abusive links',
      additionalNotes: 'Perpetrator contacted via WhatsApp from virtual VoIP number +1 (555) 019-2834. Threatens escalation if money is not paid by September 22.',
      status: 'active',
      informationCompleteness: 78,
      evidenceCoverage: 73,
      completenessBreakdown: {
        incidentDescription: 88,
        timelineCompleteness: 82,
        evidenceAttached: 75,
        evidenceMetadata: 70,
        importantDates: 85,
        supportingDocs: 68,
      },
      evidenceFactors: {
        relevance: 85,
        documentation: 74,
        consistency: 78,
        corroboration: 61,
        completeness: 68,
      },
      createdAt: new Date(Date.now() - 7 * 86400000),
      updatedAt: new Date(),
    }
  ],

  caseEvents: [
    {
      _id: 'ev_timeline_001',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      title: 'First unsolicited contact on social media',
      date: '2026-09-10',
      category: 'Initial Contact',
      description: 'Anonymous account (@ShadowCyber99) followed profile and sent message claiming possession of private archives.',
      attachedEvidenceIds: ['ev_c_003'],
      notes: 'Initial account blocked immediately.',
      createdAt: new Date(Date.now() - 7 * 86400000),
    },
    {
      _id: 'ev_timeline_002',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      title: 'Explicit monetary extortion threat received via message',
      date: '2026-09-12',
      category: 'Threat Received',
      description: 'WhatsApp message sent from +1 (555) 019-2834 demanding ₹50,000 via UPI QR code within 48 hours.',
      attachedEvidenceIds: ['ev_c_001', 'ev_c_005'],
      notes: 'Contains explicit ultimatum and morphed preview thumbnails.',
      createdAt: new Date(Date.now() - 5 * 86400000),
    },
    {
      _id: 'ev_timeline_003',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      title: 'Voicemail audio threat received from spoofed number',
      date: '2026-09-13',
      category: 'Voicemail Threat',
      description: 'Audio message left warning that family members would be tagged in public posts if police were informed.',
      attachedEvidenceIds: ['ev_c_002'],
      notes: 'Audio recording saved with background sound characteristics.',
      createdAt: new Date(Date.now() - 4 * 86400000),
    },
    {
      _id: 'ev_timeline_004',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      title: 'High-resolution screenshots captured and evidence locked',
      date: '2026-09-14',
      category: 'Evidence Preservation',
      description: 'Exported chat archives, preserved full URL links, and uploaded files to LawShield Evidence Locker.',
      attachedEvidenceIds: ['ev_c_001', 'ev_c_003'],
      notes: 'Timestamps recorded with system clock verification.',
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      _id: 'ev_timeline_005',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      title: 'Initial Cybercrime Cell acknowledgement filed',
      date: '2026-09-16',
      category: 'Official Action',
      description: 'Submitted online complaint draft to National Cyber Crime Reporting Portal (1930) and obtained acknowledgment number.',
      attachedEvidenceIds: ['ev_c_004'],
      notes: 'Acknowledgement reference #CYBER/2026/DEL/89124.',
      createdAt: new Date(Date.now() - 1 * 86400000),
    },
  ],

  caseEvidence: [
    {
      _id: 'ev_c_001',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      evidenceCode: 'E-001',
      title: 'Threatening WhatsApp Chat Screenshots & Timestamps',
      fileName: 'whatsapp_threat_threads_sept12.png',
      fileUrl: '/uploads/sample_evidence_call_log.png',
      fileType: 'image/png',
      fileSize: 485000,
      uploadDate: new Date(Date.now() - 5 * 86400000),
      userDescription: 'Four sequential screenshots showing explicit extortion demand for ₹50,000 with deadline warning.',
      incidentCategory: 'Digital Evidence',
      relatedEventId: 'ev_timeline_002',
      relatedEventTitle: 'Explicit monetary extortion threat received via message',
      status: 'Available',
      extractedInfo: {
        text: 'Pay 50000 INR to the UPI ID provided before tomorrow 6 PM or everyone in your contact circle gets the photos.',
        dates: ['12 Sep 2026', '13 Sep 2026'],
        names: ['Ananya Sharma', 'Unknown Sender'],
        organizations: ['WhatsApp', 'UPI'],
        keywords: ['extortion', '50000 INR', 'photos', 'deadline', 'UPI'],
        statements: ['Demands ₹50,000 with explicit threat of unauthorized image dissemination.'],
        relevanceNote: 'Critical direct proof of extortion under Section 384 IPC and Section 66E IT Act.',
      },
      isAiAnalyzed: true,
    },
    {
      _id: 'ev_c_002',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      evidenceCode: 'E-002',
      title: 'Voicemail Audio Threat Recording',
      fileName: 'voicemail_extortion_spoofed_call.mp3',
      fileUrl: '/uploads/sample_voicemail.mp3',
      fileType: 'audio/mpeg',
      fileSize: 1240000,
      uploadDate: new Date(Date.now() - 4 * 86400000),
      userDescription: 'Voicemail message left on September 13 with disguised male voice demanding prompt payment.',
      incidentCategory: 'Audio Recording',
      relatedEventId: 'ev_timeline_003',
      relatedEventTitle: 'Voicemail audio threat received from spoofed number',
      status: 'Available',
      extractedInfo: {
        text: 'You have only 24 hours left. Do not try to contact the police or your family will regret it.',
        dates: ['13 Sep 2026'],
        names: ['Caller (Male voice, distorted)'],
        organizations: ['VoIP Telecom Carrier'],
        keywords: ['24 hours', 'police', 'regret', 'warning'],
        statements: ['Verbal intimidation and attempt to suppress criminal reporting.'],
        relevanceNote: 'Substantiates criminal intimidation (Section 506 IPC) and intent to deter reporting.',
      },
      isAiAnalyzed: true,
    },
    {
      _id: 'ev_c_003',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      evidenceCode: 'E-003',
      title: 'Morphed Social Profile Capture & URL Archive',
      fileName: 'instagram_imposter_handle_capture.jpg',
      fileUrl: '/uploads/sample_evidence_call_log.png',
      fileType: 'image/jpeg',
      fileSize: 620000,
      uploadDate: new Date(Date.now() - 6 * 86400000),
      userDescription: 'Screenshot of fake handle @ShadowCyber99 with bio targeting complainant and direct message links.',
      incidentCategory: 'Chat Screenshot',
      relatedEventId: 'ev_timeline_001',
      relatedEventTitle: 'First unsolicited contact on social media',
      status: 'Available',
      extractedInfo: {
        text: 'Account created September 2026. Following 42 mutual friends. Bio mentions complainant workplace.',
        dates: ['10 Sep 2026'],
        names: ['@ShadowCyber99'],
        organizations: ['Instagram / Meta Platforms'],
        keywords: ['fake profile', 'impersonation', 'mutual friends', 'bio'],
        statements: ['Use of imposter account for harassment and target profiling.'],
        relevanceNote: 'Provides electronic record for Section 66D (Cheating by impersonation using computer resource) and Section 354D IPC (Stalking).',
      },
      isAiAnalyzed: true,
    },
    {
      _id: 'ev_c_004',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      evidenceCode: 'E-004',
      title: 'Cyber Crime Cell Complaint Acknowledgment Slip',
      fileName: 'cyber_cell_acknowledgment_slip_89124.pdf',
      fileUrl: '/uploads/sample_cyber_receipt.pdf',
      fileType: 'application/pdf',
      fileSize: 310000,
      uploadDate: new Date(Date.now() - 1 * 86400000),
      userDescription: 'Official automated acknowledgment receipt generated by NCRP portal with assigned tracking number.',
      incidentCategory: 'Official Notice',
      relatedEventId: 'ev_timeline_005',
      relatedEventTitle: 'Initial Cybercrime Cell acknowledgement filed',
      status: 'Available',
      extractedInfo: {
        text: 'Government of India - National Cyber Crime Reporting Portal. Acknowledgment Number: 2026/DEL/89124. Complaint Type: Women/Children Cyber Crime.',
        dates: ['16 Sep 2026'],
        names: ['Ananya Sharma (Complainant)'],
        organizations: ['National Cyber Crime Reporting Portal (MHA)'],
        keywords: ['Acknowledgment Number', 'NCRP', 'Cyber Cell', 'Status: Pending Investigation'],
        statements: ['Formal procedural step initiated prior to advocate consultation.'],
        relevanceNote: 'Demonstrates prompt victim action and procedural mitigation.',
      },
      isAiAnalyzed: true,
    },
    {
      _id: 'ev_c_005',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      evidenceCode: 'E-005',
      title: 'UPI Payment Extortion Request QR & VPA Screenshot',
      fileName: 'upi_payment_qr_demand_capture.png',
      fileUrl: '/uploads/sample_evidence_call_log.png',
      fileType: 'image/png',
      fileSize: 410000,
      uploadDate: new Date(Date.now() - 5 * 86400000),
      userDescription: 'Screenshot of UPI QR code sent by perpetrator linking to virtual payment address cyberpay99@okhdfcbank.',
      incidentCategory: 'Digital Evidence',
      relatedEventId: 'ev_timeline_002',
      relatedEventTitle: 'Explicit monetary extortion threat received via message',
      status: 'Available',
      extractedInfo: {
        text: 'Scan to pay ₹50,000. VPA: cyberpay99@okhdfcbank. Beneficiary name masked.',
        dates: ['12 Sep 2026'],
        names: ['cyberpay99@okhdfcbank'],
        organizations: ['NPCI', 'HDFC Bank'],
        keywords: ['UPI', 'VPA', 'QR code', '₹50,000', 'Bank trace'],
        statements: ['Provides vital financial trail and banking identifier for law enforcement subpoena.'],
        relevanceNote: 'Provides traceable VPA and bank link for cyber forensic freeze and Section 91 CrPC notice to bank.',
      },
      isAiAnalyzed: true,
    },
  ],

  caseLegalTopics: [
    {
      _id: 'clt_001',
      caseId: 'case_demo_001',
      name: 'Non-Consensual Imagery & Electronic Obscenity',
      statute: 'Information Technology Act 2000 (Section 66E, 67, 67A)',
      relevanceExplanation: 'Applies to capturing, transmitting, or threatening to publish intimate or non-consensual images without consent. Punishable with up to 3 to 5 years imprisonment and monetary fine.',
      severity: 'EMERGENCY',
      matchedLawId: 'law_003',
    },
    {
      _id: 'clt_002',
      caseId: 'case_demo_001',
      name: 'Cyber Stalking & Electronic Surveillance',
      statute: 'IPC Section 354D / Bharatiya Nyaya Sanhita Equivalent',
      relevanceExplanation: 'Covers monitoring a woman’s use of the internet, email, or other forms of electronic communication, and contacting her repeatedly despite clear disinterest.',
      severity: 'HIGH',
      matchedLawId: 'law_004',
    },
    {
      _id: 'clt_003',
      caseId: 'case_demo_001',
      name: 'Extortion & Criminal Intimidation',
      statute: 'IPC Section 384 (Extortion) & Section 506 (Criminal Intimidation)',
      relevanceExplanation: 'Demanding money (₹50,000) under threat of causing reputational or bodily harm constitutes extortion and criminal intimidation, both cognizable offences.',
      severity: 'HIGH',
      matchedLawId: 'law_001',
    },
  ],

  caseEvidenceGaps: [
    {
      _id: 'gap_001',
      caseId: 'case_demo_001',
      missingItem: 'Original uncompressed chat export with full header metadata',
      reason: 'Standard mobile screenshots lack technical server transit metadata and IP routing information needed for digital forensics.',
      suggestedPreservation: 'Export the complete WhatsApp chat thread directly from app settings (select "Without Media" or "Include Media") into raw .txt or email archive without editing.',
      status: 'missing',
    },
    {
      _id: 'gap_002',
      caseId: 'case_demo_001',
      missingItem: 'Official Call Detail Record (CDR) logs from mobile operator',
      reason: 'VoIP spoofed numbers must be subpoenaed from cellular gateway providers by police under Section 91 CrPC.',
      suggestedPreservation: 'Note exact incoming call timestamps down to seconds on your phone call history and take a photo of the itemized call history log.',
      status: 'unclear',
    },
    {
      _id: 'gap_003',
      caseId: 'case_demo_001',
      missingItem: 'Corroborating witness statement from colleague contacted by perpetrator',
      reason: 'Independent third-party verification reinforces that the perpetrator actively contacted acquaintances, proving wide dissemination risk.',
      suggestedPreservation: 'Ask colleague to save the exact message thread received, screenshot the sender profile, and write a signed factual summary note.',
      status: 'missing',
    },
  ],

  caseBriefs: [
    {
      _id: 'brief_demo_001',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      caseTitle: 'Online Harassment & Cyber Extortion',
      incidentSummary: 'Between September 10 and September 16, 2026, the complainant Ananya Sharma was targeted by an unknown digital perpetrator operating handle @ShadowCyber99 and virtual VoIP number +1 (555) 019-2834. The perpetrator issued an explicit extortion demand of ₹50,000 under threat of distributing non-consensual altered images to family and colleagues.',
      keyFacts: [
        'Unsolicited contact initiated on September 10, 2026, on Instagram.',
        'Extortion demand of ₹50,000 sent via WhatsApp on September 12 with 48-hour deadline.',
        'Verbal threat received via spoofed voicemail on September 13 attempting to deter police reporting.',
        'Digital evidence catalogued and timestamped in LawShield Vault on September 14.',
        'Initial online cyber complaint filed with National Cyber Crime Reporting Portal on September 16 (Ref #2026/DEL/89124).'
      ],
      importantDates: [
        '10 Sep 2026: First unsolicited contact on Instagram',
        '12 Sep 2026: WhatsApp extortion message and UPI QR demand',
        '13 Sep 2026: Audio voicemail intimidation',
        '14 Sep 2026: Evidence captured and timestamped',
        '16 Sep 2026: Official Cyber Cell complaint filed'
      ],
      peopleEntities: [
        'Complainant: Ananya Sharma (Citizen, New Delhi)',
        'Suspect: Unknown perpetrator using @ShadowCyber99 and VoIP +1 (555) 019-2834',
        'Platforms Involved: WhatsApp (Meta), Instagram, NPCI/HDFC UPI Gateway'
      ],
      potentialLegalTopics: [
        'Information Technology Act 2000 Section 66E (Privacy Violation) & Section 67A (Obscene Material)',
        'IPC Section 354D (Cyber Stalking & Electronic Surveillance)',
        'IPC Section 384 (Extortion) & Section 506 (Criminal Intimidation)'
      ],
      evidenceAvailable: [
        'E-001: Threatening WhatsApp Chat Screenshots & Timestamps',
        'E-002: Voicemail Audio Threat Recording',
        'E-003: Morphed Social Profile Capture & URL Archive',
        'E-004: Cyber Crime Cell Complaint Acknowledgment Slip',
        'E-005: UPI Payment Extortion Request QR & VPA Screenshot'
      ],
      evidenceGaps: [
        'Original raw uncompressed chat export with transit headers',
        'Itemized mobile operator CDR logs for incoming spoofed calls',
        'Corroborating witness statement from colleague contacted'
      ],
      timelineHighlights: [
        '10 Sep: Contact initiated',
        '12 Sep: ₹50,000 extortion ultimatum',
        '13 Sep: Intimidation call',
        '14 Sep: Evidence locked',
        '16 Sep: NCRP filing'
      ],
      questionsForLawyer: [
        'Should we file an emergency application for interim injunction against the hosting platform under Rule 3 of IT Intermediary Rules?',
        'What is the standard procedure to request the investigating officer to issue Section 91 CrPC notices to the UPI bank to freeze beneficiary accounts?',
        'How should Section 65B Indian Evidence Act certification be structured for smartphone screen captures?'
      ],
      suggestedNextSteps: [
        '1. Consult empaneled cyber advocate to formalize Section 65B evidence certificate.',
        '2. Request police investigating officer to issue formal freeze on UPI VPA cyberpay99@okhdfcbank.',
        '3. Issue statutory notice to intermediary platform requesting immediate content preservation.'
      ],
      userEditedContent: '',
      generatedAt: new Date(Date.now() - 2 * 86400000),
      lastEditedAt: new Date(Date.now() - 2 * 86400000),
    }
  ],

  caseQuestions: [
    {
      _id: 'cq_001',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      question: 'Should we file an emergency application for interim injunction against the hosting platform under Rule 3 of IT Intermediary Rules?',
      category: 'Interim Relief',
      status: 'discussed',
      lawyerAnswer: 'Yes. Under IT Rules 2021, intermediaries are obligated to remove non-consensual intimate imagery within 24 hours of receiving notice.',
      notes: 'Adv. Rajesh confirmed this during preliminary discussion.',
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      _id: 'cq_002',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      question: 'What is the procedure for police to request IP address and subscriber details from offshore VoIP carriers?',
      category: 'Investigation & Forensics',
      status: 'pending',
      lawyerAnswer: '',
      notes: 'Need to clarify timeline for Letters Rogatory or MLAT if carrier is US-based.',
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      _id: 'cq_003',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      question: 'How do we prepare a Section 65B Indian Evidence Act certificate for mobile device backups?',
      category: 'Court Admissibility',
      status: 'pending',
      lawyerAnswer: '',
      notes: 'Crucial for ensuring printouts of WhatsApp chats are admitted as secondary evidence.',
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      _id: 'cq_004',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      question: 'Can Section 91 CrPC be invoked immediately to freeze the bank account linked to the UPI QR code?',
      category: 'Financial Freeze',
      status: 'resolved',
      lawyerAnswer: 'Yes, the Station House Officer or Cyber Police can issue an immediate directive to the payment aggregator and bank to put a lien on the recipient account.',
      notes: 'Urgent action recommended within 48 hours.',
      createdAt: new Date(Date.now() - 1 * 86400000),
    }
  ],

  caseShares: [
    {
      _id: 'c_share_001',
      caseId: 'case_demo_001',
      userId: 'usr_demo_citizen_001',
      userName: 'Ananya Sharma',
      lawyerId: 'usr_demo_lawyer_001',
      lawyerName: 'Adv. Rajesh Verma',
      sharedSections: {
        summary: true,
        timeline: true,
        evidence: true,
        questions: true,
        privateNotes: false,
      },
      lawyerNotes: [
        {
          text: 'Reviewed initial dossier. Strong digital evidence trail with UPI VPA identifier. Advise obtaining certified Section 65B affidavit before court hearing.',
          createdAt: new Date(Date.now() - 1 * 86400000),
        }
      ],
      sharedAt: new Date(Date.now() - 2 * 86400000),
      status: 'active',
    }
  ],
};


// Seed MongoDB if it's connected
const seedMongoIfNeeded = async () => {
  if (!isMongoActive()) return;
  try {
    const userCount = await models.User.countDocuments();
    if (userCount === 0) {
      console.log('[LawShield Database] Seeding initial data into MongoDB...');
      await models.User.insertMany(seedUsers);
      await models.LawyerProfile.insertMany(seedLawyerProfiles);
      await models.Law.insertMany(seedLaws);
      console.log('[LawShield Database] Seeding complete.');
    }
  } catch (err) {
    console.error('[LawShield Database] Error checking/seeding Mongo:', err.message);
  }
};

module.exports = {
  store,
  seedMongoIfNeeded,
  generateId: () => uuidv4(),
};
