# 课题六：FDE 交付流程研究

> 原始调研材料 · 采集 2026-09-19 · `[n]` 对应文末来源表
> 本篇汇总了目前网上能找到的、**质量最高的几份一手流程材料**：PostHog 工程手册（公开 handbook）、OpenAI FDE 实践复盘（ZenML LLMOps Database）、ICONIQ Growth 行业调研、Perspective AI 的 FDE 运营 playbook、Palantir S-1 与官方博客。

---

## 0. 三份不同来源的流程，先并排看

同一件事，三家给出的阶段划分高度一致，但**时间尺度和重心不同** —— 这个差异本身就是重要信息。

| | **Palantir（产品型 FDE）** | **OpenAI（模型层 FDE）** | **PostHog（SaaS 型 FDE）** |
| --- | --- | --- | --- |
| **节奏** | **Day 0 就交付可用的东西** | 6–8 周技术管线 + **4 个月建立信任** | 按周计，**最小一周起做** |
| **阶段** | Day0–1 建 ontology → Day2 接 AIP → Day3 交付可用应用 [1] | 定义 trajectory/eval → 建管线 → pilot 迭代 → 规模化 [2] | Intake → Scope → Execute → Wrap-up [3] |
| **核心资产** | **ontology（客户领域本体）** | **eval set（专家轨迹标注）** | **可复用工件（compounding work）** |
| **拒绝什么** | 拒绝"调研 90 天交一份 PPT"的咨询模式 [1] | 拒绝**过早泛化** [2] | 拒绝按小时计价、拒绝无限扩张的 scope [3] |

---

## 1. Palantir：Ship on Day One

### 1.1 首周时间线（最具体的一份公开描述）[1]

| 时间 | 动作 |
| --- | --- |
| **Day 0–1** | 把客户领域建模成 **Foundry ontology** —— 实体（entities）、属性（properties）、关联类型（link types） |
| **Day 2** | 把 ontology 接到 **AIP**，把实体**暴露成 LLM 可推理的 tool call** |
| **Day 3** | 交付一个可运行的、**以 LLM 为基础但被数据接地**的应用 |

- 内部口号就是 **"ship on day one"**：第一周内一定要交付能跑的东西 —— 一个 Foundry transform、一次 Gotham 调查、一块跑在真实数据上的看板。[1]
- **这一模式明确拒绝咨询套路**：不做"调研 90 天、交付一份 deck"。Palantir 在 **2020 年 9 月的 S-1** 中写明：商业客户的 time-to-value 以**天**计，因为 FDE 交付的是**生产软件，而不是实施路线图**。[1]
- FDE 写的是**生产级代码**，包括数据管线与 ontology 建模 —— "只是碰巧坐在客户那儿，而不是公司园区里的工程师"。[1]

### 1.2 双人配对：Echo × Delta

Palantir 在 **2010 年代初**部署政府机构时摸索出的结构：一个人把组织混乱翻译成部署计划，另一个人把计划变成可用软件。[4]

| 角色 | 内部代号 | 拥有什么 |
| --- | --- | --- |
| **Deployment Strategist（DS）** | **Echo** | **问题本身与它周围的组织** —— 在写任何代码前做问题定义与干系人管理 |
| **Forward Deployed Software Engineer（FDSE）** | **Delta** | **代码本身** —— 在客户运营环境里构建生产就绪的工作流，专注**单一客户** |

**组建建议**：先用**一人兼两职的 FDE 起步**，等部署复杂度超出一个人能扛的范围，再拆分职能。小型部署上两个角色本来就趋于合一。[4]

### 1.3 为什么 ontology 是关键
ontology 是**"客户特定定制"与"产品可复用"之间的接缝** —— 每个客户的本体不同，但建模方法、工具暴露方式、上层应用框架是共享的。这对应 playbook 第 5 条（见 [04](./04-fde-cases.md) §4）。

---

## 2. OpenAI：Eval 先于实现

来源为 OpenAI FDE 团队的公开复盘，整理在 ZenML LLMOps Database。[2]

### 2.1 Zero-to-One 复用度曲线（最值得抄的一条）

