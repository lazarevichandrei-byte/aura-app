# AURA Match Outcomes V1

AURA Match Outcomes V1 is an internal, deterministic materialization of observable actions after a recommendation exposure. It is an offline evaluation foundation, not a label for compatibility, relationship quality, or safety.

## Anchor and windows

Every row is anchored to a trusted Event Foundation row satisfying all of:

- `event_name = profile_impression`
- `source_type = client`
- `entity_type = user`
- non-null target user

The anchor actor is the viewer and the target is the candidate. Browser-provided actor/target values are never accepted by the builder; it reads the stored event by ID.

V1 has three immutable window types: `24h`, `7d`, and `30d`. Their end is exactly anchor time plus 24 hours, 7 days, or 30 days. Rows are created only after a window is complete. Outcome events satisfy `occurred_at > anchor_at` and `occurred_at <= window_ends_at`; the anchor itself, earlier history, and future events are excluded.

## Exact outcome contract

| Field | V1 semantics |
|---|---|
| `profile_opened` | Viewer opened candidate profile in the window. |
| `return_to_profile` | Viewer returned to candidate profile. |
| `liked` | Viewer liked candidate. Candidate-to-viewer likes do not set it. |
| `passed` | Viewer passed candidate. |
| `matched` | A canonical `match_created` pair event occurred after the anchor. An older match is excluded. |
| `chat_started` | A direct pair `chat_started` event occurred after the anchor. An existing chat alone is not an outcome. |
| `messages_sent_by_viewer` | Viewer metadata-only message events in the canonical direct chat. |
| `messages_sent_by_candidate` | Candidate metadata-only message events in that chat. |
| `shared_meet_activity` | Either directional accepted creator/participant relationship below occurred. |
| `viewer_joined_candidate_meet` | Candidate (creator) accepted viewer into a Meet. |
| `candidate_joined_viewer_meet` | Viewer (creator) accepted candidate into a Meet. |
| `blocked` | Viewer blocked candidate after the anchor. |
| `reported` | Viewer reported candidate after the anchor. |

Meet V1 intentionally uses `meet_join_accepted`; there is no invented `meet_completed`. Block/report fields are observed viewer actions, not a claim that the candidate is unsafe.

## Score linking and causality

The builder selects the latest directional score snapshot satisfying feature schema 1, score version 1, and `snapshot_at <= anchor_at`. A score after the exposure is never linked. If no compatible snapshot exists, all score-link fields are null and the outcome is still materialized.

Score association does not prove that the score caused the exposure or outcome. In Phase 4 shadow mode especially, it is observational offline data. Causal statements require a separately designed randomized experiment.

`anchor_context` copies only the impression's `source` and `position_bucket`. It does not copy photo data or arbitrary metadata.

## Materialization

`processAuraOutcomeBatch` asks a service-only SQL finder for up to 500 completed impression anchors missing the requested window, then builds and persists them with at most ten concurrent workers. The default batch is 100. `evaluatedAt` can be explicit for reproducible runs; the service supplies server time only when omitted.

Rows are append-only and unique on `(anchor_event_id, outcome_schema_version, window_type)`. A duplicate insert returns the existing row; historical outcomes are never updated. No cron is created in Phase 5.

Raw Event Foundation rows have 90-day retention. Operational scheduling must materialize completed outcomes—especially the 30-day window—before required non-anchor events are removed. Running each completed window processor at least daily, with backlog monitoring, is the intended later production cadence.

## Indexes and retention

Existing event indexes separately cover actor-time, target-time, and name-time. V1 adds a targeted partial index on `(actor_user_id, target_user_id, event_name, occurred_at)` for target-bearing events because outcome evaluation repeatedly applies that combined directional window predicate. Metadata-only messages use actor/time filtering and a join to the canonical direct-chat pair.

Outcome rows are retained for 365 days from materialization. `cleanup_aura_match_outcomes` deletes bounded batches of at most 10,000. To reconcile that retention with the required cascading anchor FK, event cleanup skips only impression anchors currently referenced by retained outcomes; after outcome cleanup, those anchors become eligible for normal event cleanup. All other raw events retain the 90-day policy. Account or explicit anchor-event deletion cascades to outcomes; score snapshot deletion only clears the optional FK.

## Security and privacy

RLS is enabled. `PUBLIC`, `anon`, and `authenticated` have no table or builder access. `service_role` has only table `SELECT`, `INSERT`, and `DELETE`, plus builder/finder/cleanup execution; no `UPDATE` is granted.

V1 reads no message body, report body, coordinates, bio text, embeddings, or sensitive inferred traits. Outcomes store boolean observations and message metadata counts only. No product API or UI receives these rows.

## Metrics helpers

Pure helpers calculate impression count and open, like, pass, match, chat-start, Meet-activity, block, and report rates. Another helper groups joined score/outcome inputs into fixed buckets: `0-19`, `20-39`, `40-59`, `60-79`, and `80-100`. The outcome row does not duplicate total score; analysis obtains it through the optional score FK.

## Known limitations

- Client impression/open/return events inherit client instrumentation quality.
- Materialization cannot recover source events already removed by retention.
- Message counting depends on metadata events and their canonical direct-chat link.
- Meet activity means an accepted participation relationship, not attendance or completion.
- Multiple impressions can each become anchors; Event Foundation client-event idempotency deduplicates the same event, while each distinct exposure remains independently evaluable.
- Associations are observational and are not experiment results.
