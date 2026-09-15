"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Store, Eye, EyeOff, ArrowRight, Lock, Mail, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialRole = searchParams.get('role') === 'vendor' ? 'vendor' : 'bank';

    const [role, setRole] = useState<'bank' | 'vendor'>(initialRole as 'bank' | 'vendor');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Please fill in all fields.'); return; }
        
        setLoading(true);
        try {
            // 1. Authenticate with Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // 2. Verify Status with Backend
            const res = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const errData = await res.json();
                // If backend rejects (e.g. pending approval), sign out from Supabase immediately
                await supabase.auth.signOut();
                throw new Error(errData.detail || 'Access denied.');
            }

            const userData = await res.json();
            
            // 3. Store local session and redirect
            localStorage.setItem('rfp_role', userData.role);
            localStorage.setItem('rfp_user_email', userData.email);
            localStorage.setItem('rfp_organization', userData.organization || '');
            
            router.push(userData.role === 'bank' ? '/bank' : '/vendor');

        } catch (err: any) {
            setError(err.message || 'Login failed.');
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
                    <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tight leading-tight">
                        {isBank ? 'Administrative Terminal' : 'Vendor Portal'}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                        Secure gateway for {isBank ? 'bank officials to manage RFPs' : 'authorized vendors to access bidding documents'}.
                    </p>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <ShieldCheck size={14} className="text-[#c8a96a]" />
                    <span>SSL Encrypted Session</span>
                </div>
            </div>

            {/* Right: form - Independently Scrollable */}
            <div className="flex-1 flex flex-col items-center p-8 bg-[#f8fafc] overflow-y-auto h-full">
                <div className="w-full max-w-md my-auto py-12">
                    <div className="flex rounded-2xl bg-slate-100 p-1 mb-10 gap-1 border border-slate-200">
                        <button onClick={() => setRole('bank')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-200 ${role === 'bank' ? 'bg-[#0a1628] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Building2 size={14} /> Bank Admin
                        </button>
                        <button onClick={() => setRole('vendor')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-200 ${role === 'vendor' ? 'bg-[#0a1628] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Store size={14} /> Service Vendor
                        </button>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl font-black text-[#0a1628] mb-2 uppercase tracking-tighter">Welcome Back</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Authorized {role} login</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
                            <div className="relative group">
                                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="rahul@organization.com" className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold transition-all outline-none" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative group">
                                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-11 pr-11 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl text-sm font-bold transition-all outline-none" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        {error && <div className="px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] text-red-600 font-bold uppercase tracking-wide leading-relaxed">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] disabled:opacity-70 ${isBank ? 'bg-[#c8a96a] hover:bg-[#b8993a] text-[#0a1628] shadow-amber-200/60' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200/60'}`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-3"><Loader2 className="animate-spin" size={18} /> Authenticating...</span>
                            ) : (
                                <><span>Establish Session</span><ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        New Organization? <Link href={`/signup?role=${role}`} className="text-indigo-600 font-bold hover:underline">Apply for credentials</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a1628] flex items-center justify-center text-white font-black uppercase tracking-widest text-xs">Initializing Security handshake...</div>}>
            <LoginForm />
        </Suspense>
    );
}
