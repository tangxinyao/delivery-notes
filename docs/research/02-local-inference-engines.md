# 课题二：主流本地推理引擎 —— 性能、口碑、技术特点、用户案例

> 原始调研材料 · 采集 2026-09-19 · `[n]` 对应文末来源表

---

## 0. 格局速览

生态已完全开源（MIT / Apache 2.0）：llama.cpp、Ollama、Jan、LM Studio、vLLM、SGLang、mlx-lm。[1]

**标志性事件**：HuggingFace **TGI 于 2026-03-21 进入维护模式**，官方 README 改为推荐 **vLLM / SGLang / llama.cpp / MLX** —— 这四个是行业公认的生产就绪引擎。[1][2]

---

## 1. 横向性能对比

### 1.1 吞吐（同 GPU 同模型，Red Hat 2026 serving benchmark）[3]

| 引擎 | 峰值吞吐 | 50 并发时 |
| --- | --- | --- |
| **vLLM** | **~793 tok/s** | **920 tok/s** |
| **Ollama** | **~41 tok/s**（压力下直接趴平） | **155 tok/s** |

→ **约 19× 的差距**。多个独立来源给出的区间是 vLLM 在负载下吞吐为 Ollama 的 **10–20×**。[3]

### 1.2 TTFT / 尾延迟 [3]

| 引擎 | 冷启单请求 TTFT | 峰值负载 P99 |
| --- | --- | --- |
| **llama.cpp** | **8–12 ms**（最快） | — |
| **vLLM** | 16–25 ms | **80 ms** |
| **Ollama** | — | **673 ms** |

> 关键洞察：**llama.cpp 单请求最快，vLLM 在批处理稳态最快**。vLLM 的调度器是为 batched steady state 优化的，单个"孤独请求"反而吃亏。选型时要问清楚"你的负载是单流还是并发"。

### 1.3 SGLang vs vLLM [4]

- 请求**共享上下文**时（chatbot / RAG / agent），SGLang 吞吐 **比 vLLM 高约 29%** —— 靠 RadixAttention 复用共享前缀的 KV cache。
- 截至 **2026-04**，SGLang 在通用场景已追平 vLLM；在 **DeepSeek MoE、结构化输出、speculative decoding** 这几类工作负载上领先。[5]

### 1.4 vLLM vs llama.cpp（GPU 服务器）[6]

- **≥32 并发**请求时，vLLM 吞吐为 llama.cpp 的 **2–3×**。
- 多 GPU 场景社区共识：**llama.cpp / Ollama 不做张量并行，多卡设置下应改用 vLLM 或 ExLlamaV2**。[7]

### 1.5 Apple Silicon [8][9][10]

| 引擎 | 稳态吞吐 | 每 token 中位延迟 | 备注 |
| --- | --- | --- | --- |
| **MLX / mlx-lm** | **~230 tok/s** | **5–7 ms** | 最高稳态吞吐 |
| **MLC-LLM** | 接近 MLX | — | **TTFT 更低** |
| **Ollama** | 落后 | — | 0.19+ 起自动走 MLX 路径 |
| **PyTorch MPS** | 落后 | — | — |

- **M5 Neural Accelerators**（每个 GPU core 内置）：Qwen3-14B-4bit 相比 M4 **TTFT 快 4.06×**，生成快 1.19×。[10]
- **M5 Max + Qwen3.5-35B-A3B (NVFP4)**：prefill **1154 → 1810 tok/s**，decode **58 → 112 tok/s**。[9]

### 1.6 NPU / 移动端 [11][12]

| 平台 | 场景 | 数字 |
| --- | --- | --- |
| **Qualcomm SM8750 NPU** | Qwen2.5-3B-Instruct prefill | **969.72 tok/s** |
| **Qualcomm SM8750 NPU** | SmolLM2-1.7B-Instruct prefill | **1612.78 tok/s** |
| **Snapdragon X Elite** | NPU prefill | **786.7 tok/s** |
| 同上 | CPU prefill | 43.4 tok/s（NPU 是其 **18.1×**） |
| 同上 | GPU prefill | 25.2 tok/s（NPU 是其 **31.2×**） |

→ NPU 的强项在 **prefill 的稠密矩阵乘**；decode 阶段优势不明显。由此衍生出 **NPU 做 prefill + GPU 做 decode** 的拆分推理方案。[13]

