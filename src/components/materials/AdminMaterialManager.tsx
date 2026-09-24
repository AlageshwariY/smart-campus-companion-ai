import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { academicService } from '../../services/academicService';
import { Subject, StudyMaterial, MaterialFileType } from '../../types';

export const AdminMaterialManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [fileType, setFileType] = useState<MaterialFileType>('PDF');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('4th Year');
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    const subs = await academicService.getSubjects();
    setSubjects(subs);
    if (subs.length > 0) setSubjectId(subs[0].id);

    const mats = await academicService.getMaterials();
    setMaterials(mats);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const selSub = subjects.find(s => s.id === subjectId);
    if (!selSub) return;

    await academicService.createMaterial({
      title,
      subject_id: subjectId,
      subject_name: selSub.name,
      description,
      file_url: fileUrl,
      file_type: fileType,
      department,
      year
    });

    setMessage('Study material published! Realtime notification pushed to student hub.');
    setTimeout(() => setMessage(null), 3000);
    setTitle('');
    setDescription('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    await academicService.deleteMaterial(id);
    loadData();
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-400" /> Upload Study Material Resource
        </h3>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Resource Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Database Architecture Lecture PPT"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of file contents..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">File Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as MaterialFileType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="PDF">PDF Document</option>
                <option value="PPT">PPT Presentation</option>
                <option value="DOCX">Word Document</option>
                <option value="ZIP">ZIP Code Archive</option>
                <option value="LINK">External Link</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">File URL / Supabase Storage Path</label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" /> Upload Material
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase">Uploaded Resources ({materials.length})</h4>
        </div>
        <div className="divide-y divide-slate-800">
          {materials.map((m) => (
            <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase">[{m.file_type}] {m.subject_name}</span>
                <h5 className="text-sm font-bold text-slate-100">{m.title}</h5>
                <p className="text-xs text-slate-400 mt-1">{m.description}</p>
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
