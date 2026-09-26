const bcrypt = require('bcryptjs');

const getPasswordHash = (pwd) => bcrypt.hashSync(pwd, 10);

const seedUsers = [
  {
    _id: 'usr_demo_citizen_001',
    name: 'Ananya Sharma',
    email: 'citizen@lawshield.org',
    password: getPasswordHash('LawShield@123'),
    role: 'user',
    phone: '+91 98765 43210',
    emergencyContacts: [
      { name: 'Dr. Ramesh Sharma (Father)', phone: '+91 98765 00001', relationship: 'Father' },
      { name: 'Pooja Verma (Friend)', phone: '+91 98765 00002', relationship: 'Friend' },
      { name: 'Women Helpline National Cell', phone: '1091', relationship: 'Official Support' },
    ],
    createdAt: new Date('2026-01-10T10:00:00Z'),
  },
  {
    _id: 'usr_demo_lawyer_001',
    name: 'Adv. Rajesh Verma',
    email: 'lawyer@lawshield.org',
    password: getPasswordHash('LawShield@123'),
    role: 'lawyer',
    phone: '+91 98111 22334',
    emergencyContacts: [],
    createdAt: new Date('2026-01-10T10:00:00Z'),
  },
  {
    _id: 'usr_demo_lawyer_002',
    name: 'Adv. Priya Deshmukh',
    email: 'priya.legal@lawshield.org',
    password: getPasswordHash('LawShield@123'),
    role: 'lawyer',
    phone: '+91 98222 33445',
    emergencyContacts: [],
    createdAt: new Date('2026-01-11T10:00:00Z'),
  },
  {
    _id: 'usr_demo_lawyer_003',
    name: 'Adv. Kabir Merchant',
    email: 'kabir.cyber@lawshield.org',
    password: getPasswordHash('LawShield@123'),
    role: 'lawyer',
    phone: '+91 98333 44556',
    emergencyContacts: [],
    createdAt: new Date('2026-01-12T10:00:00Z'),
  },
  {
    _id: 'usr_demo_admin_001',
    name: 'Meera Nair (Chief Administrator)',
    email: 'admin@lawshield.org',
    password: getPasswordHash('AdminShield@2026'),
    role: 'admin',
    phone: '+91 99999 88888',
    emergencyContacts: [],
    createdAt: new Date('2026-01-01T10:00:00Z'),
  }
];

const seedLawyerProfiles = [
  {
    _id: 'lp_001',
    userId: 'usr_demo_lawyer_001',
    name: 'Adv. Rajesh Verma',
    email: 'lawyer@lawshield.org',
    specialization: 'Women Safety & Domestic Violence',
    barId: 'D/1482/2012 (Bar Council of Delhi)',
    experience: 14,
    fee: 800,
    rating: 4.9,
    reviewsCount: 245,
    totalCasesSolved: 450,
    specializedCasesSolved: { "Domestic Violence": 150, "Divorce/Matrimonial": 200, "Child Custody": 100 },
    bio: 'Senior advocate practicing in Delhi High Court & Supreme Court. Specializes in criminal defense, matrimonial disputes, Protection of Women from Domestic Violence Act, and child custody.',
    location: 'Connaught Place, New Delhi',
    avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=400',
    verificationStatus: 'verified',
    availability: 'Available Today',
    languages: ['English', 'Hindi', 'Punjabi'],
  },
  {
    _id: 'lp_002',
    userId: 'usr_demo_lawyer_002',
    name: 'Adv. Priya Deshmukh',
    email: 'priya.legal@lawshield.org',
    specialization: 'POSH & Workplace Harassment',
    barId: 'MAH/3829/2016 (Bar Council of Maharashtra & Goa)',
    experience: 9,
    fee: 1200,
    rating: 4.8,
    reviewsCount: 189,
    totalCasesSolved: 310,
    specializedCasesSolved: { "POSH/Workplace Harassment": 180, "Employment Rights": 80, "Civil Litigation": 50 },
    bio: 'Corporate legal advisor and certified POSH Internal Complaints Committee (ICC) trainer. Helps women and corporate whistleblowers navigate workplace harassment, employment rights, and civil litigation.',
    location: 'Bandra West, Mumbai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    verificationStatus: 'verified',
    availability: 'Available Today',
    languages: ['English', 'Hindi', 'Marathi'],
  },
  {
    _id: 'lp_003',
    userId: 'usr_demo_lawyer_003',
    name: 'Adv. Kabir Merchant',
    email: 'kabir.cyber@lawshield.org',
    specialization: 'Cyber Crime & Online Fraud',
    barId: 'KAR/9912/2018 (Karnataka State Bar)',
    experience: 8,
    fee: 1000,
    rating: 4.95,
    reviewsCount: 112,
    totalCasesSolved: 215,
    specializedCasesSolved: { "Cybercrime/Extortion": 125, "Online Defamation": 60, "Data Privacy": 30 },
    bio: 'Cyber security legal specialist focusing on non-consensual image abuse, online stalking, deepfakes, phishing extortion, and IT Act Sec 66/67 enforcement.',
    location: 'Indiranagar, Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    verificationStatus: 'verified',
    availability: 'Available Tomorrow',
    languages: ['English', 'Hindi', 'Kannada'],
  },
  {
    _id: 'lp_004',
    userId: 'usr_demo_lawyer_004',
    name: 'Adv. Sunita Rao',
    email: 'sunita.rao@lawshield.org',
    specialization: 'Consumer Rights & Tenancy Disputes',
    barId: 'TN/5512/2015 (Madras Bar Council)',
    experience: 11,
    fee: 650,
    rating: 4.75,
    bio: 'Expert in Consumer Protection Act 2019, illegal eviction prevention, deposit recovery, contract breaches, and alternative dispute resolution (ADR).',
    location: 'T. Nagar, Chennai',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    verificationStatus: 'pending',
    availability: 'Available Today',
    languages: ['English', 'Tamil'],
  }
];