### 1.7 显卡天梯图（本地部署容量 × 速度）

本地部署的两个硬约束是 **显存装不装得下** 和 **带宽跑不跑得快**。decode 阶段是**内存带宽受限**的，经验公式：

```
decode 吞吐 (tok/s) ≈ 显存带宽 (GB/s) ÷ 每 token 读取的权重字节数
每 token 读取字节数 ≈ 激活参数量 × 每参数字节数（Q4 ≈ 0.55~0.6 B/参数）
```

→ 所以**同代卡之间，decode 速度几乎正比于显存带宽**；显存容量决定"能不能跑"，带宽决定"跑多快"。[19][20]

| 档位 | 型号 | 显存 | 带宽 | Q4 装得下 · 上下文 | 参考价（2026-09） | 占有率 / 装机 | 典型定位 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **T0 数据中心旗舰** | **B200** | 192 GB HBM3e | **~8.0 TB/s** | 200B · 128K | **$3.0–5.0 万** | 云厂新增主力 | 长上下文吞吐为 RTX PRO 6000 的 **~4.9×** [21] |
| | **H200** | 141 GB HBM3e | ~4.8 TB/s | 120B · 64K | ~$3.1 万 | 租赁最普及 | 生产集群主力 |
| | **H100** | 80 GB HBM3 | ~3.35 TB/s | 70B · 32K | $2.5–4.0 万 | 存量最大 | 上一代生产基线 |
| **T1 专业单卡** | **RTX PRO 6000 Blackwell** | **96 GB** GDDR7 ECC | 1792 GB/s | 70B · 64K | **$1.33 万**（MSRP，一年涨 55%）| 单机首选 | 单机最优性价比；30B 上 **~8425 tok/s**，约 5090 的 **1.8×** [21][22] |
| | **A100 80G** | 80 GB HBM2e | ~2.0 TB/s | 70B · 32K | 二手 $0.8–1.2 万 | 存量退役中 | 上上代集群 |
| | **L40S / RTX 6000 Ada** | 48 GB | 864 / 960 GB/s | 32B · 32K | 无稳定公开报价 | 机架常见 | 企业机架推理卡 |
| **T2 消费旗舰** | **RTX 5090** | 32 GB GDDR7 | **1792 GB/s** | 32B · 64K | MSRP $1,999 / **街价 $3,700+** | Steam **0.41%** | 带宽比 4090 高 **77%**；小 batch 下每卡吞吐与 PRO 6000 接近 [20][21] |
| | **RTX 4090** | 24 GB | 1008 GB/s | 32B · 16K | 二手 $1,200–1,500（已停产）| Steam **0.90%** | 上一代发烧基线 |
| | **Radeon RX 7900 XTX** | 24 GB | 960 GB/s | 32B · 16K | **$749–899** | A 卡旗舰 | Llama 3.1 8B 约 **96 tok/s**，约为 4090 的 **75%**；单位显存最便宜 [24] |
| **T3 消费中端** | **RTX 5080 / 4070 Ti S** | 16 GB | 672–960 GB/s | 14B · 32K | ~$1,000 起 | 50 系合计 **13.4%** | 单人开发机 |
| | **RTX 3060 12G** | 12 GB | 360 GB/s | 8B · 16K | 二手约 $250 | **Steam 第一，3.99%** | 入门门槛 |
| **T4 统一内存** | **Mac M3 Ultra** | 512 GB 统一 | 819 GB/s | 235B · 128K | ≈$0.95 万 | 不在统计内 | 容量换带宽的另一条路线 |
| | **Mac M4 / M5 Max** | 128 GB 统一 | 546 GB/s 起 | 70B · 64K | $0.40–0.50 万 | 不在统计内 | 见 §1.5 |
| | **NVIDIA DGX Spark**（GB10） | 128 GB 统一 LPDDR5X | **273 GB/s**（全表最低） | 120B · 32K | **$4,699**（原 $3,999）| 不在统计内 | 桌面级「个人 AI 超算」：1 PFLOP 稀疏 FP4，但带宽是短板 —— GPT-OSS 120B 实测 decode **~33 tok/s**、20B 约 **50 tok/s**（prefill 2053 tok/s）[23] |

