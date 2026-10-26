"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function DemoPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<"idle" | "logging_in" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const startDemoSession = async () => {
    setStatus("logging_in");
    setErrorMsg(null);

    try {
      // First attempt to call the demo login API route
      const res = await fetch("/api/demo/login", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start demo session");
      }

      setStatus("ready");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.warn("API demo login failed, fallback to direct client demo sign-in:", err);
      // Fallback: try direct Supabase sign in with default credentials if configured
      try {
        const supabase = createClient();
        const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@gapfinder.ai";
        const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "DemoPassword123!";

        const { error } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });

        if (error) {
          setErrorMsg(
            "Demo user is being prepared. If Supabase keys are pending, you can also proceed into local demo view."
          );
          setStatus("error");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch {
        // Allow proceeding to dashboard even if remote auth is unavailable
        router.push("/dashboard?demo=true");
      }
    }
  };

  React.useEffect(() => {
    startDemoSession();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center shadow-lg border border-[#E7E5E4]">
        <div className="w-12 h-12 rounded-2xl bg-[#F3EEFF] text-[#7C3AED] flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-[#1C1917] tracking-tight mb-2">
          Loading Demo Workspace
        </h1>
        <p className="text-xs text-[#57534E] mb-6 leading-relaxed">
          Preloading realistic Computer Science course: Database Management Systems (Normalization, Dependencies, Joins, ACID) with real grounded diagnostics.
        </p>

        {status === "logging_in" && (
          <div className="flex items-center justify-center gap-2 text-xs text-[#7C3AED] font-semibold py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing into demo evaluator profile...</span>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#D97706] text-left">
              {errorMsg}
            </div>
            <Button
              onClick={() => router.push("/dashboard?demo=true")}
              className="w-full text-xs"
            >
              Enter Demo Dashboard Directly
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
