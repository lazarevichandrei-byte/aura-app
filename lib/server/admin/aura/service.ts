import "server-only";

import {auraRankingMode} from "../../match/recommendation/service";
import {supabaseAdmin} from "../../../supabase-admin";
import {isAuraAdminOverviewV1} from "./contracts";
import type {AuraAdminOutcomeWindow,AuraAdminOverviewV1,AuraAdminTimeframe} from "./types";

export async function getAuraAdminOverviewV1({adminTelegramId,timeframe,outcomeWindow}:{adminTelegramId:string;timeframe:AuraAdminTimeframe;outcomeWindow:AuraAdminOutcomeWindow}):Promise<AuraAdminOverviewV1>{
  const {data:admin,error:adminError}=await supabaseAdmin.from("users").select("id").eq("telegram_id",adminTelegramId).maybeSingle();
  if(adminError)throw adminError;
  const {data,error}=await supabaseAdmin.rpc("get_aura_admin_overview_v1",{p_timeframe:timeframe,p_outcome_window:outcomeWindow});
  if(error)throw error;
  const overview={...(data as Record<string,unknown>),ranking:{mode:auraRankingMode(),diagnosticsPersisted:false}};
  if(!isAuraAdminOverviewV1(overview))throw new Error("INVALID_AURA_ADMIN_OVERVIEW");
  const audit=await supabaseAdmin.from("aura_admin_audit_log").insert({admin_user_id:admin?.id??null,admin_telegram_id:adminTelegramId,action:"AURA_ADMIN_OVERVIEW_VIEW",target_type:null,target_id:null,metadata:{timeframe,outcome_window:outcomeWindow}});
  if(audit.error)throw audit.error;
  return overview;
}
