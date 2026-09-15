"use client";
import { useEffect, useState, use } from 'react';
import {
    ArrowLeft, Send, MessageSquare, AlertTriangle, FileText, Download,
    Info, Loader2, CheckCircle, Search, LayoutDashboard, History,
    HelpCircle, Eye, ShieldCheck, ExternalLink, Calendar,
    ChevronRight, Building2, Bell, Clock, X, Sparkles, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

type TabType = 'document' | 'corrigenda' | 'queries';

export default function VendorRFPDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [rfp, setRfp] = useState<any>(null);
    const [queries, setQueries] = useState<any[]>([]);
    const [newQuery, setNewQuery] = useState("");
    const [asking, setAsking] = useState(false);
    const [corrigenda, setCorrigenda] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('document');
    const [selectedCorrigendum, setSelectedCorrigendum] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const BACKEND_URL = "http://localhost:8000";

    useEffect(() => {
        if (id) {
            fetch(`${BACKEND_URL}/rfp/${id}`).then(res => res.json()).then(data => setRfp(data));
            fetch(`${BACKEND_URL}/vendor/queries/${id}`).then(res => res.json()).then(data => setQueries(data));
            fetch(`${BACKEND_URL}/rfp/${id}/corrigenda`).then(res => res.json()).then(data => setCorrigenda(data));
        }
    }, [id]);

    const handleAskQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuery.trim()) return;
        setAsking(true);
        try {
            const res = await fetch(`${BACKEND_URL}/vendor/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rfp_id: Number(id), question: newQuery })
            });
            const data = await res.json();
            setQueries([...queries, data]);
            setNewQuery("");
        } catch { alert("Error asking query."); }
        setAsking(false);
    };

    if (!rfp) return (
        <div className="min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-center text-[#0a1628] gap-4">
            <Loader2 size={32} className="animate-spin text-[#0033a0]" />
            <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">Securing Connection...</p>
        </div>
    );

    return (
        <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* Modal for Full Corrigendum Notice */}
            {selectedCorrigendum && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0a1628]/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-500 border border-white/20">
                        <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-amber-100 rounded-[1.25rem] flex items-center justify-center text-amber-600 shadow-inner">
                                    <AlertTriangle size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Official Amendment</h2>
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Revision Protocol V{selectedCorrigendum.version}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCorrigendum(null)}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100 shadow-sm">
                                <h4 className="text-[11px] font-black text-amber-700 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <Info size={14} /> Executive Summary
                                </h4>
                                <p className="text-base font-bold text-slate-800 leading-relaxed italic">"{selectedCorrigendum.change_summary}"</p>
                            </div>
                            <div
                                className="w-full overflow-x-auto text-[14px] text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-8 rounded-3xl border border-slate-100 shadow-inner"
                                dangerouslySetInnerHTML={{ __html: selectedCorrigendum.full_notice }}
                            />
                        </div>
                        <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                <Calendar size={14} className="text-indigo-500" /> Issued {new Date(selectedCorrigendum.created_at).toLocaleDateString()}
                            </div>
                            <button
                                onClick={() => setSelectedCorrigendum(null)}
                                className="px-8 py-3.5 bg-[#0033a0] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#002277] transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                            >
                                Confirm Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Corporate Header */}
            <header className="bg-white h-[72px] border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-20 shadow-sm">
                <div className="flex items-center gap-6">
                    <Link href="/vendor" className="group flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-2xl transition-all border border-slate-100 font-bold text-xs uppercase tracking-widest active:scale-95">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </Link>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-[#0033a0]" />
                            <h1 className="text-lg font-black text-[#0a1628] tracking-tight line-clamp-1">{rfp.title}</h1>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tender ID: <span className="text-indigo-600 font-black">#RFP-{rfp.id.toString().padStart(4, '0')}</span></span>
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                <ShieldCheck size={10} /> Verified Opportunity
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Clock size={12} className="text-indigo-500" /> Issued {new Date(rfp.created_at).toLocaleDateString()}
                    </div>
                    <a
                        href={`${BACKEND_URL}${rfp.pdf_url}`}
                        download
                        className="flex items-center gap-2.5 px-6 py-3 bg-[#0033a0] hover:bg-[#002277] text-white rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-blue-900/20 active:scale-95 group"
                    >
                        <Download size={14} className="group-hover:translate-y-0.5 transition-transform text-white/80" /> Export Document
                    </a>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">

                {/* Sidebar Navigation */}
                <aside className="w-64 bg-white border-r border-slate-200 flex flex-col py-8 px-5 shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)]">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-3">Tender Navigation</div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab('document')}
                            className={`h-12 w-full rounded-2xl flex items-center px-4 gap-3 transition-all group ${activeTab === 'document' ? 'bg-[#0033a0] text-white shadow-md shadow-blue-900/10' : 'text-slate-500 hover:bg-slate-50 hover:text-[#0033a0]'}`}
                        >
                            <FileText size={18} className={activeTab === 'document' ? 'text-white' : 'text-slate-400 group-hover:text-[#0033a0]'} />
                            <span className="text-xs font-black uppercase tracking-widest">Document Specs</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('corrigenda')}
                            className={`h-12 w-full rounded-2xl flex items-center px-4 gap-3 transition-all group relative ${activeTab === 'corrigenda' ? 'bg-[#0033a0] text-white shadow-md shadow-blue-900/10' : 'text-slate-500 hover:bg-slate-50 hover:text-[#0033a0]'}`}
                        >
                            <History size={18} className={activeTab === 'corrigenda' ? 'text-white' : 'text-slate-400 group-hover:text-[#0033a0]'} />
                            <span className="text-xs font-black uppercase tracking-widest">Amendments</span>
                            {corrigenda.length > 0 && (
                                <span className={`ml-auto w-5 h-5 flex items-center justify-center text-[9px] font-black rounded-full shadow-sm ${activeTab === 'corrigenda' ? 'bg-white text-[#0033a0]' : 'bg-amber-500 text-white animate-pulse'}`}>
                                    {corrigenda.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('queries')}
                            className={`h-12 w-full rounded-2xl flex items-center px-4 gap-3 transition-all group ${activeTab === 'queries' ? 'bg-[#0033a0] text-white shadow-md shadow-blue-900/10' : 'text-slate-500 hover:bg-slate-50 hover:text-[#0033a0]'}`}
                        >
                            <HelpCircle size={18} className={activeTab === 'queries' ? 'text-white' : 'text-slate-400 group-hover:text-[#0033a0]'} />
                            <span className="text-xs font-black uppercase tracking-widest">Support Q&A</span>
                        </button>
                    </div>

                    <div className="mt-auto bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Connection</span>
                            <span className="text-[9px] font-bold text-emerald-600 uppercase">Secured Node</span>
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Viewport (Center) */}
                    <main className="flex-1 bg-slate-100/50 relative overflow-hidden flex flex-col p-6">
                        {activeTab === 'document' && (
                            <div className="w-full h-full bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-500">
                                <div className="h-14 bg-slate-50 border-b border-slate-100 px-8 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Eye size={16} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encrypted Document Viewer</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400/20" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400/20" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-400/20" />
                                    </div>
                                </div>
                                <iframe
                                    src={`${BACKEND_URL}${rfp.pdf_url}#toolbar=0&navpanes=0`}
                                    className="w-full flex-1 border-none bg-slate-800"
                                    title="RFP Document Viewer"
                                />
                            </div>
                        )}

                        {activeTab === 'corrigenda' && (
                            <div className="w-full h-full flex flex-col animate-in slide-in-from-right-8 duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-[#0a1628] uppercase tracking-tight">Tender Revision Ledger</h2>
                                        <p className="text-sm font-medium text-slate-500">Chronological history of official modifications and scope adjustments.</p>
                                    </div>
                                    <div className="px-6 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest shadow-sm">
                                        {corrigenda.length} Amendments Issued
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                    {corrigenda.length > 0 ? (
                                        <div className="relative pl-8 ml-4 border-l-2 border-slate-200 space-y-12 pb-12">
                                            {corrigenda.map((c: any, index: number) => {
                                                const isLatest = index === corrigenda.length - 1;
                                                
                                                // Extract the formal subject line generated by the AI
                                                let displayTitle = c.change_summary;
                                                if (c.full_notice) {
                                                    const subjectMatch = c.full_notice.match(/SUBJECT:\s*([^<]+)/i);
                                                    if (subjectMatch && subjectMatch[1]) {
                                                        displayTitle = subjectMatch[1].trim();
                                                    }
                                                }

                                                return (
                                                    <div key={c.id} className="relative">
                                                        {/* Timeline Node */}
                                                        <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-all ${isLatest ? 'bg-[#e81c24] scale-125 ring-4 ring-red-100' : 'bg-slate-300'}`} />

                                                        {/* Content Card */}
                                                        <div
                                                            onClick={() => setSelectedCorrigendum(c)}
                                                            className={`group bg-white rounded-[2rem] border transition-all cursor-pointer relative flex flex-col md:flex-row overflow-hidden active:scale-[0.99] ${isLatest ? 'border-[#0033a0] shadow-xl shadow-blue-900/5 ring-1 ring-[#0033a0]/10' : 'border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md'}`}
                                                        >
                                                            {/* Side Highlight */}
                                                            <div className={`w-2 shrink-0 ${isLatest ? 'bg-[#0033a0]' : 'bg-slate-100 group-hover:bg-slate-300'}`} />

                                                            <div className="p-8 flex-1">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isLatest ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                                                            {isLatest ? 'Latest Amendment' : 'Past Revision'}
                                                                        </span>
                                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Revision V0{c.version}</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                        <Calendar size={12} /> {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                    </span>
                                                                </div>

                                                                <h3 className={`text-lg font-black tracking-tight mb-3 ${isLatest ? 'text-[#0033a0]' : 'text-slate-900'}`}>
                                                                    {displayTitle}
                                                                </h3>

                                                                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6 line-clamp-2">
                                                                    {c.full_notice.replace(/<[^>]*>?/gm, '').substring(0, 200)}...
                                                                </p>

                                                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                                                                        View Official Notice <ArrowRight size={14} />
                                                                    </span>
                                                                    <div className="flex -space-x-2">
                                                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">IB</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }).reverse()} {/* Show latest at top */}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-center p-12 opacity-80">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                                <History size={32} className="text-slate-200" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-2">Baseline Configuration</h3>
                                            <p className="text-sm font-medium text-slate-400 max-w-xs uppercase tracking-tighter">No formal amendments have been recorded against the original RFP issuance.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'queries' && (
                            <div className="w-full h-full flex flex-col animate-in slide-in-from-right-8 duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-[#0a1628] uppercase tracking-tight">Intelligence Support</h2>
                                        <p className="text-sm font-medium text-slate-500">Instant AI clarifications grounded in official tender documentation.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-64">
                                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search history..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 flex gap-8 overflow-hidden pb-4">
                                    {/* Chat Thread */}
                                    <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#0033a0] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/10">
                                                    <MessageSquare size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Resolution Channel</p>
                                                    <p className="text-xs font-bold text-slate-900">Official RAG Protocol Active</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase border border-emerald-100">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                                                Grounded Mode
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50/20">
                                            {queries.length === 0 && (
                                                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
                                                        <HelpCircle size={32} className="text-slate-200" />
                                                    </div>
                                                    <h3 className="text-lg font-black text-slate-400 uppercase tracking-[0.15em] mb-2">No Queries Logged</h3>
                                                    <p className="text-xs font-bold text-slate-400 max-w-xs leading-relaxed uppercase tracking-tighter">Submit a question regarding compliance, technical specifications, or timeline.</p>
                                                </div>
                                            )}

                                            {queries.filter(q => q.question.toLowerCase().includes(searchTerm.toLowerCase())).map((q: any) => (
                                                <div key={q.id} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="flex justify-end">
                                                        <div className="max-w-[80%] bg-[#0033a0] text-white px-6 py-4 rounded-[1.75rem] rounded-tr-md text-sm font-medium shadow-md shadow-blue-900/10 leading-relaxed border border-white/10">
                                                            {q.question}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-start">
                                                        <div className="max-w-[85%] space-y-2">
                                                            <div className="flex items-center gap-2 mb-1 pl-2">
                                                                <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                                                                    <LayoutDashboard size={12} />
                                                                </div>
                                                                <span className="text-[10px] font-black text-[#0a1628] uppercase tracking-widest">RAG Response</span>
                                                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                                                <span className="text-[9px] font-bold text-slate-400">#00{q.id}</span>
                                                            </div>
                                                            <div className="bg-white border border-slate-200 px-6 py-5 rounded-[1.75rem] rounded-tl-md text-sm text-slate-700 leading-relaxed shadow-sm font-medium">
                                                                {q.answer || (
                                                                    <div className="flex items-center gap-3 py-1">
                                                                        <Loader2 size={16} className="animate-spin text-indigo-500" />
                                                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing via Institution Node...</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-8 bg-white border-t border-slate-100">
                                            <form onSubmit={handleAskQuery} className="relative group">
                                                <div className="absolute inset-0 bg-[#0033a0] rounded-3xl blur-xl opacity-0 group-focus-within:opacity-5 transition-opacity pointer-events-none" />
                                                <div className="relative flex items-center w-full">
                                                    <input
                                                        placeholder="Inquire about technical specifications, compliance standards..."
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-6 pr-16 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0033a0]/10 focus:bg-white focus:border-[#0033a0] transition-all shadow-inner"
                                                        value={newQuery}
                                                        onChange={e => setNewQuery(e.target.value)}
                                                    />
                                                    <button
                                                        disabled={asking || !newQuery.trim()}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#0033a0] text-white rounded-xl flex items-center justify-center hover:bg-[#002277] transition-all shadow-md shadow-blue-900/10 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                                                    >
                                                        {asking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="-ml-0.5" />}
                                                    </button>
                                                </div>
                                            </form>
                                            <div className="mt-4 flex items-center justify-center gap-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                                <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-400" /> End-to-End Encrypted</span>
                                                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span className="flex items-center gap-1.5"><LayoutDashboard size={12} className="text-indigo-400" /> Grounded in Source PDF</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Panel */}
                                    <div className="hidden xl:flex w-80 flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar">

                                        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Submission Status</h4>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                                        <CheckCircle size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eligibility</p>
                                                        <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter">Verified Provider</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposal</p>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter italic">Pending Upload</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

