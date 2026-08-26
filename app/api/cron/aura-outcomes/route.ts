import {NextResponse} from "next/server";
import {processAuraOutcomeBatch} from "../../../../lib/server/match/outcomes/service";
import type {AuraOutcomeWindowV1} from "../../../../lib/server/match/outcomes/types";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const WINDOWS:AuraOutcomeWindowV1[]=["24h","7d","30d"];

export async function GET(request:Request){
  const secret=process.env.CRON_SECRET;
  if(!secret||request.headers.get("authorization")!==`Bearer ${secret}`){
    return NextResponse.json({ok:false,error:"UNAUTHORIZED"},{status:401});
  }

  const evaluatedAt=new Date().toISOString();
  const results:Record<string,unknown>={};
  let failed=false;

  for(const windowType of WINDOWS){
    try{
      results[windowType]=await processAuraOutcomeBatch({windowType,batchSize:250,evaluatedAt});
    }catch(error){
      failed=true;
      results[windowType]={error:error instanceof Error?error.message:"OUTCOME_BATCH_FAILED"};
      console.error("AURA_OUTCOME_CRON_FAILED",{windowType,error:error instanceof Error?error.message:"unknown"});
    }
  }

  return NextResponse.json({ok:!failed,evaluatedAt,results},{status:failed?500:200});
}
