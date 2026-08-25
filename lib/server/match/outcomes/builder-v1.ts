import "server-only";

import {supabaseAdmin} from "../../../supabase-admin";
import {isBuiltAuraOutcomeV1} from "./contracts";
import type {AuraOutcomeWindowV1,BuiltAuraOutcomeV1} from "./types";

export async function buildAuraOutcomeV1({anchorEventId,windowType,evaluatedAt}:{anchorEventId:string;windowType:AuraOutcomeWindowV1;evaluatedAt:string}):Promise<BuiltAuraOutcomeV1>{
  const {data,error}=await supabaseAdmin.rpc("build_aura_match_outcome_v1",{p_anchor_event_id:anchorEventId,p_window_type:windowType,p_evaluated_at:evaluatedAt});
  if(error)throw error;
  if(!isBuiltAuraOutcomeV1(data))throw new Error("INVALID_AURA_OUTCOME_V1");
  return data;
}
