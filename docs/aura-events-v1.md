# AURA Interaction Events v1

The event layer is append-only shadow telemetry. Discovery, ranking, cooldowns, matches, and chats do not read it.

## Security and identity

- Client events enter through `POST /api/events`.
- Telegram `initData` is validated on the server and mapped through `users.telegram_id` to the internal actor UUID.
- Browser payloads cannot select `actor_user_id`, `source_type`, or server dedupe keys.
- The event table has RLS enabled and no `PUBLIC`, `anon`, or `authenticated` privileges.
- `service_role` has only `SELECT`, `INSERT`, and `DELETE`; no runtime `UPDATE` is allowed.

## Version and retention

- Every v1 event has `schema_version = 1`.
- Raw events are retained for 90 days.
- `cleanup_aura_interaction_events(batch_size)` deletes expired rows in bounded batches and is not scheduled automatically by this migration.
- Deleting either actor or target deletes the linked event through `ON DELETE CASCADE`.

## Client events

| Event | Target/entity | Metadata |
|---|---|---|
| `profile_impression` | target user | `source`, `position_bucket`, optional `photo_index`, `photo_count` |
| `profile_open` | target user | `source` |
| `profile_dwell_bucket` | target user | `source`, coarse `bucket` |
| `return_to_profile` | target user | `source` |
| `meet_viewed` | `meet_event` | none |
| `match_opened` | authorized direct `chat` | none |

Client delivery requires `client_event_id`, accepts at most 10 events and is idempotent by `(actor_user_id, client_event_id)`. Events older than seven days or over five minutes in the future are rejected.

## Server events

`like`, `pass`, `match_created`, `chat_started`, `message_sent_metadata`, `meet_created`, `meet_join_request`, `meet_join_accepted`, `meet_join_rejected`, `meet_chat_joined`, `meet_participant_left`, `meet_cancelled`, `meet_updated`, `block`, and `report` are recorded only by server business routes with deterministic dedupe keys.

## Privacy

Metadata is validated against the centralized catalog. Unknown fields are rejected. Message bodies, reply text, `last_message`, raw text, embeddings, Telegram payloads, secrets, raw addresses, and free-form report text are forbidden. Message telemetry contains only message/chat identifiers and whether the persisted message was the first message.

## Failure isolation

Server event recording is best-effort and observable. A telemetry failure never rolls back a successful like, message, Meet transition, block, or report. Logs include only event name, version, source, result, correlation ID, latency bucket, and safe error code.
