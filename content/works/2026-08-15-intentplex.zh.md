---
title: "intentplex"
date: "2026-08-15T00:00:00.000Z"
lang: "zh"
image: "/media/intentplex.svg"
---

这个网站。每一段文案都在同一处同时用两种语言写好，于是「翻译到一半」是类型错误，而不是上线后才发现的问题。

基于 TanStack Start，配 Astryx 与 StyleX，没有 Tailwind，除了一份声明层叠顺序的九行样式表之外没有任何手写 CSS。

有意思的约束是：每一个颜色、尺寸、圆角和字体都必须落到设计系统的 token 上——做法是让 token 注册表成为整个仓库里唯一被允许写出 token 名字的文件。

双语保证是一个类型，不是一道流程：文案以 {en, zh} 对象存在，于是发现漏翻译的是编译器。
