# 课题一：专业的「用户体验」Benchmark 怎么做

> 原始调研材料 · 采集 2026-09-19 · 每条结论后用 `[n]` 标注来源，编号对应文末「来源」表

---

## 1. Benchmark 指标全景

### 1.1 指标记号法：`@k` 与 `^k`

两种最常被混淆的上标记号，是理解 agent/检索类 benchmark 的关键。

| 记号 | 全称 | 含义 | 测的是 |
| --- | --- | --- | --- |
| **`@k`**（at k） | pass@k / recall@k / precision@k / nDCG@k | **在 k 次尝试（或前 k 个结果）中，至少一次成功 / 命中多少** | **能力上限**（best-of-k） |
| **`^k`**（pow k / hat k） | pass^k | **连续 k 次独立运行**，**每一次都成功**的概率 | **可靠性 / 一致性** |

- `pass@k` 是 OpenAI Codex 论文确立的代码生成标准指标：采样 k 个解，只要有一个通过单测就算成功。k 越大分数越高，衡量的是"模型有没有这个能力"。
- `pass^k` 由 **τ-bench（Sierra，2024）** 引入并推广，用来回答另一个问题："同一个任务跑 k 次，**次次都对**的概率是多少"。k 增大分数单调下降。**这是最贴近生产体验的指标** —— 用户要的不是"试 8 次能成一次"，而是"每次都成"。[1][2]
- 直觉对照：`pass@k` 乐观（∃），`pass^k` 悲观（∀）。
- **τ-bench 原论文实测**：GPT-4o 级别的 SOTA agent 任务成功率**不到 50%**；retail 域 **pass^8 低于 25%** —— 同一任务跑 8 次次次都对的概率不足四分之一。这是「demo 惊艳、上线翻车」最直接的量化解释。[1]

> 提示：`pass^k` 这个记号在不同论文里也写作 `pass^k`、`pass power k`、`k-consistency`，引用时最好同时写出定义。

### 1.2 检索 / 排序类指标（RAG 场景）

| 指标 | 定义 | 是否 rank-aware |
| --- | --- | --- |
| **Recall@k** | 有多少比例的问题，其真正相关的 chunk 至少有一个出现在 top-k 里 | 否 |
| **Precision@k** | top-k 中相关结果的占比 | 否 |
| **MRR** | 第一个相关结果位次的倒数均值 | 是 |
| **MAP** | 各位次 precision 的平均 | 是 |
| **nDCG@k** | 带位置折扣的分级相关度，与"理想排序"归一化；**同时支持二值和分级相关度** | 是 |

区分点：precision/recall 只看 top-k 里有几个相关项；MAP/MRR/nDCG 还看它们**排在第几位**。[3][4]

### 1.3 生成质量类

- **参考答案类**：Exact Match、F1、BLEU/ROUGE（已基本被判别式评估取代）
- **无参考类（rubric-based）**：instruction adherence（指令遵循）、relevance、completeness、helpfulness、format validity、refusal appropriateness [3]
- **对战类**：preference win rate、Elo / Bradley-Terry-Luce 评分

### 1.4 Agent 专属

| 指标 | 定义 |
| --- | --- |
| **Task Success Rate (TSR)** | 达成目标状态的任务占比 —— agentic 首要指标 [5] |
| **Trajectory efficiency** | 最优轨迹长度 / 实际轨迹长度，越接近 1 越好 [6] |
| **Redundancy rate** | 不属于任何最优轨迹的动作占比 [6] |
| **Tool call error rate** | 工具调用失败/参数错误比例 |
| **Containment rate** | 无需转人工即完成的比例 |
| **Cost per task** | 单任务美元成本，必须与成功率联读 |
| **Goal-shift robustness** | 用户中途改目标时的鲁棒性（AgentChangeBench）[7] |

### 1.5 体验 / 性能类

| 指标 | 说明 | 经验阈值 |
| --- | --- | --- |
| **TTFT**（Time To First Token） | 流式场景下用户感知延迟的第一指标 —— "多久开始回话" | **P50 < 1s，P99 < 3s** [8] |
| **TPOT** | 每输出 token 延迟，决定"读起来顺不顺" | — |
| **E2E latency** | 端到端完成时间 | — |
| **CSAT** | 1–5 分，统计 4/5 占比 | **>4.2 强；3.5–4.2 及格；<3.5 是"忍受"而非"选择"** [5] |
| **NPS** | 长期留存代理指标 | — |

