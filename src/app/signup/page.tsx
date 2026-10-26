"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#F9F8F5] text-[#121316] selection:bg-[#121316] selection:text-white">
      {/* Left Column: Signup Form */}
      <div className="flex flex-col justify-between p-8 sm:p-12 md:p-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-full bg-[#121316] text-white flex items-center justify-center font-bold text-base shadow-xs">
              G
            </div>
            <span className="font-extrabold text-base text-[#121316] tracking-tight">GapFinder AI</span>
          </Link>

          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-extrabold text-[#121316] tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-xs text-[#5A554E] mb-6">
              Turn your study materials into precision diagnostics and an adaptive plan.
            </p>

            {/* Try Demo Callout */}
            <div className="p-4 rounded-2xl bg-[#F2EFEB] border border-[#E8E5DF] mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#121316] shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-[#121316] block">
                    Hackathon Evaluator / Judge?
                  </span>
                  <span className="text-[#5A554E]">Skip registration and test DBMS workspace</span>
                </div>
              </div>
              <Link href="/demo">
                <Button size="sm" className="text-xs shrink-0 py-1.5 px-3.5 font-semibold">
                  Try Demo
                </Button>
              </Link>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 mb-4">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 mb-4">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#121316] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full px-4 py-2.5 rounded-full border border-[#E8E5DF] bg-white text-xs text-[#121316] placeholder:text-[#A09A90] focus:outline-none focus:ring-2 focus:ring-[#121316]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121316] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-4 py-2.5 rounded-full border border-[#E8E5DF] bg-white text-xs text-[#121316] placeholder:text-[#A09A90] focus:outline-none focus:ring-2 focus:ring-[#121316]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121316] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-full border border-[#E8E5DF] bg-white text-xs text-[#121316] placeholder:text-[#A09A90] focus:outline-none focus:ring-2 focus:ring-[#121316]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#736E66] hover:text-[#121316]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                size="md"
                className="w-full font-bold shadow-xs mt-2"
              >
                Create Free Account
              </Button>
            </form>

            <div className="mt-8 text-center text-xs text-[#5A554E]">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#121316] hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-[#736E66] text-center mt-8">
          © 2026 GapFinder AI. Strict Academic Provenance Grounding.
        </div>
      </div>

      {/* Right Column: Visual Showcase */}
      <div className="hidden md:flex flex-col justify-between p-12 lg:p-16 border-l border-[#E8E5DF] bg-[#F2EFEB]">
        <div className="space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8E5DF] text-xs font-bold text-[#121316]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Evidence Guarantee</span>
          </div>

          <h2 className="text-3xl font-extrabold text-[#121316] tracking-tight leading-snug">
            Diagnose blindspots before exam day.
          </h2>

          <p className="text-xs text-[#5A554E] leading-relaxed">
            Standard revision assumes you know what you don&apos;t know. GapFinder turns your actual course materials into a personalized diagnostic engine with citation-level audit trails.
          </p>

          <div className="space-y-3 pt-4">
            {[
              "Every question maps directly to a paragraph in your course material",
              "Adaptive revision plans dynamically order what you should study next",
              "Deterministic server-side scoring protects against model drift",
              "Empirical progress metrics show proven learning gain deltas",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[#121316]">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF] text-xs text-[#5A554E] max-w-md shadow-xs">
          <span className="font-bold text-[#121316] block mb-1">
            Student Proof of Learning
          </span>
          "Re-reading chapters creates a false sense of familiarity. Testing yourself with citation feedback forces active recall and exposes real conceptual gaps."
        </div>
      </div>
    </div>
  );
}
