---
title: "Abstraction Patterns and Anti-Patterns in Software Design from a Category Theory Perspective"
date: "2026-06-15T12:00:00.000Z"
lang: "en"
image: "/media/linkedin/li-aa178dbfa9a9.webp"
source: "https://www.linkedin.com/pulse/abstraction-patterns-anti-patterns-software-design-from-wang-cua5f"
---

I used to think that Single Source of Truth in software development was merely an engineering habit. Now I realize it is actually the core structural foundation of software development.

When faced with a new requirement, the most important step is not to start coding immediately, but to determine which authoritative object this new fact, state, or constraint should belong to: Should we reuse an existing Source of Truth, create a new one, or update the existing one along with all its derived paths?

Much of the work in software development essentially involves building traceable, composable, and updatable paths around these authoritative facts, ensuring that different paths—UI, API, cache, reports, permissions, tests—ultimately align. In other words, Single Source of Truth is not simply about “avoiding data duplication”; it is the structural core that determines whether the entire system can close, remain consistent, and evolve sustainably over time.

**Reframing Software Design through Category Theory: Universal Property**

Using the language of category theory, we can understand “universal property” (泛性质) in an engineering context as the **unique standard mediator** for a certain class of system tasks.

Thus, software development can be reframed as: finding, creating, updating, and using the standard structure for a class of tasks within the system.

![Article content](https://media.licdn.com/dms/image/v2/D4D12AQF_iEqwt8ZIaA/article-inline_image-shrink_1000_1488/B4DZ7MfhL.GwAM-/0/1781547297988?e=1788393600&v=beta&t=9T5F6zRVO06fiB1bHEvPdkm_ZE3snmB__COlQmIU7mo)

**Four Core Operations**

**1. Searching for Universal Property**

When a requirement arrives, first check whether an existing standard object in the system can carry it. For example:

- Is the permission fact already determined by the UserRole → Role ← RolePermission structure?

- Is the amount already determined by the Ledger?

- Is the state already determined by the State Machine?

**2. Creating Universal Property**

If none exists, we need to create a new standard object. For instance, when introducing an approval flow, you should not scatter the approval state across pages, notifications, background tasks, and reports. Instead, establish a clear ApprovalState or ApprovalWorkflow so that all related paths go through it.

**3. Updating Universal Property**

When requirements change the original fact structure—for example, evolving permissions from RBAC to RBAC + Condition—the existing standard mediator becomes insufficient. Instead of patching if-else statements everywhere, update the authoritative structure so that all derived paths re-close consistently.

**4. Using Universal Property**

Business logic, APIs, caches, UIs, reports, and tests should not reinvent the truth. They should consume this standard object through projections, queries, derived views, event streams, and interface calls.

**Why These Constructs Are So Critical**

This is why constructs like Single Source of Truth, Domain Model, Schema, State Machine, Ledger, Event Log, Permission Model, and Workflow Engine are so important. They are not ordinary modules; they serve as the carriers of the “universal property” for certain classes of business paths. Truly good architecture makes these universal properties clear and explicit. Truly poor architecture is characterized by multiple unconstrained “fake standard mediators” for the same class of tasks.

![Article content](https://media.licdn.com/dms/image/v2/D4D12AQFsCE_rGE3olw/article-inline_image-shrink_1000_1488/B4DZ7Mf0bVI4AI-/0/1781547373878?e=1788393600&v=beta&t=6T6yyUnpsDnpMM3rG1G7HnSKAUJ4zJOrmN-eHQ21H7g)

**The Essence of Abstraction Failures and Four Typical Anti-Patterns**

Premature abstraction, over-abstraction, and failed abstraction all stem from the same underlying issue: you believe you have found the universal property for a class of tasks, but in reality, you have not.

In practice, bad abstractions typically fail in one of these four areas:

**1. Too Early (Premature Abstraction)**

The arrow patterns (morphism patterns between tasks) have not yet stabilized, yet you rush to create a standard object. You do not yet know whether these cases truly belong to the same class of tasks; you only see surface similarities and extract a Common Layer. When new requirements arrive, the differences prove more significant than the similarities. The abstraction then grows parameters, flags, callbacks, and strategies until it becomes an incomprehensible monster.

From a category theory perspective: You assume the existence of a universal object before truly identifying the actual universal property.

**2. Too Large (Over-abstraction)**

The abstraction object is too large and includes degrees of freedom that the task does not require.

A classic example: A DB Access Layer is responsible not only for queries, transactions, and connections but also incorporates permissions, caching, report metrics, currency conversion, and business state judgments. It appears “unified,” but in reality, it mixes many different tasks into one object. The same operation can be performed through multiple paths, and the results may differ.

Category theory view: This object is not the “just right” standard mediator; the extra dimensions break uniqueness.

**3. Too Small (Under-abstraction)**

The abstraction object cannot carry the real task requirements.

For example, a BaseRepository that only supports basic CRUD cannot natively handle tenant scoping, permission filters, soft deletes, auditing, or pagination consistency. Developers are forced to bypass it and write raw SQL.

Category theory view: The object does not satisfy existence; many legitimate paths cannot go through it.

**4. Misaligned (Wrong Common Constraint Object)**

A more subtle failure occurs when the common constraint object is chosen incorrectly. You assume two things should align by user_id, but in reality they should align by tenant_id + role_id + version. You build what appears to be a unified join or service, but because the alignment key is wrong, permissions, data isolation, and reports all break downstream.

Category theory view: You selected the wrong common target object for the pullback.

There is also the case of **“the diagram does not commute”** (inconsistent derivations):

Frontend state, backend APIs, caches, databases, and reports all claim to represent the same business fact, yet they are not derived from the same Source of Truth. One path shows the user has permission while another denies it; calculated amounts do not match the ledger. This is not a minor bug but a broken abstract structure: multiple paths generate the same fact, but their results are inconsistent.

**Criteria for Good Abstraction**

In short:

**A good abstraction equals the universal property of a class of tasks**: complete information, no extra freedom, all paths of the same class uniquely go through it, and the diagram commutes (derivations remain consistent).

Bad abstractions usually fail in these four dimensions: too early, too small, too large, or misaligned.

**Conclusion**

Therefore, “don’t abstract prematurely” does not mean we should avoid abstraction altogether. It means:

**Do not pretend you have already found the universal property before the arrow patterns have stabilized.**

In your architectural decisions, the last time you made an abstraction, did you truly verify whether it was the genuine universal property for the class of tasks you were addressing?

I welcome your thoughts and practical experiences in the comments.

#SoftwareArchitecture #DomainDrivenDesign #SoftwareDesign #CategoryTheory #AbstractionPrinciples
