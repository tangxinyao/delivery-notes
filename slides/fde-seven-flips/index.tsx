import type { ReactNode } from 'react';
import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage } from '@open-slide/core';

export const design: DesignSystem = {
  palette: { bg: '#0d0e10', text: '#edece7', accent: '#e08b3e' },
  fonts: {
    display: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
    body: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  typeScale: { hero: 150, body: 36 },
  radius: 2,
};

const muted = '#82868e';
const dim = '#b6b5b0';
const rule = '#23252a';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const CSS = `
@keyframes fdek-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fdek-sweep { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes fdek-bloom { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
@keyframes fdek-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
@keyframes fdek-slip { from { opacity: 0; transform: translateX(-18px); } to { opacity: 1; transform: translateX(0); } }
@media (prefers-reduced-motion: reduce) {
  .fdek-anim { animation: none !important; }
}
`;

const fill = {
  width: '100%',
  height: '100%',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  position: 'relative',
  overflow: 'hidden',
} as const;

const anim = (name: string, delay: number, active: boolean, dur = 520) =>
  active
    ? { animation: `fdek-${name} ${dur}ms cubic-bezier(0,0,0.2,1) ${delay}ms both` }
    : undefined;

const Grain = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background:
        'radial-gradient(1200px 600px at 78% -8%, rgba(224,139,62,0.10), transparent 62%)',
    }}
  />
);

const Eyebrow = ({ label }: { label: string }) => {
  const active = useIsActivePage();
  return (
    <div
      className="fdek-anim"
      style={{
        fontFamily: MONO,
        fontSize: 24,
        letterSpacing: '0.24em',
        color: 'var(--osd-accent)',
        textTransform: 'uppercase',
        ...anim('slip', 0, active, 420),
      }}
    >
      {label}
    </div>
  );
};

const Shell = ({ eyebrow, children }: { eyebrow: string; children: ReactNode }) => (
  <div style={{ ...fill, padding: '88px 120px 72px' }}>
    <style>{CSS}</style>
    <Grain />
    <div style={{ position: 'relative' }}>
      <Eyebrow label={eyebrow} />
      <div style={{ marginTop: 52 }}>{children}</div>
    </div>
  </div>
);

const Heading = ({ children }: { children: ReactNode }) => {
  const active = useIsActivePage();
  return (
    <h2
      className="fdek-anim"
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 58,
        fontWeight: 800,
        lineHeight: 1.2,
        margin: 0,
        letterSpacing: '-0.01em',
        ...anim('rise', 60, active),
      }}
    >
      {children}
    </h2>
  );
};

const Row = ({ k, v, src }: { k: string; v: string; src?: string }) => (
  <div
    style={{
      display: 'flex',
      gap: 40,
      alignItems: 'baseline',
      padding: '26px 0',
      borderTop: `1px solid ${rule}`,
    }}
  >
    <div
      style={{
        width: 168,
        flexShrink: 0,
        fontFamily: MONO,
        fontSize: 24,
        color: 'var(--osd-accent)',
        letterSpacing: '0.06em',
      }}
    >
      {k}
    </div>
    <div style={{ flex: 1, fontSize: 36, lineHeight: 1.35, color: 'var(--osd-text)' }}>{v}</div>
    <div
      style={{
        width: 210,
        flexShrink: 0,
        fontFamily: MONO,
        fontSize: 20,
        color: muted,
        textAlign: 'right',
      }}
    >
      {src ?? ''}
    </div>
  </div>
);

const Line = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 31, lineHeight: 1.5, color: dim, marginTop: 14 }}>{children}</div>
);

const Col = ({
  tag,
  title,
  accent,
  children,
}: {
  tag: string;
  title: string;
  accent?: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      flex: 1,
      borderTop: `2px solid ${accent ? 'var(--osd-accent)' : rule}`,
      paddingTop: 32,
    }}
  >
    <div
      style={{
        fontFamily: MONO,
        fontSize: 22,
        letterSpacing: '0.18em',
        color: accent ? 'var(--osd-accent)' : muted,
      }}
    >
      {tag}
    </div>
    <div
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 46,
        fontWeight: 800,
        marginTop: 18,
        lineHeight: 1.25,
      }}
    >
      {title}
    </div>
    <div style={{ marginTop: 30 }}>{children}</div>
  </div>
);

// ─────────────────────────────── 01 Cover ───────────────────────────────

const Cover: Page = () => {
  const active = useIsActivePage();
  return (
    <div style={{ ...fill, padding: '0 120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <style>{CSS}</style>
      <Grain />
      <div style={{ position: 'relative' }}>
        <div
          className="fdek-anim"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontFamily: MONO,
            fontSize: 24,
            letterSpacing: '0.24em',
            color: 'var(--osd-accent)',
            ...anim('slip', 0, active, 460),
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: 'var(--osd-accent)',
              animation: active ? 'fdek-pulse 2.6s ease-in-out 800ms infinite' : undefined,
            }}
          />
          FORWARD DEPLOYED ENGINEERING
        </div>
        <h1
          className="fdek-anim"
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontSize: 'var(--osd-size-hero)',
            fontWeight: 900,
            lineHeight: 1.06,
            letterSpacing: '-0.02em',
            margin: '44px 0 0',
            ...anim('rise', 120, active, 620),
          }}
        >
          交付大模型
          <br />
          跟以前有什么不一样
        </h1>
        <div
          className="fdek-anim"
          style={{
            width: 240,
            height: 3,
            background: 'var(--osd-accent)',
            transformOrigin: 'left',
            margin: '56px 0 40px',
            animation: active ? 'fdek-sweep 700ms cubic-bezier(0,0,0.2,1) 420ms both' : undefined,
          }}
        />
        <p
          className="fdek-anim"
          style={{ fontSize: 36, color: dim, margin: 0, ...anim('rise', 480, active) }}
        >
          七个翻转，和它们背后的数字
        </p>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 120,
          bottom: 72,
          fontFamily: MONO,
          fontSize: 22,
          color: muted,
        }}
      >
        2026.09
      </div>
    </div>
  );
};

