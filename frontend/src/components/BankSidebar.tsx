"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, FileText, History, Users, LogOut, CheckCircle2
} from 'lucide-react';

export default function BankSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('admin@bank.com');

  const currentView = searchParams.get('view') || 'overview';

  useEffect(() => {
    const email = localStorage.getItem('rfp_user_email');
    if (email) setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rfp_role');
    localStorage.removeItem('rfp_user_email');
    router.push('/');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/bank', view: 'overview' },
    { label: 'My RFPs', icon: FileText, path: '/bank?view=management', view: 'management' },
    { label: 'Audit Trail', icon: History, path: '/bank/audit', view: null },
    { label: 'Vendor Registry', icon: Users, path: '/bank/vendors', view: null },
  ];

  return (
    <aside className="w-72 bg-[#0a1628] flex flex-col shrink-0 relative overflow-hidden h-screen sticky top-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1f3c]/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#c8a96a]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand */}
      <div className="relative px-6 py-8 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0033a0] to-[#0056b3] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30 shrink-0 border border-white/20">
            <span className="text-white font-black text-lg">IB</span>
          </div>
          <div>
            <div className="text-white font-bold text-base tracking-tight leading-none">Indian Bank</div>
            <div className="text-[9px] text-blue-300 font-black uppercase tracking-widest mt-1.5">RFP Portal Console</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-8 space-y-1">
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest px-3 mb-4">Operational Console</p>
        {navItems.map((item) => {
          const isPathActive = pathname === item.path.split('?')[0];
          const isViewActive = item.view ? currentView === item.view : isPathActive;
          const isActive = item.view ? (isPathActive && isViewActive) : isPathActive;

          return (
            <Link 
              key={item.path}
              href={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-bold text-sm ${isActive ? 'bg-[#c8a96a] text-[#0a1628] shadow-lg shadow-amber-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon size={18} /> {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="relative px-4 pb-8 space-y-3">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-white/5 hover:text-red-400 transition-all duration-200 font-medium text-sm text-left">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
