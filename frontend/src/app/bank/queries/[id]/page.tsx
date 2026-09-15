"use client";
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Check, X, MessageSquare, Bot, User, ShieldCheck,
  Loader2, Sparkles, AlertCircle, Filter, CheckCircle2,
  Clock, Send, ChevronDown, Inbox
} from 'lucide-react';
import Link from 'next/link';

type FilterTab = 'all' | 'pending' | 'answered';

export default function ReviewQueries({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [queries, setQueries] = useState<any[]>([]);
  const [rfp, setRfp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const BACKEND_URL = "http://localhost:8000";

  useEffect(() => {
    if (id) {
      fetch(`${BACKEND_URL}/rfp/${id}`).then(res => res.json()).then(data => setRfp(data));
      fetch(`${BACKEND_URL}/bank/queries/${id}`).then(res => res.json()).then(data => {
        setQueries(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleApprove = async (queryId: number, currentAnswer: string) => {
    setProcessing(queryId);
    try {
      const res = await fetch(`${BACKEND_URL}/bank/query/${queryId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bank_answer: currentAnswer })
      });
      if (res.ok) {
        setQueries(queries.map(q => q.id === queryId ? { ...q, status: 'answered' } : q));
      } else {
        alert("Failed to approve query.");
      }
    } catch (err) {
      alert("Network error while approving.");
    }
    setProcessing(null);
  };

  const pendingCount = queries.filter(q => q.status === 'pending').length;
  const answeredCount = queries.filter(q => q.status === 'answered').length;

  const filteredQueries = queries.filter(q => {
    if (activeTab === 'pending') return q.status === 'pending';
    if (activeTab === 'answered') return q.status === 'answered';
    return true;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All Queries', count: queries.length },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'answered', label: 'Approved', count: answeredCount },
  ];

  if (!rfp || loading) return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center text-white gap-6">
      <Loader2 size={40} className="animate-spin text-[#c8a96a]" />
      <p className="text-slate-400 font-bold tracking-[0.2em] text-xs uppercase">Loading Compliance Data...</p>
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
            <h1 className="text-md font-black text-white tracking-tight">
              <span className="text-[#c8a96a]">VENDOR QUERIES</span> — Compliance Review
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">{rfp.title} · #00{rfp.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {pendingCount > 0 && (
            <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest animate-pulse">
              <AlertCircle size={14} /> {pendingCount} Pending Approval
            </div>
          )}
          <div className="px-4 py-2 bg-[#c8a96a]/10 border border-[#c8a96a]/20 text-[#c8a96a] rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} /> Compliance Portal
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar — Query Statistics */}
        <aside className="w-[280px] bg-white border-r border-slate-200 shrink-0 flex flex-col shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#c8a96a]/10 to-[#e8c97a]/10 border border-[#c8a96a]/20 rounded-xl flex items-center justify-center text-[#c8a96a]">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Query Hub</p>
                <p className="text-lg font-black text-[#0a1628]">{queries.length} <span className="text-sm font-bold text-slate-400">Total</span></p>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Clock size={12} className="text-amber-600" />
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Pending</span>
                </div>
                <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Approved</span>
                </div>
                <p className="text-2xl font-black text-emerald-700">{answeredCount}</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="p-4 space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Filter View</p>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-[#0a1628] text-[#c8a96a] shadow-lg shadow-slate-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {tab.key === 'all' && <Inbox size={16} />}
                  {tab.key === 'pending' && <Clock size={16} />}
                  {tab.key === 'answered' && <CheckCircle2 size={16} />}
                  {tab.label}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-[#c8a96a]/20 text-[#c8a96a]' : 'bg-slate-100 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>


        </aside>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">

            {/* Page Title Bar */}
            <div className="flex items-end justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-[#c8a96a]" />
                  <span className="text-[#c8a96a] text-[10px] font-black uppercase tracking-widest">AI-Assisted Review</span>
                </div>
                <h1 className="text-2xl font-black text-[#0a1628] tracking-tight">Vendor Clarifications</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  Review AI-proposed answers, edit if needed, then approve to publish to vendors.
                </p>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Filter size={12} />
                Showing {filteredQueries.length} of {queries.length}
              </div>
            </div>

            {/* Query Cards */}
            {filteredQueries.length === 0 && !loading && (
              <div className="py-24 text-center bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl mx-auto flex items-center justify-center text-slate-300 mb-5">
                  <MessageSquare size={30} />
                </div>
                <h3 className="text-xl font-black text-[#0a1628] mb-2">
                  {activeTab === 'pending' ? 'No Pending Clarifications' : activeTab === 'answered' ? 'No Approved Clarifications' : 'No Clarifications Requested'}
                </h3>
                <p className="text-slate-500 font-medium text-sm">
                  {activeTab === 'pending' ? 'All queries have been reviewed and approved.' : activeTab === 'answered' ? 'No queries have been approved yet.' : 'Vendors have not submitted any queries for this RFP yet.'}
                </p>
              </div>
            )}

            {filteredQueries.map((q: any, index: number) => (
              <div
                key={q.id}
                className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                {/* Query Header Bar */}
                <div className={`px-8 py-5 flex items-center justify-between border-b ${q.status === 'answered' ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/30'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                      q.status === 'answered'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {q.status === 'answered' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Query #{q.id}</span>
                        {q.is_duplicate && (
                          <span className="text-[8px] font-black text-[#c8a96a] bg-[#c8a96a]/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#c8a96a]/20">
                            Context Grounded
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        q.status === 'answered' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {q.status === 'answered' ? 'Approved & Published' : 'Awaiting Approval'}
                      </span>
                    </div>
                  </div>
                  {q.vendor_email && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                      <User size={12} />
                      {q.vendor_email}
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                  {/* Vendor Question */}
                  <div className="p-8">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <User size={14} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor Question</span>
                    </div>
                    <p className="text-[15px] font-semibold text-[#0a1628] leading-relaxed">{q.question}</p>
                  </div>

                  {/* AI Answer + Actions */}
                  <div className="p-8 flex flex-col">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                        q.status === 'answered' ? 'bg-emerald-100 text-emerald-600' : 'bg-[#0a1628] text-[#c8a96a]'
                      }`}>
                        <Bot size={14} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Proposed Answer</span>
                      </div>
                    </div>

                    <div className={`rounded-2xl border p-5 flex-1 ${
                      q.status === 'answered'
                        ? 'bg-emerald-50/40 border-emerald-100'
                        : 'bg-slate-50 border-slate-200 focus-within:border-[#c8a96a] focus-within:ring-4 focus-within:ring-[#c8a96a]/10'
                    } transition-all`}>
                      <textarea
                        className="w-full h-full min-h-[100px] border-none focus:ring-0 resize-none p-0 text-sm bg-transparent font-medium text-slate-700 leading-relaxed outline-none placeholder:text-slate-400"
                        defaultValue={q.status === 'answered' ? q.bank_answer || q.answer : q.answer}
                        disabled={q.status === 'answered' || processing === q.id}
                        id={`answer-input-${q.id}`}
                        placeholder="Edit the proposed answer before approving..."
                      />
                    </div>

                    {/* Approve Button */}
                    {q.status === 'pending' && (
                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => {
                            const textArea = document.getElementById(`answer-input-${q.id}`) as HTMLTextAreaElement;
                            handleApprove(q.id, textArea.value);
                          }}
                          disabled={processing === q.id}
                          className="flex-1 py-3.5 bg-[#0a1628] hover:bg-[#122654] text-[#c8a96a] rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] border border-[#c8a96a]/20"
                        >
                          {processing === q.id ? (
                            <><Loader2 size={16} className="animate-spin" /> Processing...</>
                          ) : (
                            <><Check size={16} /> Approve & Publish</>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Approved Confirmation */}
                    {q.status === 'answered' && (
                      <div className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Response Published to Vendor Portal</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom spacer */}
            <div className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
