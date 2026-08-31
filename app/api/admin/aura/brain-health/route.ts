import {NextResponse} from "next/server";
import {authorizeAuraAdmin} from "../../../../../lib/server/admin/aura";
import {loadAuraBrainHealthSummaryV1} from "../../../../../lib/server/match/health/runtime-events-v1";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request){
  try{
    const body=await request.json().catch(()=>null);
    const authorization=authorizeAuraAdmin(body?.initData);
    if(!authorization.ok)return NextResponse.json({ok:false,error:"NOT_FOUND"},{status:404});
    const health=await loadAuraBrainHealthSummaryV1();
    const productionFailures=(health.unresolved as Array<{component:string}>).filter(row=>row.component==="PRODUCTION_V2").length;
    const status=productionFailures>0?"RED":health.retryQueue>0?"YELLOW":"GREEN";
    return NextResponse.json({
      ok:true,
      generatedAt:new Date().toISOString(),
      status,
      productionRanking:"V2",
      automaticPromotion:false,
      ...health,
    });
  }catch(error){
    console.error("AURA_ADMIN_BRAIN_HEALTH_ERROR",{code:error instanceof Error?error.message:"UNKNOWN"});
    return NextResponse.json({ok:false,error:"BRAIN_HEALTH_UNAVAILABLE"},{status:500});
  }
}
