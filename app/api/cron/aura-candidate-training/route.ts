import {NextResponse} from "next/server";
import {materializeAuraLearningCandidateV1} from "../../../../lib/server/match/learning/candidate-training-materializer-v1";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:Request){const secret=process.env.CRON_SECRET;if(!secret||request.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({ok:false,error:"UNAUTHORIZED"},{status:401});try{return NextResponse.json({ok:true,trainedAt:new Date().toISOString(),...(await materializeAuraLearningCandidateV1())});}catch(error){console.error("AURA_CANDIDATE_TRAINING_CRON_FAILED",{code:error instanceof Error?error.message:"UNKNOWN"});return NextResponse.json({ok:false,error:"CANDIDATE_TRAINING_FAILED"},{status:500});}}
