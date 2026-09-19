# 课题三：Agent 架构对比与技术选型

> 原始调研材料 · 采集 2026-09-19 · `[n]` 对应文末来源表

---

## 1. 单 Agent 的四种推理架构：ReAct 及其竞争者

这一层决定"一个 agent 内部怎么想、怎么调工具"，是最基础也最常被忽略的选型。

### 1.1 四种范式

| 架构 | 机制 | LLM 调用模式 |
| --- | --- | --- |
| **ReAct** | 想 → 做 → 观察 → 再想，**逐步进行**，每步都基于上一步的观察结果 [1] | **每个 action 一次 LLM 调用** |
| **Plan-and-Execute** | **先出完整计划**，逐步交执行器；出错或变化时回到 planner 重规划 [1][2] | 计划期一次大调用 + 执行期轻量调用 |
| **ReWOO** | 比 P&E **耦合更紧** —— 计划里就写死了每步用哪个工具、参数是什么。Planner 生成完整的相互依赖计划（**不看任何工具反馈**）→ Worker 执行 → Solver 汇总证据出答案 [3] | 三次（Planner / Worker / Solver），**彻底消除 observation-dependent reasoning 带来的 prompt 冗余与重复调用** |
| **Reflexion** | 执行 → 自我批评 → 带着反思重试 | 多轮，额外反思开销 |
| **LLMCompiler** | Planner **流式输出任务 DAG**（每个任务含工具、参数、依赖列表）；Task Fetching Unit 在依赖满足时调度执行 → **并行化**。原论文声称 **3.6× 加速** [4] | 计划 + 并行执行 |

### 1.2 对比与选择判据

**核心权衡（最重要的一句）**：没有任何一种模式能保证更低 token、更低延迟或更高准确率 —— **结果取决于工作负载与实现**。[1]

因此实践中的选法是**"你能忍受哪种失败模式"** [3]：

| 架构 | 你要忍受的代价 |
| --- | --- |
| ReAct | **浪费 token**（每步一次调用，长任务累积延迟与 API 成本都很高）[2] |
| ReWOO | **僵化**（计划不看反馈，环境一变就全盘皆错） |
| Reflexion | **延迟**（反思轮次） |
| Plan-and-Execute | **重规划的复杂度**（什么时候该回 planner？） |
| LLMCompiler | DAG 构建复杂度；工具需可并行 |

**成本结构差异**：ReAct 是"每个动作一次 LLM 调用"，动作多时延迟与成本线性累积；Plan-then-Execute **把主要 LLM 成本前置到规划阶段**，之后执行可以更快更便宜地推进。[2]

**安全维度**：Plan-then-Execute 因为"计划先于数据"，天然更能抵抗 prompt injection —— 恶意数据在执行期才出现，无法改写已定的计划。这是把它做成 secure 实现的核心论点。[5]

**前沿改进**：
- **ReflAct** —— 把反思从"批评上一步"改为"持续对齐目标状态与世界状态"[6]
- **KAIJU** —— 意图门控的 executive kernel [7]
- **Profile-Then-Reason** —— 为工具增强 agent 设定有界语义复杂度 [8]

---

## 2. 多 Agent 的四种编排范式

| 范式 | 代表框架 | 适合 |
| --- | --- | --- |
| **Graph-based**（图 / 状态机） | LangGraph、Microsoft Agent Framework | 流程可控、需要 checkpoint 与人工介入 |
| **Role-based**（角色分工） | CrewAI、Agno | 业务角色天然可拆（研究员 / 写手 / 审核） |
| **Handoff-based**（交接） | OpenAI Agents SDK | 客服类、意图路由 |
| **Hierarchical**（层级） | Google ADK | 主管 agent + 下属 agent |

来源：[9]

---

## 3. Agent 类型对比

### 3.1 按工作形态：Coding Agent vs CoWork Agent

| 维度 | **Coding Agent** | **CoWork / 协同办公 Agent** |
| --- | --- | --- |
| **任务边界** | 明确（改这个 bug、加这个功能） | 模糊（"帮我推进这个项目"） |
| **验证信号** | **强且自动** —— 编译、单测、lint、CI | **弱** —— 没有"跑一下就知道对不对" |
| **环境** | 文件系统 + git + shell，可回滚 | SaaS API（邮件、日历、CRM、文档），**多为不可逆副作用** |
| **人机关系** | 结果可批量审查（diff / PR） | 需过程中介入与授权 |
| **主流实现** | Claude Code、Cursor、Devin、OpenAI Codex、GitHub Copilot agent、Google Jules、Kiro | Manus 类通用 agent、企业流程 agent、MCP 化的 SaaS 编排 |
| **难点** | 长上下文、跨文件一致性 | **授权与审计**、幂等性、失败回滚 |

> 关键差异：**Coding agent 之所以率先跑通，是因为它有免费的、可自动执行的 verifier（测试）**。CoWork 类 agent 缺这个，所以 eval 必须自建（见 [01-ux-benchmark.md](./01-ux-benchmark.md) 的三层评委结构）。

