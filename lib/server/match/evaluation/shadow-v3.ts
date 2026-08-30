export type ShadowScorePair={
  activeScore:number;
  shadowScore:number;
  outcomes:{
    liked?:boolean;
    matched?:boolean;
    chat_started?:boolean;
    shared_meet_activity?:boolean;
    blocked?:boolean;
    reported?:boolean;
  };
};

export type ShadowModelEvaluation={
  sampleSize:number;
  scoreDeltaMean:number;
  scoreDeltaAbsMean:number;
  active:{topQuartileSize:number;bottomQuartileSize:number;topQualityRate:number;bottomQualityRate:number;qualityUplift:number;topRiskRate:number};
  shadow:{topQuartileSize:number;bottomQuartileSize:number;topQualityRate:number;bottomQualityRate:number;qualityUplift:number;topRiskRate:number};
  verdict:"INSUFFICIENT_DATA"|"SHADOW_BETTER"|"ACTIVE_BETTER"|"INCONCLUSIVE";
};

const quality=(row:ShadowScorePair)=>Boolean(row.outcomes.matched||row.outcomes.chat_started||row.outcomes.shared_meet_activity);
const risk=(row:ShadowScorePair)=>Boolean(row.outcomes.blocked||row.outcomes.reported);
const rate=(rows:readonly ShadowScorePair[],fn:(row:ShadowScorePair)=>boolean)=>rows.length===0?0:rows.reduce((n,row)=>n+Number(fn(row)),0)/rows.length;
const round=(value:number,digits=4)=>Number(value.toFixed(digits));

function modelSlice(rows:readonly ShadowScorePair[],key:"activeScore"|"shadowScore"){
  const sorted=[...rows].sort((a,b)=>b[key]-a[key]);
  const quartile=Math.max(1,Math.ceil(sorted.length/4));
  const top=sorted.slice(0,quartile);
  const bottom=sorted.slice(-quartile);
  const topQualityRate=rate(top,quality);
  const bottomQualityRate=rate(bottom,quality);
  return {
    topQuartileSize:top.length,
    bottomQuartileSize:bottom.length,
    topQualityRate:round(topQualityRate),
    bottomQualityRate:round(bottomQualityRate),
    qualityUplift:round(topQualityRate-bottomQualityRate),
    topRiskRate:round(rate(top,risk)),
  };
}

export function evaluateShadowV3(rows:readonly ShadowScorePair[]):ShadowModelEvaluation{
  const sampleSize=rows.length;
  const active=modelSlice(rows,"activeScore");
  const shadow=modelSlice(rows,"shadowScore");
  const scoreDeltaMean=sampleSize?rows.reduce((n,row)=>n+(row.shadowScore-row.activeScore),0)/sampleSize:0;
  const scoreDeltaAbsMean=sampleSize?rows.reduce((n,row)=>n+Math.abs(row.shadowScore-row.activeScore),0)/sampleSize:0;

  let verdict:ShadowModelEvaluation["verdict"]="INCONCLUSIVE";
  if(sampleSize<40)verdict="INSUFFICIENT_DATA";
  else {
    const upliftDelta=shadow.qualityUplift-active.qualityUplift;
    const riskDelta=shadow.topRiskRate-active.topRiskRate;
    if(upliftDelta>=0.03&&riskDelta<=0.01)verdict="SHADOW_BETTER";
    else if(upliftDelta<=-0.03||riskDelta>=0.02)verdict="ACTIVE_BETTER";
  }

  return {sampleSize,scoreDeltaMean:round(scoreDeltaMean),scoreDeltaAbsMean:round(scoreDeltaAbsMean),active,shadow,verdict};
}
