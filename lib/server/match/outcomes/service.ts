import "server-only";

import {supabaseAdmin} from "../../../supabase-admin";
import {buildAuraOutcomeV1} from "./builder-v1";
import {persistAuraOutcomeV1} from "./persistence";
import type {AuraOutcomeWindowV1} from "./types";

export async function processAuraOutcomeBatch({windowType,batchSize=100,evaluatedAt=new Date().toISOString()}:{windowType:AuraOutcomeWindowV1;batchSize?:number;evaluatedAt?:string}){
  const boundedBatchSize=Math.max(1,Math.min(Math.trunc(batchSize),500));
  const {data,error}=await supabaseAdmin.rpc("find_pending_aura_outcome_anchors_v1",{p_window_type:windowType,p_evaluated_at:evaluatedAt,p_batch_size:boundedBatchSize});
  if(error)throw error;
  const anchors=(data??[]) as {anchor_event_id:string}[];
  let next=0;let created=0;let failed=0;
  const worker=async()=>{while(next<anchors.length){const anchor=anchors[next++];try{await persistAuraOutcomeV1(await buildAuraOutcomeV1({anchorEventId:anchor.anchor_event_id,windowType,evaluatedAt}));created+=1;}catch{failed+=1;}}};
  await Promise.all(Array.from({length:Math.min(10,anchors.length)},worker));
  console.info("AURA_OUTCOME_BATCH",{windowType,eligibleCount:anchors.length,createdCount:created,failedCount:failed});
  return {eligibleCount:anchors.length,createdCount:created,failedCount:failed};
}
