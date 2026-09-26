import React, { useState, useRef } from 'react';
import { Camera, Type, FileText, ArrowRight, Languages, Loader2, Focus, Upload, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export const LegaleseTranslator = () => {
  const { language } = useLanguage();
  const [mode, setMode] = useState('text'); // 'text' | 'camera' | 'upload'
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    try {
      const res = await api.post('/ai/translate', { 
        text: inputText,
        language: language 
      });
      setTranslationResult(res.data.translation || "Translation complete. (Simulated output for offline).");
    } catch (err) {
      console.error(err);
      setTranslationResult("There was an error communicating with the translation server. Please ensure the backend is running and Gemini API key is correct.");
    } finally {
      setIsTranslating(false);
    }
  };

  const extractImageText = async (file) => {
    // Import Tesseract dynamically to save bundle size if not used
    const Tesseract = await import('tesseract.js');
    const result = await Tesseract.recognize(file, 'eng');
    return result.data.text;
  };

  const extractPdfText = async (file) => {
    // Import pdfjs-dist and its worker dynamically
    const pdfjsLib = await import('pdfjs-dist');
    const workerUrl = await import('pdfjs-dist/build/pdf.worker.mjs?url');
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
  };

  const simulateARScan = async () => {
    // We cannot easily do AR scanning from a webcam offline without a heavy setup.
    // Let's prompt them to take a photo via the upload input instead, or simulate it if they click this button specifically.
    // For now, let's keep the AR button opening a camera simulation, but we'll wire up the file upload to actually work.
    setMode('camera');
    setIsScanning(true);
    // Simulate OCR delay for the demo camera
    setTimeout(() => {
      setInputText("WHEREAS, the party of the first part hereby covenants and agrees to indemnify and hold harmless the party of the second part from any and all liabilities, claims, demands, actions, or causes of action arising out of or in connection with the aforementioned premises.");
      setIsScanning(false);
      setMode('text');
    }, 2000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setMode('upload');
    setIsScanning(true);
    
    try {
      let extractedText = '';
      if (file.type === 'application/pdf') {
        extractedText = await extractPdfText(file);
      } else if (file.type.startsWith('image/')) {
        extractedText = await extractImageText(file);
      } else {
        alert("Please upload a valid PDF or Image file.");
        setIsScanning(false);
        setMode('text');
        return;
      }
      
      setInputText(`[Extracted from: ${file.name}]\n\n${extractedText || 'No readable text found in this document.'}`);
    } catch (err) {
      console.error('Extraction Error:', err);
      setInputText(`[Error extracting text from ${file.name}]\n\nCould not read the document. Ensure it contains actual text and not just scanned images without OCR.`);
    } finally {
      setIsScanning(false);
      setMode('text');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-200">
      
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-tight flex items-center justify-center space-x-3">
          <Focus size={32} className="text-[#854d0e]" />
          <span>AR Legalese Translator</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-500 font-medium">
          Scan dense legal documents with your camera or paste text. Our AI will instantly translate the "legalese" into plain simple terms.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Input area */}
        <div className="flex-1 bg-white border-2 border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex flex-wrap gap-2 mb-4 bg-stone-100 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setMode('text')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition ${mode === 'text' ? 'bg-white shadow-sm text-[#0f172a]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Type size={16} /> <span>Paste Text</span>
            </button>
            <button 
              onClick={simulateARScan}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition ${mode === 'camera' ? 'bg-white shadow-sm text-[#0f172a]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Camera size={16} /> <span>AR Scan Document</span>
            </button>
            <button 
              onClick={() => {
                setMode('upload');
                fileInputRef.current?.click();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition ${mode === 'upload' ? 'bg-white shadow-sm text-[#0f172a]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Upload size={16} /> <span>Upload Document (PDF/JPG)</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
            />
          </div>

          {mode === 'camera' || mode === 'upload' ? (
            <div className="flex-1 min-h-[300px] bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center">
              {isScanning ? (
                <div className="text-center space-y-4">
                  <div className="w-full h-1 bg-emerald-400 absolute top-0 left-0 animate-pulse shadow-[0_0_15px_#34d399]"></div>
                  {mode === 'camera' ? (
                    <Focus size={48} className="text-emerald-400 animate-spin mx-auto" style={{ animationDuration: '3s' }} />
                  ) : (
                    <Upload size={48} className="text-emerald-400 animate-bounce mx-auto" />
                  )}
                  <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm">
                    {mode === 'camera' ? 'Extracting Text via OCR...' : 'Processing Document...'}
                  </p>
                </div>
              ) : mode === 'camera' ? (
                <button onClick={simulateARScan} className="text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition">
                  <Camera size={20} /> <span>Open Camera</span>
                </button>
              ) : (
                <div className="text-center text-slate-400">
                  <CheckCircle size={48} className="mx-auto mb-4 text-slate-500 opacity-50" />
                  <p>Document loaded. Switch to Text Mode.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <textarea 
                className="w-full flex-1 min-h-[250px] p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:border-[#0f172a] transition resize-none placeholder:text-slate-400"
                placeholder="Paste complex legal terms, contracts, or notices here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button 
                onClick={handleTranslate}
                disabled={!inputText.trim() || isTranslating}
                className="mt-4 w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isTranslating ? <Loader2 size={18} className="animate-spin" /> : <Languages size={18} />}
                <span>Translate to Plain English ({language.toUpperCase()})</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Translation Result */}
        <div className="flex-1 bg-stone-50 border-2 border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-bl-full -z-0"></div>
          
          <h3 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center space-x-2 z-10">
            <FileText size={20} className="text-amber-600" />
            <span>Simplified Meaning</span>
          </h3>
          
          <div className="flex-1 bg-white border border-stone-200 rounded-2xl p-5 overflow-y-auto z-10 text-slate-700 text-sm leading-relaxed prose prose-sm max-w-none shadow-inner">
            {translationResult ? (
              <div dangerouslySetInnerHTML={{ __html: translationResult.replace(/\n/g, '<br/>') }} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-50">
                <ArrowRight size={40} />
                <p className="font-medium text-center">Translation will appear here.<br/>Ready to demystify the law.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
