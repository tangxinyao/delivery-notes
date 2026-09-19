# 课题四：FDE 真实案例（按行业分类）与方法论

> 原始调研材料 · 采集 2026-09-19 · `[n]` 对应文末来源表
> ⚠️ 本页数字多来自媒体、厂商博客与财报转述，**对外引用前请回溯原文核实**。

---

## 1. 定义、起源与市场背景

- FDE = **嵌入客户环境的工程师**，直接在客户现场让复杂软件真正跑起来。
- Palantir **2005 年**发明这一角色，最初服务 CIA、NSA、美军情报单位 —— 传统咨询模式解决不了他们的问题。[1]
- 2025–2026 年被 **Anthropic、OpenAI、Google DeepMind、Databricks、Cohere** 直接复制。[2]
- **2026 年 5 月，两周之内**：ServiceNow（联合 Accenture）、Cognizant、Anthropic、OpenAI 相继正式设立 Forward Deployed Engineering 组织。[3]

### 为什么现在热：部署鸿沟
- **MIT：95% 的企业 AI pilot 没有可衡量的业务影响。**[2]
- **Gartner：近 85% 的企业 AI 项目因集成与运营摩擦无法进入部署。**[4]
- 核心矛盾已不是"证明模型能用"，而是"让模型在真实业务系统里能用"。

### 薪酬市场
- FDE 被称为"AI 领域薪酬最高的通才岗位"：Palantir 中位数总包约 **$215K**，Anthropic / OpenAI 资深 FDE **$785K+**。[5]

---

## 2. 案例按行业分类

### 2.1 国防 / 军工 / 航天

| 案例 | 内容 | 来源 |
| --- | --- | --- |
| **美国海军 ShipOS** | 提升造船环节的可见性与风险管理 | [6] |
| **Project Maven** | 提升战场态势感知，加速决策 | [6] |
| **NATO Maven Smart System** | **2025 年 3 月，NATO 为全部 32 个成员国采购** | [6] |
| **GE Aerospace** | 用 AI 维护军用航发，**产出同比 +26%** | [6] |
| **Palantir Gotham** | 支撑美军、乌克兰、NATO 的国防业务 | [6] |

> 行业特征：数据绝对不出域 → **本地推理 + local agent 是硬约束**；采购周期长但一旦进入极难替换。

### 2.2 金融服务

| 案例 | 内容 | 来源 |
| --- | --- | --- |
| **Morgan Stanley × OpenAI（2023）** | **FDE 实践的奠基案例**。OpenAI 第一个部署 GPT-4 的企业客户。场景：把财富管理研报交到全体理财顾问手里。技术难点：当时 **RAG 还不是既成范式**，需自研 retrieval tuning 保证研报被准确召回且可信。**6–8 周**完成技术管线，含检索优化、guardrails、基础 eval 框架 | [7] |
| **Palantir 金融业务** | 欺诈检测、合规报送、实时风险建模；**AIP 在按揭欺诈检测等强监管场景的采用推动美国商业营收同比 +71%** | [6] |
| **保险承保** | 自动化保险承保，加速复杂的航空航天险种决策 | [6] |
| **OpenAI vs Anthropic 的金融/法律争夺** | 两家在金融与法律垂直市场正面竞争 | [8] |

> 行业特征：**安全性在 2026 年已成为采购硬性要求**（金融、医疗、法律、保险面对幻觉与数据泄露有真实法律责任）[9]；Claude 在长文档推理（法律审查、财务分析）上历史口碑更强 [9]。

### 2.3 医疗 / 生命科学

| 案例 | 内容 | 来源 |
| --- | --- | --- |
| **Palantir 医疗与生科** | 统一临床、运营、监管数据，打通从研究流程到诊疗优化；基于 AIP 构建帮医生/研究者更快定位关键信息的 copilot | [6] |
| **Concordance Healthcare Solutions** | 用 Foundry 构建生态，试图打破碎片化的医疗网络 | [6] |

### 2.4 制造业

| 案例 | 内容 | 来源 |
| --- | --- | --- |
| **Palantir Foundry + AIP 制造方案** | 整合设备遥测、供应链系统与人工输入，实时监控生产健康度；AIP 自动化维保排程、用预测模型优化产能 | [6] |
| **Airbus** | 在工业环境中使用 Palantir 技术 | [6] |
| **AI 原生 MES** | AIPCon 8 演示：从零重构生产流程的 AI-native 制造执行系统 | [10] |

### 2.5 能源 / 公用事业

