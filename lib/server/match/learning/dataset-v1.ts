import "server-only";

import {supabaseAdmin} from "../../../supabase-admin";
import {buildAuraTrainingExampleV1,type AuraTrainingExampleV1} from "./training-example-v1";

type WindowType="24h"|"7d"|"30d";
type OutcomeRow={viewer_user_id:string;candidate_user_id:string;window_type:WindowType;anchor_at:string;score_snapshot_id:string|null;outcomes:Record<string,unknown>};
type ScoreRow={id:string;viewer_user_id:string;candidate_user_id:string;feature_schema_version:number;score_version:number;snapshot_at:string;total_score:number};
type PairRow={viewer_user_id:string;candidate_user_id:string;feature_schema_version:number;snapshot_at:string;features:Record<string,unknown>};
const key=(a:string,b:string,t:string)=>`${a}:${b}:${t}`;

export async function loadAuraTrainingExamplesV1(windowType:WindowType="24h",limit=500):Promise<AuraTrainingExampleV1[]>{
 const boundedLimit=Math.max(1,Math.min(2000,limit));
 const {data:outcomes,error:oError}=await supabaseAdmin.from("aura_match_outcomes").select("viewer_user_id,candidate_user_id,window_type,anchor_at,score_snapshot_id,outcomes").eq("window_type",windowType).eq("is_window_complete",true).not("score_snapshot_id","is",null).order("evaluated_at",{ascending:false}).limit(boundedLimit);
 if(oError)throw oError;
 const rows=(outcomes??[]) as OutcomeRow[];
 const ids=[...new Set(rows.map(r=>r.score_snapshot_id).filter(Boolean))] as string[];
 if(!ids.length)return [];
 const {data:active,error:aError}=await supabaseAdmin.from("aura_match_score_snapshots").select("id,viewer_user_id,candidate_user_id,feature_schema_version,score_version,snapshot_at,total_score").in("id",ids).eq("score_version",2);
 if(aError)throw aError;
 const activeRows=(active??[]) as ScoreRow[];
 const activeById=new Map(activeRows.map(r=>[r.id,r]));
 const times=[...new Set(activeRows.map(r=>r.snapshot_at))];
 const [{data:shadow,error:sError},{data:pairs,error:pError}]=await Promise.all([
  times.length?supabaseAdmin.from("aura_match_score_snapshots").select("id,viewer_user_id,candidate_user_id,feature_schema_version,score_version,snapshot_at,total_score").eq("score_version",3).in("snapshot_at",times).limit(5000):Promise.resolve({data:[],error:null}),
  times.length?supabaseAdmin.from("aura_pair_feature_snapshots").select("viewer_user_id,candidate_user_id,feature_schema_version,snapshot_at,features").eq("feature_schema_version",2).in("snapshot_at",times).limit(5000):Promise.resolve({data:[],error:null}),
 ]);
 if(sError)throw sError;
 if(pError)throw pError;
 const shadowByKey=new Map(((shadow??[]) as ScoreRow[]).map(r=>[key(r.viewer_user_id,r.candidate_user_id,r.snapshot_at),r]));
 const pairByKey=new Map(((pairs??[]) as PairRow[]).map(r=>[key(r.viewer_user_id,r.candidate_user_id,r.snapshot_at),r]));
 const examples:AuraTrainingExampleV1[]=[];
 for(const outcome of rows){
  if(!outcome.score_snapshot_id)continue;
  const activeScore=activeById.get(outcome.score_snapshot_id);
  if(!activeScore)continue;
  const k=key(activeScore.viewer_user_id,activeScore.candidate_user_id,activeScore.snapshot_at);
  const shadowScore=shadowByKey.get(k);
  const pair=pairByKey.get(k);
  if(!shadowScore||!pair)continue;
  examples.push(buildAuraTrainingExampleV1({viewerUserId:activeScore.viewer_user_id,candidateUserId:activeScore.candidate_user_id,anchorAt:outcome.anchor_at,windowType,activeScore:activeScore.total_score,shadowScore:shadowScore.total_score,featureSchemaVersion:pair.feature_schema_version,pairFeatures:pair.features,outcome:outcome.outcomes}));
 }
 return examples;
}