// ─────────────────────────────── 02 三个数字 ───────────────────────────────

const Stat = ({ n, unit, text, src }: { n: string; unit?: string; text: string; src: string }) => (
  <div style={{ flex: 1, borderTop: `1px solid ${rule}`, paddingTop: 34 }}>
    <div
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 132,
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        color: 'var(--osd-accent)',
      }}
    >
      {n}
      {unit ? <span style={{ fontSize: 56, marginLeft: 6 }}>{unit}</span> : null}
    </div>
    <div style={{ fontSize: 32, lineHeight: 1.45, color: dim, marginTop: 30, minHeight: 140 }}>
      {text}
    </div>
    <div style={{ fontFamily: MONO, fontSize: 20, color: muted, marginTop: 12 }}>{src}</div>
  </div>
);

const ThreeNumbers: Page = () => (
  <Shell eyebrow="开场">
    <Heading>先看三个数字</Heading>
    <div style={{ display: 'flex', gap: 72, marginTop: 64 }}>
      <Stat
        n="95"
        unit="%"
        text="的企业 AI 试点，没有产生可衡量的业务影响。"
        src="MIT"
      />
      <Stat
        n="85"
        unit="%"
        text="的企业 AI 项目因集成与运营摩擦，进不了部署。"
        src="Gartner"
      />
      <Stat
        n="25"
        unit="%"
        text="τ-bench retail 域，同一任务连做八次全对的概率不到这个数。"
        src="arXiv 2406.12045"
      />
    </div>
  </Shell>
);

// ─────────────────────────────── 03 七个翻转 ───────────────────────────────

const FlipLine = ({ n, before, after }: { n: string; before: string; after: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 32,
      padding: '19px 0',
      borderTop: `1px solid ${rule}`,
    }}
  >
    <span style={{ fontFamily: MONO, fontSize: 24, color: 'var(--osd-accent)', width: 52 }}>{n}</span>
    <span style={{ fontSize: 33, color: muted, width: 400 }}>{before}</span>
    <span style={{ fontFamily: MONO, fontSize: 26, color: 'var(--osd-accent)' }}>→</span>
    <span style={{ fontSize: 33, fontWeight: 600 }}>{after}</span>
  </div>
);

const Agenda: Page = () => (
  <Shell eyebrow="目录">
    <Heading>七件事变了</Heading>
    <div style={{ marginTop: 40 }}>
      <FlipLine n="01" before="先写需求文档" after="eval 就是需求文档" />
      <FlipLine n="02" before="功能跑通就算过" after="跑通一次不算数" />
      <FlipLine n="03" before="客户提需求，你评估" after="双方都在猜" />
      <FlipLine n="04" before="程序不会自作主张" after="它会" />
      <FlipLine n="05" before="接口定死就完了" after="上下文就是产品" />
      <FlipLine n="06" before="性能是非功能需求" after="快慢也是对错" />
      <FlipLine n="07" before="交完就稳定了" after="交付物有保质期" />
    </div>
  </Shell>
);

// ─────────────────────────────── Section divider ───────────────────────────────

const Section = ({
  n,
  before,
  after,
}: {
  n: string;
  before: string;
  after: string;
}) => {
  const active = useIsActivePage();
  return (
    <div style={{ ...fill, padding: '0 120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <style>{CSS}</style>
      <Grain />
      <div style={{ position: 'relative' }}>
        <div
          className="fdek-anim"
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontSize: 190,
            fontWeight: 900,
            lineHeight: 1,
            color: rule,
            letterSpacing: '-0.04em',
            ...anim('bloom', 0, active, 560),
          }}
        >
          {n}
        </div>
        <div
          className="fdek-anim"
          style={{ fontSize: 40, color: muted, marginTop: 20, ...anim('rise', 120, active) }}
        >
          {before}
        </div>
        <div
          className="fdek-anim"
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1.16,
            marginTop: 22,
            letterSpacing: '-0.02em',
            ...anim('rise', 240, active, 600),
          }}
        >
          {after}
        </div>
        <div
          style={{
            width: 200,
            height: 3,
            background: 'var(--osd-accent)',
            transformOrigin: 'left',
            marginTop: 46,
            animation: active ? 'fdek-sweep 640ms cubic-bezier(0,0,0.2,1) 420ms both' : undefined,
          }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────── 翻转 01 ───────────────────────────────

const S1: Page = () => (
  <Section n="01" before="以前先写需求文档，再开发。" after="现在你写不出来。" />
);

const S1a: Page = () => (
  <Shell eyebrow="翻转 01 · eval 就是需求文档">
    <Heading>标准和打分，谁先来</Heading>
    <div style={{ marginTop: 44 }}>
      <div
        style={{
          borderLeft: `3px solid var(--osd-accent)`,
          paddingLeft: 36,
          fontSize: 44,
          lineHeight: 1.45,
          fontWeight: 600,
        }}
      >
        你需要评判标准来给输出打分。
        <br />
        可给输出打分这件事，才帮你定义出标准。
      </div>
      <div style={{ fontFamily: MONO, fontSize: 22, color: muted, marginTop: 24, paddingLeft: 39 }}>
        EvalGen · arXiv 2404.12272
      </div>
    </div>
    <div style={{ marginTop: 52 }}>
      <Steps>
        <Step>
          <Row k="命名" v="论文把这个循环依赖叫 criteria drift。" />
        </Step>
        <Step>
          <Row k="发现" v="部分标准依赖于具体看到的输出，不是预先存在的准则。" />
        </Step>
        <Step>
          <Row k="推论" v="标准细化和打分必须同时做，不能分两步。" />
        </Step>
      </Steps>
    </div>
  </Shell>
);

const S1b: Page = () => (
  <Shell eyebrow="翻转 01 · eval 就是需求文档">
    <Heading>那两小时怎么用</Heading>
    <div style={{ marginTop: 44 }}>
      <Steps>
        <Step>
          <Row k="方法" v="Critical Decision Method，认知任务分析的一种。" src="Human Factors 1998" />
        </Step>
        <Step>
          <Row k="做法" v="锚定一个真实的困难案例，做四遍回溯。" />
        </Step>
        <Step>
          <Row k="第二遍" v="在时间线上标出决策点。" />
        </Step>
        <Step>
          <Row k="第三遍" v="逐点追问：当时看到什么线索，有哪些备选，为什么排除。" />
        </Step>
        <Step>
          <Row k="产出" v="两小时能挖出 15–25 个决策点，这就是专家轨迹。" src="OpenAI FDE" />
        </Step>
      </Steps>
    </div>
  </Shell>
);

// ─────────────────────────────── 翻转 02 ───────────────────────────────

const S2: Page = () => (
  <Section n="02" before="以前功能跑通就算过。" after="现在跑通一次不算数。" />
);

const S2a: Page = () => (
  <Shell eyebrow="翻转 02 · 会不会，还是稳不稳">
    <Heading>pass@k 和 pass^k</Heading>
    <div style={{ display: 'flex', gap: 80, marginTop: 56 }}>
      <Col tag="PASS @ K" title="k 次里至少成一次">
        <Line>测的是能力上限</Line>
        <Line>k 越大分数越高</Line>
        <Line>出自 Codex 论文</Line>
      </Col>
      <Col tag="PASS ^ K" title="连续 k 次，次次都成" accent>
        <Line>测的是可靠性</Line>
        <Line>k 越大分数越低</Line>
        <Line>出自 τ-bench</Line>
      </Col>
    </div>
    <div style={{ fontSize: 33, color: dim, marginTop: 52 }}>
      客户要的是后者。验收报 pass@k，等于没报。
    </div>
  </Shell>
);

const S2b: Page = () => {
  const active = useIsActivePage();
  return (
    <Shell eyebrow="翻转 02 · 会不会，还是稳不稳">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 90, marginTop: 30 }}>
        <div
          className="fdek-anim"
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontSize: 300,
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: '-0.04em',
            color: 'var(--osd-accent)',
            ...anim('bloom', 0, active, 560),
          }}
        >
          25
          <span style={{ fontSize: 120 }}>%</span>
        </div>
        <div style={{ paddingTop: 24, flex: 1 }}>
          <Row k="场景" v="τ-bench 的 retail 域，pass^8 低于这个数。" />
          <Row k="同一批" v="GPT-4o 级别的 agent，任务成功率不到 50%。" />
          <Row k="翻译" v="同一件事做八次全对的概率，不足四分之一。" />
        </div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 22, color: muted, marginTop: 34 }}>
        arXiv 2406.12045 · 已回溯原文核实
      </div>
    </Shell>
  );
};

