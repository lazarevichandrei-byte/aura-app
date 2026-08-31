import {NextResponse} from "next/server";
import {recoverAuraBrainRuntimeV1} from "../../../../lib/server/match/health/recovery-v1";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(request:Request){
  const secret=process.env.CRON_SECRET;
  if(!secret||request.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({ok:false,error:"UNAUTHORIZED"},{status:401});
  try{
    return NextResponse.json({ok:true,ranAt:new Date().toISOString(),...(await recoverAuraBrainRuntimeV1(25))});
  }catch(error){
    console.error("AURA_BRAIN_RECOVERY_CRON_FAILED",{code:error instanceof Error?error.message:"UNKNOWN"});
    return NextResponse.json({ok:false,error:"BRAIN_RECOVERY_FAILED"},{status:500});
  }
}
