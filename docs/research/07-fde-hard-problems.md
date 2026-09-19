# 课题七：FDE 的五个真问题

> 原始调研材料 · 采集 2026-09-19 · `[n]` 对应文末来源表
>
> 前六篇回答的是"是什么、怎么选、流程怎么走"。这一篇专门挖**现场真正卡人的五件事** —— 都是前面材料反复提到"很重要"、却没人讲清楚"具体怎么做"的地方。

| # | 问题 | 为什么难 |
| --- | --- | --- |
| 1 | **专家时间稀缺下，eval 怎么冷启动** | 人人都说 eval 先行，但客户专家一周只给你两小时 |
| 2 | **怎么快速把业务语言变成可执行的领域模型** | ontology 是 Palantir 的核心资产，但建模过程是黑盒 |
| 3 | **确定性和 LLM 的边界画在哪** | "能确定性就确定性"是对的废话，边界判据没人给 |
| 4 | **交接怎么才算真的完成** | "客户能独立运维"无法验证，于是永远交不掉 |
| 5 | **哪些活儿不该接** | 判断标准都是事后诸葛亮 |

---

## 1. Eval 冷启动：专家只给你两小时

### 1.1 先认清一个反直觉的事实：criteria drift

**EvalGen / "Who Validates the Validators?"（Shankar et al.）发现的核心现象** [1]：

> **你需要评判标准来给输出打分，但"给输出打分"这件事本身才帮你定义出评判标准。**

这是一个**循环依赖**。论文把它命名为 **criteria drift**：
- 开发者在快速迭代标准，而不是先定标准后打分
- **部分评判标准是依赖于具体观察到的输出的**，而非独立的、预先存在的客观准则
- 因此："标准细化"和"打分"必须**在交互中同时进行**，不能分两步走

**对 FDE 的直接含义**：别指望第一次会议就从专家嘴里拿到完整 rubric。**拿到的一定是错的** —— 不是专家不专业，是这件事本质上做不到。正确的姿势是**带着一批真实输出去见专家**，让他边看边定标准。

### 1.2 用好那两小时：Critical Decision Method

知识获取领域有一套成熟方法，叫 **认知任务分析（CTA）**，其中最适合 FDE 的是 **Critical Decision Method（CDM）**。[2]

- **CDM 是什么**：以**探询式问题（probe questions）引导的、对单个真实事件的多轮回溯**。
- **为什么适合**：专家的决策大量是**直觉性、隐性的** —— 直接问"你是怎么判断的"，得到的是事后合理化的教科书答案。CDM 通过锚定**一个具体的、非常规的真实案例**反复追问，把隐性知识挖出来。
- **实操结构**（经典四遍法）：
  1. **第一遍**：让专家讲一个近期的、有挑战性的真实事件，出个时间线
  2. **第二遍**：在时间线上标出**决策点**
  3. **第三遍**：对每个决策点用探针追问 —— 当时你注意到了什么线索？有哪些备选？为什么排除了？如果信息换成 X 你会怎么做？新手在这儿最容易错在哪？
  4. **第四遍**：What-if —— 变换条件，探边界
- CDM 在**时间压力大、复杂度高、不确定性强**的领域（尤其临床）已被广泛验证。[2]

> **两小时怎么排**：别做需求访谈。用 CDM 挖**两个真实案例**，你会拿到 15–25 个决策点、每个点上的线索与备选。这些**就是 trajectory 标注**，也正是 OpenAI FDE 说的"与专家一起定义专家会采取的动作序列"（见 [06](./06-fde-process.md) §2.3）。

### 1.3 从 20 条到 300 条：golden set 的自举

**最有效的 golden set 由三部分组成** [3]：
1. **人工精心构造的样本** —— 覆盖已知边界情况（← 你的 CDM 产出）
2. **真实生产样本**（去除 PII）
3. **合成扩展** —— 补齐覆盖不足的场景

**合成扩展的方法**：
- **Evol-Instruct** 类做法 —— 给 LLM 一小批真实标注样本，让它**按同样的模式生成变体与新样本** [4]
- 关键发现：**哪怕只加入少量人工标注样本，也能显著提升整个合成数据集的质量与有效性**，在 few-shot 场景尤其明显 [3]
- **合成数据解决的是冷启动与覆盖缺口** [3]，不是替代真实数据