// ─────────────────────────────── 翻转 03 ───────────────────────────────

const S3: Page = () => (
  <Section n="03" before="以前客户提需求，你评估可行性。" after="现在双方都在猜。" />
);

const S3a: Page = () => (
  <Shell eyebrow="翻转 03 · 期望管理成了技术活">
    <Heading>六周，还是半年</Heading>
    <div style={{ marginTop: 44 }}>
      <Steps>
        <Step>
          <Row k="2023" v="OpenAI 第一个部署 GPT-4 的企业客户。" src="ZenML LLMOps DB" />
        </Step>
        <Step>
          <Row k="难点" v="当时 RAG 还不是既成范式，检索调优是自己做的。" />
        </Step>
        <Step>
          <Row k="6–8 周" v="技术管线建完：检索优化、guardrails、基础 eval。" />
        </Step>
        <Step>
          <Row k="+4 个月" v="pilot、用户反馈、迭代，然后才真正上线。" />
        </Step>
        <Step>
          <Row k="所以" v="技术只占交付周期的三分之一。" />
        </Step>
      </Steps>
    </div>
  </Shell>
);

const S3b: Page = () => (
  <Shell eyebrow="翻转 03 · 期望管理成了技术活">
    <Heading>这几种活别接</Heading>
    <div style={{ marginTop: 44 }}>
      <Steps>
        <Step>
          <Row k="信号 01" v="“这个特例你帮我特判一下”，第三次出现。" />
        </Step>
        <Step>
          <Row k="信号 02" v="客户不肯给领域专家时间。" />
        </Step>
        <Step>
          <Row k="信号 03" v="没有明确的高管 sponsor。" />
        </Step>
        <Step>
          <Row k="信号 04" v="要求你当场给一个报价。" src="PostHog 手册" />
        </Step>
        <Step>
          <Row k="信号 05" v="问题的价值量级，远低于投入。" src="OpenAI FDE" />
        </Step>
      </Steps>
    </div>
  </Shell>
);

// ─────────────────────────────── 翻转 04 ───────────────────────────────

const S4: Page = () => (
  <Section n="04" before="以前程序不会自作主张。" after="现在它会。" />
);

const S4a: Page = () => (
  <Shell eyebrow="翻转 04 · 它不该自己做主">
    <Heading>谁管什么</Heading>
    <div style={{ display: 'flex', gap: 80, marginTop: 52 }}>
      <Col tag="归代码" title="不能错的" accent>
        <Line>顶层循环、重试</Line>
        <Line>状态与事务边界</Line>
        <Line>业务规则与阈值</Line>
        <Line>权限、配额、超时</Line>
      </Col>
      <Col tag="归模型" title="说不清的">
        <Line>意图识别</Line>
        <Line>非结构化抽取</Line>
        <Line>开放式探索</Line>
        <Line>主观质量评估</Line>
      </Col>
    </div>
    <div style={{ fontSize: 31, color: muted, marginTop: 46 }}>
      模型负责生成和评估，确定性代码负责决策。交界处放校验。
    </div>
  </Shell>
);

