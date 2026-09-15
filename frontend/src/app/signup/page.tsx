"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Store, Eye, EyeOff, ArrowRight, Lock, Mail, User, Briefcase, Sparkles, Globe, FileCheck, ShieldCheck, Phone, Loader2, ChevronDown} from 'lucide-react';
import { supabase } from '@/lib/supabase';

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialRole = searchParams.get('role') === 'vendor' ? 'vendor' : 'bank';

    const [role, setRole] = useState<'bank' | 'vendor'>(initialRole as 'bank' | 'vendor');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Vendor specific fields
    const [organization, setOrganization] = useState('');
    const [registrationId, setRegistrationId] = useState('');
    const [website, setWebsite] = useState('');
    const [vendorCategory, setVendorCategory] = useState('');
    const [yearsInBusiness, setYearsInBusiness] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password || !fullName) { setError('Basic info is required.'); return; }
        if (role === 'vendor' && (!organization || !registrationId)) { setError('Business details are required for vendors.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

        setLoading(true);
        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            });

            if (authError) throw authError;

            // 2. Synchronize with Backend DB
            const res = await fetch('http://localhost:8000/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password, // Passing for local hash if needed, though Supabase handles auth
                    role,
                    organization,
                    registration_id: registrationId,
                    website,
                    vendor_category: vendorCategory,
                    years_in_business: yearsInBusiness ? parseInt(yearsInBusiness) : null,
                    contact_phone: contactPhone
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Backend sync failed');
            }

            if (role === 'vendor') {
                alert('Account requested! Your profile is now under review by the Bank Administrator. You will be able to sign in once approved.');
                router.push('/login?role=vendor');
            } else {
                alert('Admin account created successfully.');
                router.push('/login?role=bank');
            }

        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isBank = role === 'bank';

    return (
        <div className="h-screen flex bg-[#0a1628] overflow-hidden">
            {/* Left branded panel: Fixed Height */}
            <div className="hidden lg:flex w-5/12 flex-col justify-between p-12 relative overflow-hidden h-full">
                <div className="absolute inset-0">
                    <div className={`absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${isBank ? 'bg-[#c8a96a]' : 'bg-indigo-500'}`} />
                    <div className={`absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse delay-1000 ${isBank ? 'bg-amber-300' : 'bg-blue-400'}`} />
                </div>
                <Link href="/" className="relative flex items-center gap-3 z-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0033a0] to-[#0056b3] rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                        <span className="text-white font-black text-lg">IB</span>
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight uppercase tracking-widest">Indian <span className="text-blue-400">Bank</span></span>
                </Link>
                <div className="relative z-10">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl ${isBank ? 'bg-gradient-to-br from-[#c8a96a] to-[#e8c97a]' : 'bg-gradient-to-br from-indigo-500 to-indigo-400'}`}>
                        {isBank ? <Building2 size={36} className="text-[#0a1628]" /> : <Store size={36} className="text-white" />}
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">
                        {isBank ? 'Institutional Control' : 'Qualified Partnerships'}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                        {isBank
                            ? 'Establish your banking administrator credentials to orchestrate high-fidelity RFP missions.'
                            : 'Submit your organization credentials for bank verification to join the premium vendor network.'}
                    </p>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <ShieldCheck size={14} className="text-[#c8a96a]" />
                    <span>Secure Verification Protocol Active</span>
                </div>
            </div>

            {/* Right: form - Independently Scrollable */}
            <div className="flex-1 flex flex-col items-center p-8 bg-[#f8fafc] overflow-y-auto h-full">
                <div className="w-full max-w-xl py-12">
                    {/* Role tabs */}
                    <div className="flex rounded-2xl bg-slate-100 p-1 mb-10 gap-1 border border-slate-200">
                        <button type="button" onClick={() => setRole('bank')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-200 ${role === 'bank' ? 'bg-[#0a1628] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Building2 size={14} /> Bank Admin
                        </button>
                        <button type="button" onClick={() => setRole('vendor')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-200 ${role === 'vendor' ? 'bg-[#0a1628] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Store size={14} /> Service Vendor
                        </button>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl font-black text-[#0a1628] mb-2 uppercase tracking-tighter">Onboarding Request</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Applying for {role === 'bank' ? 'Administrative' : 'Vendor'} clearance</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200">

                        {/* Section 1: Basic Identity */}
                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
                                <User size={14} /> Personal Identity
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Official Name</label>
                                    <div className="relative group">
                                        <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Rahul Sharma" className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold transition-all outline-none" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Work Email Address</label>
                                    <div className="relative group">
                                        <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="rahul@organization.com" className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold transition-all outline-none" required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Business Credentials (Vendor Only) */}
                        {role === 'vendor' && (
                            <div className="space-y-5">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
                                    <Briefcase size={14} /> Business Authenticity
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Legal Name</label>
                                        <div className="relative group">
                                            <Building2 size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                            <input type="text" value={organization} onChange={e => setOrganization(e.target.value)} placeholder="Global Solutions Pvt Ltd" className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold transition-all outline-none" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CIN / GST / Reg ID</label>
                                        <div className="relative group">
                                            <FileCheck size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                            <input type="text" value={registrationId} onChange={e => setRegistrationId(e.target.value)} placeholder="GSTIN-27AAAAA..." className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold transition-all outline-none" required />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Website</label>
                                        <div className="relative group">
                                            <Globe size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                            <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://www.company.com" className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold transition-all outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Phone</label>
                                        <div className="relative group">
                                            <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                            <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold transition-all outline-none" required />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vendor Category</label>
                                        <div className="relative group">
                                            <Briefcase size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                                            <select 
                                                value={vendorCategory} 
                                                onChange={e => setVendorCategory(e.target.value)} 
                                                className="w-full pl-11 pr-10 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Domain...</option>
                                                <option value="software">Software & AI</option>
                                                <option value="security">Cybersecurity</option>
                                                <option value="infrastructure">IT Infrastructure</option>
                                                <option value="consulting">Consulting & Advisory</option>
                                            </select>
                                            <ChevronDown size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Years in Business</label>
                                        <input type="number" value={yearsInBusiness} onChange={e => setYearsInBusiness(e.target.value)} placeholder="e.g. 5" className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold transition-all outline-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 3: Security */}
                        <div className="space-y-5">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
                                <Lock size={14} /> Security Credentials
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Password</label>
                                    <div className="relative group">
                                        <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-11 pr-11 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold transition-all outline-none" required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Access</label>
                                    <div className="relative group">
                                        <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                        <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold transition-all outline-none" required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && <div className="px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold uppercase tracking-wide">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] disabled:opacity-70 ${isBank ? 'bg-[#c8a96a] hover:bg-[#b8993a] text-[#0a1628] shadow-amber-200/60' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200/60'}`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-3"><Loader2 className="animate-spin" size={18} /> Validating Protocol...</span>
                            ) : (
                                <><span>Submit Registration</span><ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Official access only. <Link href={`/login?role=${role}`} className="text-indigo-600 hover:underline">Existing authorized login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a1628] flex items-center justify-center text-white font-black uppercase tracking-widest text-xs">Synchronizing Security Tokens...</div>}>
            <SignupForm />
        </Suspense>
    );
}
