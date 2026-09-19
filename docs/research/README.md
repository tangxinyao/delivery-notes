# FDE 主题调研 · 原始材料

采集时间：2026-09-19。均为公开网络材料的整理，每条结论用 `[n]` 标注来源，编号对应各文末的来源表。

| 文件 | 课题 | 细化维度 |
| --- | --- | --- |
| [01-ux-benchmark.md](./01-ux-benchmark.md) | 用户体验 benchmark 怎么做 | 指标记号法（`@k` vs `^k`）、检索/生成/agent/体验四类指标、**三类评委（人类/模型/脚本）对比与分层策略**、LMArena 方法论 |
| [02-local-inference-engines.md](./02-local-inference-engines.md) | 主流本地推理引擎 | **横向性能对比（吞吐/TTFT/P99）**、逐引擎档案（技术特点·性能画像·口碑·用户案例）、量化格式、选型决策树 |
| [03-agent-architecture.md](./03-agent-architecture.md) | Agent 架构与技术选型 | **ReAct vs P&E vs ReWOO vs Reflexion vs LLMCompiler**、四种多 agent 编排范式、**Coding vs CoWork / Cloud vs Local 类型对比**、MCP、harness engineering |
| [04-fde-cases.md](./04-fde-cases.md) | FDE 真实案例 | **按行业分类**：国防/金融/医疗/制造/能源/通用流程/软件工程；Palantir playbook；行业约束对照表 |
| [05-scenario-playbook.md](./05-scenario-playbook.md) | **场景 → 选型手册** | 12 类 FDE 场景各自该用什么 benchmark、什么推理引擎、什么 agent 架构；反模式清单；交付验收清单 |
| [06-fde-process.md](./06-fde-process.md) | **FDE 交付流程研究** | Palantir/OpenAI/PostHog 三套流程并排；Echo×Delta 角色分工；五阶段生命周期（owner/交付物/放行门槛）；组织编制与指标；ICONIQ 行业数据；失败模式与批评 |
| [07-fde-hard-problems.md](./07-fde-hard-problems.md) | **FDE 的五个真问题** | criteria drift 与 eval 冷启动（CDM 挖专家知识 / golden set 自举 / judge 标定）；ontology 建模路径；确定性 vs LLM 边界判据；交接体检表（bus factor）；该说不的信号清单 |

## 使用说明

- 这些是**原始素材**，不是讲稿。做 slide 时从这里取事实与数字。
- **来源分级**：arXiv 论文与厂商官方博客为一手，优先引用；带 ⚠️ 标记的数字来自媒体/二手博客，对外引用前请回溯原文。
- 各文档末尾的"核实提示"标出了哪些是我自己归纳的分析框架（非文献原文分类）。
- 04 文末有「一手来源优先清单」，做对外材料时从那里取。

## 交叉引用主线

```
FDE 部署鸿沟（95% pilot 无影响）
  ├── 怎么证明有效？   → 01 体验 benchmark（pass^k、TSR、golden set）
  ├── 数据不出域怎么办？ → 02 本地推理引擎（vLLM / SGLang / llama.cpp）
  ├── 定制与复用的接缝？ → 03 agent 架构（ontology + MCP + 编排）
  ├── 别人怎么做的？    → 04 分行业真实案例
  ├── 我这个场景选啥？  → 05 场景选型手册（01×02×03×04 的交叉表）
  ├── 活儿怎么干？      → 06 交付流程（Week 0 → Day 120 全流程 + 组织与指标）
  └── 真到现场卡在哪？  → 07 五个真问题（eval 冷启动 / 建模 / 确定性边界 / 交接 / 该说不）
```

> 做 deck 时的建议顺序：**04 立问题 → 01/02/03 给工具 → 05 场景选型 → 06 落成流程 → 07 讲硬骨头**。
> 最适合做单页 slide 的几块：05 的场景矩阵、05 的反模式清单、06 §0 的三套流程并排表、06 §8 的全流程时间线、**07 §1.1 的 criteria drift 循环**、07 §3.4 的边界速查表、07 §5.3 的「该说不」信号清单。
>
> 如果只讲一页：**07 §1.1 的 criteria drift** ——「你需要标准来打分，但打分才帮你定义标准」，这个循环依赖是整套 FDE 方法论里最反直觉、也最有解释力的一条。