**主动学习（Active Learning）的角色**：
- AL 本身有冷启动问题（没有初始标注就没法挑样本）；**ActiveLLM** 这类工作正是用 LLM 来突破 AL 的冷启动 [5]
- 实操上：先用 CDM 的 20–30 条做种子 → 合成扩展到几百条 → **用模型的不确定性/分歧挑出最值得人标的样本** → 下次再见专家时，只让他标这几十条

### 1.4 判官标定：用少量专家标注对齐 LLM judge

标定流程是一个**可重复的循环** [6][7]：

```
1. 从生产输出中采样
2. 收集盲标的 SME（领域专家）反馈
3. 更新 anchor 样本与 rubric
4. 用 IRR（评分者间信度，如 Cohen's Kappa）验证
5. 持续追踪 agreement，回到 1
```

要点：
- **Few-shot 标定**：把专家标注的范例作为 in-context 示例喂给 judge，校准它的评判阈值（ShotJudge 路线）[6]
- **Kappa 掉了怎么办**：如果任务定义没变，就**收紧 rubric + 刷新 few-shot 示例 + 对失败样本做抽查**，而不是换模型 [6]
- **要防两种漂移**：**rubric drift** 与 **domain drift** —— 它们会悄无声息地侵蚀一个已蒸馏好的 judge [6]
- 领域专家场景下，**rubric-based 评估 + LLM judge** 的组合有专门的方法论与实证验证（Xpertbench 等）[8]

### 1.5 合成：一套"两小时专家预算"的 eval 冷启动流程

> ⚠️ 本节为综合归纳，非文献原文流程。

```
会前（0 专家时间）
  └─ 跑通一个粗糙的 v0，攒 50–100 条真实输出 —— 因为 criteria drift，
     你必须带着输出去见专家 [1]

第 1 小时（CDM）
  ├─ 挖 2 个真实困难案例，出时间线
  ├─ 标决策点，逐点追问线索/备选/排除理由
  └─ 产出：15–25 个决策点 = trajectory 种子

第 2 小时（边看边定标准）
  ├─ 拿 v0 的真实输出给专家过，让他边看边说"这条为什么不行"
  ├─ 实时把他的话转成 rubric 条目（接受 criteria drift，不抵抗它）
  └─ 产出：初版 rubric + 20–30 条已标注样本（judge 的 few-shot anchor）

会后（0 专家时间）
  ├─ Evol-Instruct 式合成扩展至 200–300 条 [4]
  ├─ 用 anchor 样本标定 LLM judge，算 Cohen's Kappa [6]
  └─ 用不确定性采样挑出 30–50 条最有价值的待标样本

下次见面（30 分钟）
  └─ 只标那 30–50 条 → 重算 Kappa → 收敛
```

---

## 2. 从业务语言到可执行的领域模型

### 2.1 一条必须先记住的反直觉规则

> **在跑 LLM 之前先把 ontology 定义出来。对着一个未定义的 schema 去 prompt LLM，产出的实体类型会极不一致，后期归一化的代价非常高。** [9]

也就是说：**"让 LLM 自动从数据里抽出本体"是个陷阱**。正确顺序是**先有骨架，再用 LLM 填肉**。

### 2.2 可用的自动化程度

- **OntoEKG** —— LLM 驱动的管线，从非结构化企业数据加速生成领域本体。它把建模任务**拆成两个模块**：
  - **extraction 模块**：识别核心的类（classes）与属性（properties）
  - **entailment 模块**：把这些元素**逻辑地组织成层级**，再序列化成标准 RDF [10]
- **OntoLearner** —— 用 LLM 做本体学习的模块化 Python 库 [11]
- **LLMs4OL 2025 挑战赛结论**：表现最好的是**混合管线** —— 商用 LLM + 领域微调的 embedding + 微调方法；关键成功要素是 **prompt engineering、RAG、集成学习** [9]
- 综述：LLM 赋能的知识图谱构建 [12]