const seedLaws = [
  {
    _id: 'law_001',
    name: 'Protection of Women from Domestic Violence Act (PWDVA)',
    section: 'Section 12, 17, 18, 19 & 20',
    category: 'Domestic Violence',
    explanation: 'Protects women living in a shared household from physical, emotional, verbal, sexual, or economic abuse by family members or domestic partners.',
    applicability: 'Applicable to all women (wives, live-in partners, mothers, sisters, daughters) residing in India.',
    rights: [
      'Right to reside in shared household without illegal eviction (Section 17)',
      'Protection Orders preventing the abuser from entering workplace or contacting you (Section 18)',
      'Monetary relief and emergency maintenance support (Section 20)',
      'Temporary custody orders for children (Section 21)',
      'Free legal aid via District Legal Services Authority (DLSA)'
    ],
    recommendedAction: 'File an application before the Judicial Magistrate or contact a Protection Officer / Service Provider under Section 12.',
    severity: 'HIGH',
  },
  {
    _id: 'law_002',
    name: 'Sexual Harassment of Women at Workplace (POSH) Act 2013',
    section: 'Section 3, 4, 9, 10 & 11',
    category: 'Workplace Harassment',
    explanation: 'Mandates every workplace with 10+ employees to maintain an Internal Complaints Committee (ICC) to address unwelcome physical contact, demands for sexual favors, sexually colored remarks, or hostile work environments.',
    applicability: 'All working women across private corporations, government offices, unorganized sectors, interns, and domestic workers.',
    rights: [
      'Right to submit a confidential written complaint within 3 months of incident',
      'Right to interim relief including paid transfer, 3 months leave, or restraining the respondent',
      'Protection against victimization or retaliation',
      'Strict confidentiality guarantees prohibiting identity leak'
    ],
    recommendedAction: 'Submit a formal written complaint to your organisation\'s ICC Presiding Officer or the Local Complaints Committee (LCC) if ICC is absent.',
    severity: 'HIGH',
  },
  {
    _id: 'law_003',
    name: 'Information Technology Act (Cyber Stalking & Privacy Violation)',
    section: 'Section 66E & Section 67 / 67A',
    category: 'Cyber Crime',
    explanation: 'Criminalizes capturing, publishing or transmitting private images of a person without consent, as well as publishing sexually explicit material online.',
    applicability: 'Any citizen subjected to online harassment, morphed photos, non-consensual media distribution, or extortion across any digital platform.',
    rights: [
      'Right to immediate takedown of non-consensual intimate imagery within 24 hours under IT Rules',
      'Right to file an online cybercrime complaint via cybercrime.gov.in',
      'Protection of identity during cyber forensics investigation'
    ],
    recommendedAction: 'Preserve full URL, screenshots with system time, metadata; do not delete messages; file complaint at National Cyber Crime Reporting Portal (1930).',
    severity: 'EMERGENCY',
  },
  {
    _id: 'law_004',
    name: 'Indian Penal Code / BNS - Stalking & Voyeurism',
    section: 'Section 354C & 354D (IPC) / BNS Equivalent',
    category: 'Women Safety',
    explanation: 'Penalizes following a woman, contacting or attempting to contact her repeatedly despite clear disinterest, monitoring her electronic communications, or capturing private acts.',
    applicability: 'Any woman experiencing physical or digital stalking, stalking by strangers, ex-partners, or acquaintances.',
    rights: [
      'Stalking on first conviction is punishable with up to 3 years imprisonment',
      'Second conviction is non-bailable with up to 5 years imprisonment',
      'Right to record Zero FIR at any police station regardless of jurisdiction'
    ],
    recommendedAction: 'Dial Women Helpline 1091 or 112 immediately. Record evidence of calls/texts, and lodge a formal Zero FIR at the nearest police station.',
    severity: 'HIGH',
  },
  {
    _id: 'law_005',
    name: 'Arrest Guidelines for Women & Right to Zero FIR',
    section: 'CrPC Section 46(4) & Section 160',
    category: 'Police & Complaint Procedures',
    explanation: 'No woman can be arrested after sunset and before sunrise except in extraordinary circumstances with prior permission of Judicial Magistrate. Women cannot be called to police station for questioning outside their residence if under 15 or female.',
    applicability: 'All women interacting with law enforcement agencies.',
    rights: [
      'Right to presence of a female police officer during search or arrest',
      'Right to free legal aid advocate at the time of detention or arrest',
      'Right to inform family or trusted contact immediately upon detention',
      'Right to lodge a Zero FIR anywhere in India if an emergency crime occurred'
    ],
    recommendedAction: 'Politely insist on a female officer and request your right to counsel; contact the District Legal Services Authority (DLSA) if detained.',
    severity: 'MEDIUM',
  },
  {
    _id: 'law_006',
    name: 'Consumer Protection Act 2019 (Unfair Trade Practices & E-Commerce Fraud)',
    section: 'Section 2(47), 35 & 84',
    category: 'Online Fraud',
    explanation: 'Shields consumers against misleading advertisements, defective products, fraudulent online sellers, unauthorized financial debits, and refusal to refund.',
    applicability: 'Any purchaser of goods or services for personal use from online marketplaces, brick-and-mortar stores, or service vendors.',
    rights: [
      'Right to claim full refund, replacement, or compensation for damages',
      'Product liability against manufacturer or seller for injury or loss',
      'Right to file electronic complaints through the e-Daakhil portal'
    ],
    recommendedAction: 'Send a formal Legal Notice to the merchant giving 15 days to resolve, then lodge a complaint on the National Consumer Helpline (1915).',
    severity: 'LOW',
  },
  {
    _id: 'law_007',
    name: 'POCSO Act 2012 (Protection of Children from Sexual Offences)',
    section: 'Section 3, 5, 7 & 19',
    category: 'Child Safety',
    explanation: 'Stringent child-friendly law protecting persons below 18 years from sexual assault, sexual harassment, and pornography, with mandatory reporting duties.',
    applicability: 'Any child under the age of 18 years regardless of gender.',
    rights: [
      'Mandatory reporting requirement for anyone having knowledge of the offence',
      'Child\'s identity cannot be disclosed in any media or public platform',
      'Child-friendly court procedures without seeing the accused during testimony'
    ],
    recommendedAction: 'Immediately alert Childline at 1098, National Commission for Protection of Child Rights (NCPCR), or nearest Special Juvenile Police Unit.',
    severity: 'EMERGENCY',
  },
  {
    _id: 'law_008',
    name: 'Right to Free Legal Aid (Constitution of India)',
    section: 'Article 39A & Legal Services Authorities Act 1987',
    category: 'Constitutional Rights',
    explanation: 'Ensures that opportunities for securing justice are not denied to any citizen by reason of economic or other disabilities. Guarantees free legal counsel to women and marginalized groups.',
    applicability: 'All women, children, victims of trafficking, and citizens below specified income ceilings.',
    rights: [
      'Free representation by qualified empanelled lawyers in High Courts, District Courts, and Supreme Court',
      'Waiver of court fees and procedural expenses',
      'Access to Lok Adalats for speedy dispute resolution'
    ],
    recommendedAction: 'Visit your nearest District Legal Services Authority (DLSA) office located inside the District Court complex or call NALSA Helpline 15100.',
    severity: 'LOW',
  }
];

