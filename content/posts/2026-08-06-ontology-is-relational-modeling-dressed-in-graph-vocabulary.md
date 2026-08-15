---
title: "Ontology is relational modeling dressed in graph vocabulary"
date: "2026-08-06T23:19:14.998Z"
lang: "en"
image: "/media/linkedin/li-d33a93fa26b7.webp"
source: "https://www.linkedin.com/feed/update/urn:li:activity:7491271702602129408/"
---

Ontology is relational modeling dressed in graph vocabulary.

My intuition is that the right way to apply LLMs to large-scale business datasets is to let the LLM design a relational database and then operate on that database, rather than relying on an excessively complex graph database. But Palantir’s heavily promoted Ontology model appears, at first glance, to be a knowledge graph. So I looked into it.

What I found is that it looks like a graph, but it does not have a graph engine. Relationships between objects are indeed first-class citizens, and the modeling process feels like drawing a network of connected entities. Underneath, however, many-to-many relationships are stored through join tables, creating an object type requires selecting a column as its primary key, and traversal is performed one hop at a time in code.

In Ontology modelling, there is no graph query language, and cross-Ontology joins are not supported. In other words, it behaves very much like a relational database. It adopts the vocabulary and presentation of a knowledge graph, while its implementation remains firmly relational.

![](/media/linkedin/li-d33a93fa26b7.webp)