---

## 2. 评价来源：人类 / 模型 / 脚本

三类评委各有不可替代的位置，成熟团队是**三层叠加**而非三选一。

### 2.1 脚本 / 程序化（Programmatic）

- **形式**：单元测试、schema 校验、正则/关键词、安全过滤器、回归测试、可执行环境判定（SWE-bench 跑测试、τ-bench 比对数据库末态）
- **优点**：确定性、零成本、可无限重跑、可进 CI
- **致命局限**：**程序化检查无法告诉你一个回答是否「好」「有帮助」「符合品牌调性」** [9]
- **适用**：有客观 ground truth 的任务 —— 代码、结构化抽取、数学、API 调用参数

### 2.2 模型（LLM-as-a-Judge）

- **一致性数据**：GPT-4 作为评委与人类标注者的一致率可达 **~85%**，而**人类彼此之间在同一任务上的一致率约 81%** —— 即强模型评委已可匹配甚至略超平均人类标注者 [10][11]
- **多评委共识**：多 judge 共识方案可达 **Macro F1 97.6–98.4%，Cohen's Kappa ≈ 0.95** [11]
- **方法要点**：
  - **pairwise 比 direct scoring 更稳** —— 两两比较的结果更稳定，与人类标注的差距也更小 [10]
  - rubric 必须显式、无歧义，否则一致性崩塌
  - 报告时要给置信区间与显著性检验 [12]
- **已知偏置**：position bias（偏好前一个）、verbosity bias（偏好长回答）、self-enhancement bias（偏好自家模型输出）
- **成本对照**：要达到一个标定良好的 LLM judge 一夜的产出，**需要 50+ 名全职标注员** [10]

### 2.3 人类

- **形式**：
  - **众包 pairwise 对战**（LMArena 模式）
  - **专家标注**（领域 golden set，医疗/法律/金融必需）
  - **真实用户隐式信号**（采纳率、重试率、复制率、点赞点踩、会话时长）
  - **定性访谈**：LLM 驱动的"即时用户体验访谈"，在用户刚用完时由模型追问 [13]
- **优点**：唯一的最终真值来源
- **局限**：贵、慢、有标注者间分歧（~81% 一致率 [10]）

### 2.4 推荐的混合分层

```
第 1 层  脚本     →  硬性门槛：格式、安全、可执行性（100% 覆盖，进 CI）
第 2 层  模型评委  →  规模化打分：相关性、完整性、指令遵循（每次提交全量跑）
第 3 层  人类     →  抽样校准 + 争议裁决 + golden set 维护（周/月度）
```
业界做法：**先用 LLM 过滤掉"明显对"和"明显错"的样本，把人类评审集中在难例上** [11]

---

## 3. LMArena / Chatbot Arena 的方法论

- 众包 pairwise 对战 → Elo / BTL 评分。累计 **1.5M+ 人类判断、100+ 系统** [14]
- **2026 演进**：
  - **Arena-Hard** —— 筛出更难、区分度更高的 prompt 子集
  - **分域榜单** —— coding / math / multilingual 独立，避免总分掩盖场景差异
  - **Vision Arena** —— 多模态独立赛道 [15]

**值得抄的四点设计**
1. 匿名 + 并排（消除品牌先验）
2. 只问"哪个更好"，不问打几分（pairwise > Likert）
3. 统计模型（BTL）而非平均分，可给置信区间
4. 主动采样：多派发给排名接近的模型对，提高单票信息增益

**已知偏差与修正研究**：Polyrating（去偏评分系统）[16]、自动排名与人类偏好一致性再评估 [17]、个性化 benchmark [18]

---

## 4. 一个可推荐的组合（2026 版）

严肃的模型/产品对比至少覆盖 [15]：
`Arena（偏好）` + `MMLU-Pro（知识）` + `GPQA-Diamond（推理）` + `SWE-bench Verified（工程）` + `≥1 个贴合部署场景的 agent benchmark`

