import "server-only";
import {supabaseAdmin} from "../../../supabase-admin";

type WindowType="24h"|"7d"|"30d";
type CandidateRow={window_type:WindowType;status:string;sample_size:number;trained_at:string;evaluation:{verdict?:string;gates?:Record<string,boolean>;metrics?:Record<string,number>}|null};

const WINDOWS:WindowType[]=["24h","7d","30d"];
const MAX_AGE_MS:Record<WindowType,number>={"24h":48*60*60*1000,"7d":9*24*60*60*1000,"30d":32*24*60*60*1000};

export async function evaluateAuraCandidatePromotionGateV1(now=new Date()){
 const rows:Partial<Record<WindowType,CandidateRow>>={};
 for(const windowType of WINDOWS){
  const {data,error}=await supabaseAdmin.from("aura_learning_candidate_versions")
   .select("window_type,status,sample_size,trained_at,evaluation")
   .eq("candidate_version",1)
   .eq("feature_schema_version",2)
   .eq("window_type",windowType)
   .order("trained_at",{ascending:false})
   .limit(1)
   .maybeSingle();
  if(error)throw error;
  if(data)rows[windowType]=data as CandidateRow;
 }

 const windows=Object.fromEntries(WINDOWS.map(windowType=>{
  const row=rows[windowType];
  const ageMs=row?Math.max(0,now.getTime()-new Date(row.trained_at).getTime()):null;
  const fresh=ageMs!==null&&ageMs<=MAX_AGE_MS[windowType];
  const eligible=row?.status==="SHADOW_ELIGIBLE"&&row?.evaluation?.verdict==="SHADOW_ELIGIBLE";
  const gates=row?.evaluation?.gates??{};
  const allOfflineGates=Object.values(gates).length>0&&Object.values(gates).every(Boolean);
  return [windowType,{present:Boolean(row),fresh,eligible,allOfflineGates,sampleSize:row?.sample_size??0,trainedAt:row?.trained_at??null,status:row?.status??"MISSING",verdict:row?.evaluation?.verdict??"MISSING"}];
 }));

 const requiredWindowsReady=WINDOWS.every(windowType=>windows[windowType].present&&windows[windowType].fresh&&windows[windowType].eligible&&windows[windowType].allOfflineGates);
 return {
  version:1,
  evaluatedAt:now.toISOString(),
  verdict:requiredWindowsReady?"READY_FOR_CANARY_REVIEW":"HOLD",
  windows,
  gates:{allWindowsPresent:WINDOWS.every(w=>windows[w].present),allWindowsFresh:WINDOWS.every(w=>windows[w].fresh),allWindowsShadowEligible:WINDOWS.every(w=>windows[w].eligible),allOfflineGatesPassed:WINDOWS.every(w=>windows[w].allOfflineGates)},
  policy:{automaticPromotion:false,nextStep:requiredWindowsReady?"MANUAL_CANARY_REVIEW":"KEEP_SHADOW",productionRanking:"V2"},
 };
}