### 3.2 按部署位置：Cloud Agent vs Local Agent

| 维度 | **Cloud Agent** | **Local Agent** |
| --- | --- | --- |
| **定位** | 团队优化**上线速度**时的选择 [10] | 团队优先**数据驻留、审计控制、执行边界**时的选择 [10] |
| **工作方式** | 把代码 clone 到远端环境，你干别的时它在跑，跑完还你一个 branch / diff / PR [11] | 在你的终端 / IDE 里交互式协作 |
| **适合任务** | 长时、异步、可并行的任务 | 快速、交互式、需要人盯着的任务 |
| **代表** | Devin、OpenAI Codex（cloud）、GitHub Copilot cloud agent、Cursor Cloud Agents、Google Jules、Kiro Web、Capy [12] | Claude Code、Cursor 本地模式 |
| **产品化** | Codex 桌面应用专为**并行监管多个长时 agent** 设计，app/CLI/IDE/web 状态统一 [13] | Claude Code 强调终端内直接协作 + **对 agent 行为的可编程控制**（subagent、hook）[13] |

**业界共识（两条）**：
1. **绝大多数团队两者都跑** —— cloud agent 用于协作，local agent 用于安全或延迟有要求的场合。[10]
2. Cloud coding agent 正在成为**独立于本地 coding assistant 的一个品类**，而非它的远程版本。[11]

**混合形态**：Cursor 被描述为最完整的 hybrid 平台 —— 本地开发 + 常驻 cloud agent 结合。[13]
VS Code 在 2026-02 正式把自己定位成"多 agent 开发之家"。[14]

**FDE 语境的映射**：
- 客户数据不出域（金融/政务/军工）→ **Local agent + 本地推理引擎**（见 [02](./02-local-inference-engines.md)）
- 客户已在云上、要的是交付速度 → **Cloud agent**
- 实际交付里最常见的是**混合**：本地 agent 做需要看客户内网数据的部分，cloud agent 做长时批处理

---

## 4. 协议层：MCP 成为基础设施

- **2025 年 12 月，Anthropic 把 MCP 捐给 Linux Foundation**，成立 **Agentic AI Foundation**（与 Block、OpenAI 共同发起）。MCP 与 A2A 从厂商规范变成中立标准。[15]
- 分工定型：**MCP = 工具连接层（基础设施）**，**编排框架 = 控制平面**。[16]
- LangGraph 平台已原生支持消费任意 MCP server 作为 tool source，无需自写 adapter。[15]
- 设计模式视角的综述：[17]

---

## 5. Harness Engineering：比框架更关键的一层

"Harness" = 包在模型外面的 **prompts + tools + 上下文策略 + hooks + sandbox + subagents + 反馈回路 + 恢复路径**。已被当作独立工程学科（"LLM as the new OS"）。[18][19]

### 5.1 上下文工程
- 核心定义（Anthropic）：**找到能最大化目标达成概率的、最小的高信号 token 集合**。[20]
- 三板斧：**memory（记忆）、compaction（压缩）、tool clearing（工具结果清理）**。[21]

### 5.2 Subagent
- 专职 subagent 拥有**干净的上下文窗口**；主 agent 只持有高层计划；subagent 返回**压缩摘要（通常 1000–2000 token）**，避免污染主上下文。[20]

### 5.3 Dynamic Workflows（Anthropic，2026-05）
- 并行 subagent 编排；**计划存在于可执行代码里，而不是模型的上下文窗口里**。
- 效果：把 agent loop 扩展到单个上下文窗口装不下的工作量。[20]
- 相关论文视角：Code as Agent Harness [22]

### 5.4 Memory / Sandbox
- 记忆已成为 code agent 的核心基础设施：真实软件工程任务天然 **long-horizon + state-intensive**。[18]
- 代码在沙箱执行，只把**筛选后的** tool 结果回传模型 —— 既是安全边界，也是上下文控制手段。[20]

---

## 6. 技术选型清单（按层）

| 层 | 候选 | 选择判据 |
| --- | --- | --- |
| **单 agent 推理范式** | ReAct / Plan-and-Execute / ReWOO / Reflexion / LLMCompiler | 按可忍受的失败模式选（见 §1.2） |
| **多 agent 编排** | LangGraph、Microsoft Agent Framework、OpenAI Agents SDK、CrewAI、Agno、Google ADK | 流程可控性 vs 角色可拆性 |
| **协议** | MCP（工具）、A2A / ACP（agent 间） | 已是事实标准，不用犹豫 |
| **可观测** | LangSmith、Pydantic Logfire、Langfuse、商业 APM | 必须能看轨迹，不只看日志 |
| **Eval** | 自建 golden set + 轨迹评估；LOCA-bench 类上下文压测 [23] | 见课题一 |
| **执行环境** | 容器 / microVM sandbox、代码解释器 | 副作用是否可回滚 |
| **记忆** | 向量库 + 结构化 memory 文件 + compaction 策略 | 长任务必需 |
| **推理后端** | 见 [02-local-inference-engines.md](./02-local-inference-engines.md) | agent 场景优先 SGLang（前缀复用 + 结构化输出） |