| 案例 | 内容 | 来源 |
| --- | --- | --- |
| **BP** | 通过油气作业优化**节省 10 亿美元** | [6] |
| **Palantir × Jacobs Smart Algorithms** | 在一个**已经优化过**的水处理厂再获 **全厂 20% 电力节省**，消除运营罚款，降低温室气体排放 | [6] |

> 这条是最好的对外叙事素材：**"已经优化过的厂里再省 20%"** 比"从零开始省 X%"有说服力得多。

### 2.6 跨行业 / 通用流程自动化

| 案例 | 内容 | 来源 |
| --- | --- | --- |
| **10Clouds 的 8 个 AI bot** | 处理时长 **−57%**；分析师单件耗时 **30 分钟 → 13 分钟**；屏幕切换 **−87.5%**；流程步骤 **−37.5%** | [11] |
| **AWS Partner-Led FDE（2026）** | AWS 把 **10 亿美元 agentic AI 投入**延伸到战略咨询伙伴，组建 AWS 认证的专职工程团队，目标**以"天"而非"月"交付生产级 agentic 系统** | [12] |
| **建筑业 / 保险业** | AIPCon 8 演示覆盖制造、保险、建筑 | [10] |

### 2.7 软件工程本身（AI 厂商的自用 & 外销）

- Claude 系列尤其是 **Claude Code 在真实软件工程任务上建立了明显领先**，coding 工作流被认为是企业采用格局变化的主要驱动力。[9]
- **2026 年 4 月，Anthropic 在企业采用率上首次超过 OpenAI**：Ramp 数据 Anthropic **34.4%** vs OpenAI **32.3%**。[9]

---

## 3. 商业验证数据

| 指标 | 数字 | 来源 |
| --- | --- | --- |
| Palantir 股价 | IPO 约 $19（2021）→ 2022 跌至 $6 → **五年回报 640%** | [2] |
| Palantir 营收 | **2026 Q1 同比 +85%**，上市以来最快 | [2] |
| Palantir 美国商业营收 | **同比 +71%** | [6] |
| Anthropic ARR | 2025 年底 $9B → **2026 年 3 月初 $19B+**（Bloomberg）→ 媒体称年内 $44B+ | [9][2] |
| OpenAI ARR | **2026 年 2 月底 $25B+** | [9] |
| Anthropic 企业服务合资公司 | 与 Blackstone、Hellman & Friedman、Goldman Sachs 成立，估值 **$1.5B**，创始承诺 **$300M** | [2] |

---

## 4. Palantir Playbook：七条组织设计原则 [13]

1. **招"工程师 - 外交官"**（engineer-diplomat），技术 + 客户沟通双强
2. **嵌入客户现场**，不是远程交付
3. **第一天就发版**（ship on day one），用可用的东西开对话
4. **把客户调研当成工程工作**，而不是售前工作
5. **构建客户特定的 ontology（本体）** —— 这是复用与定制之间的接缝
6. **产品反馈经由 FDE 回流**，FDE 是产品路线图的输入源
7. **拒绝变成系统集成商（SI）**，否则会退化成人力外包

**验收标准**：如果 FDE 团队撤走后客户内部没人能运维这套系统，那就不是"pilot 转生产"，而是"装了一个黑盒"。**交接不是附录，交接就是验收标准。**[13]

---

## 5. 行业特征对照表（交付视角）

| 行业 | 数据出域 | 主要约束 | 推荐技术姿态 |
| --- | --- | --- | --- |
| 国防 / 军工 | **绝对不可** | 合规、保密等级 | 本地推理（llama.cpp/vLLM 私有化）+ local agent |
| 金融 | 基本不可 | 监管、审计留痕、幻觉责任 | 私有云 + 强 guardrails + 完整轨迹可观测 |
| 医疗 | 不可（HIPAA 类） | 数据脱敏、临床可解释 | 本地 + 人在环 |
| 制造 / 能源 | 部分可 | OT/IT 打通、实时性 | 边缘推理 + 云端训练 |
| 通用企业流程 | 可 | 速度与 ROI | Cloud agent + SaaS MCP 化 |

---

## 6. 与前三个课题的接口

