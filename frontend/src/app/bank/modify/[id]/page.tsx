"use client";
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, Send, CheckCircle, RefreshCw, Edit3, Settings, ShieldCheck, ArrowRight, Eye, EyeOff, ChevronRight, Clock, GitMerge, History } from 'lucide-react';
import Link from 'next/link';

export default function ModifyRFP({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [rfp, setRfp] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [viewingHistorical, setViewingHistorical] = useState(false);
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfKey, setPdfKey] = useState(0);

  const BACKEND_URL = "http://localhost:8000";

  // Word-level diff highlighter
  const DiffText = ({ oldText, newText, type }: { oldText: string, newText: string, type: 'old' | 'new' }) => {
    if (!oldText || !newText) return <span>{type === 'old' ? oldText : newText}</span>;
    
    const wordsOld = oldText.split(/(\s+)/);
    const wordsNew = newText.split(/(\s+)/);
    
    if (type === 'old') {
      return (
        <>
          {wordsOld.map((word, i) => {
            if (!word.trim()) return word;
            const existsInNew = newText.includes(word);
            return (
              <span key={i} className={!existsInNew ? "bg-red-200 text-red-900 px-0.5 rounded ring-1 ring-red-300 mx-0.5 not-italic font-bold" : ""}>
                {word}
              </span>
            );
          })}
        </>
      );
    } else {
      return (
        <>
          {wordsNew.map((word, i) => {
            if (!word.trim()) return word;
            const existsInOld = oldText.includes(word);
            return (
              <span key={i} className={!existsInOld ? "bg-emerald-200 text-emerald-900 px-0.5 rounded ring-1 ring-emerald-300 mx-0.5 font-black" : ""}>
                {word}
              </span>
            );
          })}
        </>
      );
    }
  };

  useEffect(() => {
    // Fetch current RFP
    fetch(`${BACKEND_URL}/rfp/${id}`)
      .then(res => res.json())
      .then(data => {
        setRfp(data);
      });
    
    // Fetch all versions for the Time Machine
    fetch(`${BACKEND_URL}/rfp/${id}/versions`)
      .then(res => res.json())
      .then(data => {
        setVersions(data);
        if (data.length > 0) {
          setSelectedVersion(data[data.length - 1].version_number);
        }
      });
  }, [id]);

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vNum = parseInt(e.target.value);
    setSelectedVersion(vNum);
    setViewingHistorical(vNum !== versions.length);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeSummary.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/rfp/update/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updated_content: null,
          change_summary: changeSummary
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRfp(data.updated_rfp);
        setChangeSummary("");
        setPdfKey(prev => prev + 1);
        
        // Refresh versions list
        const vRes = await fetch(`${BACKEND_URL}/rfp/${id}/versions`);
        const vData = await vRes.json();
        setVersions(vData);
        setSelectedVersion(vData[vData.length - 1].version_number);
        setViewingHistorical(false);

        alert('Amendment Issued! The official PDF and Corrigendum notice have been automatically generated.');
      }
    } catch (err) {
      alert('Error applying institutional amendment.');
    }
    setLoading(false);
  };

  if (!rfp) return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center text-white gap-6">
      <Loader2 size={40} className="animate-spin text-[#c8a96a]" />
      <p className="text-slate-400 font-bold tracking-[0.2em] text-xs uppercase">Initializing Secure Container...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#f0f4f8] flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <header className="bg-[#0a1628] h-[76px] px-8 flex items-center justify-between shrink-0 shadow-xl z-20 border-b border-white/5">
        <div className="flex items-center gap-6">
          <Link href="/bank?view=management" className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/10">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <h1 className="text-md font-black text-white tracking-tight">Institutional Control: <span className="text-[#c8a96a]">AMENDMENT MODE</span></h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">{rfp.title} · RFP #00{rfp.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <CheckCircle size={14} /> System Online
          </div>
          <Link
            href="/bank?view=management"
            className="px-6 py-2.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-600 hover:border-white/20"
          >
            Exit Session
          </Link>
        </div>
      </header>

      {/* Main Content: Split Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: LIVE PDF PREVIEW OR TIME MACHINE DIFF */}
        <div className="w-[60%] lg:w-[65%] bg-[#1e1e2e] relative border-r border-[#c8a96a]/10 flex flex-col shadow-inner">

          {!viewingHistorical ? (
            <iframe
              key={pdfKey}
              src={`${BACKEND_URL}${rfp.pdf_url}?t=${pdfKey}`}
              className="w-full h-full border-none bg-slate-100"
              title="Current RFP Version"
            />
          ) : (
            <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-900 overflow-hidden p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#0a1628] to-[#122654] rounded-2xl flex items-center justify-center shadow-lg text-[#c8a96a]">
                    <GitMerge size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0a1628] tracking-tight">Version Comparison Archive</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                      Comparing <span className="text-amber-600">v{selectedVersion}.0</span> <ArrowRight size={10} /> <span className="text-emerald-600">Current Official State</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowOnlyChanges(!showOnlyChanges)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border shadow-sm ${showOnlyChanges ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {showOnlyChanges ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showOnlyChanges ? "Showing Only Modifications" : "Show Only Modifications"}
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Historical State Active
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pr-4 pb-20">
                {(() => {
                  try {
                    const historicalContent = JSON.parse(versions.find(v => v.version_number === selectedVersion)?.content || "[]");
                    const currentContent = JSON.parse(rfp.content || "[]");

                    const sectionsToRender = historicalContent.filter((section: any) => {
                      if (!showOnlyChanges) return true;
                      const currentSection = currentContent.find((s: any) => s.section_id === section.section_id);
                      return JSON.stringify(section) !== JSON.stringify(currentSection);
                    });

                    if (sectionsToRender.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-20 bg-emerald-50/50 border-2 border-dashed border-emerald-100 rounded-[3rem] text-center">
                          <CheckCircle size={48} className="text-emerald-500 mb-4 opacity-30" />
                          <h4 className="text-lg font-black text-emerald-900 tracking-tight">No Modifications Found</h4>
                          <p className="text-sm text-emerald-600 font-medium max-w-xs mt-2">
                            This version is identical to the current official institutional state.
                          </p>
                        </div>
                      );
                    }

                    return sectionsToRender.map((section: any, idx: number) => {
                      const currentSection = currentContent.find((s: any) => s.section_id === section.section_id);
                      const isModified = JSON.stringify(section) !== JSON.stringify(currentSection);

                      return (
                        <div key={idx} className={`p-1 rounded-[2.5rem] transition-all overflow-hidden ${isModified ? 'bg-amber-100/50 border border-amber-200 shadow-md' : 'bg-slate-100 border border-slate-200 opacity-60'}`}>
                          <div className="p-8 bg-white rounded-[2.4rem] border border-white/40">
                            <div className="flex items-center justify-between mb-8">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${isModified ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/10' : 'bg-slate-200 text-slate-500'}`}>
                                  {section.section_id}
                                </div>
                                <h4 className="text-lg font-black text-[#0a1628] tracking-tight">{section.title}</h4>
                              </div>
                              {isModified && (
                                <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 border border-amber-200 px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2">
                                  <Clock size={12} /> Modifications Detected
                                </span>
                              )}
                            </div>

                            <div className="space-y-8">
                              {section.clauses?.map((clause: any, cIdx: number) => {
                                const currentClause = currentSection?.clauses?.find((c: any) => c.id === clause.id);
                                
                                // Precise modification detection based on user-visible content
                                const contentModified = clause.content !== currentClause?.content;
                                const subClausesModified = JSON.stringify(clause.sub_clauses) !== JSON.stringify(currentClause?.sub_clauses);
                                const headingModified = clause.heading !== currentClause?.heading;
                                const clauseModified = contentModified || subClausesModified || headingModified;

                                if (showOnlyChanges && !clauseModified) return null;

                                return (
                                  <div key={cIdx} className={`rounded-3xl border overflow-hidden ${clauseModified ? 'border-amber-200 shadow-sm' : 'border-slate-100'}`}>
                                    <div className={`px-6 py-3 border-b flex items-center justify-between ${clauseModified ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                                      <p className="text-[10px] font-black text-[#c8a96a] uppercase tracking-widest flex items-center gap-2">
                                        Clause {clause.id}: {clause.heading}
                                      </p>
                                      {clauseModified && (
                                        <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                          <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">
                                            {contentModified ? "Content Update" : subClausesModified ? "Sub-Clause Change" : "Heading Update"}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {!clauseModified ? (
                                      <div className="p-6 bg-slate-50/30">
                                        <p className="text-sm leading-relaxed text-slate-600">{clause.content}</p>
                                        {clause.sub_clauses?.length > 0 && (
                                          <ul className="mt-4 space-y-2">
                                            {clause.sub_clauses.map((sub: string, sIdx: number) => (
                                              <li key={sIdx} className="text-xs text-slate-400 flex gap-3 italic">
                                                <span className="text-[#c8a96a]/50">•</span> {sub}
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="divide-y divide-amber-100">
                                        {/* THEN: Historical */}
                                        <div className="p-6 bg-red-50/20 relative group">
                                          <div className="absolute top-4 right-6 px-3 py-1 bg-red-100 border border-red-200 text-red-600 text-[8px] font-black uppercase rounded-lg tracking-widest">
                                            THEN (v{selectedVersion})
                                          </div>
                                          <p className={`text-sm leading-relaxed ${contentModified ? 'text-red-700 font-medium' : 'text-slate-500 italic'} pr-20`}>
                                            {contentModified ? <DiffText oldText={clause.content} newText={currentClause?.content} type="old" /> : clause.content}
                                          </p>
                                          {clause.sub_clauses?.length > 0 && (
                                            <ul className="mt-4 space-y-2">
                                              {clause.sub_clauses.map((sub: string, sIdx: number) => {
                                                const currentSub = currentClause?.sub_clauses?.find((cs: string) => cs.split(':')[0] === sub.split(':')[0]);
                                                const subModified = sub !== currentSub;
                                                return (
                                                  <li key={sIdx} className={`text-xs flex gap-3 ${subModified ? 'text-red-600 font-bold' : 'text-slate-400 italic'}`}>
                                                    <span className="text-red-400">•</span>
                                                    {subModified ? <DiffText oldText={sub} newText={currentSub} type="old" /> : sub}
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          )}
                                        </div>

                                        {/* Transition Arrow */}
                                        <div className="h-0 flex justify-center items-center relative z-10">
                                          <div className="bg-amber-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white -translate-y-[1px]">
                                            <ChevronRight size={14} className="rotate-90" />
                                          </div>
                                        </div>

                                        {/* NOW: Current */}
                                        <div className="p-6 bg-emerald-50/20 relative">
                                          <div className="absolute top-4 right-6 px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-600 text-[8px] font-black uppercase rounded-lg tracking-widest">
                                            NOW (OFFICIAL)
                                          </div>
                                          <div className="pr-20">
                                            <p className={`text-sm leading-relaxed ${contentModified ? 'text-emerald-700 font-bold' : 'text-slate-900 font-medium'}`}>
                                              {contentModified ? <DiffText oldText={clause.content} newText={currentClause?.content} type="new" /> : currentClause?.content || "Directive deleted in current version."}
                                            </p>
                                          </div>
                                          {currentClause?.sub_clauses?.length > 0 && (
                                            <ul className="mt-4 space-y-2">
                                              {currentClause.sub_clauses.map((sub: string, sIdx: number) => {
                                                const oldSub = clause.sub_clauses?.find((os: string) => os.split(':')[0] === sub.split(':')[0]);
                                                const subModified = sub !== oldSub;
                                                return (
                                                  <li key={sIdx} className={`text-xs flex gap-3 ${subModified ? 'text-emerald-600 font-bold' : 'text-slate-700 font-medium'}`}>
                                                    <span className="text-emerald-500">•</span>
                                                    {subModified ? <DiffText oldText={oldSub} newText={sub} type="new" /> : sub}
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  } catch (e) {
                    return (
                      <div className="py-20 text-center">
                        <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
                        <h4 className="text-red-500 font-black uppercase tracking-widest text-xs">Structural Error</h4>
                        <p className="text-slate-500 text-sm mt-2">Error reconstructing historical state.</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )
}

          <div className="absolute bottom-6 right-6 px-6 py-4 bg-[#0a1628]/90 backdrop-blur-xl text-white rounded-[1.5rem] border border-[#c8a96a]/20 shadow-2xl z-30">
            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="text-[9px] text-[#c8a96a]/80 font-black uppercase tracking-widest mb-0.5">Registry Status</p>
                <p className="text-xs font-black text-white uppercase">{rfp.status}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <button
                onClick={() => setPdfKey(k => k + 1)}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center border border-white/5 hover:border-white/20 transition-all active:scale-95"
                title="Force Refresh Preview"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: AMENDMENT ENGINE */}
        <div className="w-[40%] lg:w-[35%] bg-white flex flex-col shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.05)] overflow-y-auto custom-scrollbar">
          <div className="p-10 space-y-10">

            {/* Header */}
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-[#c8a96a]/10 to-[#e8c97a]/10 border border-[#c8a96a]/20 rounded-2xl flex items-center justify-center shadow-sm text-[#c8a96a]">
                  <Edit3 size={20} />
                </div>
                <h2 className="text-xl font-black text-[#0a1628] tracking-tight">Document Amendment Console</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium bg-slate-50 p-5 rounded-2xl border border-slate-100">
                Issue precise modification directives below. The subsystem will surgically update the technical architecture, regenerate the master PDF, and draft a formal <strong className="text-[#0a1628]">Corrigendum Notice</strong> for public broadcast.
              </p>
            </div>

            {/* Instruction Box */}
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Settings size={12} /> Amendment Directives
                  </label>
                  <span className="text-[9px] font-black text-[#0a1628] bg-[#c8a96a]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#c8a96a]/20">Official Change Log</span>
                </div>
                <div className="relative group">
                  <textarea
                    rows={7}
                    disabled={loading}
                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-[#c8a96a]/10 focus:border-[#c8a96a] focus:bg-white outline-none transition-all resize-none shadow-inner"
                    placeholder="e.g., Modify the technical evaluation weightage to 80% and extend the submission deadline by 14 days. Append mandatory ISO 27001 data sovereignty compliance."
                    value={changeSummary}
                    onChange={e => setChangeSummary(e.target.value)}
                    required
                  />
                  <div className={`absolute bottom-6 right-6 p-2.5 rounded-xl transition-all ${changeSummary.trim() ? 'bg-[#c8a96a] text-[#0a1628] shadow-md shadow-amber-900/20' : 'bg-slate-200 text-slate-400'}`}>
                    <Send size={16} className={changeSummary.trim() ? 'translate-x-[1px] -translate-y-[1px]' : ''} />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading || !changeSummary.trim()}
                className="w-full py-5 bg-[#0a1628] hover:bg-[#122654] text-[#c8a96a] rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-[#0a1628]/10 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] border border-[#c8a96a]/20 group"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={18} /> Compiling Official Amendment...</>
                ) : (
                  <><ShieldCheck size={18} /> Issue Formal Corrigendum</>
                )}
              </button>
            </form>

            {/* VERSION TIME MACHINE */}
            <div className="pt-10 border-t-2 border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                    <History size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0a1628] uppercase tracking-widest">Version Time Machine</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Audit Archive & Temporal Navigation</p>
                  </div>
                </div>
                {viewingHistorical && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white text-[9px] font-black rounded-xl uppercase tracking-widest animate-pulse shadow-lg shadow-amber-900/20">
                    <div className="w-1 h-1 rounded-full bg-white" /> Historical Mode
                  </div>
                )}
              </div>

              <div className="bg-[#0a1628] rounded-[2.5rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden group transition-all hover:shadow-[#c8a96a]/5 hover:border-[#c8a96a]/20">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#c8a96a]/10 blur-[60px] rounded-full -mr-16 -mt-16 transition-all group-hover:bg-[#c8a96a]/20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full -ml-10 -mb-10" />
                
                <div className="relative z-10 space-y-10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-[9px] text-[#c8a96a] font-black uppercase tracking-[0.2em] mb-1">Version</p>
                        <h4 className="text-4xl font-black text-white italic tracking-tighter">v{selectedVersion || 1}.0</h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">State Integrity</p>
                      <div className="flex items-center gap-2 justify-end">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <p className="text-xs font-bold text-slate-300">Verified SNAPSHOT</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="relative pt-2">
                      <input 
                        type="range" 
                        min="1" 
                        max={versions.length > 0 ? versions.length : 1} 
                        value={selectedVersion || 1}
                        onChange={handleVersionChange}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#c8a96a] hover:accent-[#e8c97a] transition-all relative z-10"
                      />
                      <div className="absolute top-1.5 left-0 h-1.5 bg-gradient-to-r from-[#c8a96a] to-[#e8c97a] rounded-lg pointer-events-none" style={{ width: `${((selectedVersion || 1) - 1) / (Math.max(versions.length - 1, 1)) * 100}%` }} />
                    </div>
                    
                    <div className="flex justify-between px-1">
                      {versions.length > 0 ? (
                        versions.map((v) => (
                          <button 
                            key={v.id} 
                            onClick={() => {
                              setSelectedVersion(v.version_number);
                              setViewingHistorical(v.version_number !== versions.length);
                            }}
                            className="flex flex-col items-center gap-2 group/v"
                          >
                            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedVersion === v.version_number ? 'bg-[#c8a96a] scale-150 shadow-[0_0_15px_#c8a96a]' : 'bg-white/20 group-hover/v:bg-white/40'}`} />
                            <span className={`text-[9px] font-black transition-all ${selectedVersion === v.version_number ? 'text-[#c8a96a] translate-y-0.5' : 'text-slate-600 group-hover/v:text-slate-400'}`}>v{v.version_number}</span>
                          </button>
                        ))
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#c8a96a] scale-150 shadow-[0_0_15px_#c8a96a]" />
                          <span className="text-[9px] font-black text-[#c8a96a]">v1</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedVersion && (
                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-sm relative group/summary">
                      <div className="absolute -top-3 left-6 px-3 py-1 bg-[#0a1628] border border-white/10 rounded-full text-[8px] font-black text-[#c8a96a] uppercase tracking-widest">
                        Modification Log
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium italic leading-relaxed text-center">
                        "{versions.find(v => v.version_number === selectedVersion)?.change_summary || 'Initial issuance of the institutional RFP.'}"
                      </p>
                    </div>
                  )}

                  <button 
                    disabled={!viewingHistorical}
                    onClick={() => {
                      setSelectedVersion(versions.length);
                      setViewingHistorical(false);
                    }}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-3 ${viewingHistorical ? 'bg-[#c8a96a] text-[#0a1628] border-[#c8a96a] hover:bg-white hover:border-white shadow-lg shadow-amber-900/20' : 'bg-transparent text-slate-700 border-white/5 cursor-not-allowed opacity-30'}`}
                  >
                    <RefreshCw size={14} className={viewingHistorical ? 'animate-spin-slow' : ''} />
                    Return to Live State (v{versions.length}.0)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
                <AlertCircle size={14} /> Cryptographic Audit Trail
              </div>

              <div className="mb-6 p-6 bg-[#c8a96a]/5 rounded-3xl border border-[#c8a96a]/15 flex gap-4">
                <div className="w-10 h-10 bg-[#c8a96a]/10 text-[#c8a96a] rounded-2xl flex items-center justify-center shrink-0">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h4 className="text-10px font-black text-[#0a1628] uppercase tracking-widest mb-1.5">Broadcast Warning</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Execution constitutes a binding update. Registered vendors will be instantly notified via secure channels and the institutional index will sync automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