const S4b: Page = () => (
  <Shell eyebrow="翻转 04 · 它不该自己做主">
    <Heading>选架构，是选你能忍的代价</Heading>
    <div style={{ marginTop: 44 }}>
      <Steps>
        <Step>
          <Row k="ReAct" v="每个动作一次 LLM 调用，长任务烧 token。" />
        </Step>
        <Step>
          <Row k="ReWOO" v="计划不看反馈，环境一变全盘皆错。" />
        </Step>
        <Step>
          <Row k="Reflexion" v="多一轮反思，多一份延迟。" />
        </Step>
        <Step>
          <Row k="Plan & Execute" v="成本前置到规划，代价是重规划的复杂度。" />
        </Step>
        <Step>
          <Row k="实证" v="确定性编排改善最坏情况正确率，降低方差。" src="arXiv 2605.09894" />
        </Step>
      </Steps>
    </div>
  </Shell>
);

// ─────────────────────────────── 翻转 05 ───────────────────────────────

const S5: Page = () => (
  <Section n="05" before="以前接口定死就完了。" after="现在上下文就是产品。" />
);

const S5a: Page = () => (
  <Shell eyebrow="翻转 05 · 上下文就是产品">
    <Heading>本体不是文档</Heading>
    <div style={{ marginTop: 44 }}>
      <Steps>
        <Step>
          <Row k="陷阱" v="对着没定义的 schema prompt，抽出的实体类型极不一致。" />
        </Step>
        <Step>
          <Row k="顺序" v="先把本体定出来，再用 LLM 填肉。" />
        </Step>
        <Step>
          <Row k="用途" v="Palantir 的做法：实体直接暴露成模型能调的 tool call。" />
        </Step>
        <Step>
          <Row k="规则" v="业务规则建进本体，不写进 prompt。" />
        </Step>
        <Step>
          <Row k="94.7%" v="超边编码 n 元规则后，供应链根因分析的准确率。" src="HEAR" />
        </Step>
      </Steps>
    </div>
  </Shell>
);

const S5b: Page = () => (
  <Shell eyebrow="翻转 05 · 上下文就是产品">
    <Heading>三天出活的那三天</Heading>
    <div style={{ marginTop: 44 }}>
      <Steps>
        <Step>
          <Row k="Day 0–1" v="把客户领域建成本体：实体、属性、关联类型。" />
        </Step>
        <Step>
          <Row k="Day 2" v="接上 AIP，把实体暴露成 tool call。" />
        </Step>
        <Step>
          <Row k="Day 3" v="交付一个跑在真实数据上的应用。" />
        </Step>
        <Step>
          <Row k="口号" v="ship on day one。" />
        </Step>
        <Step>
          <Row k="S-1 原话" v="交付的是生产软件，不是实施路线图。" src="Palantir 2020-09" />
        </Step>
      </Steps>
    </div>
  </Shell>
);

// ─────────────────────────────── 翻转 06 ───────────────────────────────

const S6: Page = () => (
  <Section n="06" before="以前性能是非功能需求。" after="现在快慢也是对错。" />
);

// 06a — 为什么必须本地
const Why = ({
  tag,
  title,
  lines,
  accent,
}: {
  tag: string;
  title: string;
  lines: string[];
  accent?: boolean;
}) => (
  <div
    style={{
      flex: 1,
      borderTop: `2px solid ${accent ? 'var(--osd-accent)' : rule}`,
      paddingTop: 28,
    }}
  >
    <div
      style={{
        fontFamily: MONO,
        fontSize: 21,
        letterSpacing: '0.18em',
        color: accent ? 'var(--osd-accent)' : muted,
      }}
    >
      {tag}
    </div>
    <div
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 40,
        fontWeight: 800,
        marginTop: 16,
        lineHeight: 1.24,
      }}
    >
      {title}
    </div>
    <div style={{ marginTop: 22 }}>
      {lines.map((l) => (
        <div key={l} style={{ fontSize: 27, lineHeight: 1.48, color: dim, marginTop: 12 }}>
          {l}
        </div>
      ))}
    </div>
  </div>
);

const S6a: Page = () => (
  <Shell eyebrow="翻转 06 · 先问数据出不出域">
    <Heading>本地部署不是技术偏好，是三条硬约束</Heading>
    <div style={{ display: 'flex', gap: 60, marginTop: 48 }}>
      <Why
        tag="合规"
        title="法规不许出域"
        lines={['国防 / 军工：绝对不可，涉保密等级', '金融：监管、审计留痕、幻觉责任', '医疗：HIPAA 类，数据必须脱敏']}
        accent
      />
      <Why
        tag="隐私"
        title="出域了就收不回"
        lines={['客户内网数据进第三方 API，无法举证已删除', '断网 / 边缘场景根本没有出域这个选项', '端侧才能做到“数据不离开设备”']}
      />
      <Why
        tag="成本"
        title="高频调用算得过来"
        lines={['cost per task 随调用量线性涨', '固定负载下自建摊薄成单位电费', '但低频场景自建更贵——别默认本地']}
      />
    </div>
    <div style={{ fontSize: 30, color: muted, marginTop: 44 }}>
      三条里只要命中一条，本地就是硬前提；一条都不命中，托管 API 更划算。
    </div>
  </Shell>
);

const S6b: Page = () => (
  <Shell eyebrow="翻转 06 · 先问数据出不出域">
    <Heading>谁必须本地，谁不必</Heading>
    <div style={{ marginTop: 36 }}>
      <Steps>
        <Step>
          <Row k="国防 / 军工" v="绝对不出域。本地推理 + local agent，断网可用。" src="纯本地 / 边缘" />
        </Step>
        <Step>
          <Row k="金融" v="基本不出域。私有云 + 强 guardrails + 全轨迹可观测。" src="本地 / 私有云" />
        </Step>
        <Step>
          <Row k="医疗" v="不可出域。本地 + 人在环，幻觉率是第一指标。" src="本地" />
        </Step>
        <Step>
          <Row k="制造 / 能源" v="部分可。边缘做实时推理，云端做训练与聚合。" src="边缘 + 云" />
        </Step>
        <Step>
          <Row k="通用企业流程" v="可出域。要的是速度和 ROI，别自建。" src="云" />
        </Step>
      </Steps>
    </div>
  </Shell>
);