### 2.3 让 ontology 直接为 agent 服务

这是 Palantir 路线的精髓（见 [06](./06-fde-process.md) §1.1）：**ontology 不是文档，是 tool 的定义来源** —— 实体被暴露成 LLM 可调用的 tool call。

前沿做法 **HEAR**：分层超图本体（Stratified Hypergraph Ontology）[10]
- **Graph Layer**：虚拟化带溯源信息的数据接口
- **Hyperedge Layer**：编码 **n 元业务规则与流程协议**（普通图只能表达二元关系，但"审批需要 A、B、C 三方在条件 D 下同时满足"是 n 元的）
- 以证据驱动的推理循环**动态编排本体工具**，做结构化多跳分析，**无需重训 LLM**
- 供应链任务（如订单履约阻塞的根因分析）准确率达 **94.7%**

> 对 FDE 的含义：**业务规则应该建模进本体，而不是写进 prompt。** 写进 prompt 的规则无法审计、无法复用、改一条要重测全部。

### 2.4 一个务实的三天建模路径

> ⚠️ 综合归纳。

```
Day 0  骨架先行（人来定，别交给 LLM）
       ├─ 从客户的"名词"入手：他们开会时反复说的 10–20 个实体
       ├─ 画出实体间的关联类型（link types）
       └─ 标出哪些关系是 n 元的（多半是审批、合规、调度）

Day 1  用 LLM 填肉（extraction）
       ├─ 喂 DB schema + SOP 文档 + CDM 访谈记录
       ├─ 抽属性、抽实例、抽同义词表（客户内部黑话 → 规范名）
       └─ 人工过一遍，重点看"抽出来但骨架里没有"的东西 —— 那是骨架漏了

Day 2  暴露成工具
       ├─ 每个实体 → 查询/操作的 tool call（MCP server）
       ├─ n 元业务规则 → 确定性代码，不进 prompt（见 §3）
       └─ 权限与溯源随工具一起定义，不是事后补

Day 3  交付第一个跑在真实数据上的应用
```

---

## 3. 确定性 vs LLM：把边界画清楚

OpenAI FDE 的原则是"能用确定性就用确定性"（[06](./06-fde-process.md) §2.4）。这里补上**具体判据**。

### 3.1 一条核心判据

> **模型负责生成与评估；确定性代码负责决策。**[13]

推论：**别再靠 prompt engineering 去强制业务逻辑**，而要把非确定性的模型**包进确定性的软件边界里**。[13]

### 3.2 谁拥有控制流

> **顶层循环属于确定性代码**（Python、Go、Temporal、Step Functions）。**模型在一次迭代内部被调用，而不是由它掌管迭代。**[14]

这条直接推翻了很多"让 agent 自己决定下一步"的设计。对照 [03](./03-agent-architecture.md) §1：这正是 Plan-and-Execute / ReWOO 相对 ReAct 的结构性优势 —— 控制流在代码里而不在模型脑子里。

### 3.3 把模型输出当作不可信输入

**Enforcement engineering**：**默认把模型输出视为不可信。每一个响应都必须先证明自己满足系统约束，才被允许通过；证明不了就被修正、拒绝，或路由到 fallback。**[15]

### 3.4 边界划分速查

| 这件事 | 归谁 | 理由 |
| --- | --- | --- |
| 顶层控制流、循环、重试 | **代码** | 模型不该掌管自己的迭代 [14] |
| 状态管理、事务边界 | **代码** | 需要可恢复、可回放 |
| 业务规则、合规约束、阈值 | **代码** | 要可审计、可单测、改一条不用重测全部 |
| 权限、配额、超时、速率 | **代码** | 安全边界：agent 能读什么、能发什么、能跑多久、客户端能看到什么 [15] |
| 输出格式校验 | **代码** | schema 校验是确定性的 |
| 自然语言理解、意图识别 | **模型** | 确定性代码做不了 |
| 非结构化信息抽取 | **模型** | 同上 |
| 开放式探索、需求发现、规格不完整的重构 | **模型** | **灵活性的价值超过可复现性** [16] |
| 主观质量评估 | **模型**（judge） | 程序化检查判断不了"好不好"（见 [01](./01-ux-benchmark.md) §2.1） |

