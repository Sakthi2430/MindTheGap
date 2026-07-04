import React, { useState, useRef, useEffect } from 'react';
import { runAnalysis } from '../api.js';
import { Analysis } from '../types.js';
import { useTheme } from '../context/ThemeContext.tsx';
import { Mic, MicOff } from 'lucide-react';

interface NewAnalysisProps {
  onAnalysisComplete: (analysis: Analysis) => void;
}

export function NewAnalysis({ onAnalysisComplete }: NewAnalysisProps) {
  const { theme } = useTheme();
  const [jobTitle, setJobTitle] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Microphone & Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    setMicError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Speech recognition is not fully supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setResumeText(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${finalTranscript}` : finalTranscript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setMicError("Microphone permission was denied. Please allow microphone access in your browser bar.");
        } else {
          setMicError(`Voice Recognition Error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error(err);
      setMicError("Failed to initialize the audio stream or speech capture API.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileMimeType, setFileMimeType] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle resume file reading
  const handleFile = (file: File) => {
    setError(null);
    setUploadedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64Str = result.split(',')[1];
      setFileBase64(base64Str);
      setFileMimeType(file.type || 'application/octet-stream');
      setResumeText(`[Uploaded Resume: ${file.name}]`);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !resumeText.trim() || !jdText.trim()) {
      setError('Please complete all fields (Target Job Title, Resume, and Job Description).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const resumeFileParam = uploadedFile && fileBase64 ? { data: fileBase64, mimeType: fileMimeType } : undefined;
      const result = await runAnalysis(jobTitle, resumeText, jdText, resumeFileParam);
      onAnalysisComplete(result);
    } catch (err) {
      setError((err as Error).message || 'Failed to complete analysis. Please check your Gemini credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-grow flex flex-col">
      <div className="space-y-4 mb-8 text-center sm:text-left">
        <h2 className={`text-3xl sm:text-4xl font-display font-black tracking-tight ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Analyze Knowledge Alignment</h2>
        <p className={`text-sm font-semibold ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Submit your professional background and a target job scope. Our semantic engine will evaluate structural synergy and outline a prioritized roadmap.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`space-y-8 p-8 shadow-2xl ${theme.card}`}>
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <p className="text-sm text-rose-500 font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Job Title */}
          <div>
            <label htmlFor="target-job" className={`block text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Desired Career Role
            </label>
            <input
              id="target-job"
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className={`mt-1.5 block w-full px-4 py-3.5 rounded-xl transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                theme.isDark 
                  ? 'bg-slate-900/50 border border-white/10 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
              placeholder="e.g. Lead Systems Engineer"
            />
          </div>

          {/* Grid for Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Resume Input with Drag and Drop */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <label className={`block text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Your Professional Ledger (Resume)
                </label>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isListening
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse'
                      : theme.isDark
                        ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Verbally describe your experience"
                >
                  {isListening ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      <MicOff className="h-3.5 w-3.5" />
                      Stop Dictating
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-blue-500" />
                      Speak Experience
                    </>
                  )}
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : theme.isDark 
                      ? 'border-white/10 bg-white/5 hover:bg-white/10' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleChange}
                  accept="*"
                />

                {uploadedFile ? (
                  <div className="w-full flex flex-col items-center justify-center py-2">
                    <div className={`p-3 rounded-full mb-2 ${theme.isDark ? 'bg-emerald-500/10' : 'bg-emerald-50 border border-emerald-100'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${theme.isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      Resume File Selected
                    </h4>
                    <p className={`text-sm font-bold mt-1 max-w-[240px] truncate ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                      {uploadedFile.name}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {(uploadedFile.size / 1024).toFixed(1)} KB • Content Parsed & Sealed
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setFileBase64('');
                        setFileMimeType('');
                        setResumeText('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="mt-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all border border-rose-500/20 cursor-pointer"
                    >
                      Remove & Choose Another
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`p-3 rounded-xl mb-3 shadow-sm border ${theme.isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>

                    <p className={`text-xs font-semibold ${theme.isDark ? 'text-slate-300' : 'text-slate-700'}`}>Drag & drop any Resume/profile file</p>
                    <p className={`text-[10px] mt-1 ${theme.isDark ? 'text-slate-500' : 'text-slate-400'}`}>or</p>
                    <button
                      type="button"
                      onClick={onButtonClick}
                      className="mt-2 text-xs font-bold text-blue-500 hover:text-blue-600 transition-all cursor-pointer"
                    >
                      Browse local file
                    </button>
                  </>
                )}
              </div>

              {/* Plain Text Editor Area for Resume */}
              {!uploadedFile && (
                <div className="flex flex-col space-y-1.5">
                  <p className={`text-[11px] font-bold ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>Or paste/edit resume text below:</p>
                  <div className="relative">
                    <textarea
                      required
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      rows={8}
                      className={`block w-full px-4 py-3 rounded-xl transition-all text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        theme.isDark 
                          ? 'bg-slate-900/50 border border-white/10 text-white placeholder-slate-500' 
                          : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
                      }`}
                      placeholder="Paste candidate skills, experiences, and technologies from the resume or click 'Speak Experience' above to dictate verbally..."
                    />
                    {isListening && (
                      <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-[1px] rounded-xl flex items-center justify-center pointer-events-none border border-blue-500/30 animate-pulse">
                        <div className="text-center p-4 bg-slate-900/95 border border-blue-500/30 rounded-2xl shadow-xl max-w-xs">
                          <div className="flex items-center justify-center gap-2 mb-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                            <span className="text-xs font-black text-white uppercase tracking-wider">Listening to Voice Input...</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Describe your work experience, tech stack, and previous roles aloud. We are transcribing your words in real-time!</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {micError && (
                    <p className="text-[10px] text-rose-500 font-bold">{micError}</p>
                  )}
                  <span className={`text-[10px] block text-right font-semibold ${theme.isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {resumeText.length} characters
                  </span>
                </div>
              )}
            </div>

            {/* Job Description Input */}
            <div className="flex flex-col space-y-3">
              <label htmlFor="jd-text" className={`block text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Target Professional Scope (Job Description)
              </label>

              <div className="flex flex-col h-full justify-between">
                <textarea
                  id="jd-text"
                  required
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={15}
                  className={`block w-full px-4 py-3 rounded-xl transition-all text-xs font-mono h-[calc(100%-18px)] min-h-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    theme.isDark 
                      ? 'bg-slate-900/50 border border-white/10 text-white placeholder-slate-500' 
                      : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                  placeholder="Paste the target job description requirements, responsibilities, and expected technical skill stack..."
                />
                <span className={`text-[10px] mt-1 block text-right font-semibold ${theme.isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {jdText.length} characters
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className={`pt-4 border-t flex justify-end ${theme.isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Evaluating alignment profile...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span>Analyze Skill Gap</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
