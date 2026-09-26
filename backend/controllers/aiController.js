const { store } = require('../services/dataStore');

// Knowledge-driven Legal Classifier & Risk Detector
const analyzeProblemLocally = (query) => {
  const q = (query || '').toLowerCase();

  // Check for Emergency & High risk keywords first
  const emergencyKeywords = [
    'kill', 'threat', 'suicide', 'hostage', 'weapon', 'assault right now', 
    'beating me', 'bleeding', 'stalking outside', 'in danger now', 'forced', 
    'abduct', 'kidnap', 'gun', 'knife', 'poison', 'emergency', 'attacked'
  ];
  const highRiskKeywords = [
    'domestic violence', 'harass', 'blackmail', 'extort', 'rape', 
    'sexual harassment', 'posh', 'stalking', 'leaked photos', 'morphed', 
    'dowry', 'cruelty', 'beaten', 'abuse', 'traffick', 'molest', 'intimidat'
  ];
  const mediumRiskKeywords = [
    'landlord', 'deposit', 'evict', 'tenan', 'rent', 'lease', 'salary', 
    'unpaid', 'wage', 'terminat', 'fraud', 'cheated', 'consumer', 'refund', 
    'contract', 'defamation', 'police', 'fir', 'dispute', 'scam', 'bank'
  ];

  let riskLevel = 'LOW';
  let detectedConcern = 'Standard Legal Inquiry';
  let emergencyWarning = null;

  if (emergencyKeywords.some(k => q.includes(k))) {
    riskLevel = 'EMERGENCY';
    detectedConcern = 'Immediate Physical Safety / Urgent Crisis Detected';
    emergencyWarning = 'CRITICAL: If you are in immediate physical danger, do not rely on chat. Tap the Emergency SOS button immediately or dial 112 / 1091 (Women Helpline). Reach a secure location.';
  } else if (highRiskKeywords.some(k => q.includes(k))) {
    riskLevel = 'HIGH';
    detectedConcern = 'Serious Personal Rights Violation / Harassment';
    emergencyWarning = 'High priority: Your situation involves potential criminal harassment or bodily safety violations. Preserve all digital/physical evidence and consult an empanelled lawyer or file a Zero FIR.';
  } else if (mediumRiskKeywords.some(k => q.includes(k))) {
    riskLevel = 'MEDIUM';
    detectedConcern = 'Civil / Tenancy / Employment / Consumer Infringement';
  }

  // Topic classification
  let legalTopic = 'General Civil & Constitutional Rights';
  let relevantLaw = 'Constitution of India (Article 21) & Legal Services Authorities Act, 1987';
  let explanation = 'Every individual is guaranteed the right to life, personal liberty, fair treatment, and access to legal redress under Indian jurisprudence.';
  let rights = [
    'Right to fair hearing and due process of law before any adverse action',
    'Right to free legal aid via District Legal Services Authority (DLSA) under Article 39A',
    'Right to obtain certified documents and formal written notice before legal proceedings',
    'Right to seek civil injunction or statutory redress before competent courts'
  ];
  let recommendedAction = 'Consult a verified advocate on LawShield to examine your documentation and issue a formal legal notice or petition.';
  let recommendedLawyers = store.lawyers.slice(0, 2);

  // 1. Tenancy, Rent, Security Deposit & Eviction
  if (
    q.includes('landlord') || q.includes('rent') || q.includes('tenant') || 
    q.includes('tenan') || q.includes('deposit') || q.includes('evict') || 
    q.includes('lease') || q.includes('flat') || q.includes('pg') || q.includes('broker')
  ) {
    legalTopic = 'Tenancy Rights & Security Deposit Recovery';
    relevantLaw = 'Model Tenancy Act, Transfer of Property Act 1882 (Section 106) & State Rent Control Acts';
    explanation = 'Landlords cannot arbitrarily withhold refundable security deposits without valid, documented itemized damage bills. Tenants are strictly protected against unlawful lockouts, forced eviction without court decree, or sudden disconnection of essential utilities (water/power).';
    rights = [
      'Right to full refund of security deposit within the agreed notice period or statutory timeline',
      'Right to 30 days statutory written notice prior to termination of residential tenancy',
      'Absolute protection against arbitrary lockouts or disconnection of essential utilities (water, electricity)',
      'Right to inspect actual repair invoices if deductions are claimed against the deposit',
      'Right to file a claim before the Rent Authority / Rent Tribunal or Consumer Dispute Forum'
    ];
    recommendedAction = 'Send a formal Legal Notice demanding refund of deposit with 15 days compliance. If ignored, file a petition before the Rent Tribunal or Consumer Commission for deficiency in service.';
    recommendedLawyers = store.lawyers.filter(l => 
      (l.specialization || '').toLowerCase().includes('consumer') || 
      (l.specialization || '').toLowerCase().includes('tenancy')
    );
  } 
  // 2. Workplace Sexual Harassment & POSH Act
  else if (
    q.includes('posh') || q.includes('sexual harassment') || 
    (q.includes('harass') && (q.includes('work') || q.includes('office') || q.includes('boss') || q.includes('colleague') || q.includes('manager')))
  ) {
    legalTopic = 'Workplace Sexual Harassment (POSH) & Protective Mandates';
    relevantLaw = 'The Sexual Harassment of Women at Workplace (POSH) Act, 2013 (Section 3, 4, 9, 12, 18)';
    explanation = 'The POSH Act legally obligates every organisation with 10+ employees to constitute an Internal Complaints Committee (ICC). It protects against unwelcome sexually colored remarks, physical contact, sexually explicit requests, hostile environment, or implicit threats to job security.';
    rights = [
      'Right to file a formal confidential complaint with the ICC within 3 months of the incident',
      'Right to interim reliefs: up to 3 months paid leave, or transfer of the respondent/complainant',
      'Strict statutory protection against workplace retaliation, termination, or adverse appraisal',
      'Right to strict confidentiality (Section 16 strictly forbids publishing complainant identity)',
      'Right to file an appeal before the designated Appellate Authority or Industrial Tribunal'
    ];
    recommendedAction = 'Draft a formal complaint addressed to the Presiding Officer of your organization\'s ICC. Use the LawShield Document Generator to create the initial complaint draft.';
    recommendedLawyers = store.lawyers.filter(l => 
      (l.specialization || '').toLowerCase().includes('posh') || 
      (l.specialization || '').toLowerCase().includes('women')
    );
  }
  // 3. Employment, Unpaid Wages, Severance & Wrongful Termination
  else if (
    q.includes('salary') || q.includes('wage') || q.includes('unpaid') || 
    q.includes('terminat') || q.includes('severance') || q.includes('experience letter') || 
    q.includes('provident') || q.includes('pf') || q.includes('resignation') || 
    (q.includes('work') && (q.includes('fired') || q.includes('pay') || q.includes('contract')))
  ) {
    legalTopic = 'Employment Rights, Unpaid Wages & Wrongful Termination';
    relevantLaw = 'Payment of Wages Act 1936, Industrial Disputes Act 1947 & Indian Contract Act 1872 (Section 73)';
    explanation = 'Employers cannot withhold earned wages, accrued leave encashment, or legally required experience/relieving letters upon separation. Termination must strictly follow the employment contract and statutory notice period.';
    rights = [
      'Right to timely disbursement of all earned wages without arbitrary deductions (Payment of Wages Act)',
      'Right to mandatory contractual notice period or payment of salary in lieu of notice',
      'Right to receive relieving letter, experience certificate, and full & final settlement (F&F)',
      'Right to file complaint with the Labor Commissioner or approach Industrial/Civil Court for recovery'
    ];
    recommendedAction = 'Issue a formal demand letter via registered email/post specifying the outstanding amounts and giving 15 days for settlement. If unpaid, file a claim before the Labor Commissioner.';
    recommendedLawyers = store.lawyers.filter(l => 
      (l.specialization || '').toLowerCase().includes('consumer') || 
      (l.specialization || '').toLowerCase().includes('posh')
    );
  }
  // 4. Domestic Violence, Cruelty, Dowry & Matrimonial Protection
  else if (
    q.includes('husband') || q.includes('in-laws') || q.includes('domestic') || 
    q.includes('beat') || q.includes('home') || q.includes('cruelty') || 
    q.includes('dowry') || q.includes('marriage') || q.includes('divorce') || 
    q.includes('maintenance') || q.includes('alimony') || q.includes('custody')
  ) {
    legalTopic = 'Domestic Violence & Matrimonial Protection';
    relevantLaw = 'Protection of Women from Domestic Violence Act (PWDVA) 2005 & IPC Section 498A / BNS Section 85';
    explanation = 'The law provides immediate civil remedies alongside criminal safeguards against physical, verbal, sexual, emotional, or economic domestic abuse by partners or relatives in a shared household.';
    rights = [
      'Right to reside in the matrimonial/shared household without unlawful dispossession (Section 17)',
      'Right to immediate Protection Orders (Section 18) preventing respondent from approaching or contacting you',
      'Monetary compensation, medical expenses, and emergency monthly maintenance (Section 20)',
      'Temporary child custody orders (Section 21) and access to safe shelter homes',
      'Free legal aid and shelter home assistance through designated Protection Officers and DLSA'
    ];
    recommendedAction = 'Approach a Protection Officer or submit an application under Section 12 of PWDVA. If physical violence occurred, request a Medical Legal Certificate (MLC) and file a Police Complaint.';
    recommendedLawyers = store.lawyers.filter(l => 
      (l.specialization || '').toLowerCase().includes('domestic') || 
      (l.specialization || '').toLowerCase().includes('women')
    );
  }
  // 5. Cyber Stalking, Morphed Photos, Privacy & Online Extortion
  else if (
    q.includes('online') || q.includes('photo') || q.includes('instagram') || 
    q.includes('facebook') || q.includes('whatsapp') || q.includes('hack') || 
    q.includes('cyber') || q.includes('leak') || q.includes('fake') || 
    q.includes('stalk') || q.includes('deepfake') || q.includes('blackmail') || 
    q.includes('doxx') || q.includes('extort')
  ) {
    legalTopic = 'Cyber Stalking, Privacy Violation & Digital Extortion';
    relevantLaw = 'Information Technology Act 2000 (Section 66E, 67, 67A) & IPC Section 354D / BNS Section 78';
    explanation = 'Capturing, transmitting, publishing non-consensual private pictures or videos is punishable with up to 3 to 5 years imprisonment. Stalking via digital messaging and digital extortion are cognizable criminal offences.';
    rights = [
      'Right to immediate emergency takedown of intimate/morphed content within 24 hours under IT Intermediary Rules',
      'Right to register complaints at cybercrime.gov.in or helpline 1930 without visiting a station initially',
      'Right to maintain strict anonymity and identity protection during cyber investigation',
      'Right to obtain forensic preservation order under Section 91 CrPC'
    ];
    recommendedAction = 'Preserve all timestamps, message headers, URLs, and screenshots in your LawShield Evidence Locker. Do not pay extortionists. Lodge an online complaint with the National Cyber Crime Cell (1930).';
    recommendedLawyers = store.lawyers.filter(l => 
      (l.specialization || '').toLowerCase().includes('cyber')
    );
  }
  // 6. Police Procedures, Unlawful Detention & Zero FIR
  else if (
    q.includes('police') || q.includes('fir') || q.includes('arrest') || 
    q.includes('station') || q.includes('sho') || q.includes('detain') || 
    q.includes('zero fir')
  ) {
    legalTopic = 'Police Procedures, Right to Counsel & Zero FIR';
    relevantLaw = 'Code of Criminal Procedure (CrPC Sec 46, 50, 154, 160) / Bharatiya Nagarik Suraksha Sanhita (BNSS)';
    explanation = 'Police officers cannot refuse to register a Zero FIR for cognizable offences regardless of jurisdiction. Female citizens cannot be arrested after sunset and before sunrise without magistrate permission, and cannot be summoned to police stations outside their residence if female.';
    rights = [
      'Right to register a Zero FIR at ANY police station in India without jurisdictional refusal',
      'Protection against arrest after sunset and before sunrise for women (Section 46(4) CrPC)',
      'Right to know grounds of arrest and inform a relative/advocate immediately (Section 50 & 41D)',
      'Right to free legal aid advocate at the police station under Legal Services Authorities Act'
    ];
    recommendedAction = 'If police refuse to file an FIR, submit a written complaint to the Superintendent of Police (SP) under Section 154(3) CrPC or file a private complaint before the Judicial Magistrate under Section 156(3).';
    recommendedLawyers = store.lawyers.filter(l => 
      (l.specialization || '').toLowerCase().includes('women') || 
      (l.specialization || '').toLowerCase().includes('domestic')
    );
  }
  // 7. Consumer Protection & Financial Fraud Redressal
  else if (
    q.includes('fraud') || q.includes('money') || q.includes('scam') || 
    q.includes('product') || q.includes('refund') || q.includes('bank') || 
    q.includes('cheated') || q.includes('consumer') || q.includes('upi') || 
    q.includes('card') || q.includes('ecommerce')
  ) {
    legalTopic = 'Consumer Protection & Financial Fraud Redressal';
    relevantLaw = 'Consumer Protection Act, 2019 & RBI Guidelines on Limiting Liability in Unauthorized Transactions';
    explanation = 'Consumers are protected against unfair trade practices, defective merchandise, deficiency in services, and digital payment frauds. Zero liability applies if unauthorized banking transactions are reported to the bank within 3 working days.';
    rights = [
      'Right to complete zero-liability reimbursement for unauthorized electronic transactions reported within 3 days',
      'Right to claim refund, replacement, and compensation for mental harassment under Section 35',
      'Right to file online complaint via National Consumer Helpline (1915) or e-Daakhil portal without lawyer fees'
    ];
    recommendedAction = 'Immediately freeze the affected bank card/account, record UTR/transaction numbers, and file on National Cyber Portal (1930) or Consumer Helpline (1915). Issue a 15-day notice to the merchant.';
    recommendedLawyers = store.lawyers.filter(l => 
      (l.specialization || '').toLowerCase().includes('consumer') || 
      (l.specialization || '').toLowerCase().includes('cyber')
    );
  }

  return {
    legalTopic,
    relevantLaw,
    explanation,
    rights,
    recommendedAction,
    riskLevel,
    detectedConcern,
    emergencyWarning,
    recommendedLawyers: (recommendedLawyers && recommendedLawyers.length) ? recommendedLawyers : findBestLawyers(legalTopic),
    disclaimer: 'LEGAL DISCLAIMER: The analysis and information provided above is generated for educational and general legal informational purposes only. It does not constitute formal advocate-client relationship or binding legal advice. For actionable representation, please consult a verified advocate or emergency services.'
  };
};

