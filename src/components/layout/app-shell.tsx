"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Network,
  HelpCircle,
  FileSearch,
  CalendarCheck,
  MessageSquareQuote,
  TrendingUp,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface AppShellProps {
  children: React.ReactNode;
  userEmail?: string;
  isDemoUser?: boolean;
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Materials", href: "/materials", icon: FileText },
  { name: "Topic Map", href: "/topic-map", icon: Network },
  { name: "Diagnostic Quiz", href: "/quiz", icon: HelpCircle },
  { name: "Gap Report", href: "/gap-report", icon: FileSearch },
  { name: "Revision Plan", href: "/revision-plan", icon: CalendarCheck },
  { name: "Explain Assistant", href: "/explain", icon: MessageSquareQuote },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({ children, userEmail = "student@example.com", isDemoUser = false }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch {
      router.push("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  const getPageTitle = () => {
    const item = NAV_ITEMS.find((nav) => nav.href === pathname || pathname.startsWith(`${nav.href}/`));
    return item ? item.name : "GapFinder AI";
  };

  const getNextBestAction = () => {
    if (pathname === "/dashboard") return { label: "Run Diagnostic", href: "/quiz" };
    if (pathname === "/materials") return { label: "Explore Topic Map", href: "/topic-map" };
    if (pathname === "/topic-map") return { label: "Start Quiz", href: "/quiz" };
    if (pathname === "/quiz") return { label: "View Gap Report", href: "/gap-report" };
    if (pathname === "/gap-report") return { label: "Generate Plan", href: "/revision-plan" };
    if (pathname === "/revision-plan") return { label: "Explain Weak Topic", href: "/explain" };
    if (pathname === "/explain") return { label: "Check Progress", href: "/progress" };
    return { label: "Take Retest", href: "/quiz?mode=retest" };
  };

  const nextAction = getNextBestAction();

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#E7E5E4] sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white font-bold text-base shadow-xs">
            G
          </div>
          <span className="font-bold text-base tracking-tight text-[#1C1917]">GapFinder AI</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-[#57534E] hover:bg-[#F5F5F4]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E7E5E4] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:shrink-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="p-5 border-b border-[#F5F5F4] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-[#7C3AED]/25">
              G
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#1C1917] block leading-none">
                GapFinder<span className="text-[#7C3AED]"> AI</span>
              </span>
              <span className="text-[10px] text-[#78716C] font-medium tracking-wide uppercase">
                Diagnostic Revision
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 text-[#78716C] hover:text-[#1C1917]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-[#F3EEFF] text-[#7C3AED] font-semibold shadow-xs"
                    : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-[#7C3AED]" : "text-[#78716C] group-hover:text-[#1C1917]"
                  )}
                />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Sign Out at bottom */}
        <div className="p-3 border-t border-[#F5F5F4] bg-[#FAF9F6]/50">
          <div className="p-2.5 rounded-xl bg-white border border-[#E7E5E4] flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F4] flex items-center justify-center text-[#57534E] shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1C1917] truncate">
                {userEmail}
              </p>
              <p className="text-[10px] text-[#78716C] flex items-center gap-1">
                {isDemoUser ? (
                  <span className="text-[#D97706] font-medium">Demo Profile</span>
                ) : (
                  <span>Student Mode</span>
                )}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            isLoading={isSigningOut}
            className="w-full justify-start text-xs text-[#78716C] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Sample Data Banner for demo mode */}
        {isDemoUser && (
          <div className="bg-[#FFFBEB] border-b border-[#FDE68A] px-6 py-2 text-xs font-medium text-[#D97706] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                <strong>Sample Demo Dataset Active:</strong> Grounded on Database Management Systems (Normalization, Functional Dependencies, SQL & Transactions).
              </span>
            </div>
            <Link
              href="/materials"
              className="underline hover:text-[#B45309] text-[11px] shrink-0 ml-4 font-semibold"
            >
              Inspect Source Documents
            </Link>
          </div>
        )}

        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-[#E7E5E4] sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-[#78716C]">
            <Link href="/dashboard" className="hover:text-[#1C1917]">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-[#1C1917]">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href={nextAction.href}>
              <Button size="sm" variant="secondary" className="text-xs">
                <span>{nextAction.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}