> **第一个客户 ≈ 20% 可复用 → 再做 2–3 次迭代达到 ≈ 50% 可复用 → 推入规模化业务运营**

这条曲线回答了"FDE 什么时候该停手交给产品团队"的问题，比任何定性描述都有用。

### 2.2 问题选择：只做足够大的问题
- 目标锁定**价值在数千万到低数十亿美元量级**的问题，明确避开已商品化的工作。
- 产能有策略地分成两类：
  - 一类是**已有明确产品假设**的场景 → 找完美的 design partner
  - 一类是**技术问题本身有趣**的行业（如半导体、生命科学）→ 预期收获研究洞察

### 2.3 Eval 驱动开发（FDE 流程的技术内核）
- 核心原则：**"基于 LLM 的应用，没有验证其效力的 evaluation 就不算完成。"**
- 具体做法（半导体项目）：**与客户领域专家一起定义 trajectory —— 专家解决特定问题时会采取的动作序列** —— 由此构造出带标注的 evaluation set。
- 这与 [01](./01-ux-benchmark.md) §1.4 的轨迹指标（trajectory efficiency、redundancy rate）直接对应：**专家轨迹既是评测基准，也是 agent 的设计蓝本。**

### 2.4 技术模式
- **混合架构原则**：**"能用确定性的地方就用确定性，只在 LLM 的概率性真正带来价值的地方才用 LLM。"** 硬约束走确定性代码，推理任务交给 LLM。
- **工具接入**：给 agent 配领域适配的工具（API、模拟器、执行环境），让它能像专家一样迭代求解。

### 2.5 两条教训
1. **最大的坑是过早泛化** —— 盯着 ChatGPT 的功能去造"通用企业方案"，却没有深入解决任何一个具体客户的问题。
2. 正确做法是**"在单个客户的问题上扎到极深"**，这几乎总能产出可泛化的洞察 —— 即"先做不可规模化的事"这条创业原则。

### 2.6 Morgan Stanley 的真实时间构成（重要校正）
- 技术管线：**6–8 周**
- **建立信任：额外 4 个月的 pilot、用户反馈与迭代，才真正上线**

> 这条经常被忽略：**技术只占交付周期的三分之一**。把 6–8 周当成项目总周期去报价，是 FDE 项目翻车的常见起点。

---

## 3. PostHog：公开的 FDE 工程手册

PostHog 把整套 FDE 工作方式写进了公开 handbook，是目前网上最可直接抄的操作手册。[3]

### 3.1 四阶段生命周期

| 阶段 | 内容 |
| --- | --- |
| **Intake（受理）** | 只需捕获足够分类与路由的信息：**客户、产品领域、一句话诉求** |
| **Scope（定范围）** | 对 engagement 分类、估算工作量、必要时报价。**产出是一份客户可在承诺前确认的简短 brief** |
| **Execute（执行）** | 动手：埋点、数据建模、迁移、集成、看板、参考实现 |
| **Wrap-up（收尾）** | 确认交付已上线并被认可 → 交回销售/CS → **把经验沉淀成文档供后续 engagement 复用** |

### 3.2 工作分类：一道判断题

engagement 分两类：
- **Compounding work（复利型）** —— 产出可复用工件，惠及多个客户
- **Scoped deliverables / support（一次性）** —— 客户专属答案

判断标准就一句话：**"这个产出，对另一个面临类似问题的客户有用吗？"**

### 3.3 工作原则
- 解决**真问题**，而不是最容易做的工单；必要时**纠正客户的心智模型**
- **"从 MVP 开始。动手前先说清楚最小可接受答案是什么。"**
- **先用产品的内置能力，再考虑定制工程**
- 造可复用的东西，不造一次性的
- 沟通时**先说实质性发现**，别铺垫
- 与产品工程团队保持紧密协作

### 3.4 商务规则（最容易被忽略、却最关键的一节）
- **Discovery / scoping 免费，且限时**
- **engagement 最少一周起；短于一周的按 support 报价**
- **ProServ 按交付物报价，不按小时**
- **scope 翻倍 = 重新报价，不是谈判**
- **"永远不要当场编一个数字。** 客户问价，就说一天内给报价，然后走 account exec 的流程。" —— 定价与客户交接由销售拥有

