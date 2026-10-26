import {createClient} from "@supabase/supabase-js";
import {embed} from "./ai";
export const sbFor=(token:string)=>createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{global:{headers:{Authorization:"Bearer "+token}}});
export function chunk(t:string,size=900){const o:string[]=[];let c="";for(const p of t.split(/\n\s*\n/)){if((c+p).length>size&&c){o.push(c.trim());c="";}c+=p+"\n\n";}if(c.trim())o.push(c.trim());return o;}
export async function ingest(sb:any,name:string,kind:string,text:string){
  const {data:d,error}=await sb.from("documents").insert({name,kind}).select().single();if(error)throw error;
  const cs=chunk(text),v=await embed(cs);
  const {error:e2}=await sb.from("chunks").insert(cs.map((content,idx)=>({document_id:d.id,idx,content,embedding:JSON.stringify(v[idx])})));if(e2)throw e2;
}
export async function retrieve(sb:any,q:string,k=4){
  const [v]=await embed([q]);const {data,error}=await sb.rpc("match_chunks",{q:JSON.stringify(v),k});if(error)throw error;return data||[];
}
export function gaps(ans:any[]){
  const m:Record<string,any[]>={};ans.forEach(a=>(m[a.topic]??=[]).push(a));
  return Object.entries(m).map(([topic,a])=>{const r=a.filter(x=>x.is_correct).length,p=r/a.length;
    return{topic,right:r,total:a.length,level:p<0.5?"weak":p<0.8?"medium":"strong",
      reason:`${r}/${a.length} correct`+(r<a.length?". Missed: "+a.filter(x=>!x.is_correct).map(x=>x.question).slice(0,2).join(" | "):". No mistakes on this topic.")}});
}
