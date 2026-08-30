import "server-only";
import {supabaseAdmin} from "../../../supabase-admin";

export type AuraShadowWindow="24h"|"7d"|"30d";
export async function persistAuraShadowEvaluationV1(windowType:AuraShadowWindow,evaluation:{sampleSize:number;verdict:string}){
 const {error}=await supabaseAdmin.from("aura_shadow_evaluation_snapshots").insert({window_type:windowType,evaluated_at:new Date().toISOString(),paired_count:evaluation.sampleSize,verdict:evaluation.verdict,evaluation});
 if(error)throw error;
}
export async function loadAuraShadowEvaluationHistoryV1(limitPerWindow=30){
 const limit=Math.max(1,Math.min(100,limitPerWindow));
 const {data,error}=await supabaseAdmin.from("aura_shadow_evaluation_snapshots").select("window_type,evaluated_at,paired_count,verdict,evaluation").order("evaluated_at",{ascending:false}).limit(limit*3);
 if(error)throw error;
 const result:Record<AuraShadowWindow,unknown[]>={"24h":[],"7d":[],"30d":[]};
 for(const row of data??[]){const w=row.window_type as AuraShadowWindow;if(result[w]&&result[w].length<limit)result[w].push(row);}
 return result;
}
