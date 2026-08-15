---
title: "Four Steps to a Polished, Professional Website UI"
date: 2026-07-25T12:00:00.000Z
lang: en
image: "/media/linkedin/li-39705dd92523.webp"
source: "https://www.linkedin.com/pulse/four-steps-polished-professional-website-ui-chonghuan-wang-g9t7f"
---
Not a professional designer. Can you still ship a genuinely good-looking UI?

I think so. Here's the workflow I use.

**First, a prerequisite: every product needs a matching prototype app.**

It has zero real functionality, but every visible detail — the visuals, the interactions — has to match the real product exactly. All design work happens on the prototype. Once it's finalized, you sync it back to the actual app.

This step looks like overhead, but it's what makes the whole process work. It drives the cost of design iteration down to almost nothing, so you can experiment freely without worrying about touching anything live.

Then, four steps:

**1. Start with a visual reference.** Spend some time in design galleries and collect the elements you respond to — the type treatment, the corner radii, the overall sense of rhythm. You're building a vocabulary to work from, not looking for a mockup that already resembles your product. There are also tools that will extract the underlying style system from a page you admire, which saves you eyeballing hex codes and font stacks.

**2. Hand the reference to Claude Design.** Have it extract the base style metadata for the whole site, then have it redesign a Hero section. Along the way, tweak the elements to your own taste.

**3. Once the core style is locked in,** point Claude Design at your GitHub repo. Let it read the actual implementation of your site and build out the remaining pages from there.

**4. Then hand off to Claude Code for the implementation.** This part exports directly. For my own build, I only ran Opus Medium — and it still hit exactly the design I had in mind.

The core of it is the interplay: **prototype app as the foundation + a style reference + Claude Design + Claude Code.** Together they make shipping a genuinely well-designed site remarkably easy.

One last thought on what "good design" actually means to me. It isn't about how imaginative or creative you are. It's the site-wide consistency — type, spacing, motion, color, even the ratios between font sizes — that makes everything feel like one coherent piece at a glance, instead of something disjointed and slightly uncomfortable to look at.
