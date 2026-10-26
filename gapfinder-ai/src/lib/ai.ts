const K=process.env.GEMINI_API_KEY!,G="https://generativelanguage.googleapis.com/v1beta/models/",M=process.env.GEMINI_MODEL||"gemini-2.0-flash";
const post=async(u:string,b:any)=>(await fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)})).json();
// Retrieval side: text -> 768-d vectors
export async function embed(texts:string[]):Promise<number[][]>{
  const out:number[][]=[];
  for(let i=0;i<texts.length;i+=90){
    const j=await post(`${G}text-embedding-004:batchEmbedContents?key=${K}`,{requests:texts.slice(i,i+90).map(t=>({model:"models/text-embedding-004",content:{parts:[{text:t}]}}))});
    if(!j.embeddings)throw new Error("Embedding failed: "+JSON.stringify(j.error||j));
    out.push(...j.embeddings.map((e:any)=>e.values));
  }
  return out;
}
// Generation side: only ever called with retrieved excerpts inside the prompt
export async function gen(prompt:string,json=true):Promise<any>{
  const j=await post(`${G}${M}:generateContent?key=${K}`,{contents:[{parts:[{text:prompt}]}],generationConfig:json?{responseMimeType:"application/json",temperature:0.3}:{temperature:0.2}});
  const t=j.candidates?.[0]?.content?.parts?.[0]?.text;
  if(!t)throw new Error("Generation failed: "+JSON.stringify(j.error||j));
  return json?JSON.parse(t):t;
}