> **两列口径说明**
> - **参考价**：2026-09 美元，含税前裸卡/整机；消费卡街价波动极大（5090 一度冲到 $6,900），报价只看量级不看小数点。[25]
> - **占有率**：**没有"按型号统计的 LLM 推理装机量"这种公开数据**。消费卡一列用的是 **Steam 硬件调查**（游戏装机口径，2026-04/06），只能当相对热度参考；数据中心一列是定性描述 —— 厂商级口径是 **NVIDIA 占 AI 加速器约 80%、AMD Instinct 约 5–7%**，逐型号份额未公开。[26]

**读表要点**

1. **先看显存，再看带宽**。装不下就是 0 tok/s，没有中间态；装得下之后速度才由带宽决定。
2. **小 batch 时，5090 和 PRO 6000 每卡吞吐接近**（带宽相同）—— 差距要到大 batch / 长上下文 / 大模型才拉开，因为那时容量成为瓶颈。[21]
3. **别忘了 KV cache**。上表"能装下"只算权重；32K 上下文的 KV cache 在 70B 级模型上可以再吃掉十几 GB，实际选型要按目标上下文长度重算。
4. **多卡不是线性叠加**。要靠张量并行才能把多卡显存合并使用，而 **llama.cpp / Ollama 不做张量并行**（见 §1.4）—— 多卡必须上 vLLM / SGLang / ExLlamaV2。
5. **统一内存是另一个维度**：M3 Ultra 的 512 GB 能装下任何消费级 GPU 装不下的模型，但 819 GB/s 的带宽决定了它 decode 慢于 5090。**容量优先选统一内存，速度优先选 N 卡。**
6. **DGX Spark 是「能跑」而不是「跑得快」的典型**。算力（1 PFLOP FP4，约在 RTX 5070 与 5070 Ti 之间）和 128 GB 容量都不差，但 **273 GB/s 的带宽是全表最低**，按本节公式直接锁死 decode 上限 —— 所以 120B 模型只有 ~33 tok/s。**它的定位是本地装得下大模型做开发与微调，不是拿来扛并发生产流量。** 客户拿它当推理服务器是常见误判。[23]
7. **A 卡不再是禁区，但要认软件栈**。同为 24 GB，7900 XTX 的带宽（960 GB/s）与 4090（1008 GB/s）几乎持平，**ROCm 上实测约为 CUDA 的 75–85%**，且模型越大、越 memory-bound，差距越小。**ROCm 7.2（2026-03）是第一个让 Ollama / LM Studio / llama.cpp / vLLM 开箱即与 CUDA 对齐的版本**；vLLM 与 SGLang 均已官方支持 ROCm。结论：**预算敏感、单卡、模型偏大的场景，A 卡值得进候选**；要用冷门算子或最新特性时仍以 N 卡为稳。[24]

---

---

## 2. 逐引擎档案

### 2.1 llama.cpp

| 维度 | 内容 |
| --- | --- |
| **技术特点** | 纯 C/C++，零外部依赖；CPU 优先，支持 CPU/GPU 混合推理；GGUF 格式，量化可低至 **~1.5 bit**；单流效率与可移植性最优 [14] |
| **性能画像** | 冷启 TTFT 最快（8–12ms）；单流效率高；并发能力弱；**不做张量并行** |
| **口碑** | 社区最活跃的"折腾型"项目，生态基础设施（Ollama / LM Studio / Jan 都建在它上面或受其影响）。主要批评：**多 GPU 设置下浪费硬件**，社区明确建议此时换 vLLM/ExLlamaV2 [7] |
| **典型用户案例** | Raspberry Pi、Pixel 手机等资源受限设备上跑 LLM [14]；发烧友工作站；嵌入式 / 边缘产品内嵌 |

### 2.2 Ollama

| 维度 | 内容 |
| --- | --- |
| **技术特点** | llama.cpp 之上的易用封装 + 模型分发（`ollama run` 一行起）；**0.19+ 在 Apple Silicon 自动走 MLX 路径**（safetensors 模型），为该平台最快路径 [1] |
| **性能画像** | 单用户体验极佳；**并发下崩塌**（峰值 41 tok/s、P99 673ms）[3] |
| **口碑** | **开发者体验无人能及**，"5 分钟内跑起本地模型"的首选；但公认**不具备单用户以外的扩展性**，用它做生产 API 是典型反模式 [3] |
| **典型用户案例** | 个人开发者本地试模型；桌面 AI 应用的内嵌后端；POC / demo 阶段 |

