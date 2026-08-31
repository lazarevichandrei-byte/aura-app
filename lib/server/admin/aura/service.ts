import "server-only";

import {auraRankingMode} from "../../match/recommendation/service";
import {supabaseAdmin} from "../../../supabase-admin";
import {isAuraAdminOverviewV1} from "./contracts";
import type {AuraAdminOutcomeWindow,AuraAdminOverviewV1,AuraAdminTimeframe} from "./types";

const OUTCOME_WINDOW_MS:Record<AuraAdminOutcomeWindow,number>={"24h":24*60*60_000,"7d":7*24*60*60_000,"30d":30*24*60*60_000};
const OUTCOME_MATERIALIZATION_GRACE_MS=26*60*60_000;

async function hasOverdueOutcomeGapV1(windowType:AuraAdminOutcomeWindow){
  const evaluatedAt=new Date().toISOString();
  const {data:pending,error:pendingError}=await supabaseAdmin.rpc("find_pending_aura_outcome_anchors_v1",{p_window_type:windowType,p_evaluated_at:evaluatedAt,p_batch_size:500});
  if(pendingError)throw pendingError;
  const ids=(pending??[]).map((row:{anchor_event_id:string})=>row.anchor_event_id);
  if(ids.length===0)return false;
  const {data:events,error:eventError}=await supabaseAdmin.from("aura_interaction_events").select("id,occurred_at").in("id",ids);
  if(eventError)throw eventError;
  const overdueBefore=Date.now()-OUTCOME_WINDOW_MS[windowType]-OUTCOME_MATERIALIZATION_GRACE_MS;
  return (events??[]).some(row=>new Date(row.occurred_at).getTime()<overdueBefore);
}

export async function getAuraAdminOverviewV1({adminTelegramId,timeframe,outcomeWindow}:{adminTelegramId:string;timeframe:AuraAdminTimeframe;outcomeWindow:AuraAdminOutcomeWindow}):Promise<AuraAdminOverviewV1>{
  const {data:admin,error:adminError}=await supabaseAdmin.from("users").select("id").eq("telegram_id",adminTelegramId).maybeSingle();
  if(adminError)throw adminError;
  const [{data,error},overdueGap]=await Promise.all([
    supabaseAdmin.rpc("get_aura_admin_overview_v1",{p_timeframe:timeframe,p_outcome_window:outcomeWindow}),
    hasOverdueOutcomeGapV1(outcomeWindow),
  ]);
  if(error)throw error;
  const raw=data as Record<string,unknown>;
  const rawOutcomes=(raw.outcomes??{}) as Record<string,unknown>;
  const overview={
    ...raw,
    outcomes:{...rawOutcomes,health:rawOutcomes.health==="gap"&&!overdueGap?"healthy":rawOutcomes.health},
    ranking:{mode:auraRankingMode(),diagnosticsPersisted:false},
  };
  if(!isAuraAdminOverviewV1(overview))throw new Error("INVALID_AURA_ADMIN_OVERVIEW");
  const audit=await supabaseAdmin.from("aura_admin_audit_log").insert({admin_user_id:admin?.id??null,admin_telegram_id:adminTelegramId,action:"AURA_ADMIN_OVERVIEW_VIEW",target_type:null,target_id:null,metadata:{timeframe,outcome_window:outcomeWindow}});
  if(audit.error)throw audit.error;
  return overview;
}