| 课题 | 在 FDE 语境下的用法 |
| --- | --- |
| [体验 benchmark](./01-ux-benchmark.md) | 验收不能只看模型分数 → 落到 **TSR / pass^k / TTFT / CSAT / cost-per-task**，并建立**客户场景内的 golden set**。尤其 **pass^k 而非 pass@k** —— 客户要的是次次都对 |
| [本地推理引擎](./02-local-inference-engines.md) | 国防、金融、医疗的数据不出域是硬前提；选型（vLLM vs SGLang vs llama.cpp）直接决定并发能力与单位成本 |
| [Agent 架构](./03-agent-architecture.md) | **ontology + MCP 工具层 + 编排框架**，是"客户特定定制"与"产品可复用"之间的标准接缝 —— 正好对应 playbook 第 5 条 |

---

## 来源

| # | 来源 |
| --- | --- |
| [1] | [A Comprehensive Analysis of Palantir's FDE Model · Medium](https://medium.com/activated-thinker/a-comprehensive-analysis-of-palantirs-forward-deployed-engineering-model-4502a036b5e4) |
| [2] | [FDE Model Drove 640% Returns · MindStudio](https://www.mindstudio.ai/blog/palantir-forward-deployed-engineer-model-anthropic-openai) |
| [3] | [Forward Deployed Engineering: How AI Agents Get Into Production · Innobu](https://www.innobu.com/en/articles/forward-deployed-engineering-ai-agents-enterprise-2026.html) |
| [4] | [Beyond The Proof Of Concept · Forbes Tech Council](https://www.forbes.com/councils/forbestechcouncil/2026/02/10/beyond-the-proof-of-concept-how-forward-deployed-engineering-accelerates-enterprise-ai-adoption/) |
| [5] | [2026 FDE Compensation Report (1,200 FDEs) · Perspective AI](https://getperspective.ai/blog/2026-forward-deployed-engineering-compensation-report-1200-fdes) |
| [6] | [Palantir at AIPCon 9: AI Transformations Across Industries · Investing.com](https://www.investing.com/news/transcripts/palantir-at-aipcon-9-ai-transformations-across-industries-93CH-4557860) / [What Is Palantir AIP · instinctools](https://www.instinctools.com/blog/palantir-aip/) / [Palantir Impact](https://www.palantir.com/impact/) / [Palantir's AI Strategy · Klover.ai](https://www.klover.ai/palantir-ai-strategy-path-to-ai-dominance-from-defense-to-enterprise/) |
| [7] | [OpenAI Forward Deployed Engineering · ZenML LLMOps Database](https://www.zenml.io/llmops-database/forward-deployed-engineering-bringing-enterprise-llm-applications-to-production) |
| [8] | [OpenAI and Anthropic battling in Finance and Legal · TechRadar](https://www.techradar.com/pro/openai-and-anthropic-are-battling-to-conquer-the-ai-market-in-finance-and-legal) |
| [9] | [Anthropic vs OpenAI Business Adoption 2026 · MindStudio](https://www.mindstudio.ai/blog/anthropic-vs-openai-business-adoption-2026) / [Claude Customer Stories（一手）](https://claude.com/customers) |
| [10] | [Inside the AIPCon 8 Demos: Manufacturing, Insurance, Construction · Palantir Blog（一手）](https://blog.palantir.com/inside-the-aipcon-8-demos-transforming-manufacturing-insurance-and-construction-2ef01d53ea96) |
| [11] | [FDEs for GenAI Implementation · 10Clouds](https://10clouds.com/services/forward-deployed-engineers-genai-implementation/) |
| [12] | [Introducing Forward Deployed Engineering for Partners · AWS APN Blog（一手）](https://aws.amazon.com/blogs/apn/introducing-forward-deployed-engineering-for-partners-winning-the-future-of-enterprise-ai/) |
| [13] | [Palantir's FDE Playbook · Perspective AI](https://getperspective.ai/blog/palantir-forward-deployed-engineering-playbook-anthropic-openai-copying) / [Forward Deployed（书）](https://forwarddeployedbook.com/) / [How to Build Your 1st FDE Team · Per Aspera](https://peraspera.us/forward-deployed/) |

### 一手来源优先清单（做对外材料时优先引用这几个）
- [Palantir Impact 页](https://www.palantir.com/impact/) —— 官方案例
- [Palantir Blog · AIPCon 演示复盘](https://blog.palantir.com/) —— 官方带细节
- [AWS APN Blog · Partner-Led FDE](https://aws.amazon.com/blogs/apn/introducing-forward-deployed-engineering-for-partners-winning-the-future-of-enterprise-ai/) —— 官方
- [Claude Customer Stories](https://claude.com/customers) —— 官方
- [ZenML LLMOps Database](https://www.zenml.io/llmops-database/) —— 有结构化的真实部署记录
