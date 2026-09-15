"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, ShieldCheck, Clock,
  LogOut, Building2, Sparkles, LayoutGrid, List,
  CheckCircle, ArrowRight, Shield, Globe, Cpu,
  Briefcase, BarChart3, FileText, ChevronRight, Landmark,
  BellRing, Award, Activity, Lock, Zap
} from 'lucide-react';

const CARD_ACCENTS = [
  'border-t-blue-500',
  'border-t-indigo-500',
  'border-t-emerald-500',
  'border-t-amber-500',
  'border-t-purple-500',
  'border-t-rose-500',
];

const CARD_SIDEBARS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
];

export default function VendorDashboard() {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userEmail, setUserEmail] = useState('vendor@company.com');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('rfp_user_email');
    if (email) setUserEmail(email);
    fetch('http://localhost:8000/rfps')
      .then(res => res.json())
      .then(data => {
        setRfps(data.filter((r: any) => r.status === 'published'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rfp_role');
    localStorage.removeItem('rfp_user_email');
    router.push('/');
  };

  const filtered = (rfps as any[]).filter((r: any) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRfpSummary = (rfp: any) => {
    try {
      const sections = JSON.parse(rfp.content);
      if (Array.isArray(sections) && sections.length > 0) {
        return sections[0].executive_summary || sections[0].description || null;
      }
    } catch (e) { }
    return rfp.content || null;
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#1a202c] font-sans">

      {/* ── NAVBAR ── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 h-[72px] flex items-center justify-between">

          <Link href="/vendor" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#0033a0] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
              <Landmark size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-[#0a1628] tracking-tight leading-none uppercase">Indian Bank</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                <Shield size={8} className="text-[#0033a0]" /> Digital Procurement Cell
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            <Link href="/vendor" className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-[#0033a0] shadow-md transition-all">
              <Globe size={13} /> Live Tenders
            </Link>
            <span className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-not-allowed opacity-60">
              <Briefcase size={13} /> My Bids
            </span>
            <span className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-not-allowed opacity-60">
              <Activity size={13} /> Analytics
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-2 pr-4 border-r border-slate-200">
              <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100">
                <ShieldCheck size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#0033a0] uppercase tracking-widest leading-none">Verified</span>
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight">Active Bidder</span>
              </div>
            </div>
            <button className="w-9 h-9 bg-white border border-slate-200 text-slate-400 hover:text-[#0033a0] rounded-xl flex items-center justify-center transition-all relative">
              <BellRing size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 pl-2 pr-4 py-1.5 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
            >
              <div className="w-9 h-9 bg-[#0033a0] rounded-full flex items-center justify-center text-white font-black text-sm shadow-md group-hover:bg-red-500 transition-colors">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-black text-slate-700 leading-none">{userEmail.split('@')[0]}</span>
                <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-0.5 group-hover:text-red-400"><LogOut size={9} /> Sign out</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-blue-50/50 rounded-full blur-[120px] -mr-40 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-50/60 rounded-full blur-[80px] -ml-20 -mb-10 pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-8 py-14 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0033a0]/5 rounded-full border border-[#0033a0]/10 text-[10px] font-black text-[#0033a0] uppercase tracking-widest mb-6">
              <Sparkles size={12} /> Official e-Procurement System
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-[#0a1628] tracking-tighter leading-[1.05] mb-5">
              Empowering India's<br />
              <span className="text-[#0033a0]">Digital Banking Future.</span>
            </h1>
            <p className="text-base font-medium text-slate-500 leading-relaxed mb-8 max-w-md">
              Access AI-verified Requests for Proposals and participate in institutional digital transformation tenders — fully RBI compliant.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <CheckCircle size={14} className="text-emerald-500" /> ISO 27001 Certified
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <CheckCircle size={14} className="text-emerald-500" /> RBI Compliant
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <CheckCircle size={14} className="text-emerald-500" /> AES-256 Encrypted
              </div>
            </div>
          </div>

          {/* Search Card */}
          <div className="w-full lg:w-[400px] bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60">
            <h3 className="text-xs font-black text-[#0a1628] uppercase tracking-widest mb-1 flex items-center gap-2">
              <Search size={14} className="text-[#0033a0]" /> Tender Search
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Keyword or reference number</p>
            <div className="relative group mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0033a0] transition-colors" size={16} />
              <input
                type="text"
                placeholder="e.g. Core Banking, UPI..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#0033a0] focus:bg-white transition-all"
              />
            </div>
            <div className="p-4 bg-[#0033a0]/[0.03] rounded-2xl border border-[#0033a0]/10">
              <p className="text-[10px] font-bold text-[#0033a0]/70 leading-relaxed text-center uppercase tracking-wide">
                Authorized vendors must acknowledge RBI compliance guidelines before accessing bid documents.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-[1440px] mx-auto px-8 py-14">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[10px] font-black text-[#0033a0] uppercase tracking-[0.3em] mb-2">Live Opportunities</p>
            <h2 className="text-3xl font-black text-[#0a1628] uppercase tracking-tight">Available Tenders</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Active opportunities from Indian Bank Digital Cell.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-black text-[#0033a0] uppercase tracking-widest shadow-sm">
              {rfps.length} Active
            </div>
            {/* View Toggle */}
            <div className="flex bg-white border border-slate-200 p-1 rounded-2xl gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#0033a0] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#0033a0] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* RFP Grid / List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 bg-white border border-slate-100 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
            {filtered.map((rfp: any, idx: number) => (
              viewMode === 'grid' ? (
                <div key={rfp.id} className={`group bg-white border border-slate-100 border-t-[3px] ${CARD_ACCENTS[idx % CARD_ACCENTS.length]} rounded-[2rem] p-7 hover:shadow-xl hover:shadow-blue-900/8 hover:border-slate-200 transition-all duration-300 flex flex-col`}>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-slate-50 text-[#0033a0] rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-[#0033a0] group-hover:text-white transition-all duration-300 shadow-sm">
                      <Building2 size={20} />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Ref #IB-{rfp.id}</span>
                      <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        Open
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-[#0a1628] mb-3 group-hover:text-[#0033a0] transition-colors leading-snug tracking-tight">{rfp.title}</h3>

                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                      <Clock size={12} className="text-[#0033a0]" /> {new Date(rfp.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                      <Award size={12} className="text-amber-500" /> Digital Cell
                    </div>
                  </div>

                  <p className="text-[12px] font-medium text-slate-500 mb-6 line-clamp-2 leading-relaxed flex-1">
                    {getRfpSummary(rfp) || "Institutional tender document covering technical architecture and compliance framework for Indian Bank's digital expansion."}
                  </p>

                  <Link
                    href={`/vendor/${rfp.id}`}
                    className="mt-auto flex items-center justify-center gap-2 w-full py-3.5 bg-slate-50 hover:bg-[#0033a0] border border-slate-200 hover:border-[#0033a0] text-[#0033a0] hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 group/btn"
                  >
                    Access Documents <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ) : (
                <Link key={rfp.id} href={`/vendor/${rfp.id}`} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#0033a0] hover:shadow-md flex items-center justify-between transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-1 self-stretch rounded-full ${CARD_ACCENTS[idx % CARD_ACCENTS.length].replace('border-t-', 'bg-')}`} />
                    <div className="w-10 h-10 bg-slate-50 group-hover:bg-[#0033a0] rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white transition-all">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#0a1628] tracking-tight group-hover:text-[#0033a0] transition-colors">{rfp.title}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        IB-REF-{rfp.id} · {new Date(rfp.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Live</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-[#0033a0] group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              )
            ))}

            {!loading && filtered.length === 0 && (
              <div className="col-span-full py-28 bg-white border border-dashed border-slate-200 rounded-[2.5rem] text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                  <Search size={28} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight mb-2">No Tenders Found</h3>
                <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto mb-6">No published tenders match your search. Try a different keyword or check back later.</p>
                <button onClick={() => setSearchTerm('')} className="px-6 py-3 bg-[#0033a0] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-[#0a1628] transition-all">
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a1628] py-10 px-8 mt-10">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0033a0] rounded-xl flex items-center justify-center">
              <Landmark size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white uppercase tracking-tight">Indian Bank</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">© 2026 Institutional Division</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Home</Link>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <ShieldCheck size={13} className="text-emerald-500" /> SSL Secured
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Lock size={13} className="text-emerald-500" /> AES-256 Encrypted
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