### 2.3 LM Studio / Jan

| 维度 | 内容 |
| --- | --- |
| **技术特点** | GUI 优先，非工程用户友好；Jan 为开源替代 |
| **口碑** | 面向"不想碰命令行"的用户，产品化程度高 |
| **典型场景** | 单用户笔记本、内部非技术同事自助试用 |

### 2.4 vLLM

| 维度 | 内容 |
| --- | --- |
| **技术特点** | **PagedAttention**（KV cache 分页）+ 连续批处理；硬件与模型覆盖最广；张量/流水线并行；OpenAI 兼容 API |
| **性能画像** | 批处理稳态吞吐最强；P99 80ms；≥32 并发时为 llama.cpp 的 2–3× |
| **口碑** | **2026 年的生产默认选项**。理由是生态而非单点性能：**最广的模型支持、最深的文档、最经过实战检验的 K8s 部署**；社区规模约为 SGLang 的 **3×**，issue 响应更快，上手摩擦最低 [5] |
| **典型用户案例** | **大多数云 API endpoint 与 OpenAI 兼容服务的默认后端** [5]；5–100+ 用户的团队内部服务；Red Hat 将其作为 RHEL AI / OpenShift AI 推理栈的核心 [3] |

### 2.5 SGLang

| 维度 | 内容 |
| --- | --- |
| **技术特点** | **RadixAttention** —— 以基数树组织 KV cache，自动复用共享前缀；对结构化输出、频繁串行 tool-call 有专门优化；speculative decoding、DeepSeek MoE 支持领先 |
| **性能画像** | 共享上下文场景比 vLLM 高 ~29% 吞吐 [4] |
| **口碑** | 追赶者转为并列领先者；社区比 vLLM 小但增长快，文档较薄是主要短板 [5] |
| **典型用户案例（含金量最高的一条）** | **xAI Grok 3、Microsoft Azure endpoints、LinkedIn 的 AI 功能、Cursor 的代码补全，累计运行在 400,000+ GPU 上** [5] |

### 2.6 MLX / mlx-lm（Apple）

| 维度 | 内容 |
| --- | --- |
| **技术特点** | Apple Silicon 原生，统一内存架构；M5 起利用每 GPU core 内置的 Neural Accelerator |
| **性能画像** | Apple 平台最高稳态吞吐（~230 tok/s，5–7ms/token）[8] |
| **口碑** | Apple 官方 ML Research 亲自背书与调优 [10]；**Ollama 倒戈改用 MLX 路径**是最强的口碑信号 [1] |
| **典型用户案例** | Mac 上的本地 AI 应用；隐私敏感的桌面场景（如 iOS 端侧越南语-英语实时翻译 [15]） |

### 2.7 TensorRT-LLM

| 维度 | 内容 |
| --- | --- |
| **技术特点** | NVIDIA 专属，编译期优化，极致性能 |
| **口碑** | 性能天花板高，但**构建流程复杂、硬件绑定深**，迭代模型时成本高 |
| **典型场景** | 全 NVIDIA 栈、模型固定、要榨干最后 10% 性能的大规模服务 |

---

## 3. 量化格式对照

| 格式 | 生态 | 特点 |
| --- | --- | --- |
| **GGUF** | llama.cpp / Ollama | 容器格式，block-wise 混合精度。**Q4_K_M：体积小 2.5×、速度快 ~2×，字段准确率代价 ~2.6%** [16] |
| **AWQ** | vLLM / SGLang | 激活感知权重量化，4bit 推理友好 |
| **GPTQ** | 广泛 | 经典 PTQ |
| **bitsandbytes** | HF 生态 | 训练 / 微调侧常用 |
| **EXL2** | ExLlamaV2 | 可变 bpw，多 GPU 友好 |
| **NVFP4** | Blackwell / MLX | 新一代 4bit 浮点 |
| **SINQ** | 研究阶段 | 免标定低精度权重量化 [17] |

---

## 4. 选型决策树

