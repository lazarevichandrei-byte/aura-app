import assert from "node:assert/strict";
import {pathToFileURL} from "node:url";
import path from "node:path";

const compiledRoot=process.argv[2];
if(!compiledRoot)throw new Error("MISSING_COMPILED_ROOT");
const {scoreAuraMatchV3}=await import(pathToFileURL(path.join(compiledRoot,"score-v3.js")).href);

const user={photo_count:2,has_bio:true,has_city:true,profile_completeness_bucket:"high",likes_7d:0,passes_7d:0,matches_30d:0,profile_impressions_received_7d:0,profile_opens_received_7d:0,active_days_7d:2,active_days_30d:5,last_activity_age_bucket:"lt_1d",chats_started_30d:0,messages_sent_30d:0,meet_created_30d:0,meet_join_requests_30d:0,meet_join_accepted_30d:0,meet_participations_30d:0,blocks_created_90d:0,reports_created_90d:0};
const basePair={impressions_7d:0,impressions_30d:0,opens_7d:0,opens_30d:0,return_to_profile_30d:0,max_dwell_bucket_30d:"none",recent_impression_age_bucket:"none",prior_like_from_viewer:false,prior_like_from_candidate:false,prior_match:false,prior_reject:false,current_cycle_status:"none",cooldown_active:false,has_existing_direct_chat:true,prior_chat_started:true,shared_meet_count_90d:0,viewer_joined_candidate_meet_90d:false,candidate_joined_viewer_meet_90d:false,age_difference:2,same_city:true,direct_message_count_30d:12,viewer_message_count_30d:6,candidate_message_count_30d:6,viewer_avg_message_chars_30d:30,candidate_avg_message_chars_30d:30,viewer_median_message_chars_30d:25,candidate_median_message_chars_30d:25,viewer_long_messages_30d:0,candidate_long_messages_30d:0,viewer_short_messages_30d:1,candidate_short_messages_30d:1,viewer_question_messages_30d:2,candidate_question_messages_30d:2,viewer_meet_intent_messages_30d:0,candidate_meet_intent_messages_30d:0,viewer_median_reply_seconds_30d:30,candidate_median_reply_seconds_30d:30,active_chat_days_30d:2,conversation_span_days:2,longest_viewer_burst:2,longest_candidate_burst:2,message_balance_ratio:1,viewer_started_conversation:true,candidate_started_conversation:false,mutual_conversation:true,viewer_sent_30d:6,candidate_sent_30d:6,viewer_messages_read_by_candidate_30d:6,candidate_messages_read_by_viewer_30d:6,viewer_message_read_rate_30d:1,candidate_message_read_rate_30d:1,viewer_median_read_seconds_30d:20,candidate_median_read_seconds_30d:25,viewer_unread_older_than_24h_30d:0,candidate_unread_older_than_24h_30d:0};
const snapshotAt="2026-08-30T12:00:00.000Z";
const good=scoreAuraMatchV3({viewerFeatures:user,candidateFeatures:user,pairFeatures:basePair,snapshotAt});
assert.equal(good.scoreVersion,3);
assert.equal(good.featureSchemaVersion,2);
assert.equal(good.shadow,true);

const unread=scoreAuraMatchV3({viewerFeatures:user,candidateFeatures:user,pairFeatures:{...basePair,viewer_message_read_rate_30d:0.2,candidate_message_read_rate_30d:0.2,viewer_messages_read_by_candidate_30d:1,candidate_messages_read_by_viewer_30d:1,viewer_unread_older_than_24h_30d:4,candidate_unread_older_than_24h_30d:4},snapshotAt});
assert.ok(good.totalScore>=unread.totalScore);
assert.ok(good.totalScore-unread.totalScore<=3);

const asymmetric=scoreAuraMatchV3({viewerFeatures:user,candidateFeatures:user,pairFeatures:{...basePair,viewer_message_read_rate_30d:1,candidate_message_read_rate_30d:0.1,viewer_messages_read_by_candidate_30d:6,candidate_messages_read_by_viewer_30d:1,viewer_unread_older_than_24h_30d:0,candidate_unread_older_than_24h_30d:5},snapshotAt});
assert.ok(asymmetric.totalScore<=good.totalScore);
console.log("AURA shadow Score V3 tests passed");
