// "use client";
// import { useEffect, useState } from 'react';
// import { ArrowLeft, Loader2, History, Search, ShieldCheck, User, Clock, FileCheck, Filter, FileText } from 'lucide-react';
// import Link from 'next/link';
// import BankSidebar from '@/components/BankSidebar';

// export default function AuditTrail() {
//   const [logs, setLogs] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filter, setFilter] = useState("ALL");

//   const BACKEND_URL = "http://localhost:8000";

//   useEffect(() => {
//     fetch(`${BACKEND_URL}/audit-logs`)
//       .then(res => {
//         if (!res.ok) throw new Error("API 404 or Error");
//         return res.json();
//       })
//       .then(data => {
//         if (Array.isArray(data)) {
//           setLogs(data);
//         } else {
//           setLogs([]);
//         }
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Audit fetch failed:", err);
//         setLogs([]);
//         setLoading(false);
//       });
//   }, []);

//   const getEventBadge = (type: string) => {
//     switch (type) {
//       case 'RFP_CREATED': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase border border-blue-100">Creation</span>;
//       case 'DRAFT_REFINED': return <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[9px] font-black uppercase border border-slate-100">Refinement</span>;
//       case 'RFP_PUBLISHED': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase border border-emerald-100">Publication</span>;
//       case 'CORRIGENDUM_ISSUED': return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase border border-amber-100">Corrigendum</span>;
//       case 'QUERY_ANSWERED': return <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase border border-indigo-100">Q&A Response</span>;
//       default: return <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase border border-slate-100">System</span>;
//     }
//   };

//   const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
//     const details = log.details || "";
//     const event_type = log.event_type || "";
//     const matchesSearch = details.toLowerCase().includes(searchTerm.toLowerCase()) || 
//                          event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          log.rfp_id?.toString().includes(searchTerm);
//     const matchesFilter = filter === "ALL" || event_type === filter;
//     return matchesSearch && matchesFilter;
//   }) : [];

//   return (
//     <div className="min-h-screen bg-[#f0f4f8] flex">
//       <BankSidebar />
      
//       <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
//         <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
//           <div className="max-w-6xl mx-auto space-y-8">
//             {/* Navigation & Status */}
//             <div className="flex items-center justify-between">
//                 <h1 className="text-2xl font-black text-[#0a1628] uppercase tracking-tight flex items-center gap-3">
//                     <div className="p-2 bg-[#0a1628] rounded-lg text-[#c8a96a]">
//                         <History size={20} />
//                     </div>
//                     Institutional Audit Ledger
//                 </h1>
//                 <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
//                     <ShieldCheck size={14} className="text-emerald-500" /> Immutable Protocol Active
//                 </div>
//             </div>

//             {/* Controls */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="md:col-span-2 relative">
//                     <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                     <input 
//                         type="text" 
//                         placeholder="Search logs by activity, RFP ID, or event type..." 
//                         className="w-full pl-14 pr-6 py-4 bg-white rounded-3xl border-2 border-transparent focus:border-indigo-600 outline-none shadow-sm font-bold text-sm transition-all"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                 </div>
//                 <div className="relative">
//                     <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                     <select 
//                         className="w-full pl-14 pr-6 py-4 bg-white rounded-3xl border-2 border-transparent focus:border-indigo-600 outline-none shadow-sm font-bold text-xs uppercase tracking-widest transition-all appearance-none cursor-pointer"
//                         value={filter}
//                         onChange={(e) => setFilter(e.target.value)}
//                     >
//                         <option value="ALL">All Event Types</option>
//                         <option value="RFP_CREATED">RFP Creations</option>
//                         <option value="DRAFT_REFINED">Draft Refinements</option>
//                         <option value="RFP_PUBLISHED">Publications</option>
//                         <option value="CORRIGENDUM_ISSUED">Corrigenda</option>
//                         <option value="QUERY_ANSWERED">Q&A Activity</option>
//                     </select>
//                 </div>
//             </div>

