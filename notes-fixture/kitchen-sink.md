---
title: Kitchen Sink
tags: [demo, markdown]
---

# Kitchen Sink

A fixture note used to eyeball every markdown feature as it lands.

## Inline

**bold**, _italic_, ~~strikethrough~~, `inline code`, [a link](https://example.com), and an
autolink: https://tauri.app

## Lists

- bullet
- nested
  - deeper
- [ ] todo item
- [x] done item

1. first
2. second

## Table

| Feature | Status |
| ------- | :----: |
| GFM     |   ✅   |
| Math    |   ⏳   |

## Code

```ts
export function hello(name: string) {
  return `hi ${name}`;
}
```

## Blockquote

> Notes are just files on disk.

## Footnote

Here is a footnote reference.[^1]

[^1]: And the footnote text.

## Not yet supported (later phases)

Math: $E = mc^2$

```mermaid
graph TD;
  A-->B;
```

Wikilink: [[Another Note]]