const findBestLawyers = (topic) => {
  const query = (topic || '').toLowerCase();
  
  // Calculate a match score for each lawyer
  const scoredLawyers = store.lawyers.map(lawyer => {
    let score = 0;
    
    // 1. Relevance Score (Specialization Match)
    const spec = (lawyer.specialization || '').toLowerCase();
    if (spec.includes(query) || query.includes(spec.split(' ')[0])) {
      score += 50; 
    }
    
    // Check specific keywords for broad matching
    if ((query.includes('cyber') || query.includes('online') || query.includes('digital')) && spec.includes('cyber')) score += 50;
    if ((query.includes('harass') || query.includes('posh') || query.includes('work')) && spec.includes('posh')) score += 50;
    if ((query.includes('domestic') || query.includes('divorce') || query.includes('husband')) && spec.includes('domestic')) score += 50;

    // 2. Rating Score (Multiply rating by 10)
    score += (lawyer.rating || 4.0) * 10;
    
    // 3. Experience Score (1 point per year)
    score += (lawyer.experience || 1);
    
    // 4. Cases Solved Score (Extract the highest relevant category, or just use 10% of total)
    if (lawyer.totalCasesSolved) {
      score += (lawyer.totalCasesSolved * 0.1); 
    }

    return { ...lawyer, matchScore: score };
  });

  // Sort by highest score descending
  scoredLawyers.sort((a, b) => b.matchScore - a.matchScore);
  
  // Return top 2
  return scoredLawyers.slice(0, 2).map(l => {
    const { matchScore, ...rest } = l; // remove internal score before sending to client
    return rest;
  });
};