### 正在成型的「企业参考架构」[9]
```
1 个编排框架    (LangGraph / Microsoft Agent Framework)
+ 1 个可观测栈  (LangSmith / Pydantic Logfire / 商业方案)
+ 1 个 eval harness
+ MCP 化的工具层
```

---

## 来源

| # | 来源 |
| --- | --- |
| [1] | [ReAct vs Plan-and-Execute: Agent Architecture Guide 2026 · Atlan](https://atlan.com/know/ai-agent/react-vs-plan-and-execute-agent-architecture/) |
| [2] | [ReAct vs Plan-and-Execute: A Practical Comparison · DEV](https://dev.to/jamesli/react-vs-plan-and-execute-a-practical-comparison-of-llm-agent-patterns-4gh9) / [Plan-and-Execute Agents · LangChain Blog](https://www.langchain.com/blog/planning-agents) |
| [3] | [The 4 Single-Agent Patterns: ReAct / P&E / ReWOO / Reflexion](https://theaiengineer.substack.com/p/the-4-single-agent-patterns) / [ReWOO vs ReAct · Nutrient](https://www.nutrient.io/blog/rewoo-vs-react-choosing-right-agent-architecture/) |
| [4] | [Plan-and-Execute Agents（含 LLMCompiler DAG 与 3.6× 说法）· LangChain Blog](https://www.langchain.com/blog/planning-agents) |
| [5] | [Architecting Resilient LLM Agents: Secure Plan-then-Execute (arXiv 2509.08646)](https://arxiv.org/pdf/2509.08646) |
| [6] | [ReflAct: World-Grounded Decision Making (arXiv 2505.15182)](https://arxiv.org/pdf/2505.15182) |
| [7] | [KAIJU: Executive Kernel for Intent-Gated Execution (arXiv 2604.02375)](https://arxiv.org/pdf/2604.02375) |
| [8] | [Profile-Then-Reason (arXiv 2604.04131)](https://arxiv.org/pdf/2604.04131) |
| [9] | [Agentic AI Frameworks 2026: Production Comparison · Uvik](https://uvik.net/blog/agentic-ai-frameworks/) / [Technical Architecture of Agentic AI & Multi-Agent Systems](https://aimlcompanion.ai/blog/technical-architecture-agentic-ai-2026) |
| [10] | [Cloud vs Local Multi-Agent AI Platforms · Augment Code](https://www.augmentcode.com/tools/cloud-vs-local-multi-agent-ai-platforms) |
| [11] | [Cloud Agents vs. Local Development · Alloy](https://alloy.app/library/cloud-agents-vs-local-development) / [What Is a Cloud Agent · Alloy](https://alloy.app/library/what-is-cloud-agent-new-layer-ai-native-product-development) |
| [12] | [Best Cloud Coding Agent Platforms in 2026 · Capy AI](https://capy.ai/articles/best-cloud-coding-agents-2026) |
| [13] | [Claude Code vs Codex App in 2026 · Developers Digest](https://www.developersdigest.tech/blog/claude-code-vs-codex-app-2026) |
| [14] | [Your Home for Multi-Agent Development · VS Code Blog (2026-02-05)](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development) |
| [15] | [LangGraph Multi-Agent Workflow Patterns 2026](https://architecturediagram.ai/blog/langgraph-architecture-diagram) |
| [16] | [Building Agentic Orchestration with MCP, A2A, ACP, LangGraph](https://zenithlaw.com/building-agentic-orchestration-mcp-a2a-langgraph-langchain-playbook) |
| [17] | [Survey of LLM Agent Communication with MCP (arXiv 2506.05364)](https://arxiv.org/pdf/2506.05364) |
| [18] | [Agent Harness Engineering · Addy Osmani](https://addyosmani.com/blog/agent-harness-engineering/) |
| [19] | [Agentic Harness Engineering: LLMs as the New OS](https://www.decodingai.com/p/agentic-harness-engineering) / [awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering) |
| [20] | [Effective context engineering for AI agents · Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) |
| [21] | [Context engineering: memory, compaction, tool clearing · Claude Cookbook](https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools) |
| [22] | [Code as Agent Harness (arXiv 2605.18747)](https://arxiv.org/pdf/2605.18747) |
| [23] | [LOCA-bench (arXiv 2602.07962)](https://arxiv.org/pdf/2602.07962) |

> ⚠️ 核实提示：§3.1 的 Coding vs CoWork 对比表是我基于各来源综合归纳的**分析框架，不是某一份文献的原文分类**，对外引用时请注明为自有观点。LLMCompiler 的 3.6× 加速为原论文自报数字。
