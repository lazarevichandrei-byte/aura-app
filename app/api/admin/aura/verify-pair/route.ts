import {NextResponse} from "next/server";
import {authorizeAuraAdmin} from "../../../../../lib/server/admin/aura";
import {buildPairFeatures,buildUserFeatures,persistPairFeatureSnapshot,persistUserFeatureSnapshot} from "../../../../../lib/server/match/features";
import {buildConversationReadSignalsV1} from "../../../../../lib/server/match/features/read-signals";
import {persistPairFeatureSnapshotV2,persistUserFeatureSnapshotV2} from "../../../../../lib/server/match/features/snapshot-v2";
import type {AuraPairFeaturesV2,FeatureSnapshotV2} from "../../../../../lib/server/match/features/types-v2";
import {scoreAuraMatchV2} from "../../../../../lib/server/match/score/score-v2";
import {scoreAuraMatchV3} from "../../../../../lib/server/match/score/score-v3";
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
    const [viewerSnapshot,candidateSnapshot,forwardPairSnapshot,reversePairSnapshot,forwardReadSignals,reverseReadSignals]=await Promise.all([
      buildUserFeatures(viewerUserId,snapshotAt),
      buildUserFeatures(candidateUserId,snapshotAt),
      buildPairFeatures(viewerUserId,candidateUserId,snapshotAt),
      buildPairFeatures(candidateUserId,viewerUserId,snapshotAt),
      buildConversationReadSignalsV1(viewerUserId,candidateUserId,snapshotAt),
      buildConversationReadSignalsV1(candidateUserId,viewerUserId,snapshotAt),
    ]);

    const snapshots=[viewerSnapshot,candidateSnapshot,forwardPairSnapshot,reversePairSnapshot];
    if(snapshots.some(snapshot=>snapshot.snapshotAt!==snapshotAt))throw new Error("SNAPSHOT_AT_MISMATCH");

    await Promise.all([
      persistUserFeatureSnapshot(viewerUserId,viewerSnapshot),
      persistUserFeatureSnapshot(candidateUserId,candidateSnapshot),
      persistPairFeatureSnapshot(viewerUserId,candidateUserId,forwardPairSnapshot),
      persistPairFeatureSnapshot(candidateUserId,viewerUserId,reversePairSnapshot),
    ]);

    const forwardScore=scoreAuraMatchV2({viewerFeatures:viewerSnapshot.features,candidateFeatures:candidateSnapshot.features,pairFeatures:forwardPairSnapshot.features,featureSchemaVersion:1,snapshotAt});
    const reverseScore=scoreAuraMatchV2({viewerFeatures:candidateSnapshot.features,candidateFeatures:viewerSnapshot.features,pairFeatures:reversePairSnapshot.features,featureSchemaVersion:1,snapshotAt});

    const [forwardPersisted,reversePersisted]=await Promise.all([
      persistAuraScore(viewerUserId,candidateUserId,forwardScore),
      persistAuraScore(candidateUserId,viewerUserId,reverseScore),
    ]);

    const forwardV2:FeatureSnapshotV2<AuraPairFeaturesV2>={featureSchemaVersion:2,snapshotAt,features:{...forwardPairSnapshot.features,...forwardReadSignals}};
    const reverseV2:FeatureSnapshotV2<AuraPairFeaturesV2>={featureSchemaVersion:2,snapshotAt,features:{...reversePairSnapshot.features,...reverseReadSignals}};
    const viewerV2={featureSchemaVersion:2 as const,snapshotAt,features:viewerSnapshot.features};
    const candidateV2={featureSchemaVersion:2 as const,snapshotAt,features:candidateSnapshot.features};
    const forwardShadow=scoreAuraMatchV3({viewerFeatures:viewerSnapshot.features,candidateFeatures:candidateSnapshot.features,pairFeatures:forwardV2.features,snapshotAt});
    const reverseShadow=scoreAuraMatchV3({viewerFeatures:candidateSnapshot.features,candidateFeatures:viewerSnapshot.features,pairFeatures:reverseV2.features,snapshotAt});

    const [forwardShadowPersisted,reverseShadowPersisted]=await Promise.all([
      persistUserFeatureSnapshotV2(viewerUserId,viewerV2),
      persistUserFeatureSnapshotV2(candidateUserId,candidateV2),
      persistPairFeatureSnapshotV2(viewerUserId,candidateUserId,forwardV2),
      persistPairFeatureSnapshotV2(candidateUserId,viewerUserId,reverseV2),
      persistAuraScore(viewerUserId,candidateUserId,forwardShadow),
      persistAuraScore(candidateUserId,viewerUserId,reverseShadow),
    ]).then(results=>[results[4],results[5]]);

    const {data:admin}=await supabaseAdmin.from("users").select("id").eq("telegram_id",authorization.telegramId).maybeSingle();
    const audit=await supabaseAdmin.from("aura_admin_audit_log").insert({
      admin_user_id:admin?.id??null,
      admin_telegram_id:authorization.telegramId,
      action:"AURA_ADMIN_PAIR_VERIFY",
      target_type:"user_pair",
      target_id:null,
      metadata:{
        viewer_user_id:viewerUserId,candidate_user_id:candidateUserId,snapshot_at:snapshotAt,
        forward_score_v2:forwardScore.totalScore,reverse_score_v2:reverseScore.totalScore,
        forward_shadow_v3:forwardShadow.totalScore,reverse_shadow_v3:reverseShadow.totalScore,
      },
    });
    if(audit.error)throw audit.error;

    return NextResponse.json({ok:true,result:{
      snapshotAt,
      pairFeatures:forwardPairSnapshot.features,
      reversePairFeatures:reversePairSnapshot.features,
      pairFeaturesV2:forwardV2.features,
      reversePairFeaturesV2:reverseV2.features,
      score:forwardPersisted,
      reverseScore:reversePersisted,
      shadowScore:forwardShadowPersisted,
      reverseShadowScore:reverseShadowPersisted,
    }});
  }catch(error){
    console.error("AURA_ADMIN_PAIR_VERIFY_ERROR",{code:error instanceof Error?error.message:"UNKNOWN"});
    return NextResponse.json({ok:false,error:"PAIR_VERIFY_FAILED"},{status:500});
  }
}
