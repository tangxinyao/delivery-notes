# Delivery Notes · 交付笔记

关于 **FDE（Forward Deployed Engineering）** 的公开调研与讲稿。

- **[`docs/research/`](./docs/research/)** —— 七篇调研，每条结论标注来源。涵盖用户体验 benchmark、本地推理引擎、agent 架构、分行业真实案例、场景选型手册、交付流程、以及现场真正卡人的五个问题。
- **[`slides/fde-seven-flips/`](./slides/fde-seven-flips/)** —— 讲稿《交付大模型，跟以前有什么不一样》，27 页。

材料以一手来源（论文、厂商官方博客、公开手册）为主，媒体转述的数字单独标注，引用前请回溯原文。各文档末尾注明了哪些结论属于自有归纳。

---

## 这个仓库怎么跑

Slides as React components. Each slide lives under `slides/<id>/index.tsx` and default-exports an array of page components. The `@open-slide/core` runtime handles layout, scaling, navigation, thumbnails, and fullscreen play mode — you just write the pages.

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the dev server and edit `slides/getting-started/index.tsx`, or create a new slide at `slides/<your-slide>/index.tsx`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server with hot reload. |
| `pnpm build` | Build a static bundle you can deploy. |
| `pnpm preview` | Preview the built bundle locally. |

## Authoring a slide

```tsx
// slides/my-slide/index.tsx
import type { Page, SlideMeta } from '@open-slide/core';

const Cover: Page = () => (
  <div style={{ width: '100%', height: '100%' }}>Hello</div>
);

export const meta: SlideMeta = { title: 'My slide' };
export default [Cover] satisfies Page[];
```

Every page renders into a fixed **1920 × 1080** canvas — design with absolute pixel values. Put images, videos, and fonts under `slides/<id>/assets/` and import them directly.

See [`CLAUDE.md`](./CLAUDE.md) for the full authoring guide.

## Navigation

- Arrow keys / PageUp / PageDown move between pages.
- `F` enters fullscreen play mode; Esc exits.
- In play mode: Space / → next, ← prev.

## Claude Code integration

This workspace ships with Claude Code skills preconfigured under `.claude/skills/` and `.agents/skills/`. Ask Claude Code to "make slides about X" and the `create-slide` skill takes over. Use `apply-comments` to iterate via inspector-style markers inside your source.

## Config

Optional `open-slide.config.ts` at the workspace root:

```ts
import type { OpenSlideConfig } from '@open-slide/core';

const openSlideConfig: OpenSlideConfig = {
  port: 5173,
};

export default openSlideConfig;
```

Supported fields: `slidesDir`, `port`.
