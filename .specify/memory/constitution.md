<!--
Sync Impact Report
Version change: 0.0.0 → 1.0.0
Modified principles: (none → established) Clarity Over Complexity; Russian-Market Relevance; User-Centric Design; Transparency of Data; Moderated Community Contribution; Incremental Development; Frontend-Only Independence
Added sections: Platform Scope & Constraints; Development Workflow & Quality Gates
Removed sections: None (template placeholders replaced)
Templates requiring updates: .specify/templates/plan-template.md ✅; .specify/templates/spec-template.md ✅; .specify/templates/tasks-template.md ✅; .specify/templates/agent-file-template.md ⚠ (no constitution-dependent edits needed now)
Follow-up TODOs: None
-->
# Marusya Space Constitution

## Core Principles

### I. Clarity Over Complexity
Every artifact (UI, copy, data model, roadmap) MUST prefer clear, structured information over feature bloat. Navigation, filters, and labels MUST remain minimal and self-explanatory in Russian first; advanced options require explicit user value. Reject features that add cognitive load without measurable benefit to primary journeys (tool discovery, comparison, and access guidance).

### II. Russian-Market Relevance
All content MUST account for Russian users’ constraints: surface VPN requirements, regional blocks, SIM/ID verification needs, payment barriers, and language availability. For each tool, flag whether it works without VPN, supports Russian UI, and accepts local payment methods or free tiers.

### III. User-Centric Design
Design for non-technical users: avoid jargon, provide short guidance in Russian, and ensure primary flows work on mobile. Default journeys MUST allow a user to find and attempt to use a relevant tool within two clicks from landing (select category → see action steps). Empty/error states MUST propose clear next steps instead of technical messages.

### IV. Transparency of Data
Each tool entry MUST state: availability status (e.g., “works via VPN only”), pricing model (free tier, trial, paid), access requirements (account, phone/ID, payment), and notable limitations. List the date of last validation for availability/pricing. Unknown facts MUST be marked as “Не проверено” rather than omitted.

### V. Moderated Community Contribution
Community suggestions are welcome but NEVER auto-published. All edits and new tool proposals go through manual review with a human approver, recorded decision, and reasons for rejection when applicable. Provide users a clear path to flag issues, but moderation queues MUST stay human-driven.

### VI. Incremental Development
Ship in small, testable slices that deliver user value (e.g., a single curated category with verified tools) before expanding. Defer speculative features until a prior increment is validated. Each release MUST preserve existing user journeys; regressions to clarity, transparency, or Russian accessibility are not allowed.

### VII. Frontend-Only Independence
The platform MUST run without mandatory backend dependencies in early/mid stages: static or edge-hosted data sources, client-side filtering, and static moderation queues are acceptable. Progressive enhancement is allowed, but core browsing and transparency data MUST remain available offline-capable or from static hosting.

## Platform Scope & Constraints

- Audience: students, designers, developers, creators, and everyday users exploring AI tools.
- Scope: AI tools catalog with guided access steps; not a news portal or education site.
- Content boundaries: no volume race; favor curated, verified listings with Russian-language guidance.
- Accessibility: Russian copy by default; optimize for low-latency access under VPN/limited bandwidth.
- Data hygiene: unverified claims are labeled; regional restrictions are explicitly shown.

## Development Workflow & Quality Gates

- Discovery flows MUST remain two-click simple (landing → category → actionable tool list).
- Each feature spec MUST state how it preserves Russian-market relevance and transparency fields.
- Copy reviews check for jargon and ensure Russian-first phrasing with plain guidance.
- Releases require a check that community contributions remain human-moderated and cannot bypass review.
- No feature ships without an incremental MVP slice demonstrable without backend reliance.

## Governance

- This constitution supersedes conflicting practices. The project lead approves amendments after contributor input.
- Amendment procedure: draft change → review against principles → lead approval → version bump with change log and date.
- Versioning: semantic. MAJOR for principle redefinitions/removals; MINOR for new principles/sections; PATCH for clarifications.
- Compliance: every PR/plan/spec MUST document constitution alignment in “Constitution Check”; reviewers block merges on violations.
- Documentation links: runtime guidance in repo MUST mirror principles; outdated guidance triggers a PATCH amendment or cleanup task.

**Version**: 1.0.0 | **Ratified**: 2025-12-13 | **Last Amended**: 2025-12-13
