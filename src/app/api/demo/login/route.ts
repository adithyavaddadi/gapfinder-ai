import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const demoEmail = process.env.DEMO_EMAIL || process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@gapfinder.ai";
  const demoPassword = process.env.DEMO_PASSWORD || "DemoPassword123!";

  try {
    const supabase = await createClient();

    // Try signing in directly
    let { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (signInError) {
      // If user doesn't exist yet, try creating it with the admin client
      try {
        const adminSupabase = createAdminClient();
        const { error: createError } = await adminSupabase.auth.admin.createUser({
          email: demoEmail,
          password: demoPassword,
          email_confirm: true,
          user_metadata: { full_name: "Demo Evaluator" },
        });

        if (!createError) {
          const secondAttempt = await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword,
          });
          authData = secondAttempt.data;
          signInError = secondAttempt.error;
        }
      } catch (adminErr) {
        console.warn("Could not create user via admin client:", adminErr);
      }
    }

    if (signInError) {
      return NextResponse.json(
        { error: signInError.message, code: "AUTH_FAILED" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message, code: "DEMO_LOGIN_ERROR" }, { status: 500 });
  }
}
