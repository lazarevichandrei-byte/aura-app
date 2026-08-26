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
    const [viewerSnapshot,candidateSnapshot,forwardPairSnapshot,reversePairSnapshot]=await Promise.all([
      buildUserFeatures(viewerUserId,snapshotAt),
      buildUserFeatures(candidateUserId,snapshotAt),
      buildPairFeatures(viewerUserId,candidateUserId,snapshotAt),
      buildPairFeatures(candidateUserId,viewerUserId,snapshotAt),
    ]);

    const snapshots=[viewerSnapshot,candidateSnapshot,forwardPairSnapshot,reversePairSnapshot];
    if(snapshots.some(snapshot=>snapshot.snapshotAt!==snapshotAt))throw new Error("SNAPSHOT_AT_MISMATCH");

    await Promise.all([
      persistUserFeatureSnapshot(viewerUserId,viewerSnapshot),
      persistUserFeatureSnapshot(candidateUserId,candidateSnapshot),
      persistPairFeatureSnapshot(viewerUserId,candidateUserId,forwardPairSnapshot),
      persistPairFeatureSnapshot(candidateUserId,viewerUserId,reversePairSnapshot),
    ]);

    const forwardScore=scoreAuraMatchV2({
      viewerFeatures:viewerSnapshot.features,
      candidateFeatures:candidateSnapshot.features,
      pairFeatures:forwardPairSnapshot.features,
      featureSchemaVersion:1,
      snapshotAt,
    });
    const reverseScore=scoreAuraMatchV2({
      viewerFeatures:candidateSnapshot.features,
      candidateFeatures:viewerSnapshot.features,
      pairFeatures:reversePairSnapshot.features,
      featureSchemaVersion:1,
      snapshotAt,
    });

    const [forwardPersisted,reversePersisted]=await Promise.all([
      persistAuraScore(viewerUserId,candidateUserId,forwardScore),
      persistAuraScore(candidateUserId,viewerUserId,reverseScore),
    ]);

    const {data:admin}=await supabaseAdmin.from("users").select("id").eq("telegram_id",authorization.telegramId).maybeSingle();
    const audit=await supabaseAdmin.from("aura_admin_audit_log").insert({
      admin_user_id:admin?.id??null,
      admin_telegram_id:authorization.telegramId,
      action:"AURA_ADMIN_PAIR_VERIFY",
      target_type:"user_pair",
      target_id:null,
      metadata:{
        viewer_user_id:viewerUserId,
        candidate_user_id:candidateUserId,
        snapshot_at:snapshotAt,
        forward_score_version:forwardScore.scoreVersion,
        forward_total_score:forwardScore.totalScore,
        reverse_score_version:reverseScore.scoreVersion,
        reverse_total_score:reverseScore.totalScore,
      },
    });
    if(audit.error)throw audit.error;

    return NextResponse.json({
      ok:true,
      result:{
        snapshotAt,
        pairFeatures:forwardPairSnapshot.features,
        reversePairFeatures:reversePairSnapshot.features,
        score:forwardPersisted,
        reverseScore:reversePersisted,
      },
    });
  }catch(error){
    console.error("AURA_ADMIN_PAIR_VERIFY_ERROR",{code:error instanceof Error?error.message:"UNKNOWN"});
    return NextResponse.json({ok:false,error:"PAIR_VERIFY_FAILED"},{status:500});
  }
}
