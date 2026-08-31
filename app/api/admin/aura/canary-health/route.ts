import {NextResponse} from "next/server";
import {authorizeAuraAdmin} from "../../../../../lib/server/admin/aura";
import {supabaseAdmin} from "../../../../../lib/supabase-admin";
import {evaluateAuraCandidateCanarySafetyV1,loadAuraCandidateCanaryStateV1} from "../../../../../lib/server/match/learning/canary-safety-v1";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>null);
  const authorization=authorizeAuraAdmin(body?.initData);
  if(!authorization.ok)return NextResponse.json({ok:false,error:"NOT_FOUND"},{status:404});
  const since24h=new Date(Date.now()-24*60*60*1000).toISOString();
  const [state,evaluation,{data:rows,error}]=await Promise.all([
   loadAuraCandidateCanaryStateV1(),
   evaluateAuraCandidateCanarySafetyV1(new Date(),true),
   supabaseAdmin.from("aura_candidate_canary_exposures").select("arm").gte("created_at",since24h).limit(10000),
  ]);
  if(error)throw error;
  const counts={CONTROL:0,CANDIDATE:0,FALLBACK_V2:0};
  for(const row of rows??[]){const arm=row.arm as keyof typeof counts;if(arm in counts)counts[arm]+=1;}
  return NextResponse.json({ok:true,generatedAt:new Date().toISOString(),state,evaluation,last24h:{total:(rows??[]).length,...counts}});
 }catch(error){console.error("AURA_ADMIN_CANARY_HEALTH_ERROR",{code:error instanceof Error?error.message:"UNKNOWN"});return NextResponse.json({ok:false,error:"CANARY_HEALTH_UNAVAILABLE"},{status:500});}
}