// 06c — 显卡天梯图
const Rung = ({
  tier,
  gpu,
  vram,
  bw,
  bwBar,
  fit,
  first,
  accent,
}: {
  tier?: string;
  gpu: string;
  vram: string;
  bw: string;
  bwBar: number;
  fit: string;
  first?: boolean;
  accent?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 0',
      borderTop: first ? `2px solid ${accent ? 'var(--osd-accent)' : rule}` : `1px solid #17181c`,
    }}
  >
    <div
      style={{
        width: 150,
        flexShrink: 0,
        fontFamily: MONO,
        fontSize: 17,
        letterSpacing: '0.1em',
        color: accent ? 'var(--osd-accent)' : muted,
      }}
    >
      {first ? tier : ''}
    </div>
    <div style={{ width: 280, flexShrink: 0, fontSize: 22, fontWeight: accent ? 700 : 500 }}>{gpu}</div>
    <div
      style={{
        width: 100,
        flexShrink: 0,
        fontFamily: MONO,
        fontSize: 20,
        color: accent ? 'var(--osd-accent)' : dim,
        textAlign: 'right',
      }}
    >
      {vram}
    </div>
    <div style={{ width: 420, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: bwBar,
          height: 13,
          background: accent ? 'var(--osd-accent)' : '#3a3d44',
        }}
      />
      <span style={{ fontFamily: MONO, fontSize: 18, color: muted }}>{bw}</span>
    </div>
    <div style={{ flex: 1, fontSize: 21, color: dim, lineHeight: 1.25 }}>{fit}</div>
  </div>
);

const S6c: Page = () => (
  <Shell eyebrow="翻转 06 · 显卡天梯图">
    <Heading>显存决定能不能跑，带宽决定跑多快</Heading>
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          display: 'flex',
          gap: 20,
          fontFamily: MONO,
          fontSize: 17,
          color: muted,
          letterSpacing: '0.12em',
          paddingBottom: 6,
        }}
      >
        <span style={{ width: 150 }}>档位</span>
        <span style={{ width: 280 }}>型号</span>
        <span style={{ width: 100, textAlign: 'right' }}>显存</span>
        <span style={{ width: 420 }}>显存带宽</span>
        <span style={{ flex: 1 }}>Q4 单卡能装下</span>
      </div>
      <Rung first tier="T0 数据中心" gpu="B200" vram="192 GB" bw="8.0 TB/s" bwBar={330} fit="200B+ 稠密 / 超大 MoE" />
      <Rung tier="" gpu="H200" vram="141 GB" bw="4.8 TB/s" bwBar={198} fit="120B 级" />
      <Rung tier="" gpu="H100" vram="80 GB" bw="3.35 TB/s" bwBar={138} fit="70B 舒适" />
      <Rung first accent tier="T1 专业单卡" gpu="RTX PRO 6000 Blackwell" vram="96 GB" bw="1792 GB/s" bwBar={74} fit="70B FP16 / 109B 级 MoE Q4" />
      <Rung tier="" gpu="A100 80G" vram="80 GB" bw="2.0 TB/s" bwBar={82} fit="70B" />
      <Rung tier="" gpu="L40S / RTX 6000 Ada" vram="48 GB" bw="864–960 GB/s" bwBar={38} fit="32B 舒适，70B 勉强" />
      <Rung first accent tier="T2 消费旗舰" gpu="RTX 5090" vram="32 GB" bw="1792 GB/s" bwBar={74} fit="70B Q4 单卡可跑" />
      <Rung tier="" gpu="RTX 4090" vram="24 GB" bw="1008 GB/s" bwBar={42} fit="32B 舒适" />
      <Rung tier="" gpu="RTX 3090" vram="24 GB" bw="936 GB/s" bwBar={39} fit="32B，二手性价比" />
      <Rung first tier="T3 消费中端" gpu="RTX 5080 / 4070 Ti S" vram="16 GB" bw="672–960 GB/s" bwBar={30} fit="14B 舒适" />
      <Rung tier="" gpu="RTX 3060 12G" vram="12 GB" bw="360 GB/s" bwBar={15} fit="7–8B，入门门槛" />
      <Rung first tier="T4 统一内存" gpu="Mac M3 Ultra" vram="512 GB" bw="819 GB/s" bwBar={34} fit="容量无敌，带宽一般：超大 MoE" />
      <Rung tier="" gpu="Mac M4 / M5 Max" vram="128 GB" bw="546 GB/s" bwBar={23} fit="70B Q4" />
    </div>
    <div style={{ fontFamily: MONO, fontSize: 17, color: muted, marginTop: 12 }}>
      柱长按带宽真实比例 · decode ≈ 带宽 ÷ 每 token 权重字节数（仅小 batch 成立）· 未计 KV cache · docs/research/02 §1.7
    </div>
  </Shell>
);

const S6d: Page = () => (
  <Shell eyebrow="翻转 06 · 显卡天梯图">
    <Heading>这张表怎么用</Heading>
    <div style={{ marginTop: 36 }}>
      <Steps>
        <Step>
          <Row k="顺序" v="先看显存再看带宽。装不下就是 0 tok/s，没有中间态。" />
        </Step>
        <Step>
          <Row k="反直觉" v="小 batch 下 5090 和 PRO 6000 每卡吞吐接近——带宽相同。差距要到大 batch、长上下文才拉开。" src="CloudRift" />
        </Step>
        <Step>
          <Row k="最常踩" v="“能装下”只算权重。70B 级模型跑 32K 上下文，KV cache 还能再吃十几 GB。" />
        </Step>
        <Step>
          <Row k="多卡" v="不是线性叠加，要靠张量并行才能合并显存——而 llama.cpp / Ollama 不做。" />
        </Step>
        <Step>
          <Row k="路线" v="容量优先选 Mac（M3 Ultra 512 GB），速度优先选 N 卡。统一内存是另一个维度。" />
        </Step>
      </Steps>
    </div>
  </Shell>
);

