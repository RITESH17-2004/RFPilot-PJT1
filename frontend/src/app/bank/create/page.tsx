"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Loader2, Sparkles, ShieldCheck, Cpu, 
  Briefcase, IndianRupee, Calendar, Clock, CheckCircle, Zap,
  Target, FileText, AlignLeft, Scale
} from 'lucide-react';
import Link from 'next/link';

export default function CreateRFP() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Lazily initialize state from sessionStorage if it exists
  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('rfpFormData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved form data", e);
        }
      }
    }
    return {
      title: "",
      project_type: "",
      budget: "",
      timeline: "",
      requirements: "",
      issuance_date: "",
      submission_deadline: "",
      evaluation_strategy: "",
      bank_profile: {
      bank_name: "Indian Bank",
      department: "Digital Transformation & IT Procurement",
      contact_person: "General Manager (IT)",
      contact_email: "procurement@indianbank.co.in",
      location: "Corporate Office, Chennai"
      },
      // Expert Mode Fields
      eligibility_criteria: "",
      compliance_standards: "",
      technical_stack: "",
      sla_requirements: ""
    };
  });

  // Automatically save to sessionStorage every time formData changes
  useEffect(() => {
    sessionStorage.setItem('rfpFormData', JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/rfp/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('RFP Draft generated via AI. You can now review it in the dashboard.');
        // Clear the saved form data upon successful submission
        sessionStorage.removeItem('rfpFormData');
        router.push('/bank?view=management');
      } else {
        alert('Failed to generate RFP.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-8 custom-scrollbar overflow-y-auto">
      <div className="max-w-6xl mx-auto pb-20">
        <Link href="/bank?view=management" className="flex items-center text-slate-500 hover:text-[#0a1628] mb-8 font-black text-xs uppercase tracking-widest transition-colors group w-max">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Back to Operational Console
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-b from-[#0033a0] to-[#0a1628] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-[#0033a0]/20 sticky top-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/20 relative z-10 backdrop-blur-sm">
                <FileText size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-black mb-3 leading-tight tracking-tight uppercase relative z-10">Institutional Guidelines</h1>
              <p className="text-blue-100/70 text-[11px] font-medium leading-relaxed mb-8 relative z-10">
                Complete the mandate strictly adhering to approved budgetary constraints and compliance frameworks.
              </p>
              
              <div className="space-y-6 relative z-10">
                <div>
                   <h3 className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-4 border-b border-white/10 pb-3">Critical Checklist</h3>
                   <ul className="space-y-4">
                     <li className="flex items-start gap-3 text-[10px] font-bold text-white uppercase tracking-wider">
                       <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" /> 
                       Verify budgetary approval
                     </li>
                     <li className="flex items-start gap-3 text-[10px] font-bold text-white uppercase tracking-wider">
                       <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" /> 
                       Select correct Tech Category
                     </li>
                     <li className="flex items-start gap-3 text-[10px] font-bold text-white uppercase tracking-wider">
                       <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" /> 
                       SLA terms clearly defined
                     </li>
                   </ul>
                </div>

                <div className="bg-[#0a1628]/50 p-5 rounded-2xl border border-white/10 mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={14} className="text-indigo-300" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Compliance Lock</span>
                  </div>
                  <p className="text-[10px] text-blue-200/60 leading-relaxed font-medium">Standard CVC & RBI guidelines are securely enforced during final rendering.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <div className="bg-white p-10 lg:p-14 rounded-[3rem] shadow-sm border border-slate-200 text-slate-900">
              <form onSubmit={handleSubmit} className="space-y-14">
                
                {/* 1. Core Parameters */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                     <div className="w-8 h-8 rounded-full bg-[#0a1628] text-white flex items-center justify-center font-black text-xs">1</div>
                     <div>
                       <h2 className="text-sm font-black text-[#0a1628] uppercase tracking-[0.1em]">Project Essentials</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Core definitions and financial limits</p>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mission Title</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a1628] transition-colors" size={18} />
                      <input type="text" className="w-full pl-14 pr-6 py-4 bg-slate-50 focus:bg-white border focus:border-[#0a1628] border-slate-200 rounded-2xl outline-none font-bold text-sm text-slate-900 transition-all shadow-inner focus:ring-4 focus:ring-[#0a1628]/5" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Next-Generation Mobile Banking Architecture 2026" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Technological Category</label>
                      <div className="relative group">
                        <Cpu className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a1628] transition-colors" size={18} />
                        <input type="text" className="w-full pl-14 pr-6 py-4 bg-slate-50 focus:bg-white border focus:border-[#0a1628] border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-inner focus:ring-4 focus:ring-[#0a1628]/5 transition-all" value={formData.project_type} onChange={e => setFormData({...formData, project_type: e.target.value})} placeholder="e.g. Cloud Security, Core Banking" required />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estimated Budget Segment</label>
                      <div className="relative group">
                        <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a1628] transition-colors" size={18} />
                        <input type="text" className="w-full pl-14 pr-6 py-4 bg-slate-50 focus:bg-white border focus:border-[#0a1628] border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-inner focus:ring-4 focus:ring-[#0a1628]/5 transition-all" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} placeholder="e.g. 50Cr - 100Cr" required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Logistics & Timeline */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                     <div className="w-8 h-8 rounded-full bg-[#0a1628] text-white flex items-center justify-center font-black text-xs">2</div>
                     <div>
                       <h2 className="text-sm font-black text-[#0a1628] uppercase tracking-[0.1em]">Schedules & Criteria</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Critical dates and vendor assessment</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Issuance Date</label>
                      <div className="relative group">
                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a1628] transition-colors" size={18} />
                        <input type="date" className="w-full pl-14 pr-6 py-4 bg-slate-50 focus:bg-white border focus:border-[#0a1628] border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-inner focus:ring-4 focus:ring-[#0a1628]/5 transition-all text-slate-600" value={formData.issuance_date} onChange={e => setFormData({...formData, issuance_date: e.target.value})} required />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Submission Deadline</label>
                      <div className="relative group">
                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a1628] transition-colors" size={18} />
                        <input type="date" className="w-full pl-14 pr-6 py-4 bg-slate-50 focus:bg-white border focus:border-[#0a1628] border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-inner focus:ring-4 focus:ring-[#0a1628]/5 transition-all text-slate-600" value={formData.submission_deadline} onChange={e => setFormData({...formData, submission_deadline: e.target.value})} required />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Implementation Window</label>
                      <div className="relative group">
                        <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a1628] transition-colors" size={18} />
                        <input type="text" className="w-full pl-14 pr-6 py-4 bg-slate-50 focus:bg-white border focus:border-[#0a1628] border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-inner focus:ring-4 focus:ring-[#0a1628]/5 transition-all" value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} placeholder="e.g. 18 Months post-award" required />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Evaluation Formula</label>
                      <div className="relative group">
                        <Scale className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a1628] transition-colors" size={18} />
                        <input type="text" className="w-full pl-14 pr-6 py-4 bg-slate-50 focus:bg-white border focus:border-[#0a1628] border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-inner focus:ring-4 focus:ring-[#0a1628]/5 transition-all" value={formData.evaluation_strategy} onChange={e => setFormData({...formData, evaluation_strategy: e.target.value})} placeholder="e.g. QCBS 70:30 (Tech:Commercial)" required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Expert Configuration */}
                <div className="space-y-8 bg-slate-50/50 p-8 md:p-10 rounded-[2.5rem] border border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">3</div>
                        <div>
                          <h2 className="text-sm font-black text-[#0a1628] uppercase tracking-[0.1em]">Expert Configuration</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Highly advised for accurate AI synthesis</p>
                        </div>
                     </div>
                     <span className="px-3 py-1 bg-indigo-100 border border-indigo-200 text-indigo-700 text-[9px] font-black rounded-full uppercase tracking-widest self-start md:self-auto">Optional</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Eligibility Pre-Requisites</label>
                        <textarea rows={3} className="w-full p-5 bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl outline-none font-medium text-sm leading-relaxed shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300" 
                                  value={formData.eligibility_criteria} 
                                  onChange={e => setFormData({...formData, eligibility_criteria: e.target.value})} 
                                  placeholder="e.g. Minimum 10 years in BFSI; CMMI Level 5..." />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mandatory Compliance Standards</label>
                        <textarea rows={3} className="w-full p-5 bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl outline-none font-medium text-sm leading-relaxed shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300" 
                                  value={formData.compliance_standards} 
                                  onChange={e => setFormData({...formData, compliance_standards: e.target.value})} 
                                  placeholder="e.g. ISO 27001, PCI-DSS V4.0, RBI Cyber Framework..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Architecture / Tech Stack</label>
                        <textarea rows={3} className="w-full p-5 bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl outline-none font-medium text-sm leading-relaxed shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300" 
                                  value={formData.technical_stack} 
                                  onChange={e => setFormData({...formData, technical_stack: e.target.value})} 
                                  placeholder="e.g. Kubernetes, React Next.js, Oracle 19c..." />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SLA & Penalty Clauses</label>
                        <textarea rows={3} className="w-full p-5 bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl outline-none font-medium text-sm leading-relaxed shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300" 
                                  value={formData.sla_requirements} 
                                  onChange={e => setFormData({...formData, sla_requirements: e.target.value})} 
                                  placeholder="e.g. 99.99% Uptime, 15-min DR RTO..." />
                    </div>
                  </div>
                </div>

                {/* 4. Scope Of Work */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                     <div className="w-8 h-8 rounded-full bg-[#0a1628] text-white flex items-center justify-center font-black text-xs">4</div>
                     <div>
                       <h2 className="text-sm font-black text-[#0a1628] uppercase tracking-[0.1em]">Scope of Work (SOW)</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">The core problem statement</p>
                     </div>
                  </div>
                  <div className="space-y-4 relative group">
                    <AlignLeft className="absolute left-6 top-6 text-slate-300 group-focus-within:text-[#0a1628] transition-colors" size={20} />
                    <textarea 
                        rows={8} 
                        className="w-full py-6 pl-14 pr-8 bg-white border border-slate-200 focus:border-[#0a1628] rounded-3xl outline-none font-medium text-sm leading-loose shadow-sm transition-all focus:ring-4 focus:ring-[#0a1628]/5 placeholder:text-slate-300" 
                        value={formData.requirements} 
                        onChange={e => setFormData({...formData, requirements: e.target.value})} 
                        placeholder="Detail the complete operational, functional, and non-functional scope here..." 
                        required 
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={loading} className="w-full py-6 bg-[#0a1628] hover:bg-[#0f2340] text-[#c8a96a] rounded-3xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] group border border-white/10">
                    {loading ? (
                      <><Loader2 className="animate-spin mr-3 text-white" size={24} /> Compiling Official Document via Secure RAG...</>
                    ) : (
                      <><Sparkles className="mr-3 group-hover:rotate-12 transition-transform text-white" size={24} /> Authorize & Generate Institutional RFP</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