//             {/* Log Table */}
//             <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden">
//                 {loading ? (
//                     <div className="p-20 text-center flex flex-col items-center gap-4">
//                         <Loader2 size={40} className="animate-spin text-indigo-600" />
//                         <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Deciphering Ledger...</p>
//                     </div>
//                 ) : (
//                     <table className="w-full text-left border-collapse">
//                         <thead>
//                             <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100">
//                                 <th className="px-10 py-6">Timestamp</th>
//                                 <th className="px-10 py-6">Event Context</th>
//                                 <th className="px-10 py-6">Activity Details</th>
//                                 <th className="px-10 py-6 text-right">Actor</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-50">
//                             {filteredLogs.map(log => (
//                                 <tr key={log.id} className="hover:bg-slate-50/40 transition-all group">
//                                     <td className="px-10 py-8">
//                                         <div className="flex items-center gap-3">
//                                             <div className="p-2 bg-slate-100 rounded-xl text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
//                                                 <Clock size={16} />
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs font-black text-slate-700">{new Date(log.created_at).toLocaleDateString()}</p>
//                                                 <p className="text-[10px] font-bold text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</p>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="px-10 py-8">
//                                         <div className="space-y-2">
//                                             {getEventBadge(log.event_type)}
//                                             {log.rfp_id && (
//                                                 <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
//                                                     <FileText size={10} /> Mission #00{log.rfp_id}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </td>
//                                     <td className="px-10 py-8">
//                                         <p className="text-sm font-bold text-slate-800 leading-relaxed max-w-md">
//                                             {log.details}
//                                         </p>
//                                     </td>
//                                     <td className="px-10 py-8 text-right">
//                                         <div className="flex items-center justify-end gap-3">
//                                             <div className="text-right">
//                                                 <p className="text-xs font-black text-slate-700">{log.actor?.split('@')[0] || 'System'}</p>
//                                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.actor === 'SYSTEM' ? 'Automated' : 'Manual Entry'}</p>
//                                             </div>
//                                             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
//                                                 <User size={18} />
//                                             </div>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, History, Search, ShieldCheck, User, Clock, FileCheck, Filter, FileText } from 'lucide-react';
import Link from 'next/link';
import BankSidebar from '@/components/BankSidebar';

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("ALL");

  const BACKEND_URL = "http://localhost:8000";

  useEffect(() => {
    fetch(`${BACKEND_URL}/audit-logs`)
      .then(res => {
        if (!res.ok) throw new Error("API 404 or Error");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          setLogs([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Audit fetch failed:", err);
        setLogs([]);
        setLoading(false);
      });
  }, []);

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'RFP_CREATED': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase border border-blue-100">Creation</span>;
      case 'DRAFT_REFINED': return <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[9px] font-black uppercase border border-slate-100">Refinement</span>;
      case 'RFP_PUBLISHED': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase border border-emerald-100">Publication</span>;
      case 'CORRIGENDUM_ISSUED': return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase border border-amber-100">Corrigendum</span>;
      case 'QUERY_ANSWERED': return <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase border border-indigo-100">Q&A Response</span>;
      default: return <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase border border-slate-100">System</span>;
    }
  };

  const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
    const details = log.details || "";
    const event_type = log.event_type || "";
    const matchesSearch = details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.rfp_id?.toString().includes(searchTerm);
    const matchesFilter = filter === "ALL" || event_type === filter;
    return matchesSearch && matchesFilter;
  }) : [];

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex">
      <BankSidebar />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Navigation & Status */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-[#0a1628] uppercase tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-[#0a1628] rounded-lg text-[#c8a96a]">
                        <History size={20} />
                    </div>
                    Institutional Audit Ledger
                </h1>
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <ShieldCheck size={14} className="text-emerald-500" /> Immutable Protocol Active
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search logs by activity, RFP ID, or event type..." 
                        className="w-full pl-14 pr-6 py-4 bg-white rounded-3xl border-2 border-transparent focus:border-indigo-600 outline-none shadow-sm font-bold text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                        className="w-full pl-14 pr-6 py-4 bg-white rounded-3xl border-2 border-transparent focus:border-indigo-600 outline-none shadow-sm font-bold text-xs uppercase tracking-widest transition-all appearance-none cursor-pointer"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="ALL">All Event Types</option>
                        <option value="RFP_CREATED">RFP Creations</option>
                        <option value="DRAFT_REFINED">Draft Refinements</option>
                        <option value="RFP_PUBLISHED">Publications</option>
                        <option value="CORRIGENDUM_ISSUED">Corrigenda</option>
                        <option value="QUERY_ANSWERED">Q&A Activity</option>
                    </select>
                </div>
            </div>

            {/* Log Table */}
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <Loader2 size={40} className="animate-spin text-indigo-600" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Deciphering Ledger...</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0a1628] text-[10px] font-black uppercase tracking-[0.15em] text-[#c8a96a]">
                                <th className="px-10 py-6">Timestamp</th>
                                <th className="px-10 py-6">Event Context</th>
                                <th className="px-10 py-6">Activity Details</th>
                                <th className="px-10 py-6 text-right">Actor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/40 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-xl text-slate-400 group-hover:text-[#c8a96a] group-hover:bg-[#c8a96a]/10 transition-all">
                                                <Clock size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-700">{new Date(log.created_at).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="space-y-2">
                                            {getEventBadge(log.event_type)}
                                            {log.rfp_id && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                    <FileText size={10} /> Mission #00{log.rfp_id}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-bold text-slate-800 leading-relaxed max-w-md">
                                            {log.details}
                                        </p>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="text-right">
                                                <p className="text-xs font-black text-slate-700">{log.actor?.split('@')[0] || 'System'}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.actor === 'SYSTEM' ? 'Automated' : 'Manual Entry'}</p>
                                            </div>
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-all">
                                                <User size={18} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

