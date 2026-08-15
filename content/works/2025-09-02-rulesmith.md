---
title: "Rulesmith"
date: "2025-09-02T00:00:00.000Z"
lang: "en"
image: "/media/rulesmith.svg"
---

A linter for board game rulebooks. Parses one into a state machine and reports unreachable rules, undefined terms, and turn phases with no exit condition.

Designers use it. Publishers pretend they do not.

The parser is the boring part; the interesting part was deciding what counts as a rule. A rulebook sentence can be normative, illustrative, or flavour, and only the first kind belongs in the graph.

The check that finds the most real bugs is the simplest one: a phase with no exit condition. It has caught something in every rulebook it has been pointed at, including two that were already in print.
