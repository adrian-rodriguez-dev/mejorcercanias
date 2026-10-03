## ADDED Requirements
### Requirement: Reproducible map evidence
The pipeline SHALL preserve official source URLs, hashes, raw maps and reviewed annotations, and export geometry, text, candidates and structured JSON/CSV independently of the web runtime.
#### Scenario: Reviewed corpus
- **WHEN** the pinned maps and GTFS match reviewed hashes
- **THEN** the pipeline reproduces the reviewed inventory and emits a routing correction proposal and evidence viewer.
### Requirement: Source changes require review
The pipeline SHALL report changed maps or GTFS and SHALL NOT promote stale annotations or reuse old legend coordinates as confirmed evidence on changed maps.
#### Scenario: Changed map
- **WHEN** an official map hash changes
- **THEN** raw extraction and a review report remain available while routing corrections remain unchanged.
### Requirement: Preserve boarding point decisions
The pipeline SHALL preserve reviewed separate boarding points and estimated walking policy, including the unnamed C3 endpoint at Los Rosales, without station-specific router logic.
#### Scenario: Los Rosales generation
- **WHEN** its reviewed evidence and route associations are valid
- **THEN** stop 50700 generates separate C1 and C3 points and the configured estimated walking margin.
#### Scenario: Missing boarding point decision
- **WHEN** an existing boarding point correction disappears from the candidate
- **THEN** automatic generation rejects promotion rather than restoring an implicit same-point change.
### Requirement: Auditable scheduled execution
GitHub Actions SHALL support manual and weekly execution with read-only repository permissions, retained artifacts and a visible failure when review is required or acquisition fails.
#### Scenario: Review needed
- **WHEN** validation identifies changed evidence
- **THEN** the workflow uploads the report and extraction artifacts and leaves production data untouched.
