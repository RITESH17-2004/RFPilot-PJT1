"use client";
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, FileText, Send, CheckCircle, RefreshCw, Rocket, Save, PenTool, Settings, Undo2, Check, Map } from 'lucide-react';
import Link from 'next/link';
import DocumentEditor from '@/components/DocumentEditor';

export default function ReviewAndPublishRFP({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [rfp, setRfp] = useState<any>(null);
  const [changeInstruction, setChangeInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pdfKey, setPdfKey] = useState(0);
  const [editableContent, setEditableContent] = useState<string>("");
  const [savingManual, setSavingManual] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<string>("");

  const BACKEND_URL = "http://localhost:8000";

  useEffect(() => {
    fetch(`${BACKEND_URL}/rfp/${id}`)
      .then(res => res.json())
      .then(data => {
        setRfp(data);
        setEditableContent(data.content);
        setLastSavedContent(data.content);
      });
  }, [id]);

  const handleSilentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const isManualCommit = !changeInstruction.trim() && rfp?.content !== editableContent;
    if (!changeInstruction.trim() && !isManualCommit) return;

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/rfp/draft/update/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updated_content: rfp?.content !== editableContent ? editableContent : null,
          change_summary: changeInstruction.trim() ? changeInstruction : "Manual Edits Applied via Document Editor"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRfp(data);
        setEditableContent(data.content);
        setLastSavedContent(data.content);
        setChangeInstruction("");
        setPdfKey(prev => prev + 1);
        alert('Draft Refined! Document updated (No corrigendum issued for this internal change).');
      }
    } catch (err) {
      alert('Error updating draft.');
    }
    setLoading(false);
  };

  // Quick-save manual edits directly (no AI, instant)
  const handleManualSave = async () => {
    if (rfp?.content === editableContent) return;
    setSavingManual(true);
    try {
      const res = await fetch(`${BACKEND_URL}/rfp/draft/update/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updated_content: editableContent,
          change_summary: "Manual Edits Applied via Document Editor"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRfp(data);
        setEditableContent(data.content);
        setLastSavedContent(data.content);
        setPdfKey(prev => prev + 1);
      }
    } catch (err) {
      alert('Error saving edits.');
    }
    setSavingManual(false);
  };

  const handleUndo = () => {
    setEditableContent(lastSavedContent);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/rfp/publish/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        alert('RFP Published Successfully! It is now live for vendors and RAG context is initialized.');
        router.push('/bank?view=management');
      }
    } catch (err) {
      alert('Error publishing RFP.');
    }
    setPublishing(false);
  };

  if (!rfp) return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center text-white gap-6">
      <Loader2 size={40} className="animate-spin text-[#c8a96a]" />
      <p className="text-slate-400 font-bold tracking-[0.2em] text-xs uppercase">Loading Institutional Draft...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#f0f4f8] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#0a1628] h-[76px] px-8 flex items-center justify-between shrink-0 shadow-xl z-20 border-b border-white/5">
        <div className="flex items-center gap-6">
          <Link href="/bank?view=management" className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/10">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <h1 className="text-md font-black text-white tracking-tight">Stage: <span className="text-[#c8a96a]">REVIEW & RELEASE</span></h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">{rfp.title} · #00{rfp.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="px-4 py-2 bg-[#c8a96a]/10 border border-[#c8a96a]/20 text-[#c8a96a] rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <AlertCircle size={14} /> Internal Review
          </div>
          <button
            onClick={handlePublish}
            disabled={publishing || loading}
            className="px-8 py-3 bg-[#c8a96a] hover:bg-[#b8995a] text-[#0a1628] rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-amber-900/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-[#e8c97a]/40 active:scale-[0.98]"
          >
            {publishing ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
            Publish Institutional RFP
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* DOCUMENT EDITOR — LEFT PANEL */}
        <div className="w-[60%] lg:w-[65%] bg-[#e8ecf1] relative flex flex-col overflow-hidden">

          <DocumentEditor rfpContent={editableContent} onChange={setEditableContent} />

          {/* Floating Toolbar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-[#0a1628]/90 backdrop-blur-xl rounded-2xl px-2 py-2 shadow-2xl border border-white/10">
            {/* Save Button */}
            <button
              onClick={handleManualSave}
              disabled={savingManual || rfp?.content === editableContent}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#c8a96a] hover:bg-[#b8995a] text-[#0a1628] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-amber-900/20"
              title="Save Manual Edits"
            >
              {savingManual ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>

            {/* Divider */}
            <div className="w-px h-7 bg-white/10" />

            {/* Undo Button */}
            <button
              onClick={handleUndo}
              disabled={editableContent === lastSavedContent}
              className="p-2.5 text-white/70 hover:text-[#c8a96a] rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 hover:bg-white/5"
              title="Undo to Last Saved"
            >
              <Undo2 size={16} />
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                setPdfKey(k => k + 1);
                setEditableContent(rfp.content);
                setLastSavedContent(rfp.content);
              }}
              disabled={rfp?.content === editableContent}
              className="p-2.5 text-white/70 hover:text-[#c8a96a] rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 hover:bg-white/5"
              title="Reset to Original"
            >
              <RefreshCw size={16} />
            </button>

            {/* Unsaved Indicator */}
            {rfp?.content !== editableContent && (
              <>
                <div className="w-px h-7 bg-white/10" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-amber-400 text-[9px] font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved
                </div>
              </>
            )}
          </div>
        </div>

        {/* VERTICAL DIVIDER */}
        <div className="w-[3px] bg-gradient-to-b from-[#0a1628] via-[#c8a96a]/30 to-[#0a1628] shrink-0 relative z-10 shadow-[0_0_15px_rgba(200,169,106,0.1)]" />

        {/* REVISION ENGINE — RIGHT PANEL */}
        <div className="w-[40%] lg:w-[35%] bg-gradient-to-b from-[#fafbfc] to-white flex flex-col overflow-y-auto custom-scrollbar">
          
          {/* Panel Header Strip */}
          <div className="px-8 py-4 bg-[#0a1628]/[0.03] border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Revision Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
          </div>

          <div className="p-8 space-y-8 flex-1">
            
            {/* Section: Manual + AI Info */}
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 bg-gradient-to-br from-[#c8a96a]/15 to-[#e8c97a]/10 border border-[#c8a96a]/20 rounded-2xl flex items-center justify-center text-[#c8a96a]">
                  <PenTool size={18} />
                </div>
                <div>
                  <h2 className="text-[15px] font-black text-[#0a1628] tracking-tight leading-tight">Document Revision Console</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Internal Review Mode</p>
                </div>
              </div>
              <div className="text-[12.5px] text-slate-500 leading-relaxed font-medium bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[#0a1628] font-bold">Edit directly</span> on the document, or describe changes below for AI-assisted revision. All modifications are <span className="text-[#c8a96a] font-bold">internal only</span> — no public corrigendum will be issued.
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            {/* AI Revision Form */}
            <form onSubmit={handleSilentUpdate} className="space-y-5">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Settings size={11} /> AI Revision Directives
                </label>
                <div className="relative group">
                  <textarea
                    rows={6}
                    disabled={loading || publishing}
                    className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-[#c8a96a]/10 focus:border-[#c8a96a] outline-none transition-all resize-none shadow-sm hover:shadow-md hover:border-slate-200"
                    placeholder="e.g., Modify the Technical Evaluation Matrix to assign a 15% weightage to Data Security protocols..."
                    value={changeInstruction}
                    onChange={e => setChangeInstruction(e.target.value)}
                  />
                  <div className={`absolute bottom-4 right-4 p-2 rounded-lg transition-all ${changeInstruction.trim() ? 'bg-[#c8a96a] text-[#0a1628] shadow-md shadow-amber-900/20 scale-110' : 'bg-slate-100 text-slate-400'}`}>
                    <Send size={14} className={changeInstruction.trim() ? 'translate-x-[1px] -translate-y-[1px]' : ''} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || publishing || (!changeInstruction.trim() && rfp?.content === editableContent)}
                className="w-full py-4 bg-[#0a1628] hover:bg-[#0f1f3d] text-[#c8a96a] rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-lg shadow-[#0a1628]/10 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] border border-[#c8a96a]/15 hover:border-[#c8a96a]/30 hover:shadow-xl"
              >
                {loading ? <><Loader2 className="animate-spin" size={16} /> Compiling Revision...</> : <><Save size={16} /> Execute Revision</>}
              </button>
            </form>

            {/* Bottom Info Card */}
            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="p-4 bg-[#0a1628]/[0.02] rounded-2xl border border-slate-100 flex items-start gap-3">
                <AlertCircle size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pre-Publication Mode</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Changes made here are purely internal. A formal corrigendum will only be generated after publication through the Amendment console.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}