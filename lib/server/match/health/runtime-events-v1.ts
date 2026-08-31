import "server-only";
import {supabaseAdmin} from "../../../supabase-admin";

export type AuraBrainComponentV1="PRODUCTION_V2"|"READ_SIGNALS"|"SHADOW_V3"|"CANDIDATE"|"CANDIDATE_REGISTRY";
export type AuraBrainSeverityV1="INFO"|"WARN"|"ERROR";

export type AuraBrainRuntimeEventV1={
  component:AuraBrainComponentV1;
  stage:string;
  severity?:AuraBrainSeverityV1;
  code:string;
  viewerUserId?:string|null;
  candidateUserId?:string|null;
  snapshotAt?:string|null;
  retryable?:boolean;
  metadata?:Record<string,unknown>;
};

export type AuraBrainRetryRowV1={
  id:string;
  component:AuraBrainComponentV1;
  stage:string;
  code:string;
  viewerUserId:string|null;
  candidateUserId:string|null;
  snapshotAt:string|null;
  retryAttempts:number;
};

const sanitizeMetadata=(metadata:Record<string,unknown>|undefined)=>{
  if(!metadata)return {};
  const safe:Record<string,unknown>={};
  for(const [key,value] of Object.entries(metadata)){
    if(/message|text|body|content|bio|prompt/i.test(key))continue;
    if(value===null||typeof value==="string"||typeof value==="number"||typeof value==="boolean")safe[key]=value;
  }
  return safe;
};

export async function recordAuraBrainRuntimeEventV1(event:AuraBrainRuntimeEventV1):Promise<void>{
  try{
    const {error}=await supabaseAdmin.from("aura_brain_runtime_events").insert({
      component:event.component,
      stage:event.stage,
      severity:event.severity??"ERROR",
      code:event.code.slice(0,200),
      viewer_user_id:event.viewerUserId??null,
      candidate_user_id:event.candidateUserId??null,
      snapshot_at:event.snapshotAt??null,
      retryable:event.retryable??false,
      next_retry_at:event.retryable?new Date(Date.now()+5*60_000).toISOString():null,
      metadata:sanitizeMetadata(event.metadata),
    });
    if(error&&error.code!=="23505")console.warn("AURA_BRAIN_HEALTH_EVENT_WRITE_FAILED",{code:error.code});
  }catch(error){
    console.warn("AURA_BRAIN_HEALTH_EVENT_WRITE_FAILED",{code:error instanceof Error?error.message:"UNKNOWN"});
  }
}

export async function loadDueAuraBrainRetriesV1(limit=25):Promise<AuraBrainRetryRowV1[]>{
  const bounded=Math.max(1,Math.min(100,limit));
  const {data,error}=await supabaseAdmin.from("aura_brain_runtime_events")
    .select("id,component,stage,code,viewer_user_id,candidate_user_id,snapshot_at,retry_attempts")
    .eq("retryable",true)
    .is("resolved_at",null)
    .lte("next_retry_at",new Date().toISOString())
    .lt("retry_attempts",3)
    .order("next_retry_at",{ascending:true})
    .limit(bounded);
  if(error)throw error;
  return (data??[]).map(row=>({
    id:row.id,
    component:row.component as AuraBrainComponentV1,
    stage:row.stage,
    code:row.code,
    viewerUserId:row.viewer_user_id,
    candidateUserId:row.candidate_user_id,
    snapshotAt:row.snapshot_at,
    retryAttempts:row.retry_attempts,
  }));
}

export async function resolveAuraBrainRuntimeEventV1(id:string):Promise<void>{
  const {error}=await supabaseAdmin.from("aura_brain_runtime_events").update({resolved_at:new Date().toISOString(),next_retry_at:null}).eq("id",id);
  if(error)throw error;
}

export async function rescheduleAuraBrainRuntimeEventV1(id:string,currentAttempts:number,code:string):Promise<void>{
  const nextAttempts=currentAttempts+1;
  const delays=[5*60_000,30*60_000,2*60*60_000];
  const exhausted=nextAttempts>=3;
  const {error}=await supabaseAdmin.from("aura_brain_runtime_events").update({
    retry_attempts:nextAttempts,
    code:code.slice(0,200),
    next_retry_at:exhausted?null:new Date(Date.now()+delays[Math.min(nextAttempts,delays.length-1)]).toISOString(),
    retryable:!exhausted,
  }).eq("id",id);
  if(error)throw error;
}

export async function loadAuraBrainHealthSummaryV1(){
  const since24h=new Date(Date.now()-24*60*60_000).toISOString();
  const since7d=new Date(Date.now()-7*24*60*60_000).toISOString();
  const [{data:day,error:dayError},{data:week,error:weekError},{data:open,error:openError}]=await Promise.all([
    supabaseAdmin.from("aura_brain_runtime_events").select("component,severity,retryable,resolved_at,occurred_at").gte("occurred_at",since24h),
    supabaseAdmin.from("aura_brain_runtime_events").select("component,severity,retryable,resolved_at,occurred_at").gte("occurred_at",since7d),
    supabaseAdmin.from("aura_brain_runtime_events").select("id,component,stage,severity,code,viewer_user_id,candidate_user_id,snapshot_at,retryable,retry_attempts,next_retry_at,occurred_at").is("resolved_at",null).order("occurred_at",{ascending:false}).limit(100),
  ]);
  if(dayError)throw dayError;
  if(weekError)throw weekError;
  if(openError)throw openError;

  const summarize=(rows:Array<{component:string;severity:string;retryable:boolean;resolved_at:string|null;occurred_at:string}>)=>{
    const byComponent:Record<string,number>={};
    for(const row of rows)byComponent[row.component]=(byComponent[row.component]??0)+1;
    return {total:rows.length,byComponent};
  };

  return {
    last24h:summarize(day??[]),
    last7d:summarize(week??[]),
    unresolved:open??[],
    retryQueue:(open??[]).filter(row=>row.retryable).length,
  };
}
