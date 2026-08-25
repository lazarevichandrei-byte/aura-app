import assert from "node:assert/strict";
import fs from "node:fs";
import {createRequire} from "node:module";
import path from "node:path";

const outputDirectory=process.argv[2];
if(!outputDirectory)throw new Error("OUTPUT_DIRECTORY_REQUIRED");
const require=createRequire(import.meta.url);
const {isAuraUserFeaturesV1,isAuraPairFeaturesV1}=require(path.resolve(outputDirectory,"contracts.js"));
const {activityAgeBucket,impressionAgeBucket,maxDwellBucket,profileCompletenessBucket,isAtOrBefore}=require(path.resolve(outputDirectory,"buckets.js"));
const {normalizeSnapshotAt}=require(path.resolve(outputDirectory,"time.js"));

const user={photo_count:1,has_bio:true,has_city:true,profile_completeness_bucket:"high",likes_7d:0,passes_7d:0,matches_30d:0,profile_impressions_received_7d:0,profile_opens_received_7d:0,active_days_7d:0,active_days_30d:0,last_activity_age_bucket:"30d_plus",chats_started_30d:0,messages_sent_30d:0,meet_created_30d:0,meet_join_requests_30d:0,meet_join_accepted_30d:0,meet_participations_30d:0,blocks_created_90d:0,reports_created_90d:0};
const pair={impressions_7d:0,impressions_30d:0,opens_7d:0,opens_30d:0,return_to_profile_30d:0,max_dwell_bucket_30d:"none",recent_impression_age_bucket:"none",prior_like_from_viewer:false,prior_like_from_candidate:false,prior_match:false,prior_reject:false,current_cycle_status:"none",cooldown_active:false,has_existing_direct_chat:false,prior_chat_started:false,shared_meet_count_90d:0,viewer_joined_candidate_meet_90d:false,candidate_joined_viewer_meet_90d:false,age_difference:null,same_city:null};
assert.equal(isAuraUserFeaturesV1(user),true);
assert.equal(isAuraUserFeaturesV1({...user,unknown:1}),false);
assert.equal(isAuraPairFeaturesV1(pair),true);
assert.equal(isAuraPairFeaturesV1({...pair,impressions_7d:-1}),false);
assert.equal(profileCompletenessBucket(0,false,false),"low");
assert.equal(profileCompletenessBucket(1,true,false),"medium");
assert.equal(profileCompletenessBucket(1,true,true),"high");
const snapshotAt="2026-08-25T12:00:00.000Z";
assert.equal(normalizeSnapshotAt(snapshotAt),snapshotAt);
assert.equal(activityAgeBucket("2026-08-24T12:00:00.001Z",snapshotAt),"lt_1d");
assert.equal(activityAgeBucket("2026-08-24T12:00:00.000Z",snapshotAt),"1_3d");
assert.equal(impressionAgeBucket("2026-08-25T11:00:00.001Z",snapshotAt),"lt_1h");
assert.equal(impressionAgeBucket(null,snapshotAt),"none");
assert.equal(maxDwellBucket(["2_5s","lt_2s","30s_plus"]),"30s_plus");
assert.equal(isAtOrBefore("2026-08-25T12:00:00.000Z",snapshotAt),true);
assert.equal(isAtOrBefore("2026-08-25T12:00:00.001Z",snapshotAt),false);

const migration=fs.readFileSync(path.resolve(process.cwd(),"supabase/migrations/20260825000000_aura_feature_snapshots_v1.sql"),"utf8").toLowerCase();
assert.match(migration,/actor_user_id=p_user_id and occurred_at<=p_snapshot_at/);
assert.match(migration,/target_user_id=p_user_id and occurred_at<=p_snapshot_at/);
assert.match(migration,/actor_user_id=p_viewer_user_id and target_user_id=p_candidate_user_id[\s\S]*occurred_at<=p_snapshot_at/);
assert.match(migration,/viewer_user_id<>candidate_user_id/);
assert.doesNotMatch(migration,/messages\.body|messages\.text|select[^;]*from public\.messages/);
assert.match(migration,/raise exception 'self_pair_not_allowed'/);
console.log("AURA_FEATURE_SNAPSHOT_TESTS_PASS");
