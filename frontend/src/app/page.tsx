"use client";
import Link from 'next/link';
import { Building2, Store, Sparkles, ShieldCheck, Zap, Brain, Clock, FileCheck, ArrowRight, ChevronRight, Globe, Lock, Cpu, BarChart3, Search, MessageCircle, FileText, CheckCircle, Database, Network, Scale, Code, GitMerge, FileSearch, CheckCircle2, History, Users, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-x-hidden relative text-slate-900 font-sans selection:bg-[#0033a0] selection:text-white">
      
      {/* BACKGROUND AMBIENCE */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] -left-[5%] w-[60%] h-[60%] rounded-full bg-blue-100/30 blur-[120px] animate-pulse" />
        <div className="absolute top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-indigo-50/40 blur-[100px] animate-pulse delay-700" />
      </div>

      {/* NAVIGATION */}
      <nav className="relative z-50 max-w-7xl mx-auto px-8 py-8 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 bg-[#0033a0] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-black text-2xl tracking-tighter">IB</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-black tracking-tighter uppercase leading-none text-[#0a1628]">Indian <span className="text-blue-600">Bank</span></span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 leading-none">RFP Intel Engine</span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-10">
            <Link href="/login?role=vendor" className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-[#0033a0] transition-all">Partner Portal</Link>
            <Link href="/login?role=bank" className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-[#0033a0] transition-all">Admin Terminal</Link>
            <Link href="/signup" className="px-8 py-3.5 bg-white border border-slate-200 shadow-sm rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Establish Credentials</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-24 text-left">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mb-32">
            
            <div className="lg:w-3/5">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border border-blue-100 bg-blue-50/50 text-[#0033a0] text-xs font-black uppercase tracking-[0.1em] mb-10 backdrop-blur-sm shadow-sm">
                    <Sparkles size={14} className="animate-pulse" />
                    <span>Neural Multi-RAG Protocol v1.0.4</span>
                </div>

                <h1 className="text-7xl md:text-[90px] font-black tracking-tighter mb-8 leading-[0.85] text-[#0a1628] uppercase">
                    AI <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0033a0] via-blue-600 to-[#0033a0]">
                        Automated
                    </span> <br/>
                    Procurement
                </h1>

                <p className="text-xl md:text-2xl text-slate-500 max-w-xl mb-12 leading-relaxed font-medium">
                    The modern institutional standard for digital RFP lifecycles. Harness document intelligence to draft, publish, and audit banking bids.
                </p>

                <div className="flex flex-col sm:flex-row gap-6">
                    <Link href="/signup?role=bank" className="px-10 py-6 bg-[#0033a0] text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-800 transition-all shadow-2xl shadow-blue-200 flex items-center gap-3 group active:scale-95">
                        Bank Official <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/signup?role=vendor" className="px-10 py-6 bg-white border-2 border-slate-100 text-slate-600 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:border-[#0033a0] hover:text-[#0033a0] transition-all flex items-center gap-3 group shadow-xl active:scale-95">
                        Register Partner <Globe size={18} />
                    </Link>
                </div>
            </div>

            {/* NEURAL HUB - REVERTED & FULLY CONNECTED */}
            <div className="lg:w-2/5 relative flex items-center justify-center h-[600px]">
                <div className="relative w-full h-full flex items-center justify-center">
                    
                    {/* Concentric Professional Scan Rings */}
                    <div className="absolute w-[520px] h-[520px] border border-blue-50 rounded-full opacity-40" />
                    <div className="absolute w-[440px] h-[440px] border-[2px] border-blue-100/40 border-dashed rounded-full animate-spin-slow opacity-60" />
                    <div className="absolute w-[360px] h-[360px] border border-indigo-100 rounded-full animate-reverse-spin opacity-40" />

                    {/* Central Brain Core - BOLDEST AS REQUESTED */}
                    <div className="relative z-20">
                        <div className="absolute inset-0 bg-[#0033a0] blur-[50px] opacity-20 rounded-full animate-pulse" />
                        <div className="relative w-40 h-36 bg-[#0033a0] rounded-[3rem] shadow-[0_0_80px_rgba(0,51,160,0.35)] flex items-center justify-center group hover:scale-110 transition-transform duration-500 border border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-[3rem]" />
                            <Brain size={72} className="text-white animate-pulse" />
                        </div>
                    </div>

                    {/* Multi-Domain Expanded Nodes - BALANCED POSITIONING */}
                    <div className="absolute top-[10%] right-[15%] z-30 animate-float"><DomainBadge icon={Scale} label="Legal" color="text-blue-600" /></div>
                    <div className="absolute bottom-[12%] left-[5%] z-30 animate-float-delayed"><DomainBadge icon={Code} label="Tech" color="text-indigo-600" /></div>
                    <div className="absolute top-[18%] left-[8%] z-30 animate-float" style={{ animationDelay: '-2s' }}><DomainBadge icon={ShieldCheck} label="Rules" color="text-emerald-600" /></div>
                    <div className="absolute bottom-[10%] right-[10%] z-30 animate-float-delayed" style={{ animationDelay: '-4s' }}><DomainBadge icon={History} label="Audit" color="text-amber-600" /></div>
                    <div className="absolute top-[45%] right-[-5%] z-30 animate-float"><DomainBadge icon={Users} label="Vendors" color="text-purple-600" /></div>
                    <div className="absolute bottom-[45%] left-[-5%] z-30 animate-float-delayed"><DomainBadge icon={Layers} label="RAG" color="text-blue-400" /></div>

                    {/* ALL-NODE STOCHASTIC DATA BEAMS (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 400 400">
                        <defs>
                            <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="50%" stopColor="#0033a0" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                        {/* 1. Legal (Top Right) */}
                        <path d="M 310 33 Q 255 116 200 200" stroke="url(#beamGrad)" strokeWidth="2" strokeDasharray="6,6" fill="none" className="animate-beam-random-1" />
                        {/* 2. Tech (Bottom Left) */}
                        <path d="M 51 356 Q 125 278 200 200" stroke="url(#beamGrad)" strokeWidth="2" strokeDasharray="6,6" fill="none" className="animate-beam-random-2" />
                        {/* 3. Rules (Top Left) */}
                        <path d="M 63 73 Q 131 136 200 200" stroke="url(#beamGrad)" strokeWidth="2" strokeDasharray="6,6" fill="none" className="animate-beam-random-3" />
                        {/* 4. Audit (Bottom Right) */}
                        <path d="M 329 366 Q 264 283 200 200" stroke="url(#beamGrad)" strokeWidth="2" strokeDasharray="6,6" fill="none" className="animate-beam-random-4" />
                        {/* 5. Vendors (Far Right) */}
                        <path d="M 389 208 Q 294 204 200 200" stroke="url(#beamGrad)" strokeWidth="2" strokeDasharray="6,6" fill="none" className="animate-beam-random-5" />
                        {/* 6. RAG (Far Left) */}
                        <path d="M 11 191 Q 105 195 200 200" stroke="url(#beamGrad)" strokeWidth="2" strokeDasharray="6,6" fill="none" className="animate-beam-random-6" />
                    </svg>
                </div>
            </div>
        </div>

        {/* WORKFLOW ROADMAP */}
        <div className="mb-40">
            <div className="text-center mb-20">
                <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Lifecycle Workflow</h2>
                <h3 className="text-4xl font-black text-[#0a1628] uppercase tracking-tight">The Neural Procurement Loop</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                <div className="hidden md:block absolute top-[28%] left-1/2 -ml-[50%] w-full h-0.5 bg-slate-100 z-0" />
                {[
                    { step: '01', title: 'Neural Drafting', desc: 'AI queries specialized FAISS vector silos (Legal, Tech, Rules) to dynamically assemble a fully compliant RFP draft.', icon: Brain },
                    { step: '02', title: 'Sovereign Review', desc: 'Secure internal refinement. Surgical text updates are applied silently to the draft without generating a formal Corrigendum.', icon: FileSearch },
                    { step: '03', title: 'Live Publication', desc: 'Published RFP is instantly embedded into the live Vector Store, waking up the Intelligent Agent for real-time Vendor Q&A.', icon: Globe },
                    { step: '04', title: 'Resolutions', desc: 'Admins approve automated RAG vendor responses while the model directly generates formal Corrigendum PDF notices for major updates.', icon: CheckCircle2 }
                ].map((item, i) => (
                    <div key={i} className="relative z-10 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/20 text-center group hover:border-[#0033a0] transition-all">
                        <div className="w-12 h-12 bg-[#0a1628] text-[#c8a96a] rounded-full flex items-center justify-center mx-auto mb-6 font-black text-sm shadow-lg">
                            {item.step}
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-3">{item.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-bold">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* INTELLIGENCE MODULES */}
        <div className="mb-40 p-12 bg-gradient-to-br from-[#0033a0]/[0.04] via-blue-50/60 to-indigo-50/40 rounded-[4rem] border border-blue-100/60 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0033a0]/[0.04] rounded-full blur-[120px] -mr-40 -mt-40" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-100/30 rounded-full blur-[100px] -ml-20 -mb-20" />
            <div className="flex flex-col lg:flex-row gap-20 relative z-10">
                <div className="lg:w-1/3">
                    <h2 className="text-xs font-black text-[#0033a0] uppercase tracking-[0.4em] mb-6">Brain Architecture</h2>
                    <h3 className="text-4xl font-black text-[#0a1628] uppercase tracking-tight leading-tight mb-8">Sovereign <br/>Intelligence <br/>Modules</h3>
                    <p className="text-slate-500 text-sm font-medium leading-loose mb-10">Six specialized subsystems power the RFPilot engine — from categorized FAISS vector silos to a 3-tier LLM fallback chain, every module is purpose-built for institutional procurement.</p>
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/70 rounded-2xl border border-blue-100 text-[#0033a0] text-[10px] font-black uppercase tracking-widest shadow-sm"><Database size={14} /> 5 Independent FAISS Silos</div>
                </div>
                <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                    {[
                        { label: 'Multi-Silo Knowledge Base', desc: 'Documents ingested into 5 independent FAISS indexes: RFP, Legal, Compliance, Procurement, and Technical for domain-targeted retrieval.', icon: Database, color: 'text-blue-600', border: 'border-l-blue-500' },
                        { label: '3-Tier LLM Engine', desc: 'Primary: Mistral API with exponential backoff. Fallback 1: DistilBERT + GPT-Neo-2.7B. Fallback 2: Rule-based pattern extraction.', icon: Cpu, color: 'text-indigo-600', border: 'border-l-indigo-500' },
                        { label: 'Intelligent Agent', desc: 'Multi-turn reasoning loop (10 iterations) chaining RAG retrieval, API calls, regex parsing, and document search autonomously.', icon: Brain, color: 'text-emerald-600', border: 'border-l-emerald-500' },
                        { label: 'Section-by-Section Drafting', desc: 'RFP generation across 11 structured sections, each querying its own KB category silo before prompting Mistral with expert-grade instructions.', icon: FileText, color: 'text-amber-600', border: 'border-l-amber-500' },
                        { label: 'Corrigendum Generator', desc: 'Surgical JSON editing pipeline. LLM applies natural-language changes at temperature 0.1 and outputs the complete updated document with zero data loss.', icon: GitMerge, color: 'text-purple-600', border: 'border-l-purple-500' },
                        { label: 'Hybrid Query Resolver', desc: 'FAISS vector similarity combined with keyword overlap scoring across 8 intent types for precise, context-aware answers.', icon: Search, color: 'text-rose-600', border: 'border-l-rose-500' }
                    ].map((mod, i) => (
                        <div key={i} className={`p-7 bg-white/80 backdrop-blur-sm border border-slate-100 border-l-[3px] ${mod.border} rounded-2xl hover:shadow-lg hover:bg-white transition-all group`}>
                            <div className="flex items-start gap-4">
                                <mod.icon className={`${mod.color} shrink-0 mt-0.5`} size={22} />
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-[#0a1628] mb-2">{mod.label}</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold">{mod.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* METRICS */}
        <div className="mb-40 py-16 px-12 bg-[#0a1628] rounded-[3rem]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {[
                    { label: 'RAG Latency', val: '< 200ms' },
                    { label: 'Compliance Index', val: '100%' },
                    { label: 'Drafting Speed', val: '12x Faster' },
                    { label: 'Audit Security', val: 'Immutable' }
                ].map((m, i) => (
                    <div key={i} className="text-center">
                        <span className="text-3xl font-black text-white tracking-tight block mb-2">{m.val}</span>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] block">{m.label}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* SECURITY SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pb-40 text-left">
            <div className="space-y-12 flex flex-col justify-center">
                <div>
                    <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mb-5">Banking Security Layer</h2>
                    <h3 className="text-5xl font-black uppercase tracking-tighter leading-tight text-[#0a1628] mb-6">Built for <br/><span className="text-blue-500">Institutional</span> <br/>Trust</h3>
                    <p className="text-slate-500 text-base font-medium leading-relaxed max-w-md">Every access point, AI response, and document action is governed by a multi-layer security framework designed specifically for banking-grade procurement.</p>
                </div>
                <div className="space-y-8">
                    <div className="flex gap-5 group">
                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-lg group-hover:bg-[#0033a0] group-hover:text-white group-hover:border-[#0033a0] transition-all">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h5 className="font-black text-sm uppercase tracking-widest mb-1.5 text-[#0a1628]">Vendor Verification Gate</h5>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">Vendors require CIN/GST submission and manual bank administrator clearance before accessing any live RFP data.</p>
                        </div>
                    </div>
                    <div className="flex gap-5 group">
                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 shadow-lg group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h5 className="font-black text-sm uppercase tracking-widest mb-1.5 text-[#0a1628]">Zero-Trust AI Responses</h5>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">Every AI answer is grounded strictly to the published RFP vector index — no hallucinations, no external knowledge injection.</p>
                        </div>
                    </div>
                    <div className="flex gap-5 group">
                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-lg group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h5 className="font-black text-sm uppercase tracking-widest mb-1.5 text-[#0a1628]">Immutable Audit Trail</h5>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">Every RFP creation, corrigendum, vendor approval, and query resolution is timestamped and logged to a tamper-evident SQLite audit ledger.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* INFRASTRUCTURE CARD */}
            <div className="bg-[#0a1628] p-10 rounded-[3.5rem] relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full -ml-10 -mb-10 blur-[60px]" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-blue-400 text-[10px] font-black uppercase tracking-widest mb-8">
                        <Cpu size={12} /> Infrastructure Stack
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-tight mb-3">Neural Engine <br/>Architecture</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 max-w-sm">Powered by FAISS vector stores, Mistral AI, and a SQLAlchemy-backed relational database with full async I/O.</p>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { icon: Database, label: 'FAISS + MiniLM-L3', desc: '5 independent category indexes with SHA-256 cached embeddings', color: 'text-blue-400' },
                            { icon: Cpu, label: 'Mistral Small (Latest)', desc: 'Primary LLM for drafting, corrigenda, and Q&A at temperature 0.0–0.3', color: 'text-indigo-400' },
                            { icon: Lock, label: 'SQLAlchemy + SQLite', desc: 'Relational data model for RFPs, users, queries and audit logs', color: 'text-emerald-400' },
                            { icon: Zap, label: 'FastAPI + Async I/O', desc: 'ASGI server with ThreadPoolExecutor for non-blocking inference', color: 'text-amber-400' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                                <item.icon className={`${item.color} shrink-0 mt-0.5`} size={18} />
                                <div>
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest block">{item.label}</span>
                                    <span className="text-[10px] text-slate-400 font-bold leading-relaxed">{item.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-200 bg-white pt-24 pb-12 text-left">
        <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
                <div className="lg:col-span-5 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0033a0] rounded-xl flex items-center justify-center shadow-xl text-white font-black text-xl">IB</div>
                        <div className="flex flex-col text-left">
                            <span className="text-2xl font-black tracking-tighter uppercase text-[#0a1628]">Indian <span className="text-blue-600">Bank</span></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">Institutional RFP Engine</span>
                        </div>
                    </div>
                    <p className="text-[15px] text-slate-500 font-medium leading-loose max-w-sm text-left">Providing sovereign document intelligence for India's premier financial institutions.</p>
                </div>
                <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12 text-left">
                    <div className="space-y-6 text-left">
                        <h6 className="text-xs font-black text-[#0033a0] uppercase tracking-[0.2em]">Administrative</h6>
                        <ul className="space-y-4">
                            <li><Link href="/login?role=bank" className="text-[15px] font-bold text-slate-500 hover:text-[#0033a0] transition-colors">Drafting Console</Link></li>
                            <li><Link href="/bank/audit" className="text-[15px] font-bold text-slate-500 hover:text-[#0033a0] transition-colors">Audit Ledger</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-6 text-left">
                        <h6 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em]">Partner Portal</h6>
                        <ul className="space-y-4">
                            <li><Link href="/login?role=vendor" className="text-[15px] font-bold text-slate-500 hover:text-[#0033a0] transition-colors">Active Bids</Link></li>
                            <li><Link href="/signup?role=vendor" className="text-[15px] font-bold text-slate-500 hover:text-[#0033a0] transition-colors">Onboarding</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-6 text-left">
                        <h6 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Framework</h6>
                        <ul className="space-y-4 text-[15px] font-bold text-slate-400 uppercase tracking-tighter">
                            <li>Status: <span className="text-emerald-500 uppercase">Secure</span></li>
                            <li>v1.0.4-LTS</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="pt-10 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                <span>© 2026 Indian Bank Institutional Systems</span>
                <span className="text-slate-200">Secure | Compliant | Sovereign</span>
            </div>
        </div>
      </footer>

      {/* GLOBAL ANIMATIONS */}
      <style jsx global>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes beam-random { 
            0%, 100% { opacity: 0; stroke-dashoffset: 100; } 
            20%, 80% { opacity: 1; }
            50% { stroke-dashoffset: 0; }
        }
        .animate-spin-slow { animation: spin-slow 25s linear infinite; }
        .animate-reverse-spin { animation: reverse-spin 20s linear infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 5s ease-in-out infinite; animation-delay: 2s; }
        
        .animate-beam-random-1 { animation: beam-random 4s infinite; animation-delay: 0s; }
        .animate-beam-random-2 { animation: beam-random 5s infinite; animation-delay: 1s; }
        .animate-beam-random-3 { animation: beam-random 6s infinite; animation-delay: 2s; }
        .animate-beam-random-4 { animation: beam-random 4.5s infinite; animation-delay: 0.5s; }
        .animate-beam-random-5 { animation: beam-random 5.5s infinite; animation-delay: 1.5s; }
        .animate-beam-random-6 { animation: beam-random 6.5s infinite; animation-delay: 2.5s; }

        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes reverse-spin { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      `}</style>
    </div>
  );
}

function DomainBadge({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
    return (
        <div className="bg-white p-4 rounded-[1.5rem] shadow-2xl border border-slate-50 flex flex-col items-center gap-2 group hover:border-blue-500 transition-all cursor-default">
            <Icon size={24} className={`${color} group-hover:scale-110 transition-transform`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#0033a0]">{label}</span>
        </div>
    );
}