**FDE 语境下追加两条（最重要的两条）**：
- 客户场景内的 **golden set**（100–300 条真实任务，人工标注）
- **pass^k 而非 pass@k** —— 交付验收看的是可靠性，不是能力上限

> 👉 **golden set 从 0 到 1 怎么建**（专家只给两小时的情况下）、**LLM judge 怎么用少量专家标注做标定**、以及为什么「先定 rubric 再打分」在原理上行不通（criteria drift）—— 见 [07-fde-hard-problems.md](./07-fde-hard-problems.md) §1。

---

## 来源

| # | 来源 |
| --- | --- |
| [1] | [τ-bench: A Benchmark for Tool-Agent-User Interaction (arXiv 2406.12045)](https://arxiv.org/abs/2406.12045) |
| [2] | [Sierra: Benchmarking AI agents (τ-bench 博客)](https://sierra.ai/blog/benchmarking-ai-agents) |
| [3] | [Essential LLM Evaluation Metrics · LangWatch](https://langwatch.ai/blog/essential-llm-evaluation-metrics-for-ai-quality-control) |
| [4] | [Evaluation Metrics for Search and Recommendation Systems · Weaviate](https://weaviate.io/blog/retrieval-evaluation-metrics) / [Precision & Recall at K · Evidently AI](https://www.evidentlyai.com/ranking-metrics/precision-recall-at-k) |
| [5] | [AI Agent Evaluation Metrics for Production (2026)](https://www.buildmvpfast.com/blog/ai-agent-evaluation-metrics-production-guide-2026) |
| [6] | [AgentChangeBench (arXiv 2510.18170)](https://arxiv.org/pdf/2510.18170) |
| [7] | 同 [6] |
| [8] | [Agent Metrics That Actually Matter: Latency, Cost, Success Rate](https://agentixforce.ai/blog/agent-metrics-latency-cost-success-rate) |
| [9] | [LLM-as-a-Judge vs Human-in-the-Loop · Maxim AI](https://www.getmaxim.ai/articles/llm-as-a-judge-vs-human-in-the-loop-evaluations-a-complete-guide-for-ai-engineers/) |
| [10] | [LLM-as-a-Judge vs Human Evaluation · Galileo](https://galileo.ai/blog/llm-as-a-judge-vs-human-evaluation) |
| [11] | [LLM-as-a-judge vs. human evaluation · SuperAnnotate](https://www.superannotate.com/blog/llm-as-a-judge-vs-human-evaluation) / [Evaluating LLM-Evaluators · Eugene Yan](https://eugeneyan.com/writing/llm-evaluators/) |
| [12] | [How to Correctly Report LLM-as-a-Judge Evaluations (arXiv 2511.21140)](https://arxiv.org/pdf/2511.21140) |
| [13] | [In-the-Moment UX Interviews (arXiv 2502.15226)](https://arxiv.org/pdf/2502.15226) |
| [14] | [Chatbot Arena 论文 (arXiv 2403.04132)](https://arxiv.org/pdf/2403.04132) |
| [15] | [Chatbot Arena: Elo, Methodology, Caveats](https://benchmarkingagents.com/chatbot-arena/) / [What Is the Chatbot Arena Benchmark (2026)](https://futureagi.com/glossary/chatbot-arena-conversation-benchmark/) |
| [16] | [Polyrating (arXiv 2409.00696)](https://arxiv.org/pdf/2409.00696) |
| [17] | [Re-evaluating Automatic LLM System Ranking (arXiv 2501.00560)](https://arxiv.org/pdf/2501.00560) |
| [18] | [Personalized Benchmarking (arXiv 2604.18943)](https://arxiv.org/pdf/2604.18943) |

> ✅ [1] 已回溯 arXiv 原文核实：τ-bench 确实定义 `pass^k`，用于「评估 agent 行为在多次试验下的可靠性」，并报告 retail 域 pass^8 < 25%、SOTA agent 成功率 < 50%。
> ⚠️ 本文其余带数字的结论（85%/81% 一致率、CSAT 分档、TTFT 阈值）来自二手博客，属经验值而非标准。
