---
title: "TodoClaw: The Execution Engine for Harness Engineering"
date: "2026-03-28T12:00:00.000Z"
lang: "en"
image: "/media/linkedin/li-7508e26d106f.webp"
source: "https://www.linkedin.com/pulse/todoclaw-execution-engine-harness-engineering-chonghuan-wang-cg1sc"
---

At [Narrative](https://www.linkedin.com/company/narrative-banking/) , we have developed [TodoClaw.com](http://todoclaw.com/) as the central orchestration hub and agent for our Harness Engineering ecosystem. A lightweight variant of #OpenClaw , TodoClaw is purpose-built for isolated task execution and comprehensive activity tracking.

By integrating Linear, Notion, GitHub and Ubuntu server through business-logic-aware skills, it creates a unified execution layer for complex project management and engineering workflows.

**● Core Capabilities:**

**Autonomous Multi-Project Development**

Operating on cloud infrastructure with full cross-project permissions, TodoClaw utilizes Codex and Git worktrees to handle multiple feature requests in parallel across various repositories.

**Production Monitoring & Autonomous Remediation**

It actively monitors project error logs. Upon detecting a failure, it autonomously diagnoses the issue, applies code fixes, and submits Pull Requests (PRs) for human review and merging.

**● Automated Quality Assurance:**

**Change-Based Test Generation**

It audits code changes for every ticket and automatically generates relevant new test cases.

**E2E & Regression Management**

It maintains an extensive End-to-End (E2E) test suite and performs scheduled regression testing to ensure system stability.

**● Interaction and Operation:**

**Slack Native**

It functions as a “digital teammate” within Slack, interacting naturally with the human team.

**Skill as a Service**

It exposes its internal reasoning and skills via the tdcchat skill interface, allowing other autonomous agents to call upon its capabilities.

**Deployment & Management**

TodoClaw runs natively in Docker, enabling lightning-fast replication. It also ships with a dedicated web UI that provides full visibility and control over task Kanban boards and skill configurations.
