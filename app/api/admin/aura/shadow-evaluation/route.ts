import {NextResponse} from "next/server";
import {authorizeAuraAdmin} from "../../../../../lib/server/admin/aura";
import {supabaseAdmin} from "../../../../../lib/supabase-admin";
import {evaluateShadowV3,type ShadowScorePair} from "../../../../../lib/server/match/evaluation/shadow-v3";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const WINDOWS=["24h","7d","30d"] as const;
type WindowType=typeof WINDOWS[number];
type OutcomeRow={viewer_user_id:string;candidate_user_id:string;window_type:WindowType;score_snapshot_id:string|null;outcomes:ShadowScorePair["outcomes"]};
type ScoreRow={id:string;viewer_user_id:string;candidate_user_id:string;score_version:number;snapshot_at:string;total_score:number};

const key=(viewer:string,candidate:string,snapshotAt:string)=>`${viewer}:${candidate}:${snapshotAt}`;

export async function POST(request:Request){
  try{
    const body=await request.json().catch(()=>null);
    const authorization=authorizeAuraAdmin(body?.initData);
    if(!authorization.ok)return NextResponse.json({ok:false,error:"NOT_FOUND"},{status:404});

    const {data:outcomes,error:outcomeError}=await supabaseAdmin
      .from("aura_match_outcomes")
      .select("viewer_user_id,candidate_user_id,window_type,score_snapshot_id,outcomes")
      .eq("is_window_complete",true)
      .in("window_type",WINDOWS)
      .not("score_snapshot_id","is",null)
      .order("evaluated_at",{ascending:false})
      .limit(3000);
    if(outcomeError)throw outcomeError;

    const scoreIds=[...new Set(((outcomes??[]) as OutcomeRow[]).map(row=>row.score_snapshot_id).filter(Boolean))] as string[];
    if(scoreIds.length===0)return NextResponse.json({ok:true,generatedAt:new Date().toISOString(),windows:Object.fromEntries(WINDOWS.map(window=>[window,evaluateShadowV3([])]))});

    const {data:activeScores,error:activeError}=await supabaseAdmin
      .from("aura_match_score_snapshots")
      .select("id,viewer_user_id,candidate_user_id,score_version,snapshot_at,total_score")
      .in("id",scoreIds)
      .eq("score_version",2);
    if(activeError)throw activeError;

    const active=(activeScores??[]) as ScoreRow[];
    const activeById=new Map(active.map(row=>[row.id,row]));
    const snapshotTimes=[...new Set(active.map(row=>row.snapshot_at))];

    let shadows:ScoreRow[]=[];
    if(snapshotTimes.length){
      const {data,error}=await supabaseAdmin
        .from("aura_match_score_snapshots")
        .select("id,viewer_user_id,candidate_user_id,score_version,snapshot_at,total_score")
        .eq("score_version",3)
        .in("snapshot_at",snapshotTimes)
        .limit(5000);
      if(error)throw error;
      shadows=(data??[]) as ScoreRow[];
    }
    const shadowByKey=new Map(shadows.map(row=>[key(row.viewer_user_id,row.candidate_user_id,row.snapshot_at),row]));

    const grouped=new Map<WindowType,ShadowScorePair[]>(WINDOWS.map(window=>[window,[]]));
    let pairedCount=0;
    for(const outcome of (outcomes??[]) as OutcomeRow[]){
      if(!outcome.score_snapshot_id)continue;
      const activeScore=activeById.get(outcome.score_snapshot_id);
      if(!activeScore)continue;
      const shadowScore=shadowByKey.get(key(activeScore.viewer_user_id,activeScore.candidate_user_id,activeScore.snapshot_at));
      if(!shadowScore)continue;
      grouped.get(outcome.window_type)?.push({activeScore:activeScore.total_score,shadowScore:shadowScore.total_score,outcomes:outcome.outcomes??{}});
      pairedCount++;
    }

    return NextResponse.json({
      ok:true,
      generatedAt:new Date().toISOString(),
      pairedCount,
      windows:Object.fromEntries(WINDOWS.map(window=>[window,evaluateShadowV3(grouped.get(window)??[])])),
      policy:{activeScoreVersion:2,shadowScoreVersion:3,minSampleForVerdict:40,qualityDefinition:"matched OR chat_started OR shared_meet_activity",riskDefinition:"blocked OR reported",promotion:"manual review only; this endpoint never changes production ranking"},
    });
  }catch(error){
    console.error("AURA_ADMIN_SHADOW_EVALUATION_ERROR",{code:error instanceof Error?error.message:"UNKNOWN"});
    return NextResponse.json({ok:false,error:"SHADOW_EVALUATION_UNAVAILABLE"},{status:500});
  }
}
