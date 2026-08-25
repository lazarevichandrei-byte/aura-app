import assert from "node:assert/strict";
import fs from "node:fs";
import {createRequire} from "node:module";
import path from "node:path";

const outputDirectory=process.argv[2];
if(!outputDirectory)throw new Error("OUTPUT_DIRECTORY_REQUIRED");
const require=createRequire(import.meta.url);
const {scoreAuraMatchV1}=require(path.resolve(outputDirectory,"score/score-v1.js"));
const snapshotAt="2026-08-25T12:00:00.000Z";
const neutralUser={photo_count:1,has_bio:true,has_city:true,profile_completeness_bucket:"high",likes_7d:0,passes_7d:0,matches_30d:0,profile_impressions_received_7d:0,profile_opens_received_7d:0,active_days_7d:0,active_days_30d:0,last_activity_age_bucket:"30d_plus",chats_started_30d:0,messages_sent_30d:0,meet_created_30d:0,meet_join_requests_30d:0,meet_join_accepted_30d:0,meet_participations_30d:0,blocks_created_90d:0,reports_created_90d:0};
const neutralPair={impressions_7d:0,impressions_30d:0,opens_7d:0,opens_30d:0,return_to_profile_30d:0,max_dwell_bucket_30d:"none",recent_impression_age_bucket:"none",prior_like_from_viewer:false,prior_like_from_candidate:false,prior_match:false,prior_reject:false,current_cycle_status:"none",cooldown_active:false,has_existing_direct_chat:false,prior_chat_started:false,shared_meet_count_90d:0,viewer_joined_candidate_meet_90d:false,candidate_joined_viewer_meet_90d:false,age_difference:null,same_city:null};
const score=(pair={},viewer={},candidate={})=>scoreAuraMatchV1({viewerFeatures:{...neutralUser,...viewer},candidateFeatures:{...neutralUser,...candidate},pairFeatures:{...neutralPair,...pair},featureSchemaVersion:1,snapshotAt});

const active={active_days_7d:4,active_days_30d:12,last_activity_age_bucket:"lt_1d",chats_started_30d:1,messages_sent_30d:12,meet_participations_30d:1};
const fixtures=[
  ["empty / neutral",score(),20,{compatibility:0,interest:0,reciprocity:0,engagement:0,freshness:0,safety:0}],
  ["same city + close age",score({same_city:true,age_difference:2}),40,{compatibility:20,interest:0,reciprocity:0,engagement:0,freshness:0,safety:0}],
  ["strong viewer interest",score({prior_like_from_viewer:true}),30,{compatibility:0,interest:10,reciprocity:0,engagement:0,freshness:0,safety:0}],
  ["mutual like",score({prior_like_from_viewer:true,prior_like_from_candidate:true}),46,{compatibility:0,interest:10,reciprocity:16,engagement:0,freshness:0,safety:0}],
  ["high dwell + return",score({return_to_profile_30d:3,max_dwell_bucket_30d:"30s_plus"}),31,{compatibility:0,interest:11,reciprocity:0,engagement:0,freshness:0,safety:0}],
  ["both active",score({},active,active),41,{compatibility:0,interest:0,reciprocity:0,engagement:15,freshness:6,safety:0}],
  ["stale / inactive",score({recent_impression_age_bucket:"30d_plus"}),20,{compatibility:0,interest:0,reciprocity:0,engagement:0,freshness:0,safety:0}],
  ["cooldown active",score({cooldown_active:true,current_cycle_status:"rejected"}),20,{compatibility:0,interest:0,reciprocity:0,engagement:0,freshness:0,safety:0}],
  ["existing chat",score({has_existing_direct_chat:true,prior_chat_started:true}),20,{compatibility:0,interest:0,reciprocity:0,engagement:0,freshness:0,safety:0}],
  ["previous reject",score({prior_reject:true,current_cycle_status:"rejected"}),20,{compatibility:0,interest:0,reciprocity:0,engagement:0,freshness:0,safety:0}],
  ["shared Meet activity",score({shared_meet_count_90d:1,viewer_joined_candidate_meet_90d:true}),23,{compatibility:0,interest:0,reciprocity:3,engagement:0,freshness:0,safety:0}],
];
for(const [name,result,total,components] of fixtures){assert.equal(result.totalScore,total,name);assert.deepEqual(result.components,components,name);assert.equal(result.snapshotAt,snapshotAt);}

assert.deepEqual(score({same_city:true,age_difference:4}),score({same_city:true,age_difference:4}),"fixed input is exactly reproducible");
assert.ok(score({prior_like_from_candidate:true}).totalScore>=score().totalScore,"candidate like monotonic");
assert.ok(score({prior_like_from_viewer:true,prior_like_from_candidate:true}).totalScore>=score({prior_like_from_viewer:true}).totalScore,"mutual like monotonic");
assert.ok(score({max_dwell_bucket_30d:"30s_plus"}).totalScore>=score({max_dwell_bucket_30d:"5_15s"}).totalScore,"dwell monotonic");
assert.ok(score({same_city:true}).totalScore>=score({same_city:false}).totalScore,"city monotonic");
assert.ok(score({recent_impression_age_bucket:"lt_1h"}).components.freshness>=score({recent_impression_age_bucket:"7_30d"}).components.freshness,"interaction recency monotonic");
assert.ok(score({}, {blocks_created_90d:2,reports_created_90d:1}).components.safety<=score().components.safety,"created safety activity cannot improve contribution");
const cooldown=score({cooldown_active:true,same_city:true,age_difference:1,prior_like_from_viewer:true,prior_like_from_candidate:true,opens_30d:5,max_dwell_bucket_30d:"30s_plus"},active,active);
assert.equal(cooldown.flags.cooldownActive,true);assert.ok(cooldown.totalScore<=55,"cooldown cap");
assert.equal(score({prior_match:true}).flags.priorMatch,true);assert.equal(score({has_existing_direct_chat:true}).flags.existingChat,true);

const core=fs.readFileSync(path.resolve(process.cwd(),"lib/server/match/score/score-v1.ts"),"utf8");
assert.doesNotMatch(core,/supabase|Date\.now|Math\.random|from ["'](?:react|next\/|@\/app|@\/components)/);
const orchestrator=fs.readFileSync(path.resolve(process.cwd(),"lib/server/match/score/orchestrator.ts"),"utf8");
assert.match(orchestrator,/const normalizedSnapshotAt=normalizeSnapshotAt\(snapshotAt\)/);
assert.doesNotMatch(orchestrator,/new Date\(\)/);
const migration=fs.readFileSync(path.resolve(process.cwd(),"supabase/migrations/20260825010000_aura_match_score_v1.sql"),"utf8").toLowerCase();
assert.match(migration,/unique \(viewer_user_id,candidate_user_id,feature_schema_version,score_version,snapshot_at\)/);
assert.match(migration,/grant select,insert,delete on table public\.aura_match_score_snapshots to service_role/);
assert.doesNotMatch(migration,/grant[^;]*update/);
console.log("AURA_SCORE_V1_TESTS_PASS");
