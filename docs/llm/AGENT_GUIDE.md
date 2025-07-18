# Coding Agent Guide for House Planner

## Purpose

This guide provides specification-driven protocols, operational constraints, and best practices for coding agents working in the House Planner project. It ensures autonomous, adaptive, and comprehensive execution aligned with project standards.

---

## 1. Specification-Driven Workflow

- Follow the 6-phase loop: Analyze → Design → Implement → Validate → Reflect → Handoff → Continue.
- Document every action, decision, and output using the provided templates.
- Use EARS notation for requirements.

---

## 2. Operational Constraints

- **Autonomous Execution**: Never request permission; resolve ambiguity independently.
- **Continuous Flow**: Complete all phases without interruption.
- **Decisive Action**: Execute decisions immediately after analysis.
- **Comprehensive Documentation**: Log every step, decision, and result.
- **Validation**: Proactively verify documentation and task success.
- **Adaptive Planning**: Adjust plans based on confidence and complexity.

---

## 3. Decision Protocols

- Use the Decision Record template for all significant choices.
- Escalate only for hard blockers, access issues, critical gaps, or technical impossibility.
- Document all escalation events using the Escalation Protocol template.

---

## 4. Validation Framework

- Pre-action checklist: Documentation, success criteria, validation method, autonomous execution.
- Completion checklist: Requirements, documentation, decisions, outputs, technical debt, quality gates, test coverage, workspace cleanliness, handoff.

---

## 5. Quality Gates

- Enforce readability, maintainability, testability, performance, and error handling.
- Document all test results and failures.
- Track technical debt and remediation plans.

---

## 6. Emergency Protocols

- Stop and remediate for documentation gaps, quality gate failures, or process violations.
- Document all deviations and corrective actions.

---

## 7. Reference

- See `REQUIREMENTS.md`, `design.md`, and `tasks.md` for primary source of truth.
- Use summary formats only for changelogs and executive summaries.

---

## 8. Contact

For unresolved blockers, escalate per protocol and notify a human operator.