```
单用户笔记本 / 5 分钟跑起来      → Ollama（技术用户）/ LM Studio（非技术用户）
发烧友工作站 / 极限硬件 / 嵌入式  → llama.cpp
Apple Silicon 追极限             → mlx-lm（或 Ollama 0.19+ 自动走 MLX）
多 GPU                           → vLLM 或 ExLlamaV2（绝不用 llama.cpp/Ollama）
5–100+ 并发、模型与硬件杂         → vLLM
前缀重（RAG / 多轮 / agent）      → SGLang
结构化输出 / DeepSeek MoE / spec decoding → SGLang
全 NVIDIA、模型固定、榨性能       → TensorRT-LLM
手机 / 端侧                      → 静态量化 + NPU prefill（+ GPU decode）
```

**一句话判据**（Sesame Disk 的框架）：2026 年的本地引擎选型，归根到底只取决于一个问题 —— **你要服务几个并发用户**。[18]

---

## 来源

| # | 来源 |
| --- | --- |
| [1] | [Complete Guide to Local LLM Inference Tools, July 2026 · DEV](https://dev.to/sreeraj-sreenivasan/the-complete-guide-to-local-llm-inference-tools-in-july-2026-llamacpp-ollama-vllm-sglang-and-4mh1) |
| [2] | [Best LLM Inference Engines 2026 · Yotta Labs](https://www.yottalabs.ai/post/best-llm-inference-engines-in-2026-vllm-tensorrt-llm-tgi-and-sglang-compared) |
| [3] | [vLLM vs Ollama vs llama.cpp vs SGLang: Ollama Collapses to 41 Tokens Under Load · Towards AI](https://pub.towardsai.net/vllm-vs-ollama-vs-llama-cpp-vs-sglang-ollama-collapses-to-41-tokens-under-load-8f7a850d1e07) / [llama.cpp vs vLLM · Red Hat Developer](https://developers.redhat.com/articles/2026/06/15/llamacpp-vs-vllm-choosing-right-local-llm-inference-engine) |
| [4] | [vLLM vs Ollama vs SGLang vs TensorRT-LLM · The AI Engineer](https://theaiengineer.substack.com/p/vllm-vs-ollama-vs-sglang-vs-tensorrt) |
| [5] | [vLLM vs SGLang for Production LLM Serving 2026 · DevOpsBeast](https://devopsbeast.com/blog/vllm-vs-sglang-production-2026) / [SGLang vs vLLM 2026 · Particula](https://particula.tech/blog/sglang-vs-vllm-inference-engine-comparison) |
| [6] | [vLLM vs llama.cpp on GPU Servers · GIGAGPU](https://gigagpu.com/vllm-vs-llama-cpp-gpu-servers/) |
| [7] | [Stop Wasting Your Multi-GPU Setup With llama.cpp · Osman's Odyssey](https://www.ahmadosman.com/blog/do-not-use-llama-cpp-or-ollama-on-multi-gpus-setups-use-vllm-or-exllamav2/) |
| [8] | [Production-Grade Local LLM Inference on Apple Silicon (arXiv 2511.05502)](https://arxiv.org/pdf/2511.05502) |
| [9] | [MLX vs llama.cpp on Apple Silicon: M5 Neural Accelerators](https://yage.ai/share/mlx-apple-silicon-en-20260331.html) |
| [10] | [Exploring LLMs with MLX and M5 Neural Accelerators · Apple ML Research](https://machinelearning.apple.com/research/exploring-llms-mlx-m5) |
| [11] | [Quant.npu (arXiv 2605.20295)](https://arxiv.org/pdf/2605.20295) |
| [12] | [Energy-Efficient On-Device RAG on Snapdragon X Elite (arXiv 2606.11257)](https://arxiv.org/pdf/2606.11257) |
| [13] | [Disaggregated Inference on Apple Silicon: NPU prefill + GPU decode · SqueezeBits](https://blog.squeezebits.com/disaggregated-inference-on-apple-silicon-npu-prefill-and-gpu-decode-67176) |
| [14] | [llama.cpp: A CPU-First Framework · Sandgarden](https://www.sandgarden.com/learn/llama-cpp) |
| [15] | [Privacy-Preserving Real-Time VI-EN Translation on iOS (arXiv 2505.07583)](https://arxiv.org/pdf/2505.07583) |
| [16] | [Which Quantization Should I Use? 统一评测 llama.cpp 量化 (arXiv 2601.14277)](https://arxiv.org/html/2601.14277v1) |
| [17] | [SINQ (arXiv 2509.22944)](https://arxiv.org/pdf/2509.22944) |
| [18] | [In 2026, the Decision Among Local Inference Engines Comes Down to One Question · Sesame Disk](https://sesamedisk.com/llamacpp-vs-vllm-vs-sglang-vs-ollama-2026/) |
| [19] | [GPU VRAM vs Memory Bandwidth for AI & LLMs · Ocolo](https://blog.ocolo.io/gpu-vram-vs-memory-bandwidth-ai-llm/) |
| [20] | [GPU Buying Guide for LLMs: RTX 5090 vs H100 vs H200 · Prem AI](https://www.premai.io/blog/gpu-buying-guide-for-llms-rtx-5090-vs-h100-vs-h200-complete-comparison-2026/) / [RTX 5090 vs RTX PRO 6000 Blackwell · Spheron](https://www.spheron.network/blog/rtx-5090-vs-rtx-pro-6000-blackwell-comparison/) |
| [21] | [GPU Benchmarks for LLM Inference: RTX, H100, B200 · CloudRift](https://www.cloudrift.ai/gpu-benchmarks) / [RTX PRO 6000 vs H100/H200/L40S · CloudRift](https://www.cloudrift.ai/blog/benchmarking-rtx6000-vs-datacenter-gpus) |
| [22] | [GPU Benchmark for AI and LLM Inference 2026 · VRLA Tech](https://vrlatech.com/gpu-benchmark-ai-llm-2026/) |
| [25] | [GPU 价格追踪 2026 · Tom's Hardware](https://www.tomshardware.com/pc-components/gpus/lowest-gpu-prices-tracking) / [NVIDIA AI GPU 定价指南 · IntuitionLabs](https://intuitionlabs.ai/articles/nvidia-ai-gpu-pricing-guide) / [RTX PRO 6000 涨价至 $13,250 · MLQ](https://mlq.ai/news/nvidia-raises-rtx-pro-6000-blackwell-msrp-to-13250-a-55-hike-in-one-year/) / [DGX Spark 涨价至 $4,700 · TechPowerUp](https://www.techpowerup.com/346833/nvidia-raises-dgx-spark-pricing-to-usd-4-700) |
| [26] | [2026-04 Steam 硬件调查趋势 · The FPS Review](https://www.thefpsreview.com/2026/05/02/trends-from-the-april-2026-steam-hardware-survey/) / [NVIDIA AI GPU 市占 ~80% · Silicon Analysts](https://siliconanalysts.com/analysis/nvidia-ai-accelerator-market-share-2024-2026) |
| [24] | [Best AMD GPU for Local LLM Inference 2026 · Compute Market](https://www.compute-market.com/blog/best-amd-gpu-local-llm-inference-2026) / [AMD ROCm Local LLM Setup: 96 tok/s on RX 7900 XTX](https://localaimaster.com/blog/amd-rocm-local-llm-setup) / [ROCm vs CUDA 2026 · Spheron](https://www.spheron.network/blog/rocm-vs-cuda-gpu-cloud-2026/) |
| [23] | [NVIDIA DGX Spark In-Depth Review · LMSYS](https://www.lmsys.org/blog/2025-10-13-nvidia-dgx-spark/) / [DGX Spark 产品页 · NVIDIA](https://www.nvidia.com/en-us/products/workstations/dgx-spark/) / [The Performance of NVIDIA DGX Spark · NADDOD](https://www.naddod.com/blog/the-performance-of-nvidia-dgx-spark) |

> ⚠️ 核实提示：本页性能数字来自第三方 benchmark 博客，**测试环境（GPU 型号、模型、序列长度、并发数）各不相同，不可直接横向相加**。SGLang 的用户名单（xAI/Azure/LinkedIn/Cursor、400k+ GPU）来自 [5]，对外引用前建议找 SGLang 官方 blog 或对应公司工程博客二次确认。
>
> ⚠️ **§1.7 天梯图**：显存与带宽为厂商标称规格；"Q4 能装下"一列是按 `0.55~0.6 B/参数` 估算的**工程经验值，未计入 KV cache**，实际选型必须按目标上下文长度重算；表中「· 上下文」一列是按权重占用后剩余显存反推的**量级估算**，不是实测值。decode ≈ 带宽 ÷ 权重字节数 这条经验公式只在 **memory-bound（小 batch）** 时成立，大 batch 下转为 compute-bound，不再适用。