### 3.5 实证支持
- COBOL→Python 现代化任务的对照研究：**确定性编排持续改善最坏情况正确率，并降低性能方差** [16]
- 但同一研究也承认：**开放式软件工程活动**（探索性重构、需求发现、规格不完整）**仍可能受益于自适应的 LLM 驱动控制** [16]
- 另有面向 coding agent 的确定性控制平面设计 [17]

> **一句话记法**：**确定性负责"不能错的"，LLM 负责"说不清的"。** 两者交界处放校验。

---

## 4. 交接：怎么才算真的完成

Palantir 说"交接就是验收标准"（[04](./04-fde-cases.md) §4），但没说怎么验。这里补上可操作的部分。

### 4.1 Bus factor：把"能独立运维"变成一个数

> **Bus factor = 最少需要多少名团队成员突然消失，项目就会因为剩下的人没有相应知识而停滞。**[18]

对 FDE 的翻译：**交接完成 = 客户侧这套系统的 bus factor ≥ 2**。这是一个可以当场问、当场验的数。

提高 bus factor 的手段 [18]：活的交接文档、把 code review 当知识转移、刻意轮岗、**每个关键角色配一份 playbook**。

### 4.2 文档里真正重要的东西

- 应包含：**架构概览、runbook、部署说明、已知缺陷、以及非正式的经验知识** [19]
- **最关键的一条**：**由"我修过两次的问题"攒出来的 runbook，比从零写的 runbook 有用得多。**[19]
- 交接清单要**优先放"缺了就会导致运营故障"的东西**：凭证、runbook、备份 [19]

### 4.3 最容易漏的：访问权限与密钥

> 访问权限、许可与密钥处理必须和 IT/安全一起过：**明确什么转移、什么吊销、密钥怎么轮换**。API key、服务账号、证书、第三方登录都需要在外部团队不再需要访问后轮换 —— **"转移"和"轮换"是两件必须分别打勾的事。**[19]

### 4.4 交接不是一个阶段，是贯穿始终的

> 有效的交接应该**从一开始就规划为渐进的知识转移**，在项目全程穿插**样本评审、演练、数据就绪度测试**等增量步骤。[19]

> **会话会蒸发，文档会留存** —— 每个系统的交接会都要录，会后写成文档。[19]

### 4.5 FDE 专属的交接体检表

> ⚠️ 综合归纳。前四项来自通用软件交接实践 [18][19]，后五项是 AI 系统特有的。

**通用**
1. [ ] Bus factor ≥ 2（客户侧至少两人能独立处理）
2. [ ] runbook 存在，且**至少一半条目来自真实发生过的故障**
3. [ ] 凭证已转移 **且** 已轮换（两个独立的勾）
4. [ ] 交接会已录像并转成文档

**AI 系统特有**
5. [ ] 客户能**独立重跑 eval**，并看懂结果（不只是会点按钮）
6. [ ] 客户知道**什么情况下必须重跑 eval** —— 模型换代、prompt 改动、数据分布变化
7. [ ] **rubric 与 golden set 的所有权已移交**，客户知道怎么往里加样本
8. [ ] 客户能区分"模型错了"和"检索错了"和"工具错了" —— 即**轨迹可观测且他会看**
9. [ ] 存在**降级预案**：模型不可用/质量骤降时，业务怎么继续

> 第 6 条是最容易被忽略的。模型半年换一代，客户如果不知道要重新验证，你交出去的就是一颗定时炸弹。

---

## 5. 哪些活儿不该接

综合 [06](./06-fde-process.md) 的 PostHog 商务规则与 Perspective AI 的反模式，加上一线经验帖。

### 5.1 已有的两条硬规则
- **"这个产出对另一个面临类似问题的客户有用吗？"** 答案为否 → 要么不做，要么明确标记为一次性并单独计价 [06 §3.2]
- **scope 翻倍 = 重新报价，不是谈判**；**永远不要当场编一个数字** [06 §3.4]

