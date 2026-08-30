import {NextResponse} from "next/server";
import {authorizeAuraAdmin} from "../../../../../lib/server/admin/aura";
import {supabaseAdmin} from "../../../../../lib/supabase-admin";
import {buildAuraTrainingExampleV1} from "../../../../../lib/server/match/learning/training-example-v1";

export const runtime="nodejs";
export const dynamic="force-dynamic";

type OutcomeRow={viewer_user_id:string;candidate_user_id:string;window_type:"24h"|"7d"|"30d";anchor_at:string;score_snapshot_id:string|null;outcomes:Record<string,unknown>};
type ScoreRow={id:string;viewer_user_id:string;candidate_user_id:string;feature_schema_version:number;score_version:number;snapshot_at:string;total_score:number};
type PairRow={viewer_user_id:string;candidate_user_id:string;feature_schema_version:number;snapshot_at:string;features:Record<string,unknown>};
const key=(a:string,b:string,t:string)=>`${a}:${b}:${t}`;

export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>null);
  const authorization=authorizeAuraAdmin(body?.initData);
  if(!authorization.ok)return NextResponse.json({ok:false,error:"NOT_FOUND"},{status:404});
  const windowType=body?.windowType==="7d"||body?.windowType==="30d"?body.windowType:"24h";
  const limit=Math.max(1,Math.min(2000,Number(body?.limit)||500));
  const {data:outcomes,error:oError}=await supabaseAdmin.from("aura_match_outcomes").select("viewer_user_id,candidate_user_id,window_type,anchor_at,score_snapshot_id,outcomes").eq("window_type",windowType).eq("is_window_complete",true).not("score_snapshot_id","is",null).order("evaluated_at",{ascending:false}).limit(limit);
  if(oError)throw oError;
  const rows=(outcomes??[]) as OutcomeRow[];
  const ids=[...new Set(rows.map(r=>r.score_snapshot_id).filter(Boolean))] as string[];
  if(!ids.length)return NextResponse.json({ok:true,windowType,count:0,examples:[],policy:{export:"admin-only",productionMutation:false}});
  const {data:active,error:aError}=await supabaseAdmin.from("aura_match_score_snapshots").select("id,viewer_user_id,candidate_user_id,feature_schema_version,score_version,snapshot_at,total_score").in("id",ids).eq("score_version",2);
  if(aError)throw aError;
  const activeRows=(active??[]) as ScoreRow[]; const activeById=new Map(activeRows.map(r=>[r.id,r]));
  const times=[...new Set(activeRows.map(r=>r.snapshot_at))];
  const [{data:shadow,error:sError},{data:pairs,error:pError}]=await Promise.all([
   times.length?supabaseAdmin.from("aura_match_score_snapshots").select("id,viewer_user_id,candidate_user_id,feature_schema_version,score_version,snapshot_at,total_score").eq("score_version",3).in("snapshot_at",times).limit(5000):Promise.resolve({data:[],error:null}),
   times.length?supabaseAdmin.from("aura_pair_feature_snapshots").select("viewer_user_id,candidate_user_id,feature_schema_version,snapshot_at,features").eq("feature_schema_version",2).in("snapshot_at",times).limit(5000):Promise.resolve({data:[],error:null}),
  ]);
  if(sError)throw sError;if(pError)throw pError;
  const shadowByKey=new Map(((shadow??[]) as ScoreRow[]).map(r=>[key(r.viewer_user_id,r.candidate_user_id,r.snapshot_at),r]));
  const pairByKey=new Map(((pairs??[]) as PairRow[]).map(r=>[key(r.viewer_user_id,r.candidate_user_id,r.snapshot_at),r]));
  const examples=[];
  for(const outcome of rows){
   if(!outcome.score_snapshot_id)continue; const a=activeById.get(outcome.score_snapshot_id); if(!a)continue;
   const k=key(a.viewer_user_id,a.candidate_user_id,a.snapshot_at); const s=shadowByKey.get(k); const p=pairByKey.get(k); if(!s||!p)continue;
   examples.push(buildAuraTrainingExampleV1({viewerUserId:a.viewer_user_id,candidateUserId:a.candidate_user_id,anchorAt:outcome.anchor_at,windowType,activeScore:a.total_score,shadowScore:s.total_score,featureSchemaVersion:p.feature_schema_version,pairFeatures:p.features,outcome:outcome.outcomes}));
  }
  return NextResponse.json({ok:true,generatedAt:new Date().toISOString(),windowType,count:examples.length,examples,policy:{export:"admin-only",rawMessagesIncluded:false,productionMutation:false,automaticPromotion:false}});
 }catch(error){console.error("AURA_ADMIN_TRAINING_DATASET_ERROR",{code:error instanceof Error?error.message:"UNKNOWN"});return NextResponse.json({ok:false,error:"TRAINING_DATASET_UNAVAILABLE"},{status:500});}
}
