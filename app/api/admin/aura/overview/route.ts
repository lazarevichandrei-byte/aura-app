import {NextResponse} from "next/server";
import {authorizeAuraAdmin,getAuraAdminOverviewV1,parseAuraAdminOutcomeWindow,parseAuraAdminTimeframe} from "../../../../../lib/server/admin/aura";

export const runtime="nodejs";

export async function POST(request:Request){
  try{
    const body=await request.json().catch(()=>null);
    const authorization=authorizeAuraAdmin(body?.initData);
    if(!authorization.ok)return NextResponse.json({ok:false,error:"NOT_FOUND"},{status:404});
    const overview=await getAuraAdminOverviewV1({adminTelegramId:authorization.telegramId,timeframe:parseAuraAdminTimeframe(body?.timeframe),outcomeWindow:parseAuraAdminOutcomeWindow(body?.outcomeWindow)});
    return NextResponse.json({ok:true,overview});
  }catch(error){
    console.error("AURA_ADMIN_OVERVIEW_ERROR",{code:error instanceof Error?error.message:"UNKNOWN"});
    return NextResponse.json({ok:false,error:"ADMIN_OVERVIEW_UNAVAILABLE"},{status:500});
  }
}
