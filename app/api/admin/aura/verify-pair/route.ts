import {NextResponse} from "next/server";
import {authorizeAuraAdmin} from "../../../../../lib/server/admin/aura";
import {buildPairFeatures,buildUserFeatures,persistPairFeatureSnapshot,persistUserFeatureSnapshot} from "../../../../../lib/server/match/features";
import {scoreAuraMatchV2} from "../../../../../lib/server/match/score/score-v2";
import {persistAuraScore} from "../../../../../lib/server/match/score/persistence";
import {supabaseAdmin} from "../../../../../lib/supabase-admin";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request){
  try{
    const body=await request.json().catch(()=>null);
    const authorization=authorizeAuraAdmin(body?.initData);
    if(!authorization.ok)return NextResponse.json({ok:false,error:"NOT_FOUND"},{status:404});

    const viewerUserId=typeof body?.viewerUserId==="string"?body.viewerUserId:"";
    const candidateUserId=typeof body?.candidateUserId==="string"?body.candidateUserId:"";
    if(!viewerUserId||!candidateUserId||viewerUserId===candidateUserId)return NextResponse.json({ok:false,error:"INVALID_PAIR"},{status:400});

    const snapshotAt=new Date().toISOString();
    const [viewerSnapshot,candidateSnapshot,pairSnapshot]=await Promise.all([
      buildUserFeatures(viewerUserId,snapshotAt),
      buildUserFeatures(candidateUserId,snapshotAt),
      buildPairFeatures(viewerUserId,candidateUserId,snapshotAt),
    ]);
    if(viewerSnapshot.snapshotAt!==snapshotAt||candidateSnapshot.snapshotAt!==snapshotAt||pairSnapshot.snapshotAt!==snapshotAt)throw new Error("SNAPSHOT_AT_MISMATCH");

    await Promise.all([
      persistUserFeatureSnapshot(viewerUserId,viewerSnapshot),
      persistUserFeatureSnapshot(candidateUserId,candidateSnapshot),
      persistPairFeatureSnapshot(viewerUserId,candidateUserId,pairSnapshot),
    ]);

    const score=scoreAuraMatchV2({viewerFeatures:viewerSnapshot.features,candidateFeatures:candidateSnapshot.features,pairFeatures:pairSnapshot.features,featureSchemaVersion:1,snapshotAt});
    const persisted=await persistAuraScore(viewerUserId,candidateUserId,score);

    const {data:admin}=await supabaseAdmin.from("users").select("id").eq("telegram_id",authorization.telegramId).maybeSingle();
    const audit=await supabaseAdmin.from("aura_admin_audit_log").insert({admin_user_id:admin?.id??null,admin_telegram_id:authorization.telegramId,action:"AURA_ADMIN_PAIR_VERIFY",target_type:"user_pair",target_id:null,metadata:{viewer_user_id:viewerUserId,candidate_user_id:candidateUserId,snapshot_at:snapshotAt,score_version:score.scoreVersion,total_score:score.totalScore}});
    if(audit.error)throw audit.error;

    return NextResponse.json({ok:true,result:{snapshotAt,pairFeatures:pairSnapshot.features,score:persisted}});
  }catch(error){
    console.error("AURA_ADMIN_PAIR_VERIFY_ERROR",{code:error instanceof Error?error.message:"UNKNOWN"});
    return NextResponse.json({ok:false,error:"PAIR_VERIFY_FAILED"},{status:500});
  }
}
