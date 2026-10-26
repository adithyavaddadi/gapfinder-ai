import {createClient} from "@supabase/supabase-js";
const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const {error}=await s.auth.admin.createUser({email:"demo@gapfinder.app",password:"Demo@1234",email_confirm:true});
console.log(error?error.message:"demo user ready: demo@gapfinder.app / Demo@1234");
