---
title: "Don’t Ask AI to Write Tests. Make AI Your QA Engineer."
date: "2026-08-01T12:00:00.000Z"
lang: "en"
image: "/media/linkedin/li-a98ba1f5164f.webp"
source: "https://www.linkedin.com/pulse/dont-ask-ai-write-tests-make-your-qa-engineer-chonghuan-wang-ctemf"
---

For a small team—or even a one-person company—writing and maintaining hundreds or thousands of fixed, mechanical automated test cases is no longer realistic. This is especially true when the product is evolving quickly. Keeping AI-generated test code accurate and reliable still requires substantial human review, correction, and maintenance, turning automation into yet another form of manual work.

Can we bypass the traditional approach of maintaining test code altogether?

The real change required here is conceptual: instead of treating AI as a tool that helps humans write test code, we should treat it as a proactive, intelligent QA engineer.

Test points are the tasks assigned to it. Pass criteria define what it is responsible for verifying. Browsers, databases, logs, and computing resources are the tools available to it. Test code is simply an implementation detail that it creates temporarily to complete the task—not the final product that humans need to maintain.

![Article content](https://media.licdn.com/dms/image/v2/D4D12AQG4Cit01SSdGA/article-inline_image-shrink_1000_1488/B4DZ.8czCTIIAI-/0/1785573098785?e=1788393600&v=beta&t=iSeXj6USd7HIjuMge7W3cI6jByB-ir1t3rQDjxK54JA)

Under this model, humans no longer ask AI to write complete test scripts. They only define the broad areas that need to be tested: whether the UI matches the design, whether a feature works correctly, or whether a business rule is satisfied.

UI consistency can be verified by comparing the actual interface with the design or reference screenshots. For functional testing, humans provide basic fixtures and a few hundred test points. **Each test point needs only two sentences: one describing the requirement to be verified, and one defining what counts as a pass.**

At runtime, the AI calls browsers, databases, and computing resources itself. It interprets the testing objective, constructs the required data, performs the necessary actions, evaluates the result, and cleans up the environment afterwards. Humans no longer need to manage how test data is created or removed, or how the underlying test code is written, organised, and stored.

The AI can reuse previously generated test implementations where useful, but this code is no longer an asset that humans must maintain over the long term. If a test fails, the product structure changes, or the natural-language test point is updated, the AI can immediately regenerate the test code and test data to verify the current requirement accurately.

The assets that need to be preserved and maintained are no longer the test scripts themselves, but the fixtures, testing objectives, and pass criteria. Test code becomes a temporary runtime implementation generated for the current state of the system.

This approach cannot replace unit testing. Stable and deterministic tests are still necessary for low-level calculations, permissions, data integrity, and critical business rules. Its main purpose is to replace large numbers of fragile, repetitive, and expensive-to-maintain end-to-end tests.
