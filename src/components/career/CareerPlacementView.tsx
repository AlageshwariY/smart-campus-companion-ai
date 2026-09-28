import React, { useState } from 'react';
import { Briefcase, Sparkles, FileText, MessageSquare, CheckCircle, AlertTriangle, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiService } from '../../services/aiService';
import { CareerRoadmapNode, ResumeAnalysisResult } from '../../types';

export const CareerPlacementView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'resume' | 'interview'>('roadmap');

  // Roadmap State
  const [targetRole, setTargetRole] = useState<string>('Full-Stack AI Engineer');
  const [roadmap, setRoadmap] = useState<CareerRoadmapNode[] | null>(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  // Resume State
  const [resumeText, setResumeText] = useState<string>(
    `ALEX RIVERA
Email: alex.student@campus.edu | Phone: +1 555-0192 | GitHub: github.com/alexrivera

SUMMARY:
Final year Computer Science student interested in Software Development and AI application development.

EDUCATION:
B.Tech in Computer Science & Engineering | GPA: 3.8/4.0 | Expected Graduation: May 2026

SKILLS:
Languages: JavaScript, TypeScript, Python, C++, SQL
Frameworks: React.js, Node.js, Express, Tailwind CSS, PyTorch
Databases: PostgreSQL, MongoDB

PROJECTS:
• Smart Campus Companion AI: Built a student portal using React, Vite, and Supabase.
• DBMS B-Tree Indexer: Implemented multi-level indexing in C++.`
  );
  const [resumeResult, setResumeResult] = useState<ResumeAnalysisResult | null>(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);

  // Interview Simulator State
  const [interviewType, setInterviewType] = useState<'HR' | 'Technical' | 'Behavioral'>('Technical');
  const [qIndex, setQIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<{ score: number; feedback: string; sampleAnswer: string } | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const handleGenerateRoadmap = async () => {
    setGeneratingRoadmap(true);
    try {
      const nodes = await aiService.generateCareerRoadmap(
        user?.department || 'Computer Science & Engineering',
        targetRole,
        ['React', 'TypeScript', 'SQL']
      );
      setRoadmap(nodes);
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const handleAnalyzeResume = async () => {
    setAnalyzingResume(true);
    try {
      const res = await aiService.analyzeResume(resumeText, targetRole);
      setResumeResult(res);
    } finally {
      setAnalyzingResume(false);
    }
  };

  const handleStartInterview = async () => {
    setInterviewStarted(true);
    setQIndex(0);
    setEvaluation(null);
    setStudentAnswer('');
    const q = await aiService.getNextInterviewQuestion(targetRole, interviewType, 0);
    setCurrentQuestion(q);
  };

  const handleSubmitAnswer = async () => {
    if (!studentAnswer.trim()) return;
    setSimulating(true);
    try {
      const ev = await aiService.evaluateInterviewAnswer(currentQuestion, studentAnswer);
      setEvaluation(ev);
    } finally {
      setSimulating(false);
    }
  };

  const handleNextQuestion = async () => {
    const nextIdx = qIndex + 1;
    setQIndex(nextIdx);
    setEvaluation(null);
    setStudentAnswer('');
    const q = await aiService.getNextInterviewQuestion(targetRole, interviewType, nextIdx);
    setCurrentQuestion(q);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900">
        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest flex items-center gap-1.5 w-fit mb-2">
            <Sparkles className="w-3 h-3 text-amber-300" /> Career & Placement Acceleration
          </span>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-400" /> AI Career & Placement Hub
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Personalized AI skill roadmaps, ATS resume analysis, and interactive mock interview simulation.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'roadmap' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" /> AI Career Roadmap
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'resume' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> ATS Resume Analyzer
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'interview' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" /> Interview Simulator
        </button>
      </div>

      {/* Tab Content: AI Career Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-80">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Professional Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="Full-Stack AI Engineer">Full-Stack AI Engineer</option>
                <option value="Backend Systems Engineer">Backend Systems Engineer</option>
                <option value="Data Scientist & ML Engineer">Data Scientist & ML Engineer</option>
                <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
                <option value="Product Manager">Tech Product Manager</option>
              </select>
            </div>

            <button
              onClick={handleGenerateRoadmap}
              disabled={generatingRoadmap}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Generate Skill Roadmap
            </button>
          </div>

          {roadmap && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" /> Career Milestones & Skill Progression for {targetRole}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmap.map((node) => (
                  <div key={node.step} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                        #{node.step}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-indigo-300 font-bold">
                        {node.estimated_duration}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100">{node.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{node.description}</p>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        {node.skills.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                        💡 <strong>Capstone Project Idea:</strong> {node.project_idea}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Resume Analyzer */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Paste Resume Content</h3>
              <textarea
                rows={14}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono"
              />
              <button
                onClick={handleAnalyzeResume}
                disabled={analyzingResume}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Analyze Resume Against ATS
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            {resumeResult ? (
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Overall ATS Match Score</h3>
                    <p className="text-xs text-slate-400">Target Role: {targetRole}</p>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">{resumeResult.overall_score}%</div>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Key Strengths</h4>
                    <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                      {resumeResult.key_strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Missing Recommended Skills</h4>
                    <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                      {resumeResult.missing_skills.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Formatting & Structure Suggestions</h4>
                    <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                      {resumeResult.formatting_feedback.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 space-y-3">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-200">No Resume Analysis Performed Yet</h3>
                <p className="text-xs text-slate-400">Paste your resume text on the left and click Analyze.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Interview Simulator */}
      {activeTab === 'interview' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 max-w-3xl mx-auto space-y-6 animate-fadeIn">
          {/* Disclaimer Warning Box */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Note: AI interview feedback is provided for practice purposes and is not a guarantee or substitute for official recruiter evaluation.</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">AI Mock Interview Simulator</h3>
              <p className="text-xs text-slate-400">Practice real interview questions tailored for {targetRole}.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
              >
                <option value="Technical">Technical Interview</option>
                <option value="HR">HR & Background</option>
                <option value="Behavioral">Behavioral (STAR Method)</option>
              </select>

              <button
                onClick={handleStartInterview}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Start Session
              </button>
            </div>
          </div>

          {interviewStarted && currentQuestion ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                  Question #{qIndex + 1} ({interviewType})
                </span>
                <h4 className="text-sm font-bold text-slate-100 leading-relaxed">{currentQuestion}</h4>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Spoken/Written Answer</label>
                <textarea
                  rows={5}
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Type your structured interview response here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!studentAnswer.trim() || simulating}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  {simulating ? <Sparkles className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Evaluate Response
                </button>

                {evaluation && (
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white"
                  >
                    Next Question &rarr;
                  </button>
                )}
              </div>

              {evaluation && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI Evaluation</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      Score: {evaluation.score} / 10
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">{evaluation.feedback}</p>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    💡 <strong>Recommended Sample Response Structure:</strong> {evaluation.sampleAnswer}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select an interview type above and click <strong>Start Session</strong> to begin.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
