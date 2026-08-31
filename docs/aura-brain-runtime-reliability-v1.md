# AURA Brain Runtime Reliability V1

Production ranking remains Score V2. Shadow V3, read-signal enrichment, and Candidate inference are experimental and must never make the production recommendation batch unavailable.

Runtime guarantees:
- build and persist the production V2 path before shadow work;
- isolate shadow failures per candidate;
- isolate a failed production candidate from the rest of the recommendation batch;
- Candidate registry/inference failures are best-effort and logged;
- no automatic promotion of V3 or Candidate is introduced here.

This boundary is intentionally fail-open for experimental intelligence and fail-isolated per candidate for production scoring.