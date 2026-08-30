import "server-only";
import {supabaseAdmin} from "../../../supabase-admin";
import {evaluateShadowV3,type ShadowScorePair} from "./shadow-v3";
import {persistAuraShadowEvaluationV1} from "./shadow-history-v1";

export const AURA_SHADOW_WINDOWS=["24h","7d","30d"] as const;
type WindowType=typeof AURA_SHADOW_WINDOWS[number];
type OutcomeRow={viewer_user_id:string;candidate_user_id:string;window_type:WindowType;score_snapshot_id:string|null;outcomes:ShadowScorePair["outcomes"]};
type ScoreRow={id:string;viewer_user_id:string;candidate_user_id:string;snapshot_at:string;total_score:number};
const key=(v:string,c:string,s:string)=>`${v}:${c}:${s}`;

export async function materializeAuraShadowEvaluationsV1(){
 const {data:outcomes,error}=await supabaseAdmin.from("aura_match_outcomes").select("viewer_user_id,candidate_user_id,window_type,score_snapshot_id,outcomes").eq("is_window_complete",true).in("window_type",AURA_SHADOW_WINDOWS).not("score_snapshot_id","is",null).order("evaluated_at",{ascending:false}).limit(3000);if(error)throw error;
 const rows=(outcomes??[]) as OutcomeRow[];const ids=[...new Set(rows.map(x=>x.score_snapshot_id).filter(Boolean))] as string[];const grouped=new Map<WindowType,ShadowScorePair[]>(AURA_SHADOW_WINDOWS.map(w=>[w,[]]));
 if(ids.length){const {data:a,error:ae}=await supabaseAdmin.from("aura_match_score_snapshots").select("id,viewer_user_id,candidate_user_id,snapshot_at,total_score").in("id",ids).eq("score_version",2);if(ae)throw ae;const active=(a??[]) as ScoreRow[],byId=new Map(active.map(x=>[x.id,x])),times=[...new Set(active.map(x=>x.snapshot_at))];let shadows:ScoreRow[]=[];if(times.length){const {data:s,error:se}=await supabaseAdmin.from("aura_match_score_snapshots").select("id,viewer_user_id,candidate_user_id,snapshot_at,total_score").eq("score_version",3).in("snapshot_at",times).limit(5000);if(se)throw se;shadows=(s??[]) as ScoreRow[];}const byKey=new Map(shadows.map(x=>[key(x.viewer_user_id,x.candidate_user_id,x.snapshot_at),x]));for(const o of rows){if(!o.score_snapshot_id)continue;const av=byId.get(o.score_snapshot_id);if(!av)continue;const sh=byKey.get(key(av.viewer_user_id,av.candidate_user_id,av.snapshot_at));if(sh)grouped.get(o.window_type)?.push({activeScore:av.total_score,shadowScore:sh.total_score,outcomes:o.outcomes??{}});}}
 const evaluations=Object.fromEntries(AURA_SHADOW_WINDOWS.map(w=>[w,evaluateShadowV3(grouped.get(w)??[])])) as Record<WindowType,ReturnType<typeof evaluateShadowV3>>;await Promise.all(AURA_SHADOW_WINDOWS.map(w=>persistAuraShadowEvaluationV1(w,evaluations[w])));return evaluations;
}
