"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password || !fullName) {
      setErrorMessage("Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setSuccessMessage("Account created! Check your email to confirm, or try the Demo mode instantly.");
        setIsLoading(false);
      }
    } catch {
      setErrorMessage("An unexpected error occurred during signup.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#FAF9F6]">
      {/* Left Column: Signup Form */}
      <div className="flex flex-col justify-between p-8 sm:p-12 md:p-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              G
            </div>
            <span className="font-bold text-base text-[#1C1917]">GapFinder AI</span>
          </Link>

          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-[#1C1917] tracking-tight mb-2">
              Create student account
            </h1>
            <p className="text-xs text-[#57534E] mb-6">
              Start diagnosing your course syllabus and building your personalized revision plan.
            </p>

            {/* Try Demo Callout */}
            <div className="p-3.5 rounded-xl bg-[#F3EEFF] border border-[#DDD6FE] mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#7C3AED] shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-[#1C1917] block">
                    Want to test immediately?
                  </span>
                  <span className="text-[#57534E]">Judge demo workspace is pre-configured</span>
                </div>
              </div>
              <Link href="/demo">
                <Button size="sm" variant="primary" className="text-xs shrink-0 py-1 px-3">
                  Try Demo
                </Button>
              </Link>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] mb-4">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#16A34A] mb-4">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full text-sm font-semibold mt-2"
              >
                Create Account
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            <p className="text-center text-xs text-[#57534E] mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-[#7C3AED] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-[11px] text-[#A8A29E] text-center pt-8">
          By signing up, you agree to local data evaluation policies.
        </div>
      </div>

      {/* Right Column: Value-prop Showcase */}
      <div className="hidden md:flex flex-col justify-between p-12 lg:p-16 bg-white border-l border-[#E7E5E4]">
        <div />
        <div className="max-w-md mx-auto space-y-8">
          <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] text-[#7C3AED] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1C1917] tracking-tight">
              Personalized revision backed by real evidence.
            </h2>
            <p className="text-xs text-[#57534E] leading-relaxed">
              No more re-reading notes aimlessly. Upload your syllabus and past papers, find out where you stand with grounded quizzes, and follow an optimized plan.
            </p>
          </div>

          <div className="space-y-3.5 pt-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <p className="text-xs text-[#57534E]">
                <strong className="text-[#1C1917]">Knowledge X-Ray:</strong> Visual breakdown of every curriculum topic and prerequisite relationship.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <p className="text-xs text-[#57534E]">
                <strong className="text-[#1C1917]">Transparent ratings:</strong> Every "Weak" or "Strong" rating states the exact reason and sample size.
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-[#78716C]">
          <span>GapFinder AI • Built for high-stakes exam preparation</span>
        </div>
      </div>
    </div>
  );
}