---

## 4. Perspective AI：FDE 职能的运营 Playbook

这是把 FDE 当作一个**组织职能**来设计的框架（前三节是项目层，这一节是组织层）。[5]

### 4.1 五阶段生命周期（带 owner / 交付物 / 放行条件）

| 阶段 | 时间 | Owner | 交付物 | **放行门槛（Gate）** |
| --- | --- | --- | --- | --- |
| **Discovery** | Weeks 1–4 | FDE | 界定清楚的问题陈述 | **有一个值得做原型的问题** |
| **Prototype** | Weeks 3–6 | FDE | **跑在真实数据上的可用原型** | 干系人签字确认 |
| **Deploy** | Weeks 6–10 | FDE + 平台工程 | 生产系统 | **上线、有监控、有 on-call** |
| **Productize** | Days 60–90 | FDE + 核心工程 | **核心产品里的通用化功能** | **≥1 个功能被产品化** |
| **Handoff** | Days 90–120 | FDE + CS | 文档 + 已受训的负责人 | **所有权完成移交** |

> 注意阶段是**重叠**的（Discovery 1–4 周 vs Prototype 3–6 周），不是瀑布。

### 4.2 组织与编制
- **起步编制：2–3 名 FDE**。两人才能有知识共享；三人可支撑两个在跑的 engagement + 一个在 onboarding。
- **扩张单元是 pod**：**1 名 FDE + 1 名 PM + 1 名数据/平台工程师，负责一个战略客户。**
- **汇报线：FDE 应汇报给产品或工程，虚线连销售 —— 绝不能反过来。** 成熟的职能放在 post-sale 组织，同时保持对产品与一线的强虚线。

### 4.3 指标体系
- **主指标：productization rate** —— 每个 engagement 向核心产品输出的功能数。**目标：day 90 前至少 1 个。**
- 辅助指标：time-to-prototype、**time-to-production（目标 ~10 周）**、**handoff 在 120 天内完成**、roadmap influence 占比。

> 这套指标的精妙之处：**主指标不是客户满意度，也不是营收，而是"有多少东西回流进了产品"** —— 它是防止 FDE 退化成咨询的唯一硬性机制。

### 4.4 四种致命反模式
1. **披着 FDE 皮的咨询公司** —— 没有任何能力被通用化
2. **向销售汇报** —— 会把 discovery 掰向"促成交易"而非"找到真问题"
3. **跳过 discovery 直接做原型** —— 做出漂亮但没人要的东西
4. **没有 handoff 纪律** —— 职能被永久困在运维里，无法接新项目

---

## 5. Anthropic Applied AI：时间分配与产出形态

Anthropic 的 **Applied AI Engineer 与 FDE 是同一职能的两个名字** —— 嵌入客户、在企业账户内交付 AI 应用。[6]

### 5.1 时间分配（罕见的量化描述）
| 比例 | 做什么 |
| --- | --- |
| **40%** | 在**客户办公室**用 Claude API 做原型 |
| **30%** | 与客户工程团队做架构设计 |
| **30%** | **把信号回流到 Anthropic 的产品与研究组织** |

> 30% 的时间用于回流 —— 这与 Perspective AI 的 productization rate 主指标是同一件事的两种表述。

### 5.2 交付物形态（2026 年的具体化）
FDE 交付的东西已经很具体：**MCP server、sub-agent、agent skill**，外加 white-glove 部署支持，并把**可复用的模式**回流给产品与工程。

> 对照 [03](./03-agent-architecture.md)：这三样正好是 harness 的三个层次 —— 工具层（MCP）、编排层（subagent）、能力封装层（skill）。**FDE 的交付物本质上就是一套客户专属的 harness。**

### 5.3 角色定位
是 **solutions engineering + ML engineering + 嵌入式产品管理**的混合体。

---

## 6. 行业数据：ICONIQ Growth《The FDE Advantage》

