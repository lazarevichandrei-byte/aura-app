import "server-only";
import {supabaseAdmin} from "../../../supabase-admin";
import {buildPairFeatures,buildUserFeatures} from "../features";
import {buildConversationReadSignalsV1} from "../features/read-signals";
import {persistPairFeatureSnapshotV2,persistUserFeatureSnapshotV2} from "../features/snapshot-v2";
import type {AuraPairFeaturesV2,FeatureSnapshotV2} from "../features/types-v2";
import {scoreAuraMatchV3} from "../score/score-v3";
import {persistAuraScore} from "../score/persistence";
import {recordAuraBrainRuntimeEventV1} from "../health/runtime-events-v1";

type OutcomeRow={viewer_user_id:string;candidate_user_id:string;score_snapshot_id:string|null};
type ScoreRow={id:string;viewer_user_id:string;candidate_user_id:string;snapshot_at:string;score_version:number};
const key=(viewer:string,candidate:string,snapshotAt:string)=>`${viewer}:${candidate}:${snapshotAt}`;
const errorCode=(error:unknown)=>error instanceof Error?error.message:"UNKNOWN";

export async function backfillOutcomeLinkedAuraV3V1(limit=100){
  const bounded=Math.max(1,Math.min(500,limit));
  const {data:outcomes,error:oError}=await supabaseAdmin.from("aura_match_outcomes")
    .select("viewer_user_id,candidate_user_id,score_snapshot_id")
    .eq("window_type","24h")
    .eq("is_window_complete",true)
    .not("score_snapshot_id","is",null)
    .order("evaluated_at",{ascending:false})
    .limit(bounded*3);
  if(oError)throw oError;
  const rows=(outcomes??[]) as OutcomeRow[];
  const ids=[...new Set(rows.map(row=>row.score_snapshot_id).filter(Boolean))] as string[];
  if(ids.length===0)return {linkedV2:0,missing:0,materialized:0,failed:0};

  const {data:active,error:aError}=await supabaseAdmin.from("aura_match_score_snapshots")
    .select("id,viewer_user_id,candidate_user_id,snapshot_at,score_version")
    .in("id",ids)
    .eq("score_version",2)
    .limit(bounded);
  if(aError)throw aError;
  const activeRows=(active??[]) as ScoreRow[];
  if(activeRows.length===0)return {linkedV2:0,missing:0,materialized:0,failed:0};

  const times=[...new Set(activeRows.map(row=>row.snapshot_at))];
  const [{data:v3,error:v3Error},{data:pairs,error:pError}]=await Promise.all([
    supabaseAdmin.from("aura_match_score_snapshots").select("viewer_user_id,candidate_user_id,snapshot_at").eq("score_version",3).in("snapshot_at",times).limit(5000),
    supabaseAdmin.from("aura_pair_feature_snapshots").select("viewer_user_id,candidate_user_id,snapshot_at").eq("feature_schema_version",2).in("snapshot_at",times).limit(5000),
  ]);
  if(v3Error)throw v3Error;
  if(pError)throw pError;
  const v3Keys=new Set((v3??[]).map(row=>key(row.viewer_user_id,row.candidate_user_id,row.snapshot_at)));
  const pairKeys=new Set((pairs??[]).map(row=>key(row.viewer_user_id,row.candidate_user_id,row.snapshot_at)));
  const missing=activeRows.filter(row=>!v3Keys.has(key(row.viewer_user_id,row.candidate_user_id,row.snapshot_at))||!pairKeys.has(key(row.viewer_user_id,row.candidate_user_id,row.snapshot_at))).slice(0,bounded);

  let materialized=0;
  let failed=0;
  for(const row of missing){
    try{
      const [viewerSnapshot,candidateSnapshot,pairSnapshot,readSignals]=await Promise.all([
        buildUserFeatures(row.viewer_user_id,row.snapshot_at),
        buildUserFeatures(row.candidate_user_id,row.snapshot_at),
        buildPairFeatures(row.viewer_user_id,row.candidate_user_id,row.snapshot_at),
        buildConversationReadSignalsV1(row.viewer_user_id,row.candidate_user_id,row.snapshot_at),
      ]);
      const pairV2:FeatureSnapshotV2<AuraPairFeaturesV2>={featureSchemaVersion:2,snapshotAt:row.snapshot_at,features:{...pairSnapshot.features,...readSignals}};
      const viewerV2={featureSchemaVersion:2 as const,snapshotAt:row.snapshot_at,features:viewerSnapshot.features};
      const candidateV2={featureSchemaVersion:2 as const,snapshotAt:row.snapshot_at,features:candidateSnapshot.features};
      const shadowScore=scoreAuraMatchV3({viewerFeatures:viewerSnapshot.features,candidateFeatures:candidateSnapshot.features,pairFeatures:pairV2.features,snapshotAt:row.snapshot_at});
      await Promise.all([
        persistUserFeatureSnapshotV2(row.viewer_user_id,viewerV2),
        persistUserFeatureSnapshotV2(row.candidate_user_id,candidateV2),
        persistPairFeatureSnapshotV2(row.viewer_user_id,row.candidate_user_id,pairV2),
        persistAuraScore(row.viewer_user_id,row.candidate_user_id,shadowScore),
      ]);
      materialized+=1;
    }catch(error){
      failed+=1;
      await recordAuraBrainRuntimeEventV1({component:"SHADOW_V3",stage:"LEARNING_BACKFILL",severity:"WARN",code:errorCode(error),viewerUserId:row.viewer_user_id,candidateUserId:row.candidate_user_id,snapshotAt:row.snapshot_at,retryable:true});
    }
  }

  return {linkedV2:activeRows.length,missing:missing.length,materialized,failed};
}