// 06e — 非 GPU 设备：端侧 / Mac / 嵌入式
const Tier = ({
  hw,
  mem,
  model,
  perf,
  engine,
}: {
  hw: string;
  mem: string;
  model: string;
  perf: string;
  engine: string;
}) => (
  <div
    style={{
      display: 'flex',
      gap: 28,
      alignItems: 'baseline',
      padding: '20px 0',
      borderTop: `1px solid ${rule}`,
    }}
  >
    <div style={{ width: 230, flexShrink: 0, fontSize: 27, fontWeight: 600 }}>{hw}</div>
    <div style={{ width: 130, flexShrink: 0, fontFamily: MONO, fontSize: 22, color: muted }}>{mem}</div>
    <div style={{ flex: 1, fontSize: 27, color: dim, lineHeight: 1.35 }}>{model}</div>
    <div style={{ width: 260, flexShrink: 0, fontFamily: MONO, fontSize: 21, color: 'var(--osd-accent)' }}>
      {perf}
    </div>
    <div style={{ width: 150, flexShrink: 0, fontFamily: MONO, fontSize: 21, color: muted, textAlign: 'right' }}>
      {engine}
    </div>
  </div>
);

const S6e: Page = () => (
  <Shell eyebrow="翻转 06 · 什么机器跑什么模型">
    <Heading>客户手上那台机器，能跑多大</Heading>
    <div style={{ marginTop: 30 }}>
      <div
        style={{
          display: 'flex',
          gap: 28,
          fontFamily: MONO,
          fontSize: 20,
          color: muted,
          letterSpacing: '0.12em',
          paddingBottom: 10,
        }}
      >
        <span style={{ width: 230 }}>硬件</span>
        <span style={{ width: 130 }}>可用显存</span>
        <span style={{ flex: 1 }}>能跑的模型（4bit 量化）</span>
        <span style={{ width: 260 }}>实测量级</span>
        <span style={{ width: 150, textAlign: 'right' }}>引擎</span>
      </div>
      <Tier
        hw="手机 / NPU 端侧"
        mem="—"
        model="1.7B–3B，SmolLM2 / Qwen2.5-3B"
        perf="prefill 970–1613 tok/s"
        engine="NPU + GGUF"
      />
      <Tier
        hw="Snapdragon X Elite"
        mem="—"
        model="3B 级，离线随身"
        perf="NPU prefill 是 CPU 的 18×"
        engine="NPU prefill"
      />
      <Tier
        hw="Raspberry Pi / 嵌入式"
        mem="4–8 GB"
        model="1B–3B，极限量化可到 ~1.5 bit"
        perf="能跑，别谈并发"
        engine="llama.cpp"
      />
      <Tier
        hw="MacBook（M 系列）"
        mem="16–64 GB 统一内存"
        model="7B–14B 舒适，32B 勉强"
        perf="~230 tok/s，5–7 ms/token"
        engine="mlx-lm"
      />
      <Tier
        hw="M5 Max 工作站"
        mem="128 GB 统一内存"
        model="Qwen3.5-35B-A3B (NVFP4) 等 MoE"
        perf="prefill 1810 · decode 112 tok/s"
        engine="MLX"
      />
      <Tier
        hw="单卡 GPU 服务器"
        mem="24–80 GB"
        model="14B–70B（4bit），单模型多并发"
        perf="50 并发 920 tok/s"
        engine="vLLM"
      />
      <Tier
        hw="多卡 GPU 集群"
        mem="160 GB+"
        model="70B+ 全精度、大 MoE，张量并行"
        perf="≥32 并发时 2–3× llama.cpp"
        engine="vLLM / SGLang"
      />
    </div>
    <div style={{ fontFamily: MONO, fontSize: 20, color: muted, marginTop: 20 }}>
      性能数字见 docs/research/02 · 显存与参数量的对应为工程经验值，需按实际上下文长度复核
    </div>
  </Shell>
);

// 06f — 引擎横评
const Bar = ({
  name,
  value,
  width,
  accent,
}: {
  name: string;
  value: string;
  width: number;
  accent?: boolean;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginTop: 26 }}>
    <div style={{ width: 150, fontFamily: MONO, fontSize: 24, color: accent ? 'var(--osd-accent)' : muted }}>
      {name}
    </div>
    <div
      style={{
        width,
        height: 36,
        background: accent ? 'var(--osd-accent)' : rule,
        transformOrigin: 'left',
      }}
    />
    <div style={{ fontSize: 30, color: accent ? 'var(--osd-text)' : muted }}>{value}</div>
  </div>
);

const S6f: Page = () => (
  <Shell eyebrow="翻转 06 · 快慢也是对错">
    <Heading>引擎选错，差 19 倍</Heading>
    <div style={{ marginTop: 34 }}>
      <Bar name="vLLM" value="793 tok/s" width={800} accent />
      <Bar name="Ollama" value="41 tok/s" width={42} />
    </div>
    <div style={{ marginTop: 30 }}>
      <Row k="50 并发" v="920 tok/s 对 155 tok/s。" />
      <Row k="峰值 P99" v="80 毫秒对 673 毫秒。Ollama 在压力下直接趴平。" src="Red Hat 2026" />
      <Row k="反过来" v="冷启单请求 llama.cpp 的 TTFT 是 8–12 毫秒，比 vLLM 的 16–25 还快。" />
      <Row k="所以" v="先问负载是单流还是并发，再选引擎。搞反了差一个数量级。" />
    </div>
  </Shell>
);