const seedEmergencyResources = [
  {
    id: 'res_001',
    name: 'Central Women Police Helpline',
    type: 'Police',
    phone: '1091',
    lat: 28.6139,
    lng: 77.2090,
    address: 'Police Headquarters, ITO, New Delhi',
    openHours: '24/7 Helpline & Dispatch',
    distanceKm: 1.2
  },
  {
    id: 'res_002',
    name: 'National Emergency Support Center (ERSS)',
    type: 'Emergency',
    phone: '112',
    lat: 28.6289,
    lng: 77.2150,
    address: 'Integrated Police & Medical Control Room',
    openHours: '24/7 Response Unit',
    distanceKm: 2.1
  },
  {
    id: 'res_003',
    name: 'One Stop Crisis Center (Sakhi Center)',
    type: 'Women Support',
    phone: '+91 11 2337 9901',
    lat: 28.6350,
    lng: 77.2250,
    address: 'AIIMS Trauma Complex, Near Safdarjung, New Delhi',
    openHours: '24 Hours Medical & Legal Crisis Aid',
    distanceKm: 3.4
  },
  {
    id: 'res_004',
    name: 'District Legal Services Authority (DLSA)',
    type: 'Legal Aid',
    phone: '15100',
    lat: 28.6080,
    lng: 77.2300,
    address: 'Patiala House Court Complex, New Delhi',
    openHours: 'Mon-Sat 10:00 AM - 5:00 PM',
    distanceKm: 2.8
  },
  {
    id: 'res_005',
    name: 'National Cyber Crime Cell HQ',
    type: 'Cyber Police',
    phone: '1930',
    lat: 28.5800,
    lng: 77.2200,
    address: 'Special Cyber Crime Cell, Lodhi Road, New Delhi',
    openHours: '24/7 Immediate Takedown & Fraud Cell',
    distanceKm: 4.5
  }
];

module.exports = {
  seedUsers,
  seedLawyerProfiles,
  seedLaws,
  seedEmergencyResources,
};