基于 ICONIQ《2026 State of AI Report》。[7]
> ⚠️ 该报告**未公开样本量、受访者画像、调查期与误差范围**，只说明来自"自有调研、组合公司经验与从业者访谈"。引用时请标注这一局限。

### 6.1 采用率
| 数字 | 含义 |
| --- | --- |
| **37%** | AI builder 目前已雇佣 FDE |
| **22%** | 正在招聘 FDE |
| **50%** | 计划把该角色作为 GTM 的**长期组成部分** |
| **34%** | 预计到 **2027 年**将覆盖的企业客户比例 |

### 6.2 定位与商业模式
| 数字 | 含义 |
| --- | --- |
| **38%** | 把 FDE 当作**营收引擎**（贡献扩张与留存） |
| **24%** | 把 FDE 当作**产品情报引擎** |
| **30%** | **打包进软件订阅**成本 |
| **29%** | **单独收专业服务费** |
| **25%** | **混合模式** |

> 定价原则：**为结果定价（price for outcomes）**，FDE 成为高溢价商业动作的交付臂。

### 6.3 薪酬结构
- **65%** 的 FDE 有浮动薪酬
- 平均结构：**73% 固定 / 27% 浮动**
- 浮动部分**主要挂钩客户留存与续约**

### 6.4 真实报价区间（轶事性，但有参考价值）
| 类型 | 价格 |
| --- | --- |
| 早期 AI-native 公司 | 年合同 **$40–45K**，含**一周** FDE 支持 |
| 传统企业软件厂商 | **$500K 六个月 pilot**（目标 10× 财务影响） |
| 基础设施公司 | 约 **$10K / 天** |

### 6.5 组织扩张的一个样本
**ElevenLabs：FDE 职能在不到一年内从 12 人扩到 60+ 人。**

### 6.6 单元经济（另一来源）[8]
- 前沿实验室的 FDE 年营收贡献 **$3–15M**，服务大型企业合同时利润率为**全成本的 3–15 倍**
- **追逐多场景走量的实验室会产生经营亏损** —— 聚焦是经济上的必要条件，不只是战略偏好

---

## 7. 流程的失败模式与批评

### 7.1 经济结构性问题 [9]
- 模式是高接触的，**营收随人头增长而非 license 增长**。
- **没有"每次交付都回流平台"这个机制的话，FDE 只是一家名字更好听的昂贵咨询公司。**
- 具体退化路径：FDE 从**产品反馈回路**漂移成**主要构建机制** → 定制工作流与集成被困在单个客户环境里 → 新用例需要更多人 → 交付模式只能靠加人扩张。

### 7.2 "咨询陷阱" [9]
有些组织把 FDE 当成**不成熟平台与薄弱运营模式的人肉补丁**，靠嵌入式工程师无限期救火，而不去改进管控与治理。**规模一来，就变成昂贵的英雄主义和集体倦怠。**

### 7.3 人的可持续性 [9]
- 角色特征：**没有明确 scope、没有清晰职级阶梯、高差旅负担、为别人的运营现实长期负责**。
- **FDE 的倦怠通常不是"量"的倦怠，而是"上下文切换 + 情绪劳动"的倦怠** —— 对外要始终是公司友好、能干、稳得住的那张脸，私下在硬扛技术难题。
- 流失代价高昂，因为每个 FDE 身上都沉淀着不可替代的客户上下文。

### 7.4 复制难度
**Palantir 全球商业负责人称，试图复制 FDE 模式的科技公司大多在失败，每一个复制品都是"半吊子（a half measure）"。**[9]

### 7.5 新人常犯的错误 [10]
见来源，要点包括：把自己当成客户的外包开发、不敢纠正客户的错误假设、跳过 scope 直接写代码、不记录学到的东西。

---

## 8. 综合：一套可落地的 FDE 流程（本文对四份材料的合成）

> ⚠️ 本节是我对上述材料的**综合归纳，非任一文献的原文流程**，对外引用请注明为自有观点。