// 06g — 选型决策树
const S6g: Page = () => (
  <Shell eyebrow="翻转 06 · 快慢也是对错">
    <Heading>选型只取决于一个问题：几个并发用户</Heading>
    <div style={{ marginTop: 34 }}>
      <Steps>
        <Step>
          <Row k="1 个人" v="Ollama（技术用户）/ LM Studio（不碰命令行的人）。五分钟跑起来。" />
        </Step>
        <Step>
          <Row k="嵌入 / 边缘" v="llama.cpp。纯 C/C++ 零依赖，CPU 优先，单流效率最高。" />
        </Step>
        <Step>
          <Row k="Apple 平台" v="mlx-lm，或 Ollama 0.19+ 自动走的 MLX 路径。" />
        </Step>
        <Step>
          <Row k="5–100+ 并发" v="vLLM。PagedAttention + 连续批处理，2026 年的生产默认项。" />
        </Step>
        <Step>
          <Row k="前缀重的负载" v="SGLang。RAG / 多轮 / agent 共享上下文时，比 vLLM 高约 29%。" src="RadixAttention" />
        </Step>
        <Step>
          <Row k="绝对不要" v="多卡上用 llama.cpp / Ollama——它们不做张量并行，白买的卡。" />
        </Step>
      </Steps>
    </div>
    <div style={{ fontSize: 28, color: muted, marginTop: 34 }}>
      背景：HuggingFace TGI 已于 2026-03 进入维护模式，官方改荐 vLLM / SGLang / llama.cpp / MLX。
    </div>
  </Shell>
);

// 06h — 体验阈值
const S6h: Page = () => (
  <Shell eyebrow="翻转 06 · 快慢也是对错">
    <Heading>用户感知的第一指标</Heading>
    <div style={{ marginTop: 44 }}>
      <Steps>
        <Step>
          <Row k="TTFT" v="流式场景下，用户感受到的是“多久开始回话”。" />
        </Step>
        <Step>
          <Row k="阈值" v="P50 低于 1 秒算好，P99 低于 3 秒。" />
        </Step>
        <Step>
          <Row k="CSAT" v="高于 4.2 算强，低于 3.5 说明用户在忍受。" />
        </Step>
        <Step>
          <Row k="成本" v="cost per task 必须和成功率一起看，单看都没意义。" />
        </Step>
        <Step>
          <Row k="量化代价" v="Q4_K_M 体积小 2.5×、快约 2×，字段准确率掉约 2.6%——这是要和客户谈的交换。" src="arXiv 2601.14277" />
        </Step>
      </Steps>
    </div>
  </Shell>
);

// ─────────────────────────────── 翻转 07 ───────────────────────────────

const S7: Page = () => (
  <Section n="07" before="以前交完就稳定了。" after="现在交付物有保质期。" />
);

const S7a: Page = () => (
  <Shell eyebrow="翻转 07 · 交付物有保质期">
    <Heading>交接算不算完成</Heading>
    <div style={{ marginTop: 44 }}>
      <Steps>
        <Step>
          <Row k="人" v="客户侧至少两个人能独立处理，bus factor ≥ 2。" />
        </Step>
        <Step>
          <Row k="文档" v="runbook 至少一半条目，来自真实发生过的故障。" />
        </Step>
        <Step>
          <Row k="凭证" v="已转移，且已轮换。这是两个独立的勾。" />
        </Step>
        <Step>
          <Row k="eval" v="客户能自己重跑，也看得懂结果。" />
        </Step>
        <Step>
          <Row k="最易漏" v="客户知道什么情况下必须重跑：模型换代、prompt 改动、数据漂移。" />
        </Step>
      </Steps>
    </div>
  </Shell>
);

