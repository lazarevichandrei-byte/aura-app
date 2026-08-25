# AURA Feature Snapshots v1

Feature snapshots are internal, append-only inputs for a future deterministic scoring phase. Phase 2 does not read snapshots from discovery and does not change ranking.

## Reproducibility and direction

- Every builder receives one explicit UTC `snapshotAt`; every temporal source is bounded by `timestamp <= snapshotAt`.
- Pair features are directional: `viewer_user_id -> candidate_user_id`.
- A persisted `(subject, feature_schema_version, snapshot_at)` is immutable and idempotent.
- Current profile attributes (`photos`, `bio`, `city`, `age`) have no historical table. They represent canonical values at build time; the persisted snapshot is the reproducible record. Historical rebuilding of those four fields is an explicit V1 limitation.

## User features

| Feature | Type | Source | Definition / privacy |
|---|---|---|---|
| `photo_count` | non-negative integer | `users.photos` | Current visible profile photo count. |
| `has_bio` | boolean | `users.bio` | Presence only; bio text is never copied. |
| `has_city` | boolean | `users.city` | Presence only; city value is not copied. |
| `profile_completeness_bucket` | `low/medium/high` | profile presence flags | 0–1 / 2 / 3 completed groups. |
| `likes_7d`, `passes_7d` | count | events `like/pass` | Actor count in `[T-7d,T]`. |
| `matches_30d` | count | `dating_matches` | Canonical matches containing user in `[T-30d,T]`. |
| `profile_impressions_received_7d`, `profile_opens_received_7d` | count | client events | Target count in `[T-7d,T]`. |
| `active_days_7d`, `active_days_30d` | count | actor events | Distinct UTC event dates. |
| `last_activity_age_bucket` | enum | actor events | Most recent trusted event age; no exact timestamp stored in features. |
| `chats_started_30d` | count | `chat_started` event | Actor count in `[T-30d,T]`. |
| `messages_sent_30d` | count | `message_sent_metadata` | Metadata events only; message bodies are never queried. |
| `meet_created_30d`, `meet_join_requests_30d` | count | Meet events | Actor count in `[T-30d,T]`. |
| `meet_join_accepted_30d` | count | `meet_join_accepted` | Accepted user as event target in `[T-30d,T]`. |
| `meet_participations_30d` | count | `meet_participants.joined_at` | Canonical guest memberships joined in window. |
| `blocks_created_90d`, `reports_created_90d` | count | structured events | Actor count; report text is never queried. |

## Pair features

| Feature | Type | Source | Definition / privacy |
|---|---|---|---|
| `impressions_7d/30d`, `opens_7d/30d`, `return_to_profile_30d` | count | directional events | Viewer actor and candidate target only. |
| `max_dwell_bucket_30d` | enum | dwell event metadata | Highest coarse catalog bucket; no raw duration. |
| `recent_impression_age_bucket` | enum | impression events | Coarse age of latest directional impression. |
| `prior_like_from_viewer/candidate` | boolean | dating cycles | Direction derived from canonical initiator. |
| `prior_match`, `prior_reject` | boolean | matches/cycles | Completed no later than T. |
| `current_cycle_status`, `cooldown_active` | enum/boolean | latest dating cycle | State reconstructed at T using created/completed/cooldown timestamps. |
| `has_existing_direct_chat` | boolean | canonical direct chat pair | Chat created no later than T. |
| `prior_chat_started` | boolean | event | Either direction, no later than T. |
| `shared_meet_count_90d` | count | meet creators/participants | Intersection of canonical participation sets. |
| `viewer_joined_candidate_meet_90d` | boolean | meet event + participant | Directional creator/guest relation. |
| `candidate_joined_viewer_meet_90d` | boolean | meet event + participant | Reverse creator/guest relation. |
| `age_difference` | integer/null | visible profile ages | Absolute difference; no inferred age. |
| `same_city` | boolean/null | visible profile cities | Case-insensitive equality only; raw city, coordinates and distance are not stored. |

## Security and retention

- RLS is enabled. `PUBLIC`, `anon`, and `authenticated` have no table or function access.
- `service_role` has table `SELECT/INSERT/DELETE` and builder/cleanup `EXECUTE`; snapshots cannot be updated.
- User foreign keys use `ON DELETE CASCADE`; deleting either pair member removes pair history.
- `cleanup_aura_feature_snapshots` removes snapshots older than 180 days in bounded batches. No cron is created.