```
Week 0   资格审查
         ├─ 有没有明确的高管 sponsor？
         ├─ 能不能拿到数据与环境访问权限？
         ├─ 成功标准是否已经写下来、且双方认可？
         └─ 问题价值量级是否值得做？（OpenAI：数千万美元以上）
         Gate：四项全绿才开工

Week 1   Ship on Day One
         ├─ Day 0–1  领域建模（ontology / 数据模型）
         ├─ Day 2    工具暴露（MCP server / tool call）
         ├─ Day 3    交付第一个能跑在真实数据上的东西
         └─ 同时：与领域专家一起标注 20–30 条专家轨迹 → eval 雏形
         Gate：客户亲眼看到跑在自己数据上的东西

Week 2–4 Discovery（注意：与 prototype 重叠，不是前置）
         ├─ 工作流测绘：现状几步、几次切屏、单件耗时
         ├─ 定位"命名约束"（named constraint）—— 到底卡在哪一步
         ├─ 扩充 golden set 至 100–300 条
         └─ 确定确定性/LLM 的分界线（OpenAI 混合架构原则）
         Gate：一个值得做原型的问题被清晰界定

Week 3–6 Prototype → Proof of Value
         ├─ 跑在真实数据上的原型
         ├─ eval 跑起来：pass^k、TSR、cost per task（见 01）
         └─ 与基线做同批次前后对比（业务指标，不是模型指标）
         Gate：干系人签字 + 业务指标有可见改善

Week 6–10 Deploy
         ├─ 生产部署、监控、on-call
         ├─ 不可逆动作的人工闸门
         └─ 轨迹可观测（不只是日志）
         Gate：上线、有监控、有人值班

Day 60–90 Productize
         └─ 至少 1 个能力通用化进核心产品
         Gate：productization rate ≥ 1   ← 防咨询化的唯一硬机制

Day 90–120 Handoff
         ├─ 文档 + 培训 + 客户侧 owner 指定
         ├─ 客户能独立：改 prompt、重跑 eval、排查故障
         └─ 复盘沉淀：这次哪些东西是 compounding work？
         Gate：所有权完成移交
         ── Palantir：交接不是附录，交接就是验收标准
```

> 👉 这条流程里最难的五个环节 —— **eval 怎么冷启动、ontology 怎么建、确定性边界画在哪、交接怎么验、哪些活儿不该接** —— 单独展开在 [07-fde-hard-problems.md](./07-fde-hard-problems.md)。

### 贯穿全程的三条纪律
1. **Discovery 免费且限时**，scope 翻倍就重新报价，不做无限拉伸（PostHog）
2. **Eval 先于实现** —— 没有 eval 的 LLM 应用不算完成（OpenAI）
3. **每个 engagement 都要问"这对下一个客户有用吗"** —— 答案为否的工作要么不做，要么明确标记为一次性（PostHog + Perspective AI）

---

## 来源