const S7b: Page = () => {
  const active = useIsActivePage();
  return (
    <div style={{ ...fill, padding: '0 120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <style>{CSS}</style>
      <Grain />
      <div style={{ position: 'relative', maxWidth: 1400 }}>
        <div
          className="fdek-anim"
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1.22,
            letterSpacing: '-0.02em',
            ...anim('rise', 0, active, 600),
          }}
        >
          交接不是附录。
          <br />
          交接就是验收标准。
        </div>
        <div
          style={{
            width: 200,
            height: 3,
            background: 'var(--osd-accent)',
            transformOrigin: 'left',
            margin: '52px 0 36px',
            animation: active ? 'fdek-sweep 640ms cubic-bezier(0,0,0.2,1) 320ms both' : undefined,
          }}
        />
        <div
          className="fdek-anim"
          style={{ fontSize: 34, color: dim, lineHeight: 1.6, ...anim('rise', 400, active) }}
        >
          FDE 团队撤走之后，客户内部没人能运维，
          <br />
          那就不是把试点转成了生产，是装了一个黑盒。
        </div>
        <div style={{ fontFamily: MONO, fontSize: 22, color: muted, marginTop: 34 }}>
          Palantir playbook
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────── 收束 ───────────────────────────────

const ThreeQuestions: Page = () => (
  <Shell eyebrow="收束">
    <Heading>选型先问三句</Heading>
    <div style={{ marginTop: 52 }}>
      <Steps>
        <Step>
          <Row k="问一" v="数据出不出域。出不了，本地推理是硬前提。" />
        </Step>
        <Step>
          <Row k="问二" v="有没有能自动判卷的东西。有测试就靠脚本，没有就得请人。" />
        </Step>
        <Step>
          <Row k="问三" v="动作能不能撤回。撤不回的，人工闸门必须在。" />
        </Step>
      </Steps>
    </div>
    <div style={{ fontSize: 33, color: dim, marginTop: 56 }}>
      问完这三句，八成的选型就定了。
    </div>
  </Shell>
);

const Sources: Page = () => (
  <Shell eyebrow="材料">
    <Heading>数字都有出处</Heading>
    <div style={{ marginTop: 40 }}>
      <Row k="论文" v="τ-bench（2406.12045）、EvalGen（2404.12272）、CDM（Human Factors 1998）" />
      <Row k="一手" v="Palantir S-1 与官方博客、PostHog 公开工程手册、AWS APN Blog" />
      <Row k="复盘" v="OpenAI FDE 分享（ZenML LLMOps Database）" />
      <Row k="调研" v="ICONIQ Growth《The FDE Advantage》、Red Hat 2026 serving benchmark" />
    </div>
    <div style={{ fontSize: 28, color: muted, marginTop: 44, lineHeight: 1.6 }}>
      完整材料与逐条引用见 docs/research/，共七篇。
      <br />
      媒体转述的数字已单独标注，对外引用前请回溯原文。
    </div>
  </Shell>
);

const Closing: Page = () => {
  const active = useIsActivePage();
  return (
    <div style={{ ...fill, padding: '0 120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <style>{CSS}</style>
      <Grain />
      <div style={{ position: 'relative' }}>
        <div
          className="fdek-anim"
          style={{
            fontFamily: MONO,
            fontSize: 24,
            letterSpacing: '0.24em',
            color: 'var(--osd-accent)',
            ...anim('slip', 0, active, 460),
          }}
        >
          END
        </div>
        <div
          className="fdek-anim"
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontSize: 108,
            fontWeight: 900,
            lineHeight: 1.18,
            letterSpacing: '-0.02em',
            marginTop: 44,
            ...anim('rise', 140, active, 640),
          }}
        >
          模型早就够用了。
          <br />
          卡的是最后一公里。
        </div>
      </div>
    </div>
  );
};

export const transition: SlideTransition = {
  duration: 200,
  exit: {
    duration: 140,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-4px)' },
    ],
  },
  enter: {
    duration: 200,
    delay: 80,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    keyframes: [
      { opacity: 0, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};

const settle: SlideTransition = {
  duration: 280,
  exit: {
    duration: 160,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-6px)' },
    ],
  },
  enter: {
    duration: 280,
    delay: 100,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    keyframes: [
      { opacity: 0, transform: 'translateY(12px)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
    ],
  },
};

const bloom: SlideTransition = {
  duration: 240,
  exit: {
    duration: 160,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    keyframes: [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(1.01)' },
    ],
  },
  enter: {
    duration: 240,
    delay: 80,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    keyframes: [
      { opacity: 0, transform: 'scale(0.97)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
  },
};

Cover.transition = settle;
Closing.transition = settle;
S1.transition = bloom;
S2.transition = bloom;
S3.transition = bloom;
S4.transition = bloom;
S5.transition = bloom;
S6.transition = bloom;
S7.transition = bloom;

export const meta: SlideMeta = {
  title: '交付大模型，跟以前有什么不一样',
  createdAt: '2026-09-19T00:42:30.073Z',
};

export const notes: (string | undefined)[] = [
  '开场不用寒暄。直接说：这套东西讲的是 FDE 交付，重点不是模型多强，是交付方式变了。',
  '三个数字都来自公开报告。95% 和 85% 是行业面，25% 是技术面——后面第二个翻转会展开。',
  '快速念一遍就行，不要逐条解释，后面每条都有单独一页。',
  '这是最反直觉的一条，慢一点。',
  '重点讲循环依赖：你不可能在第一次会议上从专家嘴里拿到完整 rubric，不是他不专业，是原理上做不到。',
  'CDM 是 1998 年的成熟方法，不是我们发明的。要点：带着真实输出去见专家，别带问卷。',
  '这一条最好用现场例子：demo 演示三次成功，上线第二周出事。',
  '强调上标的方向：@ 是至少一次，^ 是每一次。',
  '这页停久一点，让数字砸下去。',
  '这条讲给业务方听效果最好。',
  '六到八周和四个月，这个比例是全场最该被记住的数字之一。',
  '如果听众里有做交付的，这一页可以互动：你们遇到过哪几条。',
  '技术受众从这里开始进入状态。',
  '这张表可以当交付规范直接用。',
  '不要评判哪个架构好，只讲代价。',
  '上下文工程这个词不用解释，直接讲本体。',
  '重点是最后一条：规则写进 prompt，改一条要重测全部。',
  '这三天是 Palantir 的真实节奏，不是理想化流程。',
  '这一条业务方最容易忽略：慢就是错。先花两页把“为什么要本地”讲清楚，再谈快慢。',
  '三条理由要分开说：合规是法规不许，隐私是出去了收不回，成本是高频才划算。最后一句是关键——一条都不命中就别自建，本地不是默认答案。',
  '这页对着客户所在行业念就行。制造能源那行可以展开讲边缘+云的混合。',
  '天梯图是全场最实用的一页，慢慢过。一句话带出逻辑：显存决定能不能跑，带宽决定跑多快，柱长是带宽真实比例。被问到具体型号就顺着档位念。',
  '接着讲读表的五条。第二条最反直觉——小 batch 下 5090 和十倍价格的专业卡每卡吞吐接近，很多客户不知道，容易买错。',
  '这页补 GPU 以外的设备：手机 NPU、树莓派、Mac。做边缘和端侧交付的听众重点看这页。',
  '柱子按真实比例画。被问细节就说：同 GPU 同模型，Red Hat 2026 的测试。重点落在“反过来”那行——单流 llama.cpp 更快，选型前先问负载形态。',
  '这页是决策树，可以当交付规范直接用。最后一条“多卡别用 llama.cpp”是最常见的踩坑。',
  '阈值都是经验值，不是标准，说的时候要讲清楚。量化那条留给技术受众，业务方跳过。',
  '最后一个翻转，也是最容易被跳过的一个。',
  '第五条是重点：模型半年换一代，客户不知道要重新验证，你就留了颗雷。',
  '这句话是 Palantir 的原话，可以直接引用。',
  '收束用三问，听众能带走。',
  '这页是给会后要材料的人看的，念一句就过。',
  '结尾不要拖，说完就停。',
];

export default [
  Cover,
  ThreeNumbers,
  Agenda,
  S1,
  S1a,
  S1b,
  S2,
  S2a,
  S2b,
  S3,
  S3a,
  S3b,
  S4,
  S4a,
  S4b,
  S5,
  S5a,
  S5b,
  S6,
  S6a,
  S6b,
  S6c,
  S6d,
  S6e,
  S6f,
  S6g,
  S6h,
  S7,
  S7a,
  S7b,
  ThreeQuestions,
  Sources,
  Closing,
] satisfies Page[];
