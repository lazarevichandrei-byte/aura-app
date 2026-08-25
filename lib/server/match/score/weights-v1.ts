/** Immutable Score V1 constants. Create V2 rather than changing their meaning. */
export const AURA_SCORE_V1_WEIGHTS={
  BASE_SCORE:20,
  TOTAL_MIN:0,
  TOTAL_MAX:100,
  COOLDOWN_CAP:55,
  compatibility:{MAX:20,SAME_CITY:10,AGE_0_2:10,AGE_3_5:7,AGE_6_10:3},
  interest:{MAX:25,VIEWER_LIKE:10,IMPRESSIONS_MAX:2,OPENS_MAX:6,RECENT_OPENS_BONUS:1,RETURNS_MAX:4,DWELL_MAX:7},
  reciprocity:{MAX:20,CANDIDATE_LIKE:12,MUTUAL_LIKE_BONUS:4,SHARED_MEETS_MAX:5,DIRECTIONAL_MEET_MAX:2},
  engagement:{MAX:15,PER_USER_MAX:6,BOTH_ACTIVE_BONUS:3},
  freshness:{MAX:10,IMPRESSION_MAX:4,PER_USER_ACTIVITY_MAX:3},
  safety:{MIN:-10,PER_USER_BLOCK_MAX:3,PER_USER_REPORT_CREATED_MAX:2},
} as const;

export const DWELL_POINTS_V1={none:0,lt_2s:0,"2_5s":1,"5_15s":3,"15_30s":5,"30s_plus":7} as const;
export const IMPRESSION_FRESHNESS_POINTS_V1={none:0,"30d_plus":0,"7_30d":1,"1_7d":2,"1_24h":3,lt_1h:4} as const;
export const ACTIVITY_FRESHNESS_POINTS_V1={"30d_plus":0,"7_30d":1,"3_7d":2,"1_3d":3,lt_1d:3} as const;
