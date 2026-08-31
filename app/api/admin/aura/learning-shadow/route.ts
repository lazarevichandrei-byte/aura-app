import {NextResponse} from "next/server";
import {authorizeAuraAdmin} from "../../../../../lib/server/admin/aura";
import {supabaseAdmin} from "../../../../../lib/supabase-admin";
import {loadAuraTrainingExamplesV1} from "../../../../../lib/server/match/learning/dataset-v1";
import {evaluateAuraLearningCandidateOfflineV1} from "../../../../../lib/server/match/learning/offline-evaluation-v1";
import {evaluateAuraCandidatePromotionGateV1} from "../../../../../lib/server/match/learning/promotion-gate-v1";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>null);
  const authorization=authorizeAuraAdmin(body?.initData);
  if(!authorization.ok)return NextResponse.json({ok:false,error:"NOT_FOUND"},{status:404});
  const examples=await loadAuraTrainingExamplesV1("24h",2000);
  const evaluation=evaluateAuraLearningCandidateOfflineV1(examples);
  const [{count:v2},{count:v3},{count:candidate},{data:latest},promotionGate]=await Promise.all([
   supabaseAdmin.from("aura_match_score_snapshots").select("id",{count:"exact",head:true}).eq("score_version",2),
   supabaseAdmin.from("aura_match_score_snapshots").select("id",{count:"exact",head:true}).eq("score_version",3),
   supabaseAdmin.from("aura_candidate_shadow_snapshots").select("id",{count:"exact",head:true}),
   supabaseAdmin.from("aura_candidate_shadow_snapshots").select("snapshot_at,active_score,shadow_score,candidate_score,candidate_version,status,created_at").order("created_at",{ascending:false}).limit(20),
   evaluateAuraCandidatePromotionGateV1(),
  ]);
  return NextResponse.json({ok:true,generatedAt:new Date().toISOString(),training:{count:examples.length,required:100,remaining:Math.max(0,100-examples.length)},scores:{v2:v2??0,v3:v3??0,candidate:candidate??0},evaluation,promotionGate,latest:latest??[],policy:{productionRanking:"V2",candidate:"SHADOW_ONLY",automaticPromotion:false}});
 }catch(error){console.error("AURA_ADMIN_LEARNING_SHADOW_ERROR",{code:error instanceof Error?error.message:"UNKNOWN"});return NextResponse.json({ok:false,error:"LEARNING_SHADOW_UNAVAILABLE"},{status:500});}
}
