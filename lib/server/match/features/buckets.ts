import type {ActivityAgeBucket,DwellBucket,ImpressionAgeBucket,ProfileCompletenessBucket} from "./types";

const HOUR=60*60*1000;
const DAY=24*HOUR;
export const windowStart=(snapshotAt:string,days:number)=>new Date(new Date(snapshotAt).getTime()-days*DAY).toISOString();
export const isAtOrBefore=(value:string,snapshotAt:string)=>new Date(value).getTime()<=new Date(snapshotAt).getTime();

export function profileCompletenessBucket(photoCount:number,hasBio:boolean,hasCity:boolean):ProfileCompletenessBucket{
  const score=(photoCount>0?1:0)+(hasBio?1:0)+(hasCity?1:0);
  return score<=1?"low":score===2?"medium":"high";
}

export function activityAgeBucket(lastActivity:string|null,snapshotAt:string):ActivityAgeBucket{
  if(!lastActivity)return "30d_plus";
  const age=Math.max(0,new Date(snapshotAt).getTime()-new Date(lastActivity).getTime());
  return age<DAY?"lt_1d":age<3*DAY?"1_3d":age<7*DAY?"3_7d":age<30*DAY?"7_30d":"30d_plus";
}

export function impressionAgeBucket(lastImpression:string|null,snapshotAt:string):ImpressionAgeBucket{
  if(!lastImpression)return "none";
  const age=Math.max(0,new Date(snapshotAt).getTime()-new Date(lastImpression).getTime());
  return age<HOUR?"lt_1h":age<DAY?"1_24h":age<7*DAY?"1_7d":age<30*DAY?"7_30d":"30d_plus";
}

const DWELL_ORDER:Record<DwellBucket,number>={none:0,lt_2s:1,"2_5s":2,"5_15s":3,"15_30s":4,"30s_plus":5};
export function maxDwellBucket(values:string[]):DwellBucket{
  return values.reduce<DwellBucket>((best,value)=>value in DWELL_ORDER&&DWELL_ORDER[value as DwellBucket]>DWELL_ORDER[best]?value as DwellBucket:best,"none");
}

