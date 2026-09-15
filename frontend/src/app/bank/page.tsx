"use client";
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    PlusCircle, FileText, History, Bell, Search, CheckCircle2, Clock, MessageSquare, Edit3, Eye, Settings
} from 'lucide-react';
import BankSidebar from '@/components/BankSidebar';

function DashboardContent() {
    const [rfps, setRfps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchBar] = useState("");
    const [userEmail, setUserEmail] = useState('admin@bank.com');
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view') === 'management' ? 'my-rfps' : 'dashboard';

    const BACKEND_URL = "http://localhost:8000";

    useEffect(() => {
        const email = localStorage.getItem('rfp_user_email');
        if (email) setUserEmail(email);
        fetch(`${BACKEND_URL}/rfps`)
            .then(res => res.json())
            .then(data => { setRfps(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filteredRFPs = (rfps as any[]).filter(rfp =>
        rfp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rfp.id.toString().includes(searchQuery)
    );

    const publishedCount = (rfps as any[]).filter(r => r.status === 'published').length;
    const draftsCount = (rfps as any[]).filter(r => r.status === 'draft').length;

    return (
        <div className="min-h-screen bg-[#f0f4f8] flex">
            <BankSidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Bar */}
                <header className="h-[72px] bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {currentView === 'dashboard' ? 'Institutional Overview' : 'Operational Management'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {currentView === 'my-rfps' && (
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search IDs/Titles..."
                                    className="w-full pl-9 pr-4 py-2 bg-[#f0f4f8] rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none border border-slate-200"
                                    value={searchQuery}
                                    onChange={(e) => setSearchBar(e.target.value)}
                                />
                            </div>
                        )}
                        <button className="relative p-2.5 text-slate-400 hover:text-slate-700 bg-[#f0f4f8] rounded-xl transition-colors border border-slate-200/80">
                            <Bell size={19} />
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="w-9 h-9 bg-gradient-to-br from-[#c8a96a] to-[#e8c97a] rounded-xl flex items-center justify-center text-[#0a1628] font-black text-sm shadow-md">
                                {userEmail.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden md:block text-left">
                                <div className="text-sm font-bold text-slate-900">{userEmail.split('@')[0]}</div>
                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-0.5">Bank Administrator</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-10">

                        {/* VIEW 1: DASHBOARD (Overview Only) */}
                        {currentView === 'dashboard' && (
                            <>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h1 className="text-3xl font-black text-[#0a1628] mb-1 tracking-tight uppercase leading-none">Procurement Analytics</h1>
                                        <p className="text-slate-500 font-medium text-sm">Real-time status of all institutional RFP missions.</p>
                                    </div>
                                    <Link href="/bank/create" className="px-6 py-3.5 bg-[#0a1628] text-[#c8a96a] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-3 border border-white/10 active:scale-95">
                                        <PlusCircle size={18} /> Create New RFP
                                    </Link>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    {[
                                        { label: 'System Registry', value: rfps.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                        { label: 'Active Missions', value: publishedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { label: 'Internal Drafts', value: draftsCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    ].map((s, i) => (
                                        <div key={i} className={`${s.bg} p-6 rounded-[2rem] flex items-center justify-between border border-white/60 shadow-sm`}>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                                                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                                <s.icon size={22} className={s.color} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <History size={16} className="text-slate-400" /> Compliance Registry Log
                                        </h2>
                                    </div>
                                    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            {/* <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-10 py-5">RFP Identifier</th>
                                                    <th className="px-10 py-5">Mission Title</th>
                                                    <th className="px-10 py-5 text-right">Compliance Status</th>
                                                </tr>
                                            </thead> */}
                                            <thead className="bg-[#0a1628] text-[10px] font-black uppercase tracking-[0.15em] text-[#c8a96a]">
                                                <tr>
                                                    <th className="px-10 py-5">RFP Identifier</th>
                                                    <th className="px-10 py-5">Mission Title</th>
                                                    <th className="px-10 py-5 text-right">Compliance Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {rfps.map((rfp: any) => (
                                                    <tr key={rfp.id} className="hover:bg-slate-50/30 transition-all">
                                                        <td className="px-10 py-6 font-mono text-xs font-black text-slate-400">#00{rfp.id}</td>
                                                        <td className="px-10 py-6 text-sm font-bold text-slate-700">{rfp.title}</td>
                                                        <td className="px-10 py-6 text-right">
                                                            {rfp.status === 'published'
                                                                ? <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">Official / Published</span>
                                                                : <span className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100 shadow-sm">Draft / Internal</span>
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* VIEW 2: MY RFPs (Search + Actions) */}
                        {currentView === 'my-rfps' && (
                            <>
                                <div className="px-2">
                                    <h1 className="text-3xl font-black text-[#0a1628] mb-1 tracking-tight uppercase">Operational Console</h1>
                                    <p className="text-slate-500 font-medium text-sm">Surgical control over procurement documents and vendor interactions.</p>
                                </div>

                                <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden">
                                    {loading ? (
                                        <div className="p-12 space-y-4">
                                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-3xl" />)}
                                        </div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-[#0a1628]">
                                                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                    <th className="px-10 py-6">Mission Details</th>
                                                    <th className="px-10 py-6 text-right">Operational Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredRFPs.map(rfp => (
                                                    <tr key={rfp.id} className="hover:bg-slate-50/60 transition-all group">
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-6">
                                                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:border-[#c8a96a]/30 transition-colors">
                                                                    <span className="text-[10px] font-black text-slate-300 uppercase">ID</span>
                                                                    <span className="text-sm font-black text-slate-500 group-hover:text-[#c8a96a] transition-colors">00{rfp.id}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="font-black text-slate-800 text-base group-hover:text-[#0a1628] transition-colors block mb-1">{rfp.title}</span>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Created {new Date(rfp.created_at).toLocaleDateString()}</span>
                                                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                                        {rfp.status === 'published'
                                                                            ? <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest"><CheckCircle2 size={10} /> Active & Sync</span>
                                                                            : <span className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-widest"><Clock size={10} /> Draft Mode</span>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8 text-right">
                                                            {rfp.status === 'draft' ? (
                                                                <Link href={`/bank/review/${rfp.id}`} className="inline-flex items-center gap-2 px-6 py-3 bg-[#c8a96a] text-[#0a1628] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#b8995a] transition-all shadow-xl shadow-amber-200/30 active:scale-95">
                                                                    <Edit3 size={16} /> Review & Publish
                                                                </Link>
                                                            ) : (
                                                                <div className="flex items-center justify-end gap-3">
                                                                    <a href={`${BACKEND_URL}${rfp.pdf_url}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 text-slate-400 hover:text-[#0a1628] hover:bg-white rounded-2xl border border-slate-100 transition-all shadow-sm" title="Review PDF">
                                                                        <Eye size={18} />
                                                                    </a>
                                                                    <Link href={`/bank/queries/${rfp.id}`} className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-[#c8a96a]/40 hover:text-[#0a1628] transition-all shadow-sm active:scale-95">
                                                                        <MessageSquare size={16} className="text-[#c8a96a]" /> Q&A
                                                                    </Link>
                                                                    <Link href={`/bank/modify/${rfp.id}`} className="inline-flex items-center gap-2 px-5 py-3 bg-[#0a1628] text-[#c8a96a] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                                                                        <Settings size={16} className="text-[#c8a96a]" /> Modify
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}

export default function BankDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a1628] flex items-center justify-center text-white uppercase tracking-widest font-black text-xs animate-pulse">Initializing Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
