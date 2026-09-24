import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, Upload, Send, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import { academicService } from '../../services/academicService';
import { Assignment, AssignmentSubmission } from '../../types';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const AssignmentList: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToTable } = useRealtime();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'submitted' | 'overdue'>('pending');
  
  // Submit modal state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileUrl, setFileUrl] = useState('https://github.com/student-assignment-draft.zip');
  const [submitting, setSubmitting] = useState(false);

  const loadAssignments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const asgs = await academicService.getAssignments(user.department, user.year);
      const subs = await academicService.getSubmissions(user.id);
      setAssignments(asgs);
      setSubmissions(subs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
    const unsub1 = subscribeToTable('assignments', () => loadAssignments());
    const unsub2 = subscribeToTable('assignment_submissions', () => loadAssignments());
    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  if (loading) return <SkeletonLoader count={4} height="h-32" />;

  const getStatus = (assignment: Assignment): 'Pending' | 'Submitted' | 'Overdue' => {
    const sub = submissions.find(s => s.assignment_id === assignment.id);
    if (sub && (sub.status === 'Submitted' || sub.status === 'Graded')) return 'Submitted';
    const isOverdue = new Date(assignment.due_date).getTime() < Date.now();
    return isOverdue ? 'Overdue' : 'Pending';
  };

  const filteredAssignments = assignments.filter((a) => {
    const status = getStatus(a);
    if (activeFilter === 'pending') return status === 'Pending';
    if (activeFilter === 'submitted') return status === 'Submitted';
    if (activeFilter === 'overdue') return status === 'Overdue';
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !user) return;
    setSubmitting(true);
    try {
      await academicService.submitAssignment({
        assignment_id: selectedAssignment.id,
        student_id: user.id,
        status: 'Submitted',
        submission_text: submissionText,
        file_url: fileUrl
      });
      setSelectedAssignment(null);
      setSubmissionText('');
      loadAssignments();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Assignment Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1">Track deadlines and turn in coursework submissions</p>
        </div>
        <button
          onClick={loadAssignments}
          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 self-start sm:self-center transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {(['pending', 'submitted', 'overdue', 'all'] as const).map((filter) => {
          const count = assignments.filter(a => filter === 'all' || getStatus(a).toLowerCase() === filter).length;
          const isActive = activeFilter === filter;

          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all flex items-center gap-2 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{filter}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Assignment Cards Grid */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          title={activeFilter === 'pending' ? 'No Pending Assignments' : 'No Assignments Found'}
          message={activeFilter === 'pending' ? 'Great work! All your coursework is submitted.' : `No assignments in '${activeFilter}' category.`}
          icon={<CheckCircle2 className="w-12 h-12 text-emerald-500" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((asg) => {
            const status = getStatus(asg);
            const dueDate = new Date(asg.due_date);
            const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / 86400000);

            let dueTag = '';
            if (status === 'Submitted') dueTag = 'Submitted ✅';
            else if (daysLeft < 0) dueTag = 'Overdue ❌';
            else if (daysLeft === 0) dueTag = 'Due Today 🔥';
            else dueTag = `Due in ${daysLeft} days ⏳`;

            const statusBadgeColor = status === 'Submitted' 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : status === 'Overdue' 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30';

            return (
              <div
                key={asg.id}
                className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                      {asg.subject_name}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadgeColor}`}>
                      {dueTag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 mt-2">{asg.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{asg.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Due: {dueDate.toLocaleDateString()}</span>
                  </div>

                  {status === 'Submitted' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Turn In Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedAssignment(asg)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> Submit Work
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={Boolean(selectedAssignment)}
          onClose={() => setSelectedAssignment(null)}
          title={`Submit: ${selectedAssignment.title}`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Submission Notes / Code Summary</label>
              <textarea
                rows={4}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Describe your solution approach, algorithm details, or instructions..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Project File / Repository URL</label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting to Database...' : 'Finalize & Submit Assignment'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