### 5.2 新人最常犯的错误 [20]
- 把自己当成客户的外包开发
- **不敢纠正客户的错误假设**（而 PostHog 明确要求"必要时纠正客户的心智模型"）
- 跳过 scope 直接写代码
- 不记录学到的东西

### 5.3 一份"该说不"的信号清单

> ⚠️ 综合归纳。

| 信号 | 为什么危险 |
| --- | --- |
| "这个特例你帮我特判一下" **第三次出现** | 说明领域模型建错了，特判会无限繁殖 |
| 客户拒绝提供领域专家时间 | eval 建不起来 → 无法验收 → 无法交接 |
| 没有明确的高管 sponsor | 上线时推不动，做完也没人用 |
| 要求你承诺一个"当场给出的"报价 | 一定报低，后面全是亏损与摩擦 |
| 需求是"把 X 做得像 ChatGPT 一样" | 没有具体问题，属于 OpenAI 说的"过早泛化"陷阱 [06 §2.5] |
| 客户想让你**长期驻场做运维** | 这是咨询陷阱的入口，FDE 会被永久困住 [06 §7.2] |
| 问题价值量级远低于投入 | OpenAI 的判据：目标应是数千万美元以上的问题 [06 §2.2] |
| 客户已经有答案，只想要你背书 | 不是工程问题，是政治问题 |

---

## 6. 这五个问题与前六篇的关系

| 本篇 | 补的是哪里的空 |
| --- | --- |
| §1 Eval 冷启动 | [01](./01-ux-benchmark.md) 讲了指标与评委分层，但没讲**专家稀缺时怎么起步** |
| §2 领域建模 | [06](./06-fde-process.md) §1 说 Palantir Day 0–1 建 ontology，但**怎么建是黑盒** |
| §3 确定性边界 | [06](./06-fde-process.md) §2.4 引了 OpenAI 的原则，但**没有判据** |
| §4 交接验证 | [04](./04-fde-cases.md) §4 说"交接即验收"，但**没有验收方法** |
| §5 该说不 | [06](./06-fde-process.md) §3.4 有商务规则，但**没有识别信号** |

---

## 来源

