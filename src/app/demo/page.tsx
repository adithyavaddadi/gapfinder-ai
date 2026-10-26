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
        router.push("/dashboard?demo=true");
      }
    }
  };

  React.useEffect(() => {
    startDemoSession();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-[#121316] flex items-center justify-center p-6 selection:bg-[#121316] selection:text-white">
      <Card className="max-w-md w-full p-8 text-center shadow-lg border border-[#E8E5DF] bg-white">
        <div className="w-14 h-14 rounded-full bg-[#F2EFEB] border border-[#E8E5DF] text-[#121316] flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Sparkles className="w-6 h-6 text-[#121316]" />
        </div>

        <h1 className="text-xl font-extrabold text-[#121316] tracking-tight mb-2">
          Loading Demo Workspace
        </h1>
        <p className="text-xs text-[#5A554E] mb-6 leading-relaxed">
          Preloading realistic Computer Science course: Database Management Systems (Normalization, Dependencies, Joins, ACID) with real grounded diagnostics.
        </p>

        {status === "logging_in" && (
          <div className="flex items-center justify-center gap-2 text-xs text-[#121316] font-semibold py-4">
            <Loader2 className="w-4 h-4 animate-spin text-[#121316]" />
            <span>Signing into demo evaluator profile...</span>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left">
              {errorMsg}
            </div>
            <Button
              onClick={() => router.push("/dashboard?demo=true")}
              className="w-full text-xs font-semibold py-2.5"
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
