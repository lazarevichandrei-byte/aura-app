import "server-only";
import {evaluateAuraCandidatePromotionGateV1} from "./promotion-gate-v1";

const CACHE_MS=60_000;
let cached:{at:number;ready:boolean}|null=null;

const boundedPercent=(value=process.env.AURA_CANDIDATE_CANARY_PERCENT)=>{
 const parsed=Number(value??0);
 return Number.isFinite(parsed)?Math.max(0,Math.min(10,parsed)):0;
};

const bucket=(value:string)=>{
 let hash=2166136261;
 for(let i=0;i<value.length;i+=1){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);}
 return (hash>>>0)%10_000;
};

async function promotionReady(){
 const now=Date.now();
 if(cached&&now-cached.at<CACHE_MS)return cached.ready;
 const gate=await evaluateAuraCandidatePromotionGateV1(new Date(now));
 const ready=gate.verdict==="READY_FOR_CANARY_REVIEW";
 cached={at:now,ready};
 return ready;
}

export async function candidateCanaryDecisionV1(viewerId:string){
 const percent=boundedPercent();
 if(percent<=0)return {enabled:false,selected:false,percent,reason:"DISABLED" as const};
 const ready=await promotionReady();
 if(!ready)return {enabled:true,selected:false,percent,reason:"PROMOTION_GATE_HOLD" as const};
 const selected=bucket(viewerId)<Math.round(percent*100);
 return {enabled:true,selected,percent,reason:selected?"SELECTED" as const:"CONTROL" as const};
}