| # | 来源 | 质量 |
| --- | --- | --- |
| [1] | [Who Validates the Validators? Aligning LLM-Assisted Evaluation of LLM Outputs with Human Preferences（EvalGen，arXiv 2404.12272）](https://arxiv.org/abs/2404.12272) | **高** —— criteria drift 概念的出处，已回溯原文 |
| [2] | [Hoffman, Crandall & Shadbolt (1998): Use of the Critical Decision Method to Elicit Expert Knowledge · Human Factors](https://journals.sagepub.com/doi/10.1518/001872098779480442) / [Cognitive Task Analysis: Eliciting Expert Cognition in Context (2025)](https://journals.sagepub.com/doi/10.1177/10944281241271216) / [CTA 在临床研究中的系统综述 · PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8903544/) | **高** —— 经典方法学文献 |
| [3] | [Creating and Validating Synthetic Datasets for LLM Evaluation · Arize AI](https://arize.com/blog/creating-and-validating-synthetic-datasets-for-llm-evaluation-experimentation/) / [Pre-production LLM evaluation · Arize](https://arize.com/resources/llm-evaluation/pre-production-llm-evaluation/) / [How to Build a Golden Dataset · QASkills](https://qaskills.sh/blog/golden-dataset-llm-evaluation-guide) | 中–高 |
| [4] | [Evol-Instruct: Generating Synthetic Labeled Data with LLMs · The Neural Base](https://theneuralbase.com/synthetic-data-generation/learn/beginner/evol-instruct/) | 中 |
| [5] | [ActiveLLM: LLM-Based Active Learning for Textual Few-Shot Scenarios · TACL](https://direct.mit.edu/tacl/article/doi/10.1162/TACL.a.63/134746/ActiveLLM-Large-Language-Model-Based-Active) / [arXiv 2405.10808](https://arxiv.org/html/2405.10808) | **高** |
| [6] | [How to Calibrate Your LLM Judge With Human Annotations · Galileo](https://galileo.ai/blog/calibrate-llm-judge-human-annotations) / [How to Calibrate LLM-as-Judge with Human Corrections · LangChain](https://www.langchain.com/resources/llm-as-a-judge) | 中–高 |
| [7] | [LLM Evaluation Rubrics: Templates & Reviewer Calibration · Twine](https://www.twine.net/blog/llm-evaluation-rubrics/) / [Calibrating Scores of LLM-as-a-Judge · GoDaddy](https://www.godaddy.com/resources/news/calibrating-scores-of-llm-as-a-judge) | 中 |
| [8] | [Xpertbench: Expert Level Tasks with Rubrics-Based Evaluation (arXiv 2604.02368)](https://arxiv.org/pdf/2604.02368) / [Rubric-Based Evaluations & LLM-as-a-Judge · Adnan Masood](https://medium.com/@adnanmasood/rubric-based-evals-llm-as-a-judge-methodologies-and-empirical-validation-in-domain-context-71936b989e80) | 高 / 中 |
| [9] | [Build an Enterprise Ontology Your LLM Can Use (2026-06)](https://agileleadershipdayindia.org/blogs/knowledge-graphs-graphrag-agent-grounding/building-enterprise-ontology-llm.html) / [Building Knowledge Graphs with LLMs: Five Methods Compared](https://zerofuturetech.substack.com/p/building-ontology-with-llms-five) | 中 |
| [10] | [LLM-Driven Ontology Construction for Enterprise Knowledge Graphs（OntoEKG / HEAR）](https://awesomepapers.io/graph-learning/papers/2602.01276) | 高 |
| [11] | [OntoLearner: A Modular Python Library for Ontology Learning with LLMs (arXiv 2607.01977)](https://arxiv.org/pdf/2607.01977) | 高 |
| [12] | [LLM-empowered knowledge graph construction: A survey (arXiv 2510.20345)](https://arxiv.org/pdf/2510.20345) | 高 |
| [13] | [From Harness to Enforcement: Designing Deterministic Guardrails for LLM Systems](https://bh3r1th.medium.com/from-harness-to-enforcement-designing-deterministic-guardrails-for-llm-systems-6a9912ba7eba) | 中 |
| [14] | [Designing Reliable LLM Agents With Deterministic Control Flow · HackerNoon](https://hackernoon.com/designing-reliable-llm-agents-with-deterministic-control-flow) / [Deterministic Guardrails for Non-Deterministic Agents · DEV](https://dev.to/anna_danilec/deterministic-guardrails-for-non-deterministic-agents-127b) | 中 |
| [15] | [Guardrails Are Not Optional: Engineering Safety, Reliability and Control in LLM Agents](https://medium.com/@sendoamoronta/guardrails-are-not-optional-engineering-safety-reliability-and-control-in-llm-agents-e1c7ccccf2b9) | 中 |
| [16] | [Deterministic vs. LLM-Controlled Orchestration for COBOL-to-Python Modernization (arXiv 2605.09894)](https://arxiv.org/pdf/2605.09894) | **高** —— 有对照实验 |
| [17] | [A Deterministic Control Plane for LLM Coding Agents (arXiv 2606.26924)](https://arxiv.org/pdf/2606.26924) | 高 |
| [18] | [Bus Factor Explained · VeryCreatives](https://verycreatives.com/blog/bus-factor) | 中 |
| [19] | [Software Transition Plan: A Practical Handoff Checklist · briskData](https://briskdata.com/insights/software-transition-plan.php) / [Software Handover Checklist · Miquido](https://www.miquido.com/blog/software-project-handover-checklist/) / [Software Handover Checklist 2026 · Progressive Robot](https://www.progressiverobot.com/2026/08/07/software-handover-checklist-changing-development-partners/) | 中 |
| [20] | [10 Mistakes New Forward Deployed Engineers Make · fde.academy](https://fde.academy/blog/mistakes-new-forward-deployed-engineers-make) | 中 |

> ⚠️ 核实提示：[1] 的 criteria drift 定义已回溯 arXiv 原文确认（该论文未公开参与者人数，只说明是"qualitative study"）。§1.5、§2.4、§4.5、§5.3 均为本文的综合归纳，非文献原文流程，对外引用请注明为自有观点。
