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
  LogOut,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  User,
  Zap,
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
  { name: "Quiz", href: "/quiz", icon: HelpCircle },
  { name: "Gap Report", href: "/gap-report", icon: FileSearch },
  { name: "Plan", href: "/revision-plan", icon: CalendarCheck },
  { name: "Explain", href: "/explain", icon: MessageSquareQuote },
  { name: "Progress", href: "/progress", icon: TrendingUp },
];

export function AppShell({ children, userEmail = "student@example.com", isDemoUser = true }: AppShellProps) {
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
    <div className="min-h-screen bg-[#F9F8F5] text-[#121316] flex flex-col selection:bg-[#E8E5DF] selection:text-[#121316]">
      {/* Top Demo Notification Pill Banner */}
      {isDemoUser && (
        <aside aria-label="Demo Dataset Notification" className="bg-[#FAF7F0] border-b border-[#E8E4DC] px-4 py-2 text-xs text-[#5A554E] flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#121316]" />
              <span className="font-semibold text-[#121316] tracking-wider text-[11px] uppercase bg-white px-2.5 py-0.5 rounded-full border border-[#E8E4DC] shadow-xs">
                Sample DBMS Dataset Loaded
              </span>
              <span className="hidden sm:inline text-[11px] text-[#6B665E]">
                3 indexed documents, Knowledge X-Ray, diagnosed baseline errors & adaptive revision plan ready.
              </span>
            </div>
            <Link
              href="/materials"
              className="text-[11px] text-[#121316] hover:text-[#4A463F] underline font-medium flex items-center gap-1 shrink-0 ml-3"
            >
              <span>View Seed Documents</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </aside>
      )}

      {/* Main Top Navigation Header with Top-Middle Floating Menu */}
      <header className="sticky top-0 z-50 liquid-pill border-x-0 border-t-0 border-b border-[#E8E5DF] px-4 lg:px-8 py-3.5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#121316] flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
              G
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-base tracking-tight text-[#121316]">
                  GapFinder
                </span>
                <span className="text-[10px] font-bold text-[#121316] bg-[#F2EFEB] px-1.5 py-0.5 rounded-full">
                  AI
                </span>
              </div>
              <span className="text-[9px] text-[#8C867A] font-medium tracking-wider uppercase block mt-0.5">
                Diagnostic Revision
              </span>
            </div>
          </Link>

          {/* TOP MIDDLE FLOATING PILL MENU */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#F2EFEB]/90 border border-[#E8E5DF] shadow-inner backdrop-blur-md">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 select-none",
                    isActive
                      ? "bg-[#121316] text-white font-semibold shadow-sm"
                      : "text-[#5A554E] hover:text-[#121316] hover:bg-white/80"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-[#78716C]")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Next Action + User Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Action Pill Button */}
            <Link href={nextAction.href} className="hidden lg:block">
              <Button
                size="sm"
                className="bg-[#121316] hover:bg-black text-white text-xs font-semibold rounded-full shadow-sm py-2 px-4 transition-transform active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-300 fill-amber-300" />
                <span>{nextAction.label}</span>
              </Button>
            </Link>

            {/* User Pill & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E8E5DF]">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E8E5DF] shadow-xs">
                <div className="w-5 h-5 rounded-full bg-[#121316] flex items-center justify-center text-white text-[10px] font-bold">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-[11px] text-[#4A463F] font-medium max-w-[110px] truncate">
                  {userEmail}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="p-2 rounded-full text-[#78716C] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-[#121316] hover:bg-white border border-[#E8E5DF]"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-[#E8E5DF] mt-3 space-y-1">
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all",
                      isActive
                        ? "bg-[#121316] text-white font-semibold"
                        : "text-[#4A463F] bg-white border border-[#E8E5DF] hover:bg-[#F2EFEB]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2">
              <Link href={nextAction.href} onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full text-xs py-2.5 bg-[#121316] text-white rounded-full">
                  <span>{nextAction.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 pb-24">
        {children}
      </main>
    </div>
  );
}