// Main AI endpoint
exports.analyzeProblem = async (req, res) => {
  try {
    const { problemText, history = [] } = req.body;
    if (!problemText || !problemText.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide details of your legal problem' });
    }

    const systemPrompt = `You are LawShield AI, an empathetic, highly knowledgeable legal and safety assistant specializing in Indian Law (BNSS, IPC, Constitution).
Analyze the user's issue and output a JSON object strictly adhering to this structure:
{
  "legalTopic": "string",
  "relevantLaw": "string (name and sections)",
  "explanation": "clear, simple explanation of the legal situation",
  "rights": ["list", "of", "actionable", "rights"],
  "recommendedAction": "clear, safe next steps",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY",
  "detectedConcern": "brief summary of concern",
  "emergencyWarning": "string or null if not emergency"
}
Ensure advice is neutral, objective, and safe. Do not fabricate case law.`;

    // 1. Try Gemini API first (Generous Free Tier)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        console.log(`[AI Engine] Attempting to contact Gemini API...`);
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: problemText,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        const parsed = JSON.parse(response.text);
        return res.json({
          success: true,
          source: 'gemini',
          analysis: {
            ...parsed,
            recommendedLawyers: findBestLawyers(parsed.legalTopic || problemText),
            disclaimer: 'LEGAL DISCLAIMER: The analysis and information provided above is generated by Google Gemini for educational and general legal informational purposes only. It does not constitute formal legal representation. Always consult a licensed attorney.'
          }
        });
      } catch (geminiErr) {
        console.warn('Gemini request failed, falling back to Ollama:', geminiErr.message);
      }
    }

    // 2. Check if Ollama should be used (Local AI Fallback)
    const ollamaUrl = process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434/api/chat';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';
    
    try {
      console.log(`[AI Engine] Attempting to contact local Ollama instance at ${ollamaUrl}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second max wait for Ollama to respond initially

      const response = await fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: ollamaModel,
          format: 'json',
          stream: false,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: problemText }
          ]
        })
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.message.content);
        return res.json({
          success: true,
          source: 'ollama-local',
          analysis: {
            ...parsed,
            recommendedLawyers: findBestLawyers(parsed.legalTopic || problemText),
            disclaimer: 'LEGAL DISCLAIMER: The analysis and information provided above is generated by a local AI model for educational and general legal informational purposes only. It does not constitute formal legal representation. Always consult a licensed attorney.'
          }
        });
      }
    } catch (externalErr) {
      console.warn('Ollama request encountered an error (is Ollama running?), falling back to built-in legal engine:', externalErr.message);
    }

    // Built-in intelligent Legal classifier fallback
    const analysis = analyzeProblemLocally(problemText);
    return res.json({
      success: true,
      source: 'lawshield-engine',
      analysis
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Legal analysis failed', error: error.message });
  }
};

exports.analyzeLegalProblem = exports.analyzeProblem;

// @route   POST /api/ai/tts
// @desc    Generate Text-to-Speech using ElevenLabs (with fallback to simple URL if no key)
// @access  Public
exports.generateSpeech = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (elevenLabsKey) {
      try {
        console.log(`[TTS Engine] Calling ElevenLabs API...`);
        // We use fetch so we don't strictly need the official SDK installed to make this simple request
        const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Default voice
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': elevenLabsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text.substring(0, 5000), // ElevenLabs free limit safety
            model_id: 'eleven_monolingual_v1',
            voice_settings: { stability: 0.5, similarity_boost: 0.5 }
          })
        });

        if (response.ok) {
          const buffer = await response.arrayBuffer();
          // We could save to file and return URL, or return buffer directly. Let's return buffer for simplicity.
          res.set('Content-Type', 'audio/mpeg');
          return res.send(Buffer.from(buffer));
        }
      } catch (e) {
        console.warn('ElevenLabs request failed, falling back to client-side TTS instruction:', e.message);
      }
    }

    // Fallback: Instruct frontend to use Web Speech API (SpeechSynthesis)
    return res.json({
      success: true,
      source: 'fallback_web_speech',
      message: 'ElevenLabs API key not found or failed. Please use browser Web Speech API.'
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'TTS failed', error: error.message });
  }
};

// @route   POST /api/ai/synthesize-brief
// @desc    Synthesizes messy case data and evidence into a structured chronological storyboard
// @access  Public
exports.synthesizeCaseBrief = async (req, res) => {
  try {
    const { rawDescription, evidence = [], chatHistory = [] } = req.body;
    if (!rawDescription) return res.status(400).json({ success: false, message: 'Description required' });

    const prompt = `You are a Legal Paralegal AI. Read this traumatized citizen's raw case description, their uploaded evidence list, and chat history. 
    Restructure it into a highly logical, chronological visual storyboard for a lawyer to read. 
    Output ONLY JSON matching this structure:
    {
      "executiveSummary": "2 paragraph professional legal summary.",
      "primaryOffense": "e.g., Cyberstalking under IT Act Sec 66",
      "entities": [{"name": "Victim/Accused", "role": "Role"}],
      "timeline": [
        { "date": "YYYY-MM-DD", "time": "HH:MM", "event": "What happened", "evidenceLink": "Matches an evidence title if applicable" }
      ]
    }
    
    Raw Description: ${rawDescription}
    Evidence Uploaded: ${JSON.stringify(evidence)}
    Chat History: ${JSON.stringify(chatHistory)}`;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
        });
        const textResponse = response.text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({ success: true, storyboard: parsed });
        }
      } catch (geminiErr) {
        console.warn('Gemini Case Synthesis failed, falling back to mock:', geminiErr.message);
      }
    }

    // Fallback Mock Storyboard
    return res.json({
      success: true,
      storyboard: {
        executiveSummary: "The client reports ongoing harassment and threats. The situation escalated recently with digital evidence of abuse. Immediate legal intervention is required to secure a restraining order and file a formal FIR.",
        primaryOffense: "Harassment & Criminal Intimidation",
        entities: [{ name: "Client", role: "Victim" }, { name: "Unknown Caller", role: "Accused" }],
        timeline: [
          { date: new Date().toISOString().split('T')[0], time: "10:00 AM", event: "Initial threatening communication received.", evidenceLink: evidence[0]?.title || null },
          { date: new Date().toISOString().split('T')[0], time: "11:30 AM", event: "Follow-up abuse. Client felt unsafe.", evidenceLink: null }
        ]
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to synthesize brief', error: error.message });
  }
};

// @route   POST /api/ai/translate
// @desc    Translates dense legalese into plain text
// @access  Public
exports.translateLegalese = async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text required' });

    const prompt = `You are an expert legal translator. Break down the following complex legal text line-by-line or clause-by-clause. 
For each part, format your response using basic HTML like this:
<div style="margin-bottom: 16px;">
  <div style="font-size: 0.85em; color: #64748b; margin-bottom: 4px;">Original: <i>"..."</i></div>
  <div style="font-weight: 600; color: #0f172a;">Meaning: ...</div>
</div>

Translate the "Meaning" into simple, easy-to-understand plain terms. If the requested language is ${language || 'English'} and it is not English, provide the Meaning in that language. Do not use markdown backticks for the HTML.

Text to analyze:\n\n"${text}"`;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
        });
        return res.json({ success: true, translation: response.text });
      } catch (geminiErr) {
        console.warn('Gemini Translation failed:', geminiErr.message);
      }
    }

    // Fallback
    return res.json({
      success: true,
      translation: "Fallback simplified text: You have the right to remain silent and consult a lawyer. (Connect backend to Gemini for real translation)."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Translation failed', error: error.message });
  }
};