| # | 来源 | 质量 |
| --- | --- | --- |
| [1] | [Palantir FDE Complete Guide: Role, Skills, Customer Handling · LabHub](https://labhub.hopto.org/blog/culture/2026-03-23-palantir-fde-role-skills-customer-handling-guide?lang=en) / [A Comprehensive Analysis of Palantir's FDE Model · Medium](https://medium.com/activated-thinker/a-comprehensive-analysis-of-palantirs-forward-deployed-engineering-model-4502a036b5e4) / Palantir S-1 (2020-09) | 二手，但引用 S-1 一手 |
| [2] | [OpenAI: Forward Deployed Engineering · ZenML LLMOps Database](https://www.zenml.io/llmops-database/forward-deployed-engineering-bringing-enterprise-llm-applications-to-production) | **高** —— OpenAI FDE 团队公开分享的整理 |
| [3] | [How forward deployed engineers work · PostHog Handbook](https://posthog.com/handbook/forward-deployed-engineering/how-we-work) | **最高** —— 公司自己的公开操作手册 |
| [4] | [FDE vs Deployment Strategist · Paraform](https://www.paraform.com/blog/forward-deployed-engineer-vs-deployment-strategist) / [A Day in the Life of a Palantir Deployment Strategist · Palantir Blog（一手）](https://blog.palantir.com/a-day-in-the-life-of-a-palantir-deployment-strategist-951cb59a5a96) | 中 + 一手博客 |
| [5] | [The FDE Playbook: How to Structure, Run, and Scale an FDE Function in 2026 · Perspective AI](https://getperspective.ai/blog/the-forward-deployed-engineer-playbook-how-to-structure-run-and-scale-an-fde-function-in-2026) | **高** —— 最系统的组织层框架 |
| [6] | [Anthropic's Applied AI Engineers · Perspective AI](https://getperspective.ai/blog/anthropic-applied-ai-engineers-forward-deployed-claude-enterprise) / [Forward Deployed Engineer, Applied AI · Anthropic 职位（一手）](https://job-boards.greenhouse.io/anthropic/jobs/5302966008) | 中 + 一手 JD |
| [7] | [The FDE Advantage: Turning Deployment into Compounding Value · ICONIQ Growth](https://www.iconiq.com/growth/reports/the-fde-advantage-turning-deployment-into-compounding-value) | **高** —— 机构调研，但方法论未披露 |
| [8] | [Forward-Deployed Engineer Economics 2.0 · Digitech Bytes](https://digitechbytes.com/emerging-consumer-tech-explained/forward-deployed-engineer-economics-2-0-the-unit-economics-math-six-months-later/) | 中 |
| [9] | [Is Forward Deployed Engineering Worth It? Costs, Burnout & Exit Options · Vibe Engines](https://vibeengines.com/handbook/is-forward-deployed-engineering-worth-it) / [FDEs and the reality of enterprise AI · The Microsoft Cloud Blog](https://themicrosoftcloudblog.com/2026/02/forward-deployed-engineers-and-the-reality-of-enterprise-ai/) / [The FDE Model Is Backward · Legion Intel](https://www.legionintel.com/command-papers/forward-deployed-engineering) / [The rise of the FDE · LeadDev](https://leaddev.com/career-development/the-rise-of-the-forward-deployed-engineer-fde) | 中–高，**批评视角必读** |
| [10] | [10 Mistakes New Forward Deployed Engineers Make · fde.academy](https://fde.academy/blog/mistakes-new-forward-deployed-engineers-make) / [Three Years of Forward Deployed Engineers · Medium](https://medium.com/@desmond2112/three-years-of-forward-deployed-engineers-fde-7bc47b44752f) | 中，一线经验 |

### 其他值得读但本文未展开的
- [The FDE Blueprint · Rocketlane](https://www.rocketlane.com/blogs/fde-blueprint)
- [The Forward Deployed Engineering Operating Model · Vishleshan](https://vishleshan.ai/blogs/forward-deployed-engineering-operating-model) —— 四阶段：embedded discovery → 针对命名约束构建 → 与既有系统集成 → 对生产结果负责
- [How to Build a Forward-Deployed Engineering Function: A 2026 Founder's Playbook · Perspective AI](https://getperspective.ai/blog/how-to-build-forward-deployed-engineering-function-founder-playbook-2026)
- [Forward Deployed Engineer · Wikipedia](https://en.wikipedia.org/wiki/Forward_Deployed_Engineer)
- [What Tools Do FDEs Use? An Ontology-First Open Stack · ObjectOS](https://www.objectos.ai/en/blog/forward-deployed-engineer-tools/)
- [Everest Group：Palantir – Inside the category of one](https://www.everestgrp.com/palantir-inside-the-category-of-one-forward-deployed-software-engineers-blog/)（抓取被 403，需手动打开）
- [Alvarez & Marsal：The Rise and Role of the Forward Deployed Engineer (PDF, 2026-04)](https://www.alvarezandmarsal.com/sites/default/files/2026-04/The%20Rise%20and%20Role%20of%20the%20Forward%20Deployed%20Engineer.pdf)（抓取被 403，需手动下载 —— **咨询机构一手 PDF，优先补读**）

> ⚠️ 核实提示：§1.1 的 Palantir 首周时间线来自二手整理，建议对外引用前找 Palantir 官方博客或 S-1 原文确认；§6 的 ICONIQ 数字未披露样本量；§8 是本文的综合归纳，非文献原文。
