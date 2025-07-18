# LLM Integration Guide for House Planner

## Purpose

This guide details best practices and protocols for integrating large language models (LLMs) and coding agents into the House Planner project, ensuring context-aware, specification-driven operation.

---

## 1. Context Management

- Maintain lean operational context; summarize logs and outputs, retaining only essential information.
- For large files, use chunked analysis and preserve critical context (imports, class definitions).
- Prioritize analysis of directly mentioned files, recent changes, and dependencies.

---

## 2. Tool Usage Pattern

- Batch related tool calls to optimize performance.
- Implement automatic retries for transient failures.
- Preserve agent state between tool invocations.

---

## 3. Documentation Protocols

- Use detailed templates for all documentation.
- Link all actions, decisions, and outputs to requirements and design artifacts.
- Ensure documentation completeness before proceeding.

---

## 4. Engineering Standards

- Apply SOLID principles, design patterns, and clean code practices.
- Maintain separation of concerns and secure-by-design architecture.
- Document threat models for new features.

---

## 5. Testing Strategy

- E2E, integration, and unit tests with comprehensive logical coverage.
- Automate all tests and document results, failures, and performance baselines.

---

## 6. Escalation Protocol

- Escalate only for hard blockers, access issues, critical gaps, or technical impossibility.
- Document all escalation events and recommended actions.

---

## 7. Reference

- See `AGENT_GUIDE.md` for agent workflow and operational protocols.
- See project root documentation for requirements and design.
