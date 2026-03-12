# 附录：AI系统性能检查清单（175+项）(Appendix. AI Systems Performance Checklist (175+ Items))

这份详尽的检查清单涵盖了AI系统性能工程师所需的宏观流程级最佳实践和详细的底层调优建议。每一项检查清单条目都是实用的提醒，帮助您从AI系统中榨取最大的性能和效率。

> This extensive checklist covers both broad process-level best practices and detailed, low-level tuning advice for AI systems performance engineers. Each of these checklist items serves as a practical reminder to squeeze maximum performance and efficiency out of AI systems.

在调试、性能分析、分析和调优AI系统时使用本指南。通过系统地应用这些技巧——从底层操作系统和CUDA调优到集群级优化——AI系统性能工程师可以在现代NVIDIA GPU硬件上使用多种AI软件框架（包括CUDA、PyTorch、OpenAI的Triton、TensorFlow、Keras和JAX）实现闪电般的执行速度和成本效益高的操作。本检查清单中的原则也适用于未来世代的NVIDIA硬件，包括其GPU、基于ARM的CPU、CPU-GPU超级芯片、网络设备和机架系统。

> Use this guide when debugging, profiling, analyzing, and tuning one's AI systems. By systematically applying these tips-from low-level OS and CUDA tweaks up to cluster-scale optimizations-an AI systems performance engineer can achieve both lightning-fast execution and cost-effective operation on modern NVIDIA GPU hardware using many AI software frameworks, including CUDA, PyTorch, OpenAI's Triton, TensorFlow, Keras, and JAX. The principles in this checklist will also apply to future generations of NVIDIA hardware, including their GPUs, ARM-based CPUs, CPU-GPU superchips, networking gear, and rack systems.

## 性能调优与成本优化思维 (Performance Tuning and Cost Optimization Mindset)

务实、文档化的循环——先做快速优化，再做深度工作——将工程时间转化为可衡量的投资回报。首先针对最大的运行时和成本驱动因素，并在优化前后始终进行性能分析以验证影响。

> A pragmatic, documented loop-quick wins before deep work-turns engineering time into measurable ROI. Start by targeting the biggest runtime and cost drivers, and always profile before and after to verify impact.

结合自动调优、框架升级、云定价杠杆和利用率仪表板来获取高投资回报的胜利，记录结果并倾向于简单、可维护的修复方案。在精度允许的情况下调优对吞吐量敏感的超参数。

> Combine auto-tuning, framework upgrades, cloud pricing levers, and utilization dashboards for high-ROI wins, documenting results and favoring simple, maintainable fixes. Tune throughput-sensitive hyperparameters when accuracy allows.

以下是关于性能调优和成本优化思维的一些建议：

> Here are some tips on the performance tuning and cost optimization mindset:

### 优先优化昂贵的部分 (Optimize the expensive first)

使用80/20法则。找出运行时最大的贡献因素并专注于这些。如果90%的时间花在几个内核或通信阶段上，那么深入优化这些比微优化只占1%时间的内容要好得多。

> Use the 80/20 rule. Find the top contributors to runtime and focus on those. If 90% of the time is in a couple of kernels or a communication phase, it's better to optimize those deeply than to microoptimize something taking 1% of the time.

每个章节的技术都应该应用在最重要的地方。例如，如果您的训练时间是40%数据加载、50% GPU计算和10%通信，那么首先修复数据加载，因为您可能可以将开销减半。然后考虑GPU内核优化。

> Each chapter's techniques should be applied where they matter most. For example, if your training is 40% data loading, 50% GPU compute, and 10% communication, then first fix data loading, as you can maybe halve the overhead. Then look at GPU kernel optimization.

### 优化前后进行性能分析 (Profile before and after)

每当您应用优化时，都要衡量其影响。这听起来很明显，但通常调整是基于理论做出的，实际上可能没有帮助——甚至有害。

> Whenever you apply an optimization, measure its impact. This sounds obvious, but often tweaks are made based on theory and might not help-or even hurt-in practice.

考虑一个场景，您的工作负载不受内存限制，但您决定尝试为训练任务启用激活检查点。这实际上可能会通过使用额外的计算来减少内存，从而减慢任务速度。换句话说，始终在更改前后比较吞吐量、延迟和利用率等关键指标。

> Consider a scenario where your workload is not memory-limited, but you decide to try enabling activation checkpointing for your training job. This may actually slow down the job by using extra compute to reduce memory. In other words, always compare key metrics like throughput, latency, and utilization before and after making changes.

使用内置的性能分析器进行简单计时，例如100次迭代的平均迭代时间。

> Use the built-in profilers for simple timing, such as average iteration time over 100 iterations.

### 拥抱自适应自动调优反馈循环 (Embrace adaptive autotuning feedback loops)

实施利用实时性能反馈的高级自动调优框架——使用强化学习或贝叶斯优化等技术——动态调整系统参数。这种方法使您的系统能够根据不断变化的工作负载和运行条件持续微调设置。

> Implement advanced autotuning frameworks that leverage real-time performance feedback-using techniques like reinforcement learning or Bayesian optimization-to dynamically adjust system parameters. This approach enables your system to continuously fine-tune settings in response to changing workloads and operating conditions.

### 为优化时间做预算 (Budget for optimization time)

性能工程是一项迭代投资。存在收益递减——选择容易实现的成果，如启用AMP和数据预取。这些可能轻松带来2倍的提升。更难的优化，如编写自定义内核，可能带来较小的增量。始终权衡工程时间与节省的运行时间和成本。对于大型重复性任务，如训练旗舰模型，即使5%的提升也可以证明数周的调优是合理的，因为它可能节省数百万。对于一次性或小工作负载，专注于更大的胜利并保持务实。

> Performance engineering is an iterative investment. There are diminishing returns-pick the low-hanging fruit like enabling AMP and data prefetch. These might give 2x easily. Harder optimizations like writing custom kernels might give smaller increments. Always weigh the engineering time versus the gain in runtime and cost saved. For large recurring jobs like training a flagship model, even a 5% gain can justify weeks of tuning since it saves maybe millions. For one-off or small workloads, focus on bigger wins and be pragmatic.

### 及时了解框架改进 (Stay updated on framework improvements)

我们讨论的许多优化，如混合精度、融合内核和分布式算法，在深度学习框架和库中不断得到改进。升级到最新的PyTorch或TensorFlow有时可以立即带来加速，因为它们整合了新的融合操作或更好的启发式方法。利用这些改进，因为它们本质上是免费的收益。阅读与性能相关的更改的发布说明。

> Many optimizations we discussed, such as mixed precision, fused kernels, and distributed algorithms, continue to be improved in deep learning frameworks and libraries. Upgrading to the latest PyTorch or TensorFlow can sometimes yield immediate speedups as they incorporate new fused ops or better heuristics. Leverage these improvements, as they are essentially free gains. Read release notes for performance-related changes.

### 与供应商和社区成员协同设计 (Codesign collaboratively with vendors and community members)

与硬件供应商和更广泛的性能工程社区保持联系，使软件优化与最新的硬件架构保持一致。这种协同设计方法可以通过定制算法来利用新兴硬件能力，揭示显著的性能提升机会。定期审查供应商文档，参与论坛，测试驱动程序或框架的测试版。这些互动通常会揭示可以整合到您系统中的新优化机会和最佳实践。整合新的驱动程序优化、库更新和硬件特定技巧可以提供额外的、有时是相当大的性能提升。

> Stay connected with hardware vendors and the broader performance engineering community to align software optimizations with the latest hardware architectures. This codesign approach can reveal significant opportunities for performance gains by tailoring algorithms to leverage emerging hardware capabilities. Regularly review vendor documentation, participate in forums, and test beta releases of drivers or frameworks. These interactions often reveal new optimization opportunities and best practices that can be integrated into your systems. Integrating new driver optimizations, library updates, and hardware-specific tips can provide additional, sometimes significant, performance gains.

### 利用云灵活性降低成本 (Leverage cloud flexibility for cost)

如果在云环境中运行，明智地使用更便宜的竞价实例或预留实例。它们可以大幅削减成本，但您可能会在几分钟内失去竞价实例。还要考虑实例类型，因为有时稍微老一点的GPU实例以一小部分成本可以提供更好的性价比，如果您的工作负载不需要绝对最新的硬件。我们关于H800与H100的讨论表明，通过努力可以在次优硬件上完成出色的工作。在云中，您可以获得类似的权衡。通过在不同实例配置上运行基准测试来评估成本/性能，包括CPU数量、CPU内存、GPU数量、GPU内存、L1/L2缓存、统一内存、NVLink/NVSwitch互连、网络带宽和延迟以及本地磁盘配置。计算每美元吞吐量等指标来指导您的优化决策。

> If running in cloud environments, use cheaper spot instances or reserved instances wisely. They can drastically cut costs, but you may lose the spot instances with a few minutes' notice. Also consider instance types, as sometimes a slightly older GPU instance at a fraction of the cost can deliver better price/performance if your workload doesn't need the absolute latest. Our discussions on H800 versus H100 showed it's possible to do great work on second-best hardware with effort. In the cloud, you can get similar trade-offs. Evaluate cost/performance by benchmarking on different instance configurations, including number of CPUs, CPU memory, number of GPUs, GPU memory, L1/L2 caches, unified memory, NVLink/NVSwitch interconnects, network bandwidth and latency, and local disk configuration. Calculate metrics like throughput per dollar to guide your optimization decisions.

### 监控利用率指标 (Monitor utilization metrics)

持续监控GPU利用率、SM效率、内存带宽使用率，对于多节点还有网络利用率。使用DCGM导出器、Prometheus等设置仪表板，这样您可以发现任何资源何时未充分利用。如果GPU利用率只有50%，深入调查原因。很可能是数据等待/停滞和缓慢同步通信。如果网络利用率只有10%但GPU在等待数据，可能是其他问题如锁导致的。这些指标有助于确定要关注哪个子系统。

> Continuously monitor GPU utilization, SM efficiency, memory bandwidth usage, and, for multinode, network utilization. Set up dashboards using DCGM exporter, Prometheus, etc., so you can catch when any resource is underused. If GPUs are at 50% utilization, dig into why. It's likely data waiting/stalling and slow synchronization communication. If the network is only 10% utilized but the GPU waits on data, maybe something else like a lock is the issue. These metrics help pinpoint which subsystem to focus on.

### 迭代并调优吞吐量超参数 (Iterate and tune hyperparameters for throughput)

一些模型超参数，如批量大小、序列长度和MoE活跃专家数量，可以在不降低最终精度的情况下为吞吐量进行调优。例如，更大的批量大小可以提供更好的吞吐量，但可能需要调整学习率计划以保持精度。不要害怕调整这些以找到速度和精度的最佳平衡点。这也是性能工程的一部分——有时可以调整模型或训练过程以提高效率，如使用激活检查点或更多计算步骤来获得相同的有效批量。您可以调整训练学习率计划来补偿这种情况。

> Some model hyperparameters, such as batch size, sequence length, and number of MoE active experts, can be tuned for throughput without degrading final accuracy. For example, larger batch sizes give better throughput but might require tuning the learning rate schedule to maintain accuracy. Don't be afraid to adjust these to find a sweet spot of speed and accuracy. This is part of performance engineering too-sometimes the model or training procedure can be adjusted for efficiency, like using activation checkpointing or more steps of compute for the same effective batch. You might tweak the training learning rate schedule to compensate for this scenario.

### 记录并重用 (Document and reuse)

记录您应用了哪些优化及其影响。在代码或内部wiki类共享知识库系统中进行文档化。这为未来项目建立了知识库。许多技巧是可重用的模式，如在集群上启用重叠和特定的环境变量。拥有这些历史可以在开始新工作或让新团队成员加入性能调优工作时节省时间。

> Keep notes of what optimizations you applied and their impact. Document in code or in an internal wiki-like shared knowledge-base system. This builds a knowledge base for future projects. Many tips are reusable patterns, like enabling overlapping and particular environment variables that help on a cluster. Having this history can save time when starting a new endeavor or when onboarding new team members into performance tuning efforts.

### 平衡优化与复杂性 (Balance optimizations with complexity)

追求实现所需性能的最简单解决方案。例如，如果原生PyTorch配合torch.compile能满足您的速度目标，您可能不需要编写自定义CUDA内核。这将有助于避免额外的维护。使用高度自定义代码进行过度优化会使系统变得脆弱。既快速又可维护的解决方案是优雅的。因此，应用产生所需收益的最小侵入性优化，仅在需要时才升级到更复杂的优化。

> Aim for the simplest solution that achieves needed performance. For example, if native PyTorch with torch.compile meets your speed target, you might not need to write custom CUDA kernels. This will help avoid extra maintenance. Over-optimizing with highly custom code can make the system brittle. There is elegance in a solution that is both fast and maintainable. Thus, apply the least-intrusive optimization that yields the required gain, and escalate to more involved ones only as needed.

### 优化AI驱动的性能 (Optimize AI-driven performance)

利用机器学习模型分析历史遥测数据并预测系统瓶颈，实现参数的实时自动调整以优化资源分配和吞吐量。

> Leverage machine learning models to analyze historical telemetry data and predict system bottlenecks, enabling automated adjustments of parameters in real time to optimize resource allocation and throughput.

## 可复现性与文档最佳实践 (Reproducibility and Documentation Best Practices)

除非性能提升是可复现的、版本化的并持续检查，否则它们不会持久，否则会随着时间的推移悄然回归。将文档、CI基准测试和共享知识视为保持加速和加速入职及审计的粘合剂。

> Performance wins don't stick unless they're reproducible, versioned, and continuously checked, or they'll regress quietly over time. Treat docs, CI benchmarks, and shared knowledge as the glue that preserves speedups and accelerates onboarding and audits.

在源代码控制中锁定版本、配置和基准测试，以便实验可重复且回归可追溯。将性能检查引入CI/CD，实施端到端监控和警报，并将优化与安全性和全面文档配对，以创建持久、可审计的实践。以下是提高可复现性和文档的一些技巧：

> Lock down versions, configs, and benchmarks in source control so experiments are repeatable and regressions traceable. Bring performance checks into CI/CD, instrument end-to-end monitoring and alerts, and pair optimization with security and thorough documentation to create a durable, auditable practice. The following is a list of tips to improve reproducibility and documentation:

### 严格的版本控制 (Rigorous version control)

对所有系统配置、框架/驱动程序版本、操作系统设置、优化脚本和基准测试维护全面的版本控制。使用Git（或类似系统）跟踪更改和标记发布。这样，实验可以精确复现——性能回归可以轻松识别。

> Maintain comprehensive version control for all system configurations, framework/driver versions, OS settings, optimization scripts, and benchmarks. Use Git (or a similar system) to track changes and tag releases. This way, experiments can be reproduced exactly-and performance regressions can be easily identified.

### 用于性能回归的持续集成 (Continuous integration for performance regression)

将自动化性能基准测试和实时监控集成到您的CI/CD流水线中。这确保每个更改——从代码更新到配置更改——都根据一组性能指标进行验证，有助于及早发现回归并保持一致和可衡量的性能提升。采用行业标准基准测试，如MLPerf，以建立可靠的性能基线并跟踪随时间的改进。

> Integrate automated performance benchmarks and real-time monitoring into your CI/CD pipelines. This ensures that each change-from code updates to configuration changes-is validated against a set of performance metrics, helping catch regressions early and maintaining consistent and measurable performance gains. Adopt industry-standard benchmarks, such as MLPerf, to establish a reliable performance baseline and track improvements over time.

### 端到端工作流优化 (End-to-end workflow optimization)

确保优化在整个AI流水线中整体应用——从数据摄取和预处理到训练和推理部署。协调的跨系统调优可以揭示孤立调整可能错过的协同效应，从而产生更显著的整体性能提升。

> Ensure that optimizations are applied holistically across the entire AI pipeline-from data ingestion and preprocessing through training and inference deployment. Coordinated, cross-system tuning can reveal synergies that isolated adjustments might miss, resulting in more significant overall performance gains.

### 自动化监控和诊断 (Automated monitoring and diagnostics)

部署端到端监控解决方案，收集跨硬件、网络和应用程序层的实时指标。将这些与Prometheus/Grafana等仪表板集成，并配置自动警报以及时检测异常，如GPU利用率突然下降或网络延迟激增。

> Deploy end-to-end monitoring solutions that collect real-time metrics across hardware, network, and application layers. Integrate these with dashboards, such as Prometheus/Grafana, and configure automated alerts to promptly detect anomalies, such as sudden drops in GPU utilization or spikes in network latency.

### 容错和自动恢复 (Fault tolerance and automated recovery)

通过使用分布式检查点、冗余硬件配置和动态作业重新调度，将容错纳入您的系统设计。这种策略最大限度地减少停机时间，即使在硬件或网络故障面前也能保持性能。

> Incorporate fault tolerance into your system design by using distributed checkpointing, redundant hardware configurations, and dynamic job rescheduling. This strategy minimizes downtime and maintains performance even in the face of hardware or network failures.

### 编译器和构建优化 (Compiler and build optimizations)

在构建过程中利用激进的编译器标志和性能分析引导优化，从代码中提取最大性能。定期更新和调整构建配置，并通过严格的基准测试验证每个更改的影响，以确保最佳执行。

> Leverage aggressive compiler flags and profile-guided optimizations during the build process to extract maximum performance from your code. Regularly update and tune your build configurations, and verify the impact of each change through rigorous benchmarking to ensure optimal execution.

### 安全性、合规性和性能 (Security, compliance, and performance)

整合并协同设计安全性、合规性和性能。定期审计配置，强制执行访问控制，维护行业标准保障措施，包括加密、安全数据通道、零信任网络、硬件安全模块（HSM）和安全飞地。并确保性能调优永远不会损害系统安全性。同样，确保安全性不会带来不必要的性能开销。

> Integrate and codesign security, compliance, and performance. Regularly audit configurations, enforce access controls, and maintain industry-standard safeguards, including encryption, secure data channels, zero-trust networking, hardware security modules (HSMs), and secure enclaves. And make sure that performance tuning never compromises system security. Similarly, make sure security doesn't incur unnecessary performance overhead.

### 全面文档和知识共享 (Comprehensive documentation and knowledge sharing)

维护所有优化步骤、系统配置和性能基准测试的详细记录。开发内部知识库以促进团队协作和快速入职，确保最佳实践在项目之间得到保留和重用。

> Maintain detailed records of all optimization steps, system configurations, and performance benchmarks. Develop an internal knowledge base to facilitate team collaboration and rapid onboarding, ensuring that best practices are preserved and reused across projects.

### 面向未来和可扩展性规划 (Future-proofing and scalability planning)

设计模块化、可适应的系统架构，可以轻松整合新兴硬件和软件技术。持续评估可扩展性需求并更新优化策略，以在工作负载增长时保持竞争优势。

> Design modular, adaptable system architectures that can easily incorporate emerging hardware and software technologies. Continuously evaluate scalability requirements and update your optimization strategies to sustain competitive performance as your workload grows.

## 系统架构与硬件规划 (System Architecture and Hardware Planning)

您的硬件、互连和数据路径为性能和成本效益设定了上限——没有任何软件调整可以超越饥饿的GPU。通过匹配加速器、CPU/DRAM/I/O和冷却/电源与工作负载来规划每美元/瓦的有效吞吐量，从一开始就避免瓶颈。

> Your hardware, interconnects, and data paths set the ceiling for performance and cost-efficiency-no software tweak can outrun a starved GPU. Plan for goodput per dollar/watt by matching accelerators, CPU/DRAM/I/O, and cooling/power to the workload to avoid bottlenecks from the start.

具体来说，为有效吞吐量设计——每美元/瓦的有用工作——而不仅仅是原始FLOPS。将加速器和互连与工作负载匹配，适当调整CPU/内存/I/O大小以保持GPU供给，保持数据本地化，并规划电源/冷却以使硬件维持峰值频率。在添加更多GPU之前评估扩展效率。以下是优化系统架构和提高硬件规划效率的一些技巧：

> Specifically, design for goodput-useful work per dollar/watt-and not just raw FLOPS. Match accelerators and interconnects to workload, right-size CPU/memory/I/O to keep GPUs fed, keep data local, and plan power/cooling so hardware sustains peak clocks. Evaluate scaling efficiency before adding more GPUs. Here are some tips for optimizing system architecture and improving hardware planning efficiency:

### 为有效吞吐量和效率设计 (Design for goodput and efficiency)

将有用吞吐量视为目标。获得的每一点性能提升都会在大规模下转化为巨大的成本节约。专注于最大化每美元/瓦的生产性工作——而不仅仅是原始FLOPS。

> Treat useful throughput as the goal. Every bit of performance gained translates to massive cost savings at scale. Focus on maximizing productive work per dollar/watt-and not just raw FLOPS.

### 选择合适的加速器 (Choose the right accelerator)

优先选择现代GPU以获得卓越的每瓦性能和内存容量。新架构提供原生FP8和FP4精度支持等功能——以及更快的互连。这些比旧一代GPU和系统产生大幅加速。

> Prefer modern GPUs for superior performance-per-watt and memory capacity. Newer architectures offer features like native FP8 and FP4 precision support-along with much faster interconnects. These produce big speedups over older-generation GPUs and systems.

### 利用高带宽互连 (Leverage high-bandwidth interconnects)

对于多GPU工作负载，使用具有NVLink/NVSwitch的系统，如GB200/GB300 NVL72，而不是仅支持PCIe连接的系统。NVLink 5提供高达1.8 TB/s的双向GPU到GPU带宽（比PCIe Gen5快14倍以上），实现跨GPU的近线性扩展。NVLink Switch域可以通过二级交换机扩展，在一个NVLink域中连接多达576个GPU。这使得分层集合操作尽可能长时间地保持在NVLink上，然后才回退到机架间结构。

> Use systems with NVLink/NVSwitch, such as GB200/GB300 NVL72, instead of PCIe-only connectivity for multi-GPU workloads. NVLink 5 provides up to 1.8 TB/s bidirectional GPU-to-GPU bandwidth (over 14x PCIe Gen5), enabling near-linear scaling across GPUs. NVLink Switch domains can be scaled with second-level switches to connect up to 576 GPUs in one NVLink domain. This enables hierarchical collectives that stay on NVLink as long as possible before falling back to the inter-rack fabric.

### 平衡CPU/GPU和内存比例 (Balance CPU/GPU and memory ratios)

为每个GPU配置足够的CPU核心、DRAM和存储吞吐量。例如，为数据加载和网络任务分配每个GPU约1个快速CPU核心。确保系统RAM和I/O能够以每个GPU数百MB/s的速率供给GPU，以避免饥饿。

> Provision enough CPU cores, DRAM, and storage throughput per GPU. For example, allocate ~1 fast CPU core per GPU for data loading and networking tasks. Ensure system RAM and I/O can feed GPUs at required rates on the order of hundreds of MB/s per GPU to avoid starvation.

### 规划数据局部性 (Plan for data locality)

如果跨多个节点训练，最小化节点外通信。尽可能将紧密耦合的工作负载保持在同一个NVLink/NVSwitch域内以利用全带宽，并使用您能访问的最高速度互连。理想情况下，节点内和机架内通信使用NVLink，机架间通信使用InfiniBand。

> If training across multiple nodes, minimize off-node communication. Whenever possible, keep tightly coupled workloads on the same NVLink/NVSwitch domain to exploit full bandwidth, and use the highest-speed interconnect that you have access to. Ideally, this is NVLink for intranode and intra-rack communication and InfiniBand for inter-rack communication.

### 避免链中的瓶颈 (Avoid bottlenecks in the chain)

识别最慢的环节——无论是CPU、内存、磁盘还是网络——并将其升级。例如，如果由于I/O导致GPU利用率低，投资更快的存储或缓存而不是更多GPU。所有组件都良好匹配的端到端设计可以防止浪费GPU周期。

> Identify the slowest link-be it CPU, memory, disk, or network-and scale it up. For instance, if GPU utilization is low due to I/O, invest in faster storage or caching rather than more GPUs. An end-to-end design where all components are well-matched prevents wasted GPU cycles.

### 选择合适的集群规模 (Choose an appropriate cluster size)

添加GPU时要注意收益递减。超过某个集群规模后，开销可能会增长——确保加速证明成本是合理的。通常最好通过在N个GPU上达到95%使用率来优化利用率，然后再扩展到2N个GPU。

> Beware of diminishing returns when adding GPUs. Past a certain cluster size, overheads can grow-ensure the speedup justifies the cost. It's often better to optimize utilization on N GPUs by reaching 95% usage, for example, before scaling to 2N GPUs.

### 为冷却和电源设计 (Design for cooling and power)

确保数据中心能够处理GPU的热量和电源需求。GB200/GB300等高性能系统具有非常高的TDP。提供足够的冷却（可能是基于液体的）和电源供应，使GPU能够在不降频的情况下维持升压频率。

> Ensure the data center can handle GPU thermal and power needs. High-performance systems like GB200/GB300 have very high TDP. Provide adequate cooling (likely liquid-based) and power provisioning so the GPUs can sustain boost clocks without throttling.

## 统一CPU-GPU"超级芯片"架构 (Unified CPU-GPU "Superchip" Architecture)

统一内存和封装内链路让您可以容纳更大的模型，并在将正确的数据放在正确的层级时减少复制开销。使用Grace进行预处理，HBM用于"热"张量，将超级芯片转变为紧密耦合的引擎，减少停滞。

> Unified memory and on-package links let you fit larger models and cut copy overhead when you place the right data in the right tier. Using Grace for preprocessing and HBM for "hot" tensors turns the superchip into a tightly coupled engine with fewer stalls.

在Grace Blackwell超级芯片上，将CPU和GPU视为共享内存复合体。将热权重/激活保留在HBM中，通过NVLink-C2C将溢出或不频繁的数据保留在Grace LPDDR中。使用封装内Grace CPU进行预处理/编排，并预取或流水线管理内存以隐藏超大模型的延迟。按以下方式利用超级芯片架构：

> On Grace Blackwell Superchips, treat CPU and GPU as a shared-memory complex. Keep hot weights/activations in HBM and overflow or infrequent data in Grace LPDDR via NVLink-C2C. Use the on-package Grace CPU for preprocessing/orchestration and prefetch or pipeline-managed memory to hide latency for ultralarge models. Take advantage of the superchip architecture as follows:

### 利用统一CPU-GPU内存 (Utilize unified CPU-GPU memory)

利用Grace Blackwell（GB200/GB300）超级芯片的统一内存空间。两个Blackwell GPU和一个72核Grace CPU共享一个具有NVLink-C2C（900 GB/s）的相干内存池。使用CPU的大内存（例如480 GB LPDDR5X）作为超大模型的扩展，同时将"热"数据保留在GPU的HBM中以获得速度。

> Exploit the Grace Blackwell (GB200/GB300) Superchip's unified memory space. Two Blackwell GPUs and a 72-core Grace CPU share a coherent memory pool with NVLink-C2C (900 GB/s). Use the CPU's large memory (e.g., 480 GB LPDDR5X) as an extension for oversize models while keeping "hot" data in the GPUs' HBM for speed.

### 为局部性放置数据 (Place data for locality)

即使有统一内存，也要优先考虑数据放置。将模型权重、激活和其他频繁访问的数据放在GPU HBM3e（具有更高的本地带宽）上，让不频繁使用或溢出的数据驻留在CPU RAM中。这确保900 GB/s的NVLink-C2C链路不会成为关键数据的瓶颈。

> Even with unified memory, prioritize data placement. Put model weights, activations, and other frequently accessed data on GPU HBM3e (which has much higher local bandwidth), and let infrequently used or overflow data reside in CPU RAM. This ensures the 900 GB/s NVLink-C2C link isn't a bottleneck for critical data.

### 在可用时利用CPU-GPU直接内存访问 (Take advantage of CPU-GPU direct memory access when available)

使用GPU在GB200和GB300等组合CPU-GPU超级芯片上直接访问CPU内存的能力。GPU可以通过NVLink-C2C相干地读写Grace LPDDR内存，而无需通过主机PCIe暂存。带宽和延迟仍低于HBM，因此预取托管指针、暂存数据和流水线传输以隐藏延迟。因此，建议将热激活和KV缓存保留在HBM中，并将CPU内存用作具有显式预取的低层缓存。

> Use the GPU's ability to directly access CPU memory on combined CPU-GPU superchips like the GB200 and GB300. GPUs can read and write Grace LPDDR memory coherently over NVLink-C2C without staging over host PCIe. Bandwidth and latency are still lower than HBM, so prefetch managed pointers, stage data, and pipeline transfers to hide latency. As such, it's recommended to keep hot activations and KV cache in HBM and use CPU memory as a lower-tier cache with explicit prefetch.

### 有效使用Grace CPU (Use the Grace CPU effectively)

封装内Grace CPU提供72个高性能核心——利用它们！将数据预处理、增强和其他CPU友好型任务卸载到这些核心。它们可以使用NVLink-C2C快速供给GPU，实质上充当GPU的极快I/O和计算伴侣。

> The on-package Grace CPU provides 72 high-performance cores-utilize them! Offload data preprocessing, augmentation, and other CPU-friendly tasks to these cores. They can feed the GPUs quickly using NVLink-C2C, essentially acting as an extremely fast I/O and compute companion for the GPU.

### 为超大模型规划 (Plan for ultralarge models)

对于超过GPU内存的万亿参数模型训练，GB200/GB300系统允许您使用CPU内存作为模型内存池的一部分。优先使用框架缓存分配器，并在自定义代码中使用cudaMallocAsync以最小化碎片并启用图捕获。使用CUDA统一内存或托管内存API优雅地处理溢出，并考虑从CPU→GPU内存显式预取（例如cudaMemPrefetchAsync）即将到来的层以隐藏延迟。

> For trillion-parameter model training that exceeds GPU memory, GB200/GB300 systems allow you to train using CPU memory as part of the model's memory pool. Prefer framework caching allocators and use cudaMallocAsync in custom code to minimize fragmentation and enable graph capture. Use CUDA Unified Memory or managed memory APIs to handle overflow gracefully, and consider explicit prefetching (e.g., cudaMemPrefetchAsync) of upcoming layers from CPU → GPU memory to hide latency.

### 考虑超级芯片优化算法 (Consider superchip-optimized algorithms)

SuperOffload是一组专注于提高卸载和张量转换/复制策略效率的超级芯片优化算法示例。创新包括推测-然后-验证（STV）、异构优化器计算和基于ARM的CPU优化器。SuperOffload专为NVIDIA超级芯片（例如Grace Hopper、Grace Blackwell、Vera Rubin）设计，相对于传统卸载策略提高了令牌处理吞吐量和芯片利用率。

> SuperOffload is an example of a superchip-optimized set of algorithms focused on improving efficiency of offload and tensor cast/copy strategies. Innovations include speculation-then-validation (STV), heterogeneous optimizer computation, and an ARM-based CPU optimizer. Designed specifically for NVIDIA superchips (e.g., Grace Hopper, Grace Blackwell, Vera Rubin), SuperOffload increases token-processing throughput and chip utilization relative to traditional offload strategies.

## 多GPU扩展与互联优化 (Multi-GPU Scaling and Interconnect Optimizations)

只有当通信快速且拓扑感知时，扩展才有回报——否则添加的GPU只是在互相等待。依靠NVLink/NVSwitch带宽、现代集合操作和结构感知放置来接近线性加速。

> Scaling pays only when communication is fast and topology-aware-otherwise added GPUs just wait on one another. Lean on NVLink/NVSwitch bandwidth, modern collectives, and fabric-aware placement to approach linear speedups.

具体来说，利用NVLink/NVSwitch域（例如NVL72）实现近线性扩展，并选择适合结构的并行策略。使用拓扑感知放置、更新的NCCL集合操作（例如PAT）和遥测来验证您是否有效利用了每GPU约1.8 TB/s的双向吞吐量。在扩展时规划分层通信。以下是利用多GPU扩展通过互联和拓扑优化的技巧：

> Specifically, exploit NVLink/NVSwitch domains (e.g., NVL72) for near-linear scaling, and choose parallelism strategies that fit the fabric. Use topology-aware placement, updated NCCL collectives (e.g., PAT), and telemetry to verify you're using the ~1.8 TB/s bidirectional throughput per-GPU bandwidth effectively. Plan hierarchical communications as you expand. The following are tips on utilizing multi-GPU scaling through interconnect and topology optimizations:

### 为高速全对全拓扑设计 (Design for high-speed all-to-all topology)

在具有72个完全互连GPU的NVL72 NVSwitch集群上，例如，任何GPU都可以以全NVLink 5速度与其他任何GPU通信。在结构层面，NVLink Switch域是非阻塞的。应用级吞吐量可能因并发流量和路径调度而异，因此在使用DCGM NVLink计数器和Nsight Systems跟踪验证行为之前，不要假设每对饱和。通过使用并行化策略（如数据并行、张量并行和流水线并行）来利用这种拓扑，这些策略在较差的互连上会成为瓶颈。

> On NVL72 NVSwitch clusters with 72 fully interconnected GPUs, for example, any GPU can communicate with any other at full NVLink 5 speed. At the fabric level, the NVLink Switch domain is nonblocking. Application-level throughput can vary with concurrent traffic and path scheduling, so verify behavior using DCGM NVLink counters and Nsight Systems traces before assuming per-pair saturation. Take advantage of this topology by using parallelization strategies, such as data parallel, tensor parallel, and pipeline parallelism, that would be bottlenecked on lesser interconnects.

### 利用拓扑感知调度 (Utilize topology-aware scheduling)

尽可能始终在NVLink Switch域内并置多GPU作业。将作业的所有GPU保持在NVL72结构上意味着通信密集型工作负载的近线性扩展。将GPU跨NVLink域或标准网络混合将为紧密耦合的任务引入瓶颈，应避免。

> Always colocate multi-GPU jobs within an NVLink Switch domain if possible. Keeping all GPUs of a job on the NVL72 fabric means near-linear scaling for communication-heavy workloads. Mixing GPUs across NVLink domains or standard networks will introduce bottlenecks and should be avoided for tightly coupled tasks.

### 利用前所未有的带宽 (Leverage unprecedented bandwidth)

认识到NVLink 5每个GPU在每个方向上有900 GB/s，这比上一代翻了一番。NVL72机架总共提供约130 TB/s的机架内聚合带宽。这大幅减少了通信等待时间，因为即使在1.8 TB/s的速度下，数十GB的梯度数据也可以在几毫秒内完成全归约。设计训练算法，如梯度同步和参数分片，以充分利用这种相对免费的通信预算。

> Recognize that NVLink 5 has 900 GB/s per GPU in each direction, which doubles the per-GPU bandwidth versus the previous generation. An NVL72 rack provides ~130 TB/s total intra-rack bandwidth in aggregate. This drastically reduces communication wait times, as even tens of gigabytes of gradient data can be all-reduced in a few milliseconds at 1.8 TB/s. Design training algorithms, such as gradient synchronization and parameter sharding, to fully exploit this relatively free communication budget.

### 采用现代集合算法 (Embrace modern collective algorithms)

使用为NVSwitch优化的最新NVIDIA NCCL库。具体来说，启用并行聚合树（PAT）算法，该算法是为NVLink Switch拓扑引入的。这通过利用NVL72拓扑比树/环算法更高效地执行归约，进一步减少了同步时间。

> Use the latest NVIDIA NCCL library optimized for NVSwitch. Specifically, enable the parallel aggregated tree (PAT) algorithm, which was introduced for NVLink Switch topologies. This further reduces synchronization time by taking advantage of the NVL72 topology to perform reductions more efficiently than other tree/ring algorithms.

### 考虑细粒度并行 (Consider fine-grained parallelism)

通过全带宽全对全连接，考虑以前不可行的细粒度模型并行。例如，当每个GPU与其他每个GPU有1.8 TB/s双向吞吐量时，跨多个GPU的层级并行或张量并行可以是高效的。以前，人们可能会避免过多的跨GPU通信，但NVL72允许在不达到网络限制的情况下进行激进的工作分区。

> With full-bandwidth all-to-all connectivity, consider fine-grained model parallelism that wasn't feasible before. For example, layer-wise parallelism or tensor parallelism across many GPUs can be efficient when each GPU has 1.8 TB/s bidirectional throughput to every other. Previously, one might avoid excessive cross-GPU communication, but NVL72 allows aggressive partitioning of work without hitting network limits.

### 监控饱和 (Monitor for saturation)

虽然NVL72非常快，但在性能分析中要注意链路利用率。如果您的应用以某种方式使用极端全对全操作使NVSwitch饱和，例如，您可能需要通过聚合梯度等来限制通信。使用NVIDIA工具或NVSwitch遥测验证通信是否在NVLink容量范围内，并在需要时调整模式。例如，您可以交错全对全交换以避免网络争用。DCGM公开NVLink计数器，可以帮助验证链路平衡和检测集合期间的 hotspots。

> Although NVL72 is extremely fast, keep an eye on link utilization in profiling. If your application somehow saturates the NVSwitch using extreme all-to-all operations, for example, you might need to throttle communication by aggregating gradients, etc. Use NVIDIA's tools or NVSwitch telemetry to verify that communications are within the NVLink capacity, and adjust patterns if needed. For instance, you can stagger all-to-all exchanges to avoid network contention. DCGM exposes NVLink counters that can help verify link balance and detect hotspots during collectives.

### 规划未来扩展 (Plan for future expansion)

请注意，NVLink Switch可以扩展到单个机架之外——使用二级交换机在一个连接域中最多可连接576个GPU。如果您在超大规模下运行，请规划使用本地NVL72机架间集合的分层通信，然后仅在必要时使用机架间互连。这有助于首先最大化机架内NVLink使用率。这确保您在诉诸机架间InfiniBand跳数之前使用最快的链路。

> Be aware that NVLink Switch can scale beyond a single rack-up to 576 GPUs in one connected domain using second-level switches. If you operate at that ultrascale, plan hierarchical communication using local NVL72 inter-rack collectives first, then use inter-rack interconnects only when necessary. This helps to maximize intra-rack NVLink usage first. This ensures you're using the fastest links before resorting to inter-rack InfiniBand hops.

### 识别联邦和分布式优化的机会 (Identify opportunities for federated and distributed optimizations)

对于跨越异构环境（如多云或边缘到云设置）的部署，采用自适应通信协议和动态负载均衡策略。这可以最大限度地减少延迟并最大化跨分布式系统的吞吐量，确保即使在资源和能力变化的情况下也能保持稳健的性能。

> For deployments that span heterogeneous environments, such as multicloud or edge-to-cloud setups, adopt adaptive communication protocols and dynamic load balancing strategies. This minimizes latency and maximizes throughput across distributed systems, which ensures robust performance even when resources vary in capability and capacity.

## 操作系统与驱动优化 (Operating System and Driver Optimizations)

操作系统抖动、NUMA未命中和驱动程序不匹配会悄悄消耗吞吐量并产生您无法调整的变异性。加固堆栈（大页、亲和性、一致的CUDA/驱动程序、持久性）创建稳定的高性能基线。

> OS jitter, NUMA misses, and driver mismatches quietly drain throughput and create variability you can't tune around. Hardening the stack (huge pages, affinities, consistent CUDA/driver, persistence) creates a stable, high-performance baseline.

运行精简的、为HPC调优的Linux。设置NUMA/IRQ亲和性并启用THP和高内存锁定。在节点间保持NVIDIA驱动程序/CUDA一致。隔离系统抖动，调整CPU库/存储，正确设置容器限制，并保持BIOS/固件/NVSwitch结构最新以获得可预测的吞吐量。以下是您应该在环境中探索的一些主机、操作系统和容器优化：

> Run a lean, HPC-tuned Linux. Set NUMA/IRQ affinities and enable THP and high memlock. Keep NVIDIA drivers/CUDA consistent across nodes. Isolate system jitter, tune CPU libraries/storage, set container limits correctly, and keep BIOS/firmware/NVSwitch fabric up to date for predictable throughput. Here are some host, OS, and container optimizations that you should explore in your environment:

### 使用为HPC调优的Linux内核 (Use a Linux kernel tuned for HPC)

确保您的GPU服务器运行为高性能计算配置的最近、稳定的Linux内核。禁用消耗CPU或I/O的不必要的后台服务。使用"performance" CPU调控器——而不是"on-demand"或"power-save"——以保持CPU核心在高频率运行以供给GPU。

> Ensure your GPU servers run a recent, stable Linux kernel configured for high-performance computing. Disable unnecessary background services that consume CPU or I/O. Use the "performance" CPU governor-versus "on-demand" or "power-save"-to keep CPU cores at a high clock for feeding GPUs.

### 为性能关键型工作负载禁用交换 (Disable swap for performance-critical workloads)

在训练服务器上禁用交换以避免页面抖动，或者，如果必须保持交换启用，请使用mlock或cudaHostAlloc锁定关键缓冲区以确保它们保留在RAM中。

> Disable swap on training servers to avoid page thrashing, or, if swap must remain enabled, lock critical buffers using mlock or cudaHostAlloc to ensure they stay in RAM.

### 通过积极预分配避免内存碎片 (Avoid memory fragmentation with aggressive preallocation)

为经常使用的张量预分配大的连续内存块，以减少运行时分配开销和碎片。这种主动策略确保在长时间训练运行期间更稳定和高效的内存管理。

> Preallocate large, contiguous blocks of memory for frequently used tensors to reduce runtime allocation overhead and fragmentation. This proactive strategy ensures more stable and efficient memory management during long training runs.

### 优化CPU库的环境变量 (Optimize environment variables for CPU libraries)

微调参数，如OMP_NUM_THREADS和MKL_NUM_THREADS，以更好地匹配您的硬件配置。调整这些变量可以减少线程争用并提高CPU绑定操作的并行效率。

> Fine-tune parameters, such as OMP_NUM_THREADS and MKL_NUM_THREADS, to better match your hardware configuration. Adjusting these variables can reduce thread contention and improve the parallel efficiency of CPU-bound operations.

### 为NUMA感知设计 (Design for NUMA awareness)

对于多NUMA服务器，将GPU进程/线程固定到本地NUMA节点的CPU。使用numactl或taskset等工具将每个训练进程绑定到离其分配的GPU最近的CPU。同样，将内存分配绑定到本地NUMA节点（numactl --membind），以便GPU DMA的主机内存来自最近的RAM。这避免了可能使有效PCIe/NVLink带宽减半的昂贵跨NUMA内存流量。

> For multi-NUMA servers, pin GPU processes/threads to the CPU of the local NUMA node. Use tools like numactl or taskset to bind each training process to the CPU nearest its assigned GPU. Similarly, bind memory allocations to the local NUMA node (numactl --membind) so host memory for GPU DMA comes from the closest RAM. This avoids costly cross-NUMA memory traffic that can halve effective PCIe/NVLink bandwidth.

### 利用网络和GPU任务的IRQ亲和性 (Utilize IRQ affinity for network and GPU tasks)

将NIC中断显式绑定到与NIC在同一NUMA节点上的CPU核心，类似地将GPU驱动程序线程固定到专用核心——包括来自nvidia-persistence服务守护程序等长时间运行服务的线程。这种策略最大限度地减少跨NUMA流量并在重负载下稳定性能。

> Explicitly bind NIC interrupts to CPU cores on the same NUMA node as the NIC, and similarly pin GPU driver threads to dedicated cores-including those from long-running services like the nvidia-persistence service daemon. This strategy minimizes cross-NUMA traffic and stabilizes performance under heavy loads.

### 启用透明大页 (Enable transparent hugepages)

在always或madvise模式下启用透明大页（THP），以便大内存分配使用2 MB页面。这减少了为框架分配数十或数百GB主机内存时的TLB抖动和内核开销。通过检查/sys/kernel/mm/transparent_hugepage/enabled验证THP是否激活。启用THP后，您的进程正在为大的分配使用大页。如果您的负载对延迟敏感且观察到抖动，则优先使用madvise模式的THP。

> Turn on transparent hugepages (THP) in always or madvise mode so that large memory allocations use 2 MB pages. This reduces TLB thrashing and kernel overhead when allocating tens or hundreds of GBs of host memory for frameworks. Verify THP is active by checking for /sys/kernel/mm/transparent_hugepage/enabled. With THP enabled, your processes are using hugepages for big allocations. Prefer THP in madvise mode if your workload is latency-critical and you observe jitter.

### 增加最大锁定内存 (Increase max locked memory)

配置操作系统以允许大的固定（即页面锁定）分配。GPU应用经常固定内存以加快传输——设置ulimit -l unlimited或高值，以便您的数据加载器可以分配固定缓冲区而不会达到操作系统限制。这可以防止故障或回退到可分页内存，这会减慢GPU DMA速度。

> Configure the OS to allow large pinned (aka page-locked) allocations. GPU apps often pin memory for faster transfers-set ulimit -l unlimited or a high value so your data loaders can allocate pinned buffers without hitting OS limits. This prevents failures or fallbacks to pageable memory, which would slow down GPU DMA.

### 使用最新的NVIDIA驱动程序和CUDA堆栈 (Use the latest NVIDIA driver and CUDA stack)

在所有节点上保持NVIDIA驱动程序和CUDA运行时为最新（在测试的稳定版本内）。新驱动程序可以带来性能改进，是新GPU计算能力所必需的。确保所有节点具有相同的驱动程序/CUDA版本，以避免多节点作业中的任何不匹配。在启动时在GPU上启用持久模式（nvidia-smi -pm 1），以便驱动程序保持加载状态且GPU不会产生重新初始化延迟。在所有节点上更新NVIDIA驱动程序工具包以继承错误修复和性能改进。

> Keep NVIDIA drivers and CUDA runtime up-to-date (within a tested stable version) on all nodes. New drivers can bring performance improvements and are required for new GPUs' compute capabilities. Make sure all nodes have the same driver/CUDA versions to avoid any mismatches in multinode jobs. Enable persistence mode on GPUs at boot (nvidia-smi -pm 1) so the driver stays loaded and GPUs don't incur re-init delays. Update the NVIDIA driver and toolkit on all nodes to inherit bug fixes and performance improvements.

### 使用MIG配置时启用GPU持久性 (Enable GPU persistence when using a MIG configuration)

启用持久模式后，GPU保持"热"状态并准备使用，减少作业的启动延迟。如果使用多实例GPU（MIG）分区，这一点尤其关键——没有持久性，MIG配置会在每个作业时重置，但保持驱动程序活动会保留切片。使用MIG时始终配置持久模式。

> With persistence mode enabled, the GPU remains "warm" and ready to use, reducing startup latency for jobs. This is especially crucial if using a Multi-Instance GPU (MIG) partitioning-without persistence, MIG configurations would reset on every job, but keeping the driver active preserves the slices. Always configure persistence mode when using MIG.

### 隔离系统任务 (Isolate system tasks)

在每台服务器上为一个核心或一小部分核心专用于操作系统内务处理，如中断处理和后台守护程序。这样，供给GPU的主CPU线程不会被中断。这可以使用CPU隔离或cgroup固定来完成。消除操作系统抖动确保一致的吞吐量。

> Dedicate a core-or small subset of cores-on each server for OS housekeeping, such as interrupt handling and background daemons. This way, your main CPU threads feeding the GPU are not interrupted. This can be done using CPU isolation or cgroup pinning. Eliminating OS jitter ensures consistent throughput.

### 优化系统I/O设置 (Optimize system I/O settings)

如果您的工作负载进行大量日志记录或检查点，请挂载有利于吞吐量的文件系统选项。考虑对数据磁盘使用noatime并增加文件系统预读以进行流式读取。确保磁盘调度程序设置为适当使用mq-deadline或noop以用于NVMe SSD，以减少延迟可变性。

> If your workload does a lot of logging or checkpointing, mount filesystems with options that favor throughput. Consider using noatime for data disks and increase filesystem read-ahead for streaming reads. Ensure the disk scheduler is set appropriately to use mq-deadline or noop for NVMe SSDs to reduce latency variability.

### 执行定期维护 (Perform regular maintenance)

保持BIOS/固件更新以获得性能修复。一些BIOS更新改进PCIe带宽或修复GPU的IOMMU问题。此外，定期检查NIC和NVSwitch/结构的固件更新（如NVIDIA提供的，如Fabric Manager升级等）。小的固件调整有时可以解决模糊的瓶颈或可靠性问题。

> Keep BIOS/firmware updated for performance fixes. Some BIOS updates improve PCIe bandwidth or fix input-output memory management unit (IOMMU) issues for GPUs. Also, periodically check for firmware updates for NICs and NVSwitch/Fabric if applicable, as provided by NVIDIA, such as Fabric Manager upgrades, etc. Minor firmware tweaks can sometimes resolve obscure bottlenecks or reliability issues.

### 调整Docker和Kubernetes配置以获得最大性能 (Tune Docker and Kubernetes configurations for maximum performance)

在容器中运行时，添加选项，如--ipc=host用于共享内存，并设置--ulimit memlock=-1以防止内存锁定问题。这保证您的容器化进程在没有操作系统限制的情况下访问内存。

> When running in containers, add options, such as --ipc=host for shared memory, and set --ulimit memlock=-1 to prevent memory locking issues. This guarantees that your containerized processes access memory without OS-imposed restrictions.

## GPU资源管理与调度 (GPU Resource Management and Scheduling)

更智能的放置和分区可以在不购买新硬件的情况下提高利用率——并保护混合工作负载的可预测性。尊重拓扑，在适当的地方使用MPS/MIG，并控制时钟/电源以最小化争用和尾部延迟。

> Smarter placement and partitioning raise utilization without buying new hardware-and protect predictability for mixed workloads. Respect topology, use MPS/MIG where appropriate, and control clocks/power to minimize contention and tail latency.

调度时考虑GPU/NUMA/NVLink拓扑，并使用MPS或MIG提高较小作业的利用率，同时保留ECC和持久性以确保可靠性。在需要时锁定时钟或限制功率以确保稳定性，避免CPU过度订阅，并智能地打包作业以最大化投资回报率而不产生争用。以下是一些GPU资源管理和调度技巧：

> Schedule with GPU/NUMA/NVLink topology in mind, and use MPS or MIG to raise utilization for smaller jobs while retaining ECC and persistence for reliability. Lock clocks or power limit for stability when needed, avoid CPU oversubscription, and pack jobs intelligently to maximize ROI without contention. Here are some GPU resource management and scheduling tips:

### 拓扑感知作业调度 (Topology-aware job scheduling)

确保Kubernetes和SLURM等编排器在尊重NUMA和NVLink边界的节点上调度容器，以最小化跨NUMA和跨NVLink域内存访问。这种对齐减少延迟并提高整体吞吐量。

> Ensure that orchestrators like Kubernetes and SLURM are scheduling containers on nodes that respect NUMA and NVLink boundaries to minimize cross-NUMA and cross-NVLink-domain memory accesses. This alignment reduces latency and improves overall throughput.

### 多进程服务（MPS）(Multi-Process Service (MPS))

在单个GPU上运行多个进程时启用NVIDIA MPS以提高利用率。MPS允许来自不同进程的内核在GPU上并发执行而不是时间切片。如果单个作业不能完全饱和GPU，这很有用——例如，在单个GPU上使用MPS运行4个训练任务可以重叠它们的工作并提升整体吞吐量。

> Enable NVIDIA MPS when running multiple processes on a single GPU to improve utilization. MPS allows kernels from different processes to execute concurrently on the GPU instead of time-slicing. This is useful if individual jobs don't fully saturate the GPU-for example, running 4 training tasks on one GPU with MPS can overlap their work and boost overall throughput.

### 多实例GPU（MIG）(Multi-Instance GPU (MIG))

使用MIG将高端GPU分区为较小的实例以用于多个作业。如果您有许多轻量级工作负载，如推理小模型或运行许多实验，您可以将GPU切片以确保每个作业有保证的资源。例如，现代GPU可以分成多个MIG切片（最多7个）。不要将MIG用于紧密耦合的并行作业，因为这些作业受益于完整的GPU访问。在作业小于完整GPU时部署MIG进行隔离和最大化GPU投资回报率。

> Use MIG to partition high-end GPUs into smaller instances for multiple jobs. If you have many light workloads like inferencing small models or running many experiments, you can slice a GPU to ensure guaranteed resources for each job. For instance, modern GPUs can be split into multiple MIG slices (up to 7). Do not use MIG for tightly coupled parallel jobs, as those benefit from full GPU access. Deploy MIG for isolation and maximizing GPU ROI when jobs are smaller than a full GPU.

### MIG的持久性 (Persistence for MIG)

保持持久模式开启以在作业之间维护MIG分区。这避免了重新分区开销，并确保后续作业无需延迟即可看到预期的GPU切片。在集群启动时配置MIG并保持启用，以便调度是可预测的，因为在运行时更改MIG配置需要重置GPU，这可能会中断正在运行的作业。计划维护窗口，因为MIG设备分区不会在重启后由GPU持久化。使用NVIDIA的MIG Manager在启动时自动重新创建所需的布局。

> Keep persistence mode on to maintain MIG partitions between jobs. This avoids repartitioning overhead and ensures subsequent jobs see the expected GPU slices without delay. Configure MIG at cluster boot and leave it enabled so that scheduling is predictable, as changing MIG config on the fly requires resetting the GPU, which can disrupt running jobs. Plan for maintenance windows as MIG device partitions are not persisted by the GPU across reboot. Use NVIDIA's MIG Manager to automatically recreate the desired layout on boot.

### GPU时钟和电源设置 (GPU clock and power settings)

如果需要运行间一致性，请考虑使用nvidia-smi -lgc/ -lmc将GPU时钟锁定到固定高频率。默认情况下，GPU使用自动升压，这通常是最优的，但固定时钟可以避免任何瞬态降频。在功率受限的场景中，您可以稍微降频或设置功率限制以使GPU保持在稳定的热/功率范围内——如果偶尔降频是问题，这可以产生一致的性能。

> Consider locking GPU clocks to a fixed high frequency with nvidia-smi -lgc/ -lmc if you need run-to-run consistency. By default, GPUs use auto boost, which is usually optimal, but fixed clocks can avoid any transient downclocking. In power-constrained scenarios, you might slightly underclock or set a power limit to keep GPUs in a stable thermal/power envelope-this can yield consistent performance if occasional throttling was an issue.

### ECC内存 (ECC memory)

在数据中心GPU上保持ECC启用以确保可靠性，除非您有特定原因禁用它。性能成本很小——带宽和内存损失约几个百分点——但ECC捕获可能破坏长时间训练作业的内存错误。大多数服务器GPU默认启用ECC。保持启用以保护数周的训练。

> Keep ECC enabled on data center GPUs for reliability unless you have a specific reason to disable it. The performance cost is minimal-on the order of a few percent loss in bandwidth and memory-but ECC catches memory errors that could otherwise corrupt a long training job. Most server GPUs ship with ECC on by default. Leave it on to safeguard multiweek training.

### 作业调度器感知 (Job scheduler awareness)

将GPU拓扑集成到您的作业调度器中，如SLURM和Kubernetes。配置调度器在需要低延迟耦合时将作业分配到同一节点或同一NVSwitch组。使用Kubernetes设备插件或SLURM Gres为较小作业调度MIG切片。GPU感知调度器可以防止单个作业跨越遥远的GPU并遭受带宽问题的场景。

> Integrate GPU topology into your job scheduler, such as SLURM and Kubernetes. Configure the scheduler to allocate jobs on the same node or same NVSwitch group when low-latency coupling is needed. Use Kubernetes device plugins or SLURM Gres to schedule MIG slices for smaller jobs. A GPU-aware scheduler prevents scenarios like a single job spanning distant GPUs and suffering bandwidth issues.

### CPU过度订阅 (CPU oversubscription)

调度作业时，考虑每个GPU任务的CPU需求，如数据加载线程等。不要在节点上打包超过CPU能处理的GPU作业。让GPU空闲比使CPU过载导致所有GPU供给不足要好。监控每个GPU作业的CPU利用率以指导调度决策。

> When scheduling jobs, account for the CPU needs of each GPU task, such as data loading threads, etc. Don't pack more GPU jobs on a node than the CPUs can handle. It's better to leave a GPU idle than to overload the CPU such that all GPUs become underfed. Monitor CPU utilization per GPU job to inform scheduling decisions.

### 对NVSwitch使用NVIDIA Fabric Manager (Use NVIDIA Fabric Manager for NVSwitch)

在具有NVSwitch的系统上，GB200/GB300 NVL72机架确保NVIDIA Fabric Manager正在运行。它管理NVSwitch拓扑和路由。没有它，多GPU通信可能无法完全优化，甚至可能对大型作业失败。Fabric Manager服务通常在配备NVSwitch的服务器上默认运行，但您应该仔细检查它是否已启用并运行——特别是在驱动程序更新后。

> On systems with NVSwitch, the GB200/GB300 NVL72 racks ensure NVIDIA Fabric Manager is running. It manages the NVSwitch topology and routing. Without it, multi-GPU communication might not be fully optimized or could even fail for large jobs. The Fabric Manager service typically runs by default on NVSwitch-equipped servers, but you should double-check that it's enabled and running-especially after driver updates.

### 作业打包以提高利用率 (Job packing for utilization)

通过智能打包作业来最大化利用率。例如，在4-GPU节点上，如果您有两个2-GPU作业且CPU使用率不高，将它们一起运行在同一节点上可以节省资源，甚至如果在同一计算节点或启用NVLink的机架内一起运行，还可以使用更快的NVLink进行通信。相反，避免将超过节点内存或I/O容量的作业共置。目标是在无争用的情况下实现高硬件利用率。

> Maximize utilization by intelligently packing jobs. For example, on a 4-GPU node, if you have two 2-GPU jobs that don't use much CPU, running them together on the same node can save resources and even use the faster NVLink for communication if running together inside the same compute node or NVLink-enabled rack. Conversely, avoid colocating jobs that collectively exceed the memory or I/O capacity of the node. The goal is high hardware utilization without contention.

## I/O优化 (I/O Optimization)

如果数据跟不上，GPU就会空闲——通常最大、最便宜的加速来自修复输入，而不是数学计算。并行性、固定内存、异步传输和快速存储确保模型持续供给。

> If data can't keep up, GPUs idle-often the largest, cheapest speedups come from fixing input, not math. Parallelism, pinned memory, async transfers, and fast storage ensure the model is continuously fed.

通过并行化数据加载器、使用固定内存和异步传输，并将数据存储在快速NVMe上——最好使用GPUDirect Storage来保持GPU供给。智能地进行条带化、缓存和压缩。测量端到端吞吐量，使I/O随集群规模扩展，并异步写入检查点/日志。以下是数据流水线I/O优化的一些技巧：

> Keep the GPUs fed by parallelizing data loaders, using pinned memory and async transfers, and storing data on fast NVMe-preferably with GPUDirect Storage. Stripe, cache, and compress wisely. Measure end-to-end throughput so I/O scales with cluster size, and write checkpoints/logs asynchronously. Here are some tips on I/O optimizations for your data pipeline:

### 并行加载数据 (Load data in parallel)

使用多个工作线程/进程为GPU加载和预处理数据。默认的1-2个数据加载器工作线程可能不够。使用PyTorch DataLoader(num_workers=N)等分析和增加数据加载器进程/线程的数量，直到数据输入不再是瓶颈。高核心数CPU的存在就是为了供给这些GPU，因此确保您充分利用它们。

> Use multiple workers/threads to load and preprocess data for the GPUs. The default of one to two data loader workers may be insufficient. Profile and increase the number of data loader processes/threads using PyTorch DataLoader(num_workers=N), for example, until the data input is no longer the bottleneck. High core-count CPUs exist to feed those GPUs, so make sure you utilize them.

### 为I/O固定主机内存 (Pin host memory for I/O)

为数据传输缓冲区启用固定（即页面锁定）内存。许多框架都有类似PyTorch的DataLoader的pin_memory=True选项，用于分配GPU可以直接DMA的主机内存。使用固定内存显著提高H2D复制吞吐量。将其与异步传输结合以重叠数据加载与计算。

> Enable pinned (aka page-locked) memory for data transfer buffers. Many frameworks have an option like PyTorch's pin_memory=True for its DataLoader to allocate host memory that the GPU can DMA from directly. Using pinned memory significantly improves H2D copy throughput. Combine this with asynchronous transfers to overlap data loading with computation.

### 重叠计算和数据传输 (Overlap compute and data transfers)

流水线化您的输入数据。当GPU忙于计算批次N时，在CPU上加载和准备批次N+1，并使用CUDA流和非阻塞cudaMemcpyAsync在后台传输它。这种双缓冲隐藏延迟——GPU理想情况下从不等待数据。确保您的训练循环使用异步传输。例如，在PyTorch中，您可以使用non_blocking=True将张量复制到GPU。异步传输允许CPU在后台数据传输进行时继续运行。这将通过重叠计算与数据传输来提高性能。

> Pipeline your input data. While the GPU is busy computing on batch N, load and prepare batch N+1 on the CPU and transfer it in the background using CUDA streams and nonblocking cudaMemcpyAsync. This double buffering hides latency-the GPU ideally never waits for data. Ensure your training loop uses asynchronous transfers. For example, in PyTorch, you can copy tensors to GPU with non_blocking=True. Asynchronous transfer allows the CPU to continue running while the data transfer is in progress in the background. This will improve performance by overlapping computation with data transfer.

### 使用快速存储（NVMe/SSD）(Use fast storage (NVMe/SSD))

将训练数据存储在快速本地NVMe SSD或高性能并行文件系统上。机械硬盘将严重限制吞吐量。如果可用，启用GPUDirect Storage（GDS），以便GPU可以直接从NVMe或网络存储流式传输数据——绕过CPU。这进一步减少了读取大型数据集时的I/O延迟和CPU负载。对于大型数据集，考虑每个节点拥有数据的本地副本或分片。如果使用网络存储，优先选择具有条带化的分布式文件系统，如Lustre，或可以并行服务许多客户端的对象存储。

> Store training data on fast local NVMe SSDs or a high-performance parallel filesystem. Spinning disks will severely limit throughput. If available, enable GPUDirect Storage (GDS) so that GPUs can stream data directly from NVMe or network storage-bypassing the CPU. This further reduces I/O latency and CPU load when reading large datasets. For large datasets, consider each node having a local copy or shard of the data. If using network storage, prefer a distributed filesystem like Lustre with striping or an object store that can serve many clients in parallel.

### 调优I/O并发和条带化 (Tune I/O concurrency and striping)

避免单文件访问的瓶颈。如果一个大文件被所有工作线程使用，将其条带化到多个存储目标或分成块，以便多个服务器可以服务它。例如，将数据集分成多个文件，让每个数据加载器工作线程同时读取不同的文件。这最大化存储系统的聚合带宽。

> Avoid bottlenecks from single-file access. If one large file is used by all workers, stripe it across multiple storage targets or split it into chunks so multiple servers can serve it. For instance, break datasets into multiple files and have each data loader worker read different files simultaneously. This maximizes aggregate bandwidth from the storage system.

### 优化小文件访问 (Optimize small files access)

如果您的数据集由数百万个小文件组成，减轻元数据开销。每秒打开太多小文件可能会压垮文件系统的元数据服务器。解决方案将小文件打包到更大的容器中，如tar或RecordIO文件；使用批量读取的数据摄取库；或确保在客户端上启用元数据缓存。这减少每个文件的开销并加快epoch开始时间。

> If your dataset consists of millions of small files, mitigate metadata overhead. Opening too many small files per second can overwhelm the filesystem's metadata server. Solutions pack small files into larger containers, such as tar or RecordIO files; use data ingestion libraries that batch reads; or ensure metadata caching is enabled on clients. This reduces per-file overhead and speeds up epoch start times.

### 在可用时使用客户端缓存 (Use client-side caching when available)

利用任何缓存层。如果使用NFS，增加客户端缓存大小和持续时间。对于分布式文件系统，考虑缓存守护程序，甚至手动将部分数据集缓存到本地磁盘。目标是避免重复从慢速源读取相同的数据。如果每个节点在不同时间处理相同的文件，本地缓存可以大幅削减冗余I/O。

> Take advantage of any caching layer. If using NFS, increase the client cache size and duration. For distributed filesystems, consider a caching daemon or even manually caching part of the dataset on a local disk. The goal is to avoid repeatedly reading the same data from a slow source. If each node processes the same files at different times, a local cache can drastically cut redundant I/O.

### 明智地压缩数据 (Compress data wisely)

如果I/O是瓶颈，则存储压缩的数据集，但使用轻量级压缩，如LZ4或Zstd快速模式。这用一些CPU来换取减少I/O量。如果由于解压缩CPU成为瓶颈，考虑多线程解压缩或卸载到加速器。此外，通过使用一个线程读取压缩数据，另一个线程并行解压缩数据来重叠解压缩与读取。现代GPU可以使用GPU计算资源（或图像/视觉数据的专业解码器）在使用GPUDirect Storage和cuFile I/O堆栈时执行实时数据解压缩。

> Store the dataset compressed if I/O is the bottleneck, but use lightweight compression, such as LZ4 or Zstd fast mode. This trades some CPU to reduce I/O volume. If the CPU becomes the bottleneck due to decompression, consider multithreaded decompression or offloading to accelerators. Also, overlap decompression with reading by using one thread to read compressed data and another thread to decompress the data in parallel. Modern GPUs can perform on-the-fly data decompression using GPU computing resources (or specialized decoders for image/visual data) when paired with GPUDirect Storage and the cuFile I/O stack.

### 测量吞吐量并消除瓶颈 (Measure throughput and eliminate bottlenecks)

持续监控数据流水线的吞吐量。如果GPU利用率不接近100%且您怀疑输入延迟，测量您从磁盘读取的MB/s以及数据加载器核心的繁忙程度。NVIDIA的DCGM等工具可以揭示GPU是否在等待数据。通过增加预取缓冲区、增加网络缓冲区大小、优化磁盘RAID设置等系统地调优每个组件。这样做直到输入流水线能够以GPU消耗的速度供给数据。通常，这些优化通过消除I/O停滞将GPU利用率从约70%提高到>95%。

> Continuously monitor the data pipeline's throughput. If GPUs aren't near 100% utilization and you suspect input lag, measure how many MB/s you're reading from disk and how busy the data loader cores are. Tools like dstat or NVIDIA's DCGM can reveal if GPUs are waiting on data. Systematically tune each component by bumping up prefetch buffers, increasing network buffer sizes, optimizing disk RAID settings, etc. Do this until the input pipeline can feed data as fast as GPUs consume it. Often, these optimizations raise GPU utilization from ~70% to > 95% on the same hardware by removing I/O stalls.

### 为多节点扩展I/O (Scale I/O for multinode)

在集群规模上，确保存储系统能够处理聚合吞吐量。例如，8个GPU每个消耗200 MB/s是每节点1.6 GB/s。跨100个节点，这需要160 GB/s。很少有中央文件系统能够维持这一点。通过将数据分片到存储服务器、使用每节点缓存，或将数据预加载到每个节点的本地磁盘来缓解。以存储空间换取吞吐量（例如，数据的多个副本）通常是值得的，以避免让昂贵的GPU挨饿。

> At cluster scale, ensure the storage system can handle aggregate throughput. For example, 8 GPUs consuming 200 MB/s each is 1.6 GB/s per node. Across 100 nodes, that's 160 GB/s needed. Very few central filesystems can sustain this. Mitigate by sharding data across storage servers, using per-node caches, or preloading data onto each node's local disk. Trading off storage space for throughput (e.g., multiple copies of data) is often worth it to avoid starving expensive GPUs.

### 最小化检查点和日志开销 (Minimize checkpointing and logging overhead)

高效地写入检查点和日志。如果可能，使用异步写入检查点，或写入本地磁盘，然后复制到网络存储以避免停滞训练。压缩检查点或使用稀疏存储格式以减少大小。通过聚合迭代统计并仅每N次迭代记录而不是每次迭代来限制每步的日志记录频率。这将大大减少I/O开销。

> Write checkpoints and logs efficiently. Use asynchronous writes for checkpoints if possible, or write to local disk, then copy to network storage to avoid stalling training. Compress checkpoints or use sparse storage formats to reduce size. Limit logging frequency on each step by aggregating iteration statistics and logging only every Nth iteration rather than every iteration. This will greatly reduce I/O overhead.

您还可以使用cuda-checkpoint和Checkpoint/Restore in Userspace（CRIU）暂停正在运行的GPU进程以持久化进程映像。准备恢复时，CUDA驱动程序可以恢复设备内存和CUDA状态——即使在相同设备类型的其他GPU上。将其视为模型状态字典或分片检查点文件的补充而不是替代。

> You can also suspend a running GPU process with cuda-checkpoint and Checkpoint/Restore in Userspace (CRIU) to persist the process image. When ready to resume, the CUDA driver can restore device memory and CUDA state-even on to other GPUs of the same device type. Treat this as complementary to your model's state-dict or sharded checkpoint files rather than a replacement.

## 数据处理流水线 (Data Processing Pipelines)

数据的格式、布局和局部性决定了流水线在大规模下的运行顺畅程度。二进制格式、分片、缓存和优先线程将I/O从瓶颈转变为稳定的流。

> The format, layout, and locality of data determine how smoothly the pipeline runs at scale. Binary formats, sharding, caching, and prioritized threads turn I/O from a bottleneck into a steady stream.

将数据集转换为二进制或内存映射格式，跨存储和节点分片，并提高线程优先级或将简单的增强移到GPU以防止停滞。缓存热数据/KV状态，积极预取和缓冲，并调整批次大小以保持从磁盘到设备的流水线顺畅。以下是改进数据处理的一些技巧：

> Convert datasets to binary or memory-mapped formats, shard across storage and nodes, and raise thread priorities or move simple augments to the GPU to prevent stalls. Cache hot data/KV states, prefetch and buffer aggressively, and size batches to keep the pipeline smooth from disk to device. The following are tips for improving your data processing:

### 使用二进制数据格式 (Use binary data formats)

将数据集转换为二进制格式，如TFRecords、LMDB或内存映射数组。这种转换减少了处理数百万小文件的开销并加速数据摄取。

> Convert datasets to binary formats, such as TFRecords, LMDB, or memory-mapped arrays. This conversion reduces the overhead associated with handling millions of small files and accelerates data ingestion.

### 调优文件系统 (Tune the file system)

除了使用noatime挂载文件系统和增加预读之外，考虑将数据分片到多个存储节点以分布I/O负载并防止单个服务器上的瓶颈。

> In addition to mounting file systems with noatime and increasing read-ahead, consider sharding data across multiple storage nodes to distribute I/O load and prevent bottlenecks on a single server.

### 为CPU绑定工作负载禁用超线程 (Disable hyperthreading for CPU-bound workloads)

对于严重CPU绑定的数据流水线，禁用超线程可以减少资源争用并带来更一致的性能。这在单线程性能关键的系统上特别有益。

> For data pipelines that are heavily CPU-bound, disabling hyperthreading can reduce resource contention and lead to more consistent performance. This is especially beneficial on systems where single-thread performance is critical.

### 提高线程优先级 (Elevate thread priorities)

使用chrt或pthread_setschedparam等工具提高数据加载器和预处理CPU线程的调度优先级。通过给予这些线程更高的优先级，您确保数据以最小延迟供给GPU，减少流水线停滞的机会。

> Increase the scheduling priority of data loader and preprocessing CPU threads using tools, such as chrt or pthread_setschedparam. By giving these threads higher priority, you ensure that data is fed to the GPU with minimal latency, reducing the chance of pipeline stalls.

### 缓存频繁使用的数据 (Cache frequently used data)

利用操作系统页面缓存或专用RAM磁盘来缓存频繁访问的数据。这种方法在NLP等应用中特别有益，其中某些标记或短语被重复访问，减少冗余处理和I/O开销。

> Leverage operating system page caches or a dedicated RAM disk to cache frequently accessed data. This approach is especially beneficial in applications like NLP, where certain tokens or phrases are accessed repeatedly, reducing redundant processing and I/O overhead.

### 预取和缓冲数据 (Prefetch and buffer data)

始终在需要它的迭代之前加载数据。使用后台数据加载器线程或进程，如具有prefetch_factor的PyTorch DataLoader。对于分布式训练，使用DistributedSampler确保每个进程获得唯一的数据以避免冗余I/O。

> Always load data ahead of the iteration that needs it. Use background data loader threads or processes, such as PyTorch DataLoader with prefetch_factor. For distributed training, use DistributedSampler to ensure each process gets unique data to avoid redundant I/O.

### 并行化数据转换 (Parallelize data transformations)

如果CPU预处理——如图像增强和文本标记化——很重，将其分布到多个工作线程/进程。分析以确保CPU不是瓶颈而GPU在等待。如果是，增加工作线程或将一些转换移到GPU，如NVIDIA的DALI等库可以在GPU上异步执行图像操作。

> If CPU preprocessing-such as image augmentation and text tokenization-is heavy, distribute it across multiple worker threads/processes. Profile to ensure the CPU isn't the bottleneck while GPUs wait. If it is, either increase workers or move some transforms to GPU, as libraries like NVIDIA's DALI can do image operations on a GPU asynchronously.

### 缓存模型状态和输出 (Cache model states and outputs)

在使用LLM进行推理时，缓存频繁看到的标记的嵌入和V缓存以避免重复计算它们是有益的。类似地，如果LLM训练作业多次重用相同的数据集（称为epochs），您应该利用OS页面缓存或RAM来存储热数据。

> When inferencing with LLMs, it's beneficial to cache the embeddings and V cache for frequently seen tokens to avoid having to recompute them repeatedly. Similarly, if an LLM training job reuses the same dataset multiple times (called epochs), you should leverage OS page cache or RAM to store the hot data.

### 跨节点分片数据 (Shard data across nodes)

在多节点训练中，给每个节点一个数据子集以避免每个节点从单一源读取整个数据集。这可以扩展I/O。使用分布式文件系统或手动分片分配，每个节点读取不同的文件。这加快了速度，并自然地与数据并行对齐，因为每个节点处理自己的数据分片。DeepSeek的Fire-Flyer文件系统（3FS）是分布式数据集分片文件系统的一个例子。DeepSeek的3FS通过将数据集分片分布在每个节点的NVMe SSD上实现每秒多TB的吞吐量——同时最小化传统缓存。这种设计用本地高速数据供给每个GPU，避免I/O瓶颈。

> In multinode training, give each node a subset of data to avoid every node reading the entire dataset from a single source. This scales out I/O. Use a distributed filesystem or manual shard assignment with each node reading different files. This speeds things up and naturally aligns with data parallelism since each node processes its own data shard. DeepSeek's Fire-Flyer File System (3FS) is one example of a distributed dataset sharding filesystem. DeepSeek's 3FS achieves multiterabyte-per-second throughput by distributing dataset shards across NVMe SSDs on each node-while minimizing traditional caching. This design feeds each GPU with local high-speed data, avoiding I/O bottlenecks.

### 监控流水线并调整批次大小 (Monitor pipeline and adjust batch size)

有时增加批次大小会将更多工作推给GPU并减少频繁的I/O，提高整体利用率——但只是在一定程度上，因为它会影响收敛。相反，如果GPU经常等待数据，且您无法加速I/O，您实际上可能减小批次大小以缩短每次迭代，从而减少空闲时间，或对较小批次进行梯度累积，使数据读取更连续。找到一个平衡点，使GPU几乎总是忙碌的。

> Sometimes increasing batch size will push more work onto GPUs and less frequent I/O, improving overall utilization-but only up to a point as it affects convergence. Conversely, if GPUs are waiting on data often, and you cannot speed I/O, you might actually decrease batch size to shorten each iteration and thus reduce idle time or do gradient accumulation of smaller batches such that data reads are more continuous. Find a balance where GPUs are nearly always busy.

### 在GPU上应用数据增强 (Apply data augmentation on GPU)

如果增强很简单但应用于大量数据，如添加噪声或归一化，在GPU上进行可能值得，以避免使CPU饱和。GPU在数据加载期间通常未充分利用，因此在加载后使用小的CUDA内核来增强数据可以是高效的。但要注意不要序列化流水线。使用流来重叠批次N+1的增强，而批次N正在训练。利用NVIDIA DALI等GPU加速库来异步执行这些任务。这有助于保持顺畅和高吞吐量的数据流水线。

> If augmentation is simple but applied to massive data, like adding noise or normalization, it might be worth doing on GPU to avoid saturating CPU. GPUs are often underutilized during data loading, so using a small CUDA kernel to augment data after loading can be efficient. But be careful not to serialize the pipeline. Use streams to overlap augmentation of batch N+1 while batch N is training. Utilize GPU-accelerated libraries like NVIDIA DALI to perform these tasks asynchronously. This helps maintain a smooth and high-throughput data pipeline.

### 专注于端到端吞吐量（例如每秒标记数）(Focus on end-to-end throughput (e.g., tokens per second))

记住，如果您的数据流水线将吞吐量减半，加速模型计算也没有帮助。始终进行端到端分析，而不仅仅是孤立的训练循环。使用Nsight Systems和Nsight Compute测量内核时间线和停滞，或PyTorch分析器进行框架级归因。然后比较合成数据与真实数据的迭代时间，以了解数据加载引入了多少开销。目标是理想情况下少于10%的开销。如果超过这个值，投资流水线优化；它通常产生大的"免费"训练加速。

> Remember that speeding up model compute doesn't help if your data pipeline cuts throughput in half. Always profile end-to-end, not just the training loop isolated. Use Nsight Systems and Nsight Compute to measure kernel timelines and stalls, or the PyTorch profiler for framework-level attribution. Then compare iteration time with synthetic versus real data to see how much overhead data loading introduces. Aim for less than 10% overhead from ideal. If it's more than that, invest time in pipeline optimization; it often yields large "free" speedups in training.

## 性能分析、调试与监控 (Performance Profiling, Debugging, and Monitoring)

您无法优化您不衡量的东西；性能分析揭示您是计算绑定、内存绑定、I/O绑定还是网络绑定，以便您针对正确的修复。持续的遥测和回归测试防止胜利随着代码、驱动程序和数据的发展而侵蚀。

> You can't optimize what you don't measure; profiling reveals if you're compute-bound, memory-bound, I/O-bound, or network-bound so you target the right fix. Continuous telemetry and regression tests keep wins from eroding as code, drivers, and data evolve.

具体来说，将Nsight Systems/Compute和框架分析器与NVTX一起使用，以确定您是计算绑定、内存绑定、I/O绑定还是通信绑定。修剪Python开销，观察利用率差距，平衡跨rank的工作，跟踪内存/网络/磁盘健康，并用性能回归测试和警报来限制更改。使用以下指导来分析、监控和调试AI工作负载的性能：

> Specifically, use Nsight Systems/Compute and framework profilers with NVTX to determine whether you're compute-bound, memory-bound, I/O-bound, or communication-bound. Trim Python overhead, watch utilization gaps, balance work across ranks, track memory/network/disk health, and gate changes with performance regression tests and alerts. Use the following guidance to profile, monitor, and debug the performance of your AI workloads:

### 分析以发现瓶颈和根本原因 (Profile to find bottlenecks and root cause analysis)

定期在训练/推理作业上运行分析器。使用NVIDIA Nsight Systems获取CPU和GPU活动的时间线。您还可以使用Nsight Compute或PyTorch分析器深入研究内核效率。识别您的作业是计算绑定、内存绑定还是等待I/O/通信。相应地针对您的优化。例如，如果您的工作负载是内存绑定的，专注于减少内存流量而不是实现计算绑定优化。结合机器学习驱动的分析来预测和预防性能瓶颈。这可以帮助自动化实时微调调整。使用GPUDirect Storage时，启用GDS跟踪以将cuFile活动与内核间隙相关联。

> Regularly run profilers on your training/inference jobs. Use NVIDIA Nsight Systems to get a timeline of CPU and GPU activity. You can also use Nsight Compute or the PyTorch profiler to drill down into kernel efficiency. Identify whether your job is compute bound, memory bound, or waiting on I/O/communication. Target your optimizations accordingly. For example, if your workload is memory bound, focus on reducing memory traffic rather than implementing compute-bound optimizations. Combine with machine-learning-driven analytics to predict and preempt performance bottlenecks. This can help in automating fine-tuning adjustments in real time. When using GPUDirect Storage, enable GDS tracing to correlate cuFile activity with kernel gaps.

### 消除Python开销 (Eliminate Python overhead)

分析您的训练脚本以识别Python瓶颈——如过度循环或日志记录——并用向量化操作或优化的库调用替换它们。最小化Python开销有助于确保CPU不会成为整个系统性能的隐藏瓶颈。

> Profile your training scripts to identify Python bottlenecks-such as excessive looping or logging-and replace them with vectorized operations or optimized library calls. Minimizing Python overhead helps ensure that the CPU does not become a hidden bottleneck in the overall system performance.

### 测量GPU利用率和空闲间隙 (Measure GPU utilization and idle gaps)

持续监控GPU利用率、SM效率、内存带宽使用率等。如果您注意到利用率的周期性下降，将它们与事件相关联。例如，每5分钟的利用率下降可能与检查点保存同时发生。这种模式指向优化机会，如交错检查点和使用异步刷新。利用DCGM或nvidia-smi守护程序模式等工具随时间记录这些指标。

> Continuously monitor GPU utilization, SM efficiency, memory bandwidth usage, etc. If you notice periodic drops in utilization, correlate them with events. For example, a drop in utilization every 5 minutes might coincide with checkpoint saving. Such patterns point to optimization opportunities, such as staggering checkpoints and using asynchronous flushes. Utilize tools like DCGM or nvidia-smi in daemon mode to log these metrics over time.

### 使用NVTX标记 (Use NVTX markers)

使用NVTX范围或框架分析API对代码进行检测，以标记不同阶段，包括数据加载、前向传播、后向传播等。这些标记显示在Nsight Systems或Perfetto时间线中，并帮助您将GPU空闲时间或延迟归因于流水线的特定部分。这使得向开发人员传达代码的哪部分需要关注变得更容易。对于PyTorch，您可以使用torch.profiler.record_function()。

> Instrument your code with NVTX ranges or framework profiling APIs to label different phases, including data loading, forward pass, backward pass, etc. These markers show up in the Nsight Systems or Perfetto timeline and help you attribute GPU idle times or latencies to specific parts of the pipeline. This makes it easier to communicate to developers which part of the code needs attention. For PyTorch, you can use torch.profiler.record_function().

### 利用内核分析和分析工具，而不仅仅是PyTorch分析器 (Utilize kernel profiling and analysis tools beyond just the PyTorch profiler)

对于性能关键的内核，使用Nsight Compute检查占用率和吞吐量等内核级指标，或使用Nsight Systems分析GPU/CPU时间线和重叠。检查实现的占用率、内存吞吐量和指令吞吐量。寻找内存瓶颈的迹象，如接近硬件最大值的内存带宽。这有助于识别内存绑定的工作负载。分析器的"Issues"部分通常直接建议内核是内存绑定还是计算绑定以及原因。使用此反馈来指导代码更改，如如果全局加载效率低则改进内存合并。

> For performance-critical kernels, use Nsight Compute to examine kernel-level metrics like occupancy and throughput, or Nsight Systems to analyze GPU/CPU timelines and overlap. Check achieved occupancy, memory throughput, and instruction throughput. Look for signs of memory bottlenecks, such as memory bandwidth near the hardware maximum. This helps to identify memory-bound workloads. The profiler's "Issues" section often directly suggests if a kernel is memory bound or compute bound and why. Use this feedback to guide code changes, such as improving memory coalescing if global load efficiency is low.

### 检查warp发散 (Check for warp divergence)

使用分析器查看warp是否发散，因为它可以显示分支效率和发散分支指标。发散意味着warp中的某些线程由于分支而不活动，这会损害吞吐量。如果显著，重新审视内核代码以重构条件或数据分配以最小化warp内发散，并确保每个warp处理统一的工作。

> Use the profiler to see if warps are diverging, as it can show branch efficiency and divergent branch metrics. Divergence means some threads in a warp are inactive due to branching, which hurts throughput. If significant, revisit the kernel code to restructure conditionals or data assignments to minimize intrawarp divergence and ensure that each warp handles uniform work.

### 验证负载均衡 (Verify load balancing)

在多GPU作业中，跨rank进行分析。有时一个GPU（rank 0）执行额外的工作，如聚合统计数据和数据收集——并经常成为瓶颈。监控每个GPU的时间线。如果一个GPU持续落后，分配额外的工作负载。例如，您可以让非零rank共享I/O和日志记录责任。确保所有GPU/rank具有类似的工作负载可以避免最慢的rank拖累其他rank。

> In multi-GPU jobs, profile across ranks. Sometimes one GPU (rank 0) does extra work like aggregating stats and data gathering-and often becomes a bottleneck. Monitor each GPU's timeline. If one GPU is consistently lagging, distribute that extra workload. For example, you can have the nonzero ranks share the I/O and logging responsibilities. Ensuring that all GPUs/ranks have similar workloads avoids the slowest rank dragging the rest.

### 监控内存使用 (Monitor memory usage)

跟踪GPU内存分配和使用随时间的变化。确保您不接近OOM，这可能导致框架意外将张量交换到主机，从而导致巨大的减速。如果内存使用逐次迭代攀升，您可能发现了泄漏。在这种情况下，使用torch.cuda.memory_summary()和Nsight Systems的GPU内存跟踪等工具分析详细分配。在CPU端，监控分页，因为您进程的驻留内存（RES）不应显著超过物理RAM。如果您看到分页，减少数据集预加载大小或增加RAM。

> Track GPU memory allocation and usage over time. Ensure you are not near OOM, which can cause the framework to unexpectedly swap tensors to host, which will cause huge slowdowns. If memory usage climbs iteration by iteration, you have likely identified leaks. In this case, profile with tools like torch.cuda.memory_summary() and Nsight Systems' GPU memory trace to analyze detailed allocations. On the CPU side, monitor for paging, as your process's resident memory (RES) should not exceed physical RAM significantly. If you see paging, reduce dataset preload size or increase RAM.

### 监控网络和磁盘 (Monitor network and disk)

对于分布式作业，使用操作系统工具监控网络吞吐量和磁盘吞吐量。确保实际吞吐量符合预期。例如，在100 Gbps链路上，如果充分利用，您应该看到12.5 GB/s（12.5 GB/s = 100 Gb/s / 8位每字节）。如果没有，网络可能是瓶颈或配置错误。类似地，监控训练节点上的磁盘I/O。如果您看到100%磁盘利用率峰值和GPU空闲，您可能需要更好地缓冲或缓存数据。

> For distributed jobs, use OS tools to monitor network throughput and disk throughput. Ensure the actual throughput matches expectations. For example, on a 100 Gbps link, you should see 12.5 GB/s (12.5 GB/s = 100 Gb/s / 8 bits per byte) if fully utilized. If not, the network might be a bottleneck or misconfigured. Similarly, monitor disk I/O on training nodes. If you see spikes of 100% disk utilization and GPU idle, you likely need to buffer or cache data better.

### 为异常设置警报 (Set up alerts for anomalies)

在生产或长时间运行的训练环境中，为GPU错误等事件设置自动警报或日志，如ECC错误、设备过热等。这将有助于识别异常慢的迭代。例如，NVIDIA的DCGM可以监控健康指标，如果GPU开始降频或遇到错误，您可以触发操作。这有助于立即捕获性能问题——如导致降频的冷却故障——而不是在作业完成后。

> In a production or long-running training context, set up automated alerts or logs for events like GPU errors, such as ECC errors, device overheating, etc. This will help identify abnormally slow iterations. For example, NVIDIA's DCGM can watch health metrics, and you can trigger actions if a GPU starts throttling or encountering errors. This helps catch performance issues-like a cooling failure causing throttling-immediately rather than after the job finishes.

### 执行回归测试 (Perform regression testing)

维护一组基准测试任务，每当您更改软件时运行，包括CUDA驱动程序、CUDA版本、AI框架版本，甚至您的训练代码。将性能与以前的运行进行比较以及早发现回归。驱动程序更新或代码更改无意中降低吞吐量并不罕见——标准工作负载上的快速分析运行将突出显示这一点，以便您可以调查。例如，可能一个内核意外地不再使用Tensor Core。这绝对是需要调查的事情。

> Maintain a set of benchmark tasks to run whenever you change software, including CUDA drivers, CUDA versions, AI framework versions, or even your training code. Compare performance to previous runs to catch regressions early. It's not uncommon for a driver update or code change to inadvertently reduce throughput-a quick profiling run on a standard workload will highlight this so you can investigate. For example, maybe a kernel is accidentally not using Tensor Cores anymore. This is something to look into for sure.

## GPU编程与CUDA调优 (GPU Programming and CUDA Tuning)

将内核与内存层次结构和硬件特性对齐是获得大而持久的收益的来源。融合、Tensor Core、CUDA图和编译器路径（例如torch.compile和OpenAI的Triton）将启动开销转化为有用的计算。

> Aligning kernels with the memory hierarchy and hardware features is where large, durable gains come from. Fusion, Tensor Cores, CUDA Graphs, and compiler paths (e.g., torch.compile and OpenAI's Triton) convert launch overhead into useful math.

针对内存层次结构进行优化：合并全局加载，平铺到共享内存，管理寄存器/占用率，并重叠传输（例如cp.async/TMA）与计算。优先选择调优的库和CUDA图，利用torch.compile和OpenAI的Triton进行融合，并使用roofline分析和PTX/SASS检查验证可扩展性。以下是一些GPU和CUDA编程优化技巧和技巧：

> Optimize for the memory hierarchy: coalesce global loads, tile into shared memory, manage registers/occupancy, and overlap transfers (e.g., cp.async/TMA) with compute. Prefer tuned libraries and CUDA Graphs, leverage torch.compile and OpenAI's Triton for fusion, and validate scalability with roofline analysis and PTX/SASS inspection. The following are some GPU and CUDA programming optimization tips and techniques:

### 理解GPU内存层次结构 (Understand GPU memory hierarchy)

记住GPU的分层内存结构——每个线程的寄存器、每个块/SM的共享内存/L1缓存、跨SM的L2缓存和全局HBM。在较高层级最大化数据重用。例如，使用寄存器和共享内存来重用值并最小化对较慢全局内存的访问。一个好的内核确保绝大多数数据要么在寄存器中，要么使用合并和缓存从HBM高效加载。

> Keep in mind the tiered memory structure of GPUs-registers per thread, shared memory/L1 cache per block/SM, L2 cache across SM, and global HBM. Maximize data reuse in the higher tiers. For example, use registers and shared memory to reuse values and minimize accesses to slower global memory. A good kernel ensures the vast majority of data is either in registers or gets loaded from HBM efficiently using coalescing and caching.

### 合并全局内存访问 (Coalesce global memory accesses)

确保同一线程束中的线程访问连续的内存地址，以便硬件可以用尽可能少的事务为它们服务。线程束线程的跨步或分散内存访问将导致每个线程束多次内存事务，有效地浪费带宽。重构数据布局或索引计算，以便当线程束加载数据时，它以单次、宽的内存事务进行。

> Ensure that threads in the same warp access contiguous memory addresses so that the hardware can service them in as few transactions as possible. Strided or scattered memory access by warp threads will result in multiple memory transactions per warp, effectively wasting bandwidth. Restructure data layouts or index calculations so that whenever a warp loads data, it's doing so in a single, wide memory transaction.

### 使用共享内存进行数据重用 (Use shared memory for data reuse)

共享内存就像手动管理的缓存，具有非常高的带宽。将频繁使用的数据——如矩阵的瓦片——加载到共享内存中。并让线程在继续之前多次操作这些瓦片。这种流行的平铺技术大幅削减全局内存流量。注意共享内存库冲突。组织共享内存访问模式或填充数据以确保线程不会争用相同的内存库，这会序列化访问并降低性能。

> Shared memory is like a manually managed cache with very high bandwidth. Load frequently used data-such as tiles of matrices-into shared memory. And have threads operate on those tiles multiple times before moving on. This popular tiling technique greatly cuts down global memory traffic. Be cautious of shared-memory bank conflicts. Organize shared-memory access patterns or pad data to ensure threads aren't contending for the same memory bank, which would serialize accesses and reduce performance.

### 优化内存对齐 (Optimize memory alignment)

尽可能将数据结构对齐到128字节，特别是对于批量内存复制或向量化加载。未对齐的访问即使理论上合并也可能强制多次事务。使用float2和float4等向量化类型进行全局内存I/O可以帮助每个指令加载/存储多个值，但确保您的数据指针正确对齐到向量大小。

> Align data structures to 128 bytes whenever possible, especially for bulk memory copies or vectorized loads. Misaligned accesses can force multiple transactions even if theoretically coalesced. Using vectorized types like float2 and float4 for global memory I/O can help load/store multiple values per instruction, but ensure your data pointer is properly aligned to the vector size.

### 最小化内存传输 (Minimize memory transfers)

仅在必要时才将数据传输到GPU，并且以大块传输。如果可能，将许多小传输合并为一次大传输。例如，如果您每次迭代有许多小数组要发送，将它们打包到一个缓冲区并发送一次。小的、频繁的cudaMemcpy可能成为瓶颈。如果使用统一内存，使用显式预取（cudaMemPrefetchAsync）在需要之前将数据暂存到GPU，避免关键计算期间的按需页面错误。

> Only transfer data to the GPU when necessary and in large chunks. Consolidate many small transfers into one big transfer if you can. For example, if you have many small arrays to send each iteration, pack them into one buffer and send once. Small, frequent cudaMemcpy can become a bottleneck. If using Unified Memory, use explicit prefetch (cudaMemPrefetchAsync) to stage data on GPU before it's needed, avoiding on-demand page faults during critical compute sections.

### 避免过度的临时分配 (Avoid excessive temporary allocations)

频繁的GPU内存分配和释放可能损害性能。例如，频繁使用cudaMalloc/cudaFree或内核中的设备malloc将导致额外开销。相反，重用内存缓冲区或使用大多数DL框架中可用的内存池，如PyTorch，其实现GPU缓存分配器。如果编写自定义CUDA代码，考虑使用带有内存池的cudaMallocAsync或自己管理暂存内存池，以避免重复分配/释放的开销。

> Frequent allocation and freeing of GPU memory can hurt performance. For example, frequently using cudaMalloc/cudaFree or device malloc in kernels will cause extra overhead. Instead, reuse memory buffers or use memory pools available within most DL frameworks, like PyTorch, that implement a GPU caching allocator. If writing custom CUDA code, consider using cudaMallocAsync with a memory pool or manage a pool of scratch memory yourself to avoid the overhead of repetitive alloc/free.

### 平衡线程和资源使用 (Balance threads and resource use)

实现良好的占用率-资源平衡。使用更多线程以获得更高的占用率有助于隐藏内存延迟，但如果每个线程使用太多寄存器或太多共享内存，占用率会下降。调整内核启动参数——包括每个块的线程——以确保有足够的warp在运行以覆盖延迟，但不要太多以至于每个线程都缺乏寄存器或共享内存。在具有高指令级并行性（ILP）的内核中，减少寄存器使用以提高占用率实际上可能损害性能。最优点通常在占用率频谱的中间，因为最大占用率并不总是理想的。使用NVIDIA Nsight Compute占用率计算器来试验配置。

> Achieve a good occupancy-resource balance. Using more threads for higher occupancy helps hide memory latency, but if each thread uses too many registers or too much shared memory, occupancy drops. Tune your kernel launch parameters-including threads per block-to ensure you have enough warps in flight to cover latency, but not so many that each thread is starved of registers or shared memory. In kernels with high instruction-level parallelism (ILP), reducing register usage to boost occupancy might actually hurt performance. The optimal point is usually in the middle of the occupancy spectrum, as maximum occupancy is not always ideal. Use the NVIDIA Nsight Compute Occupancy Calculator to experiment with configurations.

### 监控寄存器和共享内存使用 (Monitor register and shared-memory usage)

使用Nsight Compute等分析工具持续监控每个线程的寄存器和共享内存消耗。如果观察到占用率低于25%，考虑增加每个块的线程数以更好地利用可用硬件资源。但是，验证此调整不会通过查看详细的占用率报告和内核执行指标导致过度的寄存器溢出。寄存器溢出可能导致额外的内存流量并降低整体性能。

> Continuously monitor per-thread register and shared-memory consumption using profiling tools like Nsight Compute. If the occupancy is observed to be below 25%, consider increasing the number of threads per block to better utilize available hardware resources. However, verify that this adjustment does not cause excessive register spilling by reviewing detailed occupancy reports and kernel execution metrics. Register spilling can lead to additional memory traffic and degrade overall performance.

### 重叠内存传输与计算 (Overlap memory transfers with computation)

尽可能重叠内存传输与计算。在多个CUDA流中使用cudaMemcpyAsync在预取时运行内核。优先使用张量内存加速器进行批量移动到共享内存，并使用cp.async进行细粒度暂存复制和预取。这些方法通过重叠数据传输与计算有效地掩盖全局内存延迟，确保GPU核心保持充分利用而无需等待内存操作完成。

> Overlap memory transfers with computation whenever possible. Use cuda MemcpyAsync in multiple CUDA streams to prefetch while kernels run. Prefer the Tensor Memory Accelerator for bulk movement to shared memory, and use cp.async for fine-grained staged copies and prefetch. These approaches effectively mask global memory latency by overlapping data transfers with computation, making sure the GPU cores remain fully utilized without waiting for memory operations to complete.

### 尽可能使用批量预取 (Use bulk prefetching when possible)

对于可预测的模式，使用PTX cp.async.bulk.prefetch.tensor.[1-5]d.L2.global*（或prefetch.global.L2系列）预取到L2，并使用TMA（例如cp.async.bulk.tensor）将块暂存到共享内存。您还可以使用cp.async将全局内存异步暂存到共享内存并重叠复制与计算。您还可以显式将数据加载到寄存器中以备使用。这些主动方法减少了全局内存访问造成的延迟，并确保关键数据在需要时以更快的低延迟存储（如寄存器或共享内存）可用，从而最小化执行停滞并提高整体内核效率。

> For predictable patterns, prefetch into L2 using the PTX cp.async.bulk.prefetch.tensor.[1-5]d.L2.global* (or the prefetch.global.L2 family), and use TMA (e.g., cp.async.bulk.tensor) to stage blocks into shared memory. You can also use cp.async to stage global memory into shared memory asynchronously and overlap copy with compute. You can also explicitly load data into registers ahead of use. These proactive methods reduce the delay caused by global memory accesses and make sure that critical data is available in faster, lower-latency storage-such as registers or shared memory-right when it's needed, thus minimizing execution stalls and improving overall kernel efficiency.

### 利用协作组 (Utilize cooperative groups)

利用CUDA的协作组在线程子集之间实现高效的局部同步，而不是强制执行全块范围的屏障。这种技术实现对同步的更细粒度控制，减少不必要的等待时间和开销。通过将共享数据或执行相关计算的线程分组，您只同步那些需要协调的线程，这可以导致更高效的执行模式和更好的整体吞吐量。

> Utilize CUDA's cooperative groups to achieve efficient, localized synchronization among a subset of threads rather than enforcing a full block-wide barrier. This technique enables finer-grained control over synchronization, reducing unnecessary waiting times and overhead. By grouping threads that share data or perform related computations, you can synchronize only those threads that require coordination, which can lead to a more efficient execution pattern and better overall throughput.

### 优化warp发散 (Optimize warp divergence)

构建您的代码，使warp内的线程尽可能遵循相同的执行路径。发散可以使该warp的执行时间加倍——例如，一半的warp（16个线程）走一个分支，一半的warp（16个线程）走另一个分支。如果您有一些数据很少触发的分支，考虑"排序"或分组数据，使warp处理统一的情况，使所有情况都为真或所有情况都为假。使用ballot和shuffle等warp级原语为某些问题创建无分支解决方案。将warp视为工作单元，并旨在使所有32个线程以最大效率同步执行相同的工作。

> Structure your code so that threads within a warp follow the same execution path as much as possible. Divergence can double the execution time for that warp-for example, half the warp (16 threads) taking one branch and half the warp (16 threads) taking another branch. If you have branches that some data rarely triggers, consider "sorting" or grouping data so warps handle uniform cases such that all are true or all are false. Use warp-level primitives like ballot and shuffle to create branchless solutions for certain problems. Treat a warp as the unit of work, and aim for all 32 threads to do identical work in lockstep for maximum efficiency.

### 利用warp级操作 (Leverage warp-level operations)

使用CUDA的warp内在函数让线程在适当时无需进入共享内存即可通信。例如，使用__shfl_sync向warp中的所有线程广播值，或执行warp级归约——如跨warp对寄存器求和——而不是每个线程写入共享内存。这些内在函数绕过较慢的内存，可以加速如归约或扫描等可以在warp内完成的算法。通过在warp内处理这些任务，您避免了与共享内存和全块同步相关的延迟。

> Use CUDA's warp intrinsics to let threads communicate without going to shared memory when appropriate. For example, use __shfl_sync to broadcast a value to all threads in a warp or to do warp-level reductions-like summing registers across a warp-instead of each thread writing to shared memory. These intrinsics bypass slower memory and can speed up algorithms like reductions or scans that can be done within warps. By processing these tasks within a warp, you avoid the latency associated with shared memory and full-block synchronizations.

### 使用CUDA流实现并发 (Use CUDA streams for concurrency)

在单个进程/GPU内，在不同的CUDA流中启动独立的内核以重叠它们的执行，如果它们不使用所有资源。重叠计算与计算——例如，一个流计算模型的一部分，而另一个流启动独立的内核，如GPU上的数据预处理或异步memcpy。注意依赖关系，并在需要时使用CUDA事件进行同步。流的正确使用可以通过不让任何资源空闲来增加GPU利用率——特别是如果您有一些轻量级内核。

> Within a single process/GPU, launch independent kernels in different CUDA streams to overlap their execution if they don't use all resources. Overlap computation with computation-e.g., one stream computing one part of the model while another stream launches an independent kernel like data preprocessing on GPU or asynchronous memcpy. Be mindful of dependencies and use CUDA events to synchronize when needed. Proper use of streams can increase GPU utilization by not leaving any resource idle-especially if you have some kernels that are light.

### 优先使用库函数 (Prefer library functions)

尽可能使用NVIDIA的优化库，如cuBLAS、cuDNN、Thrust和NCCL，用于核心数学和集合操作。对于分布式推理中的点对点GPU数据移动，在可用时使用NIXL。当您需要细粒度GPU启动传输时，也可以使用NVSHMEM。这些针对每个GPU架构进行了重度优化，通常接近理论上的"光速"峰值。这将节省您重新发明它们的麻烦。例如，使用cuBLAS GEMM进行矩阵乘法而不是自定义内核，除非您有非常特殊的模式。这些库还透明地处理新硬件特性。PyTorch等AI框架（及其编译器）在底层使用这些优化库。

> Wherever possible, use NVIDIA's optimized libraries, such as cuBLAS, cuDNN, Thrust, and NCCL, for core math and collective operations. For point-to-point GPU data movement in distributed inference, use NIXL where available. You can also use NVSHMEM when you need fine-grained GPU-initiated transfers. These are heavily optimized for each GPU architecture and often approach theoretical "speed of light" peaks. This will save you the trouble of reinventing them. For example, use cuBLAS GEMM for matrix multiplies rather than a custom kernel, unless you have a very special pattern. The libraries also handle new hardware features transparently. AI frameworks like PyTorch (and its compiler) use these optimized libraries under the hood.

### 对重复启动使用CUDA图 (Use CUDA Graphs for repeated launches)

如果您有一个启动数千次的静态训练循环，考虑使用CUDA图来捕获和启动操作序列作为图。这可以显著减少每次迭代的CPU启动开销，特别是在多GPU场景中，启动许多内核和memcpy可能会给CPU带来额外压力并产生额外延迟。

> If you have a static training loop that is launched thousands of times, consider using CUDA Graphs to capture and launch the sequence of operations as a graph. This can significantly reduce CPU launch overhead for each iteration, especially in multi-GPU scenarios where launching many kernels and memcpy's can put extra pressure on the CPU and incur additional latency.

### 检查可扩展性限制 (Check for scalability limits)

在优化内核时，定期检查它如何随问题大小和跨架构扩展。一个内核可能在小输入上实现出色的占用率和性能，但在较大输入上扩展不佳，因为它可能开始抖动L2缓存或遇到内存缓存驱逐。使用roofline分析。将实现的FLOPS和带宽与硬件限制进行比较，以确保您没有留下性能。

> As you optimize a kernel, periodically check how it scales with problem size and across architectures. A kernel might achieve great occupancy and performance on a small input but not scale well to larger inputs, as it may start thrashing L2 cache or running into memory-cache evictions. Use roofline analysis. Compare achieved FLOPS and bandwidth to hardware limits to ensure you're not leaving performance on the table.

### 检查PTX和SASS以进行高级内核分析 (Inspect PTX and SASS for advanced kernel analysis)

对于性能关键的自定义CUDA内核，使用Nsight Compute检查生成的PTX和SASS。这种深入分析可以揭示内存库冲突或冗余计算等问题，指导您进行有针对性的低级优化。

> For performance-critical custom CUDA kernels, use Nsight Compute to examine the generated PTX and SASS. This deep dive can reveal issues like memory bank conflicts or redundant computations, guiding you toward targeted low-level optimizations.

### 使用PyTorch编译器 (Use the PyTorch compiler)

利用PyTorch的torch.compile通过TorchInductor将Python级操作融合到优化的内核中。编译器还可以通过集成CUDA图来减少启动开销。优化预热后，通常可获得约10%-40%的收益。这消除了解释器开销并解锁编译器级优化。

> Take advantage of PyTorch's torch.compile to fuse Python-level operations into optimized kernels through TorchInductor. The compiler can also reduce launch overhead by integrating CUDA Graphs. Typical gains of about 10%-40% are common once the optimizations are warmed up. This eliminates interpreter overhead and unlocks compiler-level optimizations.

在实践中，启用torch.compile已经产生了实质性的加速（例如，许多模型上20%-50%），通过自动组合内核并更高效地利用NVIDIA GPU硬件（例如Tensor Core）。始终在您的模型上测试编译模式。虽然它可以大幅提升吞吐量，但您应该在部署前确保兼容性和正确性。当图稳定时，启用CUDA图以减少每次迭代的CPU开销。保持静态内存池以满足指针稳定性约束。

> In practice, enabling torch.compile has produced substantial speedups (e.g., 20%-50% on many models) by automatically combining kernels and utilizing NVIDIA GPU hardware (e.g., Tensor Cores) more efficiently. Always test compiled mode on your model. While it can massively boost throughput, you should ensure compatibility and correctness before deploying. When graphs are stable, enable CUDA Graphs to reduce per-iteration CPU overhead. Keep static memory pools to satisfy pointer-stability constraints.

### 为动态形状做规划 (Plan for dynamic shapes)

如果输入大小变化，使用torch._dynamo.mark_dynamic()注解动态维度或使用torch.export()导出形状多态图，然后进行编译。使用torch.compiler.set_stance()控制重新编译行为，使用"fail_on_recompile"和torch._dynamo.error_on_graph_break()在测试和CI中暴露有问题的形状变动。尽可能使用静态形状以启用CUDA图来减少每次迭代的CPU开销。

> If your input sizes vary, use torch._dynamo.mark_dynamic() to annotate dynamic dimensions or export shape-polymorphic graphs with torch.export(), and then compile. Control recompilation behavior with torch.compiler.set_stance() using "fail_on_recompile" and torch._dynamo.error_on_graph_break() to surface problematic shape churn in testing and CI. Use static shapes where possible to enable CUDA Graphs to reduce per-iteration CPU overhead.

### 利用Triton内核配合torch.compile (Leverage Triton kernels using torch.compile)

如果PyTorch不能很好地融合某个操作，考虑用Triton编写自定义GPU内核并集成它。PyTorch通过torch.library.triton_op可以轻松注册自定义GPU内核。

> If PyTorch doesn't fuse an operation well, consider writing a custom GPU kernel in Triton and integrating it. PyTorch makes it easy to register a custom GPU kernel with torch.library.triton_op.

### 使用自动调优（当可用时）(Use autotuning when available)

启用库自动调优功能以最大化底层性能。例如，当输入大小固定时设置torch.backends.cudnn.benchmark=True。这让NVIDIA的cuDNN库尝试多种卷积算法并为您的硬件选择最快的一种。一次性开销会带来优化的内核，可以加速训练和推理。如果不需要完全可重现性，通过禁用cudnn.deterministic允许非确定性算法来解锁这些更快的实现。

> Enable library autotuning features to maximize low-level performance. For example, set torch.backends.cudnn.benchmark=True when input sizes are fixed. This lets NVIDIA's cuDNN library try multiple convolution algorithms and pick the fastest one for your hardware. The one-time overhead leads to optimized kernels that can accelerate training and inference. If exact reproducibility isn't required, allow nondeterministic algorithms by disabling cudnn.deterministic to unlock these faster implementations.

### 利用只读路径 (Leverage the read-only path)

将频繁使用的常量或系数标记为只读，以便GPU可以将它们缓存在专用的L1只读缓存中。在CUDA C++中，您可以使用const __restrict__指针来提示数据是不可变的。在现代GPU架构上，编译器会为const __restrict__限定指针生成缓存的全局加载。使用AI框架和库时，确保查找表或静态权重在设备上并被当作常量处理。这种优化减少了这些值的全局内存流量和延迟，因为每个SM可以快速从缓存中获取它们，而不是重复访问慢速DRAM。

> Mark frequently used constants or coefficients as read-only so the GPU can cache them in the dedicated L1 read-only cache. In CUDA C++, you can use const __restrict__ pointers to hint that data is immutable. On modern GPU architectures, the compiler generates cached global loads for const __restrict__ qualified pointers. When using AI frameworks and libraries, make sure that lookup tables or static weights are on the device and treated as constant. This optimization reduces global memory traffic and latency for those values, as each SM can quickly fetch them from cache instead of repeatedly accessing slow DRAM.

## 内核调度与执行优化 (Kernel Scheduling and Execution Optimizations)

启动开销和不必要的同步会创建空闲间隙，严重降低吞吐量。融合小内核并使用持久/动态策略保持设备忙碌并隐藏延迟。

> Launch overhead and unnecessary syncs create idle gaps that crush throughput. Fusing small kernels and using persistent/dynamic strategies keeps the device busy and latency hidden.

通过最小化同步、融合小内核，并在重复启动相同工作时使用持久内核来保持设备忙碌。对于不规则任务，考虑GPU动态并行性——但要谨慎使用以避免增加开销。以下是改进内核调度和执行的技巧：

> Keep the device busy by minimizing synchronizations, fusing small kernels, and using persistent kernels when launching the same work repeatedly. For irregular tasks, consider GPU dynamic parallelism-but use it judiciously to avoid adding overhead. The following are tips on improving kernel scheduling and execution:

### 最小化GPU同步调用 (Minimize GPU synchronization calls)

避免不必要的全局同步，这些同步会停滞GPU进度。过度使用cudaDeviceSynchronize()或阻塞GPU操作（如同步内存复制）会插入空闲间隙，此时CPU和GPU都无法进行有用的工作。仅在绝对需要时同步。例如，在传输最终结果或调试时同步。通过让异步操作排队，您保持GPU忙碌且CPU自由准备进一步的工作。这导致更连续的执行流水线。

> Avoid unnecessary global synchronizations that stall GPU progress. Excessive use of cudaDeviceSynchronize() or blocking GPU operations (like synchronous memory copies) will insert idle gaps where neither the CPU nor GPU can do useful work. Synchronize only when absolutely needed. For instance, synchronize when transferring final results or when debugging. By letting asynchronous operations queue up, you keep the GPU busy and the CPU free to prepare further work. This leads to a more continuous execution pipeline.

### 融合小内核以摊销启动开销 (Fuse small kernels to amortize launch overhead)

如果您有许多微小的GPU内核连续启动，考虑合并它们的操作以在单个内核中运行（如果可能）。每次内核启动都有大约几十微秒的固定成本，因此通过手动CUDA内核融合、XLA融合或NVIDIA CUTLASS/Triton等工具进行自定义操作可以提高吞吐量。融合内核花更多时间做实际工作，更少时间在启动开销或内存往返上。这在推理或预处理流水线中特别有用，其中元素操作链可以一次性执行。首先尝试torch.compile(mode="reduce-overhead")。编译器可以融合操作链并将稳定区域包装在CUDA图中。这将减少CPU启动开销。对于未融合的热点，考虑将它们迁移到Triton内核，并在适用时使用异步TMA和自动warp专业化。

> If you have many tiny GPU kernels launching back-to-back, consider merging their operations to run in a single kernel where possible. Every kernel launch has a fixed cost on the order of tens of microseconds, so combining operations through manual CUDA kernel fusion, XLA fusion, or tools like NVIDIA CUTLASS/Triton for custom ops can improve throughput. Fused kernels spend more time doing actual work and less time in launch overhead or memory round trips. This is especially helpful in inference or preprocessing pipelines where chains of elementwise ops can be executed in one go. Try torch.compile(mode="reduce-overhead") first. The compiler can fuse operation chains and wrap steady regions in CUDA Graphs. This will reduce CPU launch overhead. For unfused hotspots, consider migrating them to Triton kernels and using asynchronous TMA and automatic warp specialization where applicable.

### 利用GPU动态并行性进行GPU内工作调度 (Utilize GPU dynamic parallelism for intra-GPU work scheduling)

利用CUDA的动态并行性让GPU内核从GPU启动其他内核而无需返回CPU。在具有不可预测或迭代工作量的场景中，例如需要根据中间结果生成额外任务的算法，动态并行性通过消除CPU启动瓶颈来减少延迟。例如，父内核可以直接在设备上划分和启动子内核进行进一步处理。这保持整个工作流在GPU上，避免CPU干预并实现更好的重叠和利用率。然而要谨慎使用，因为如果过度使用，它会引入自己的开销。

> Utilize CUDA's Dynamic Parallelism to let GPU kernels launch other kernels from the GPU without returning to the CPU. In scenarios with unpredictable or iterative work, such as an algorithm that needs to spawn additional tasks based on intermediate results, dynamic parallelism cuts latency by removing the CPU launch bottleneck. For example, a parent kernel can divide and launch child kernels for further processing directly on the device. This keeps the entire workflow on the GPU, avoiding CPU intervention and enabling better overlap and utilization. Use this judiciously, however, as it can introduce its own overhead if overused.

### 对重复工作负载使用持久内核 (Use persistent kernels for repeated workloads)

当工作负载涉及快速连续启动相同的内核时，例如处理工作队列或使用相同计算流式传输批次，使用持久内核策略。持久内核启动一次并保持活动状态，重用线程在循环中处理许多工作单元，而不是为每个单元启动新内核。这种方法用更复杂的内核设计换取显著更低的调度开销。通过保持内核活动，您避免重复的启动成本，可以实现更高的持续占用率。高性能分布式训练和推理系统经常采用这种技术来最大化吞吐量并最小化迭代任务的延迟。

> Use a persistent kernel strategy when a workload involves launching identical kernels in rapid succession, such as processing a work queue or streaming batches with the same computation. A persistent kernel is launched once and remains active, reusing threads to handle many units of work in a loop, rather than launching a fresh kernel for each unit. This approach trades a more complex kernel design for significantly lower scheduling overhead. By keeping the kernel alive, you avoid repeated launch costs and can achieve higher sustained occupancy. High-performance distributed training and inference systems often employ this technique to maximize throughput and minimize latency for iterative tasks.

### 评估线程块集群 (Evaluate thread block clusters)

线程块集群保持数据靠近并减少重新启动开销。在Blackwell上，最多16个线程块可以形成一个集群（在增加非可移植限制后）。在持久式设计中，使用集群感知同步和共享内存驻留来改进局部性。使用Nsight Compute等内核级分析工具分析占用率与驻留的权衡。

> Thread block clusters to keep data close and reduce relaunch overheads. Up to 16 thread blocks can form a cluster on Blackwell (after increasing the non-portable limit). Use cluster-aware synchronization and shared-memory residency to improve locality in persistent-style designs. Profile occupancy vs. residency trade-offs with kernel-level profiling tools like Nsight Compute.

## 算术优化与降低/混合精度 (Arithmetic Optimizations and Reduced/Mixed Precision)

降低精度和稀疏性让您可以用比特换取大幅的速度和内存收益——通常对精度影响微乎其微。混合精度、TF32/FP8/INT8和融合缩放利用硬件数学路径来提高每美元的吞吐量。

> Lower precisions and sparsity let you trade bits for big speed and memory wins-often with negligible accuracy impact. Mixed precision, TF32/FP8/INT8, and fused scaling exploit hardware math paths to raise throughput per dollar.

具体来说，使用混合精度（BF16/FP16）和Tensor Core获得大幅提升，采用TF32轻松获得FP32加速，并在质量允许的情况下评估FP8/FP4。利用结构化稀疏性、降低精度的梯度/通信，以及INT8/INT4量化进行推理——融合缩放/激活以保持精度。以下优化技术适用于改进算术计算性能并利用降低/混合精度：

> Specifically, use mixed precision (BF16/FP16) and Tensor Cores for big gains, adopt TF32 for easy FP32 speedups, and evaluate FP8/FP4 where quality allows. Exploit structured sparsity, lower-precision gradients/communications, and INT8/INT4 quantization for inference-fusing scales/activations to preserve accuracy. The following optimization techniques apply to improving the performance of arithmetic computations and utilizing reduced/mixed precision:

### 使用混合精度训练 (Use mixed-precision training)

利用FP16或BF16进行训练以加速数学运算并减少内存使用。现代GPU具有Tensor Core，可以大幅加速FP16/BF16矩阵运算。保持关键部分（如最终累加或权重副本）在FP32中以确保数值稳定性，但在半精度中运行批量计算。这通常提供约1.5-3.5倍的加速（取决于模型和内核组合，矩阵乘法密集型工作负载的增益更大），且精度损失最小，现在已成为大多数框架中自动混合精度（AMP）的标准配置。

> Leverage FP16 or BF16 for training to speed up math operations and reduce memory usage. Modern GPUs have Tensor Cores that massively accelerate FP16/BF16 matrix operations. Keep critical parts like the final accumulation or a copy of weights in FP32 for numerical stability, but run bulk computations in half-precision. This often gives about a 1.5-3.5x speedup (depending on the model and kernel mix, with larger gains on matmul-heavy workloads) with minimal accuracy loss and is now standard in most frameworks with automatic mixed precision (AMP).

### 采用梯度累积和激活检查点 (Embrace gradient accumulation and activation checkpointing)

详细说明使用梯度累积来有效增加批量大小而不增加额外内存使用，并考虑激活检查点来减少非常深网络的内存占用。这些技术在训练接近或超过GPU内存限制的模型时至关重要。

> Detail the use of gradient accumulation to effectively increase the batch size without extra memory usage, and consider activation checkpointing to reduce memory footprint in very deep networks. These techniques are crucial when training models that approach or exceed GPU memory limits.

### 在新硬件上优先使用BF16而非FP16 (Favor BF16 instead of FP16 on newer hardware)

如果可用，使用BF16而非FP16，因为它具有更大的指数范围且不需要损失缩放。现代GPU支持BF16 Tensor Core，速度与FP16相同。BF16将通过避免溢出/下溢问题简化训练，同时仍获得半精度的性能优势。

> If available, use BF16 instead of FP16, as it has a larger exponent range and doesn't require loss scaling. Modern GPUs support BF16 Tensor Cores at the same speed as FP16. BF16 will simplify training by avoiding overflow/underflow issues while still gaining the performance benefits of half precision.

### 利用FP8、新颖精度和缩放技术 (Exploit FP8, novel precisions, and scaling techniques)

在现代GPU上，FP8 Tensor Core在计算密集型内核上提供大约比FP16或BF16高两倍的数学吞吐量，同时减少激活和权重带宽。此外，FP4（NVFP4）Tensor Core的吞吐量是FP8的两倍，用于具有微张量缩放（一种保持精度的误差校正技术）的推理以提高令牌吞吐量。对于训练，将FP8与NVIDIA Transformer Engine一起使用，并在需要时保持FP16或FP32累加器。对于推理，首先评估FP8，仅在校准显示对您的任务质量可接受后才采用NVFP4。建议训练时使用混合FP8（前向激活/权重使用E4M3，梯度使用E5M2）。具体来说，考虑前向传播使用E4M3（例如激活和权重），反向传播使用E5M2（例如梯度）。使用256-1024的延迟缩放窗口通常是有益的。对于推理，在校准后考虑NVFP4。TE与PyTorch集成并由现代GPU硬件支持。优先使用框架TE内核而非临时FP8自定义操作。端到端加速取决于内核组合、内存带宽和校准，因此请在您的模型和工作负载上验证精度和性能。

> On modern GPUs, FP8 Tensor Cores provide roughly double the math throughput of FP16 or BF16 on compute-bound kernels while, at the same time, reducing activation and weight bandwidth. Additionally, FP4 (NVFP4) Tensor Cores double the throughput of FP8 and are used for inference with micro tensor scaling (an error-correction technique to maintain accuracy) to raise token throughput. For training, use FP8 with the NVIDIA Transformer Engine and maintain FP16 or FP32 accumulators when required. For inference, evaluate FP8 first and adopt NVFP4 only after calibration shows acceptable quality for your task. It's recommended to use hybrid FP8 (E4M3 for forward activations/weights and E5M2 for gradients) for training. Specifically, consider using E4M3 for the forward pass (e.g., activations and weights) and E5M2 for the backward pass (e.g., gradients). It's often beneficial to use a delayed scaling window of 256-1024. For inference, consider NVFP4 after calibration. TE integrates with PyTorch and is supported by modern GPU hardware. Prefer framework TE kernels over ad-hoc FP8 custom operations. End-to-end speedup depends on kernel mix, memory bandwidth, and calibration, so validate accuracy and performance on your model and workload.

### 利用Tensor Core和张量内存加速器（TMA）(Leverage Tensor Cores and the Tensor Memory Accelerator (TMA))

确保您的自定义CUDA内核尽可能利用Tensor Core进行矩阵运算。这可能涉及使用CUTLASS模板以简化。通过使用Tensor Core和TMA进行异步张量移动到共享内存，您可以为GEMM、卷积和其他张量操作实现显著的加速——通常达到接近GPU峰值FLOPS。确保您的数据以FP16/BF16/TF32格式存在并按Tensor Core瓦片维度对齐，这些是8或16的倍数。

> Make sure your custom CUDA kernels utilize Tensor Cores for matrix ops if possible. This might involve using CUTLASS templates for simplicity. By using Tensor Cores and TMA for asynchronous tensor movement to shared memory, you can achieve dramatic speedups for GEMM, convolutions, and other tensor operations-often reaching near-peak FLOPS of the GPU. Ensure your data is in FP16/BF16/TF32 as needed and aligned to Tensor Core tile dimensions, which are multiples of 8 or 16.

### 使用TF32轻松加速 (Use TF32 for easy speedup)

对于32位矩阵乘法，设置torch.set_float32_matmul_precision("high")以在PyTorch中为数值安全的操作启用TF32（快速FP32）。cuBLAS和cuDNN等库会自动在现代GPU硬件上选择最优的Tensor Core代码路径。如果您用"highest"强制使用全精度FP32（而非"high"），请确保了解性能影响。

> For 32-bit matrix multiplies, set torch.set_float32_matmul_precision("high") to enable TF32 (fast FP32) for operations that are numerically safe in PyTorch. Libraries like cuBLAS and cuDNN will automatically pick optimal Tensor Core code paths on modern GPU hardware. If you force full-precision FP32 with "highest" (instead of "high"), make sure to understand the performance impact.

### 利用结构化稀疏性 (Exploit structured sparsity)

现代NVIDIA GPU在矩阵乘法中支持2:4结构化稀疏性，这以结构化模式将50%的权重置零。这允许硬件将其吞吐量翻倍。通过剪枝模型来利用这一点。如果您能将权重剪枝以满足2:4稀疏性模式，这些层的GEMM可以运行速度提高约2倍。使用NVIDIA的SDK或库支持来应用结构化稀疏性并确保使用稀疏Tensor Core路径。如果您的模型可以容忍或使用稀疏性正则化进行训练，这可以提供免费的速度提升。

> Modern NVIDIA GPUs support 2:4 structured sparsity in matrix multiply, which zeros out 50% of weights in a structured pattern. This allows the hardware to double its throughput. Leverage this by pruning your model. If you can prune weights to meet the 2:4 sparsity pattern, your GEMMs can run ~2x faster for those layers. Use NVIDIA's SDK or library support to apply structured sparsity and ensure the sparse Tensor Core paths are used. This can give a free speed boost if your model can tolerate or be trained with that sparsity, which often requires retraining with sparsity regularization.

### 在可能时降低梯度和激活的精度 (Reduce precision for gradients and activations when possible)

即使您保持权重在较高精度，也考虑将梯度或激活压缩到较低精度。例如，使用FP16/BF16或FP8通信进行梯度。许多框架支持FP16梯度全归约。类似地，对于激活检查点，以16位而非FP32存储激活可以节省内存。关于FP8和FP4优化器和量化梯度的研究仍在继续。这些有助于在减少内存和带宽成本的同时保持模型质量。在带宽受限环境中，梯度压缩尤其可以改变游戏规则。DeepSeek通过压缩梯度在受限GPU上进行训练展示了这一点。

> Even if you keep weights at higher precision, consider compressing gradients or activations to lower precision. For instance, use FP16/BF16 or FP8 communication for gradients. Many frameworks support FP16 gradient all-reduce. Similarly, for activation checkpointing, storing activations in 16-bit instead of FP32 saves memory. Research continues on FP8 and FP4 optimizers and quantized gradients. These help maintain model quality while reducing memory and bandwidth costs. In bandwidth-limited environments, gradient compression in particular can be a game changer. DeepSeek demonstrated this by compressing gradients to train on constrained GPUs.

### 对推理使用自定义量化 (Use custom quantization for inference)

对于部署，尽可能使用INT8量化。GPU上的INT8推理极快且内存高效。使用NVIDIA的TensorRT或量化工具将模型量化为INT8并进行校准。许多神经网络如transformers可以在INT8下运行，精度下降可忽略不计。加速比可以是FP16的2-4倍。在最新的GPU上，还探索和评估某些模型的FP8或INT4，以进一步提高推理吞吐量。

> For deployment, use INT8 quantization wherever possible. INT8 inference on GPUs is extremely fast and memory-efficient. Use NVIDIA's TensorRT or quantization tools to quantize models to INT8 and calibrate them. Many neural networks like transformers can run in INT8 with a negligible accuracy drop. The speedups can be 2-4x over FP16. On the newest GPUs, also explore and evaluate FP8 or INT4 for certain models to further boost throughput for inference.

### 在可能时融合缩放和计算操作 (Fuse scaling and computing operations when possible)

使用较低精度时，记住要融合操作以保持精度。例如，Blackwell的FP4"微缩放"建议为每组值保留一个缩放因子。通过在一个过程中进行缩放和计算来整合这些融合操作——而不是使用单独的通道，这可能导致精度损失。许多这些由现有库处理，因此只需使用它们而不是从头实现。

> When using lower precision, remember to fuse operations to retain accuracy. For example, Blackwell's FP4 "microscaling" suggests keeping a scale per group of values. Incorporate these fused operations by scaling and computing in one pass-rather than using separate passes, which could cause precision loss. Many of these are handled by existing libraries, so just use them rather than implementing them from scratch.

## 高级调优策略与算法技巧 (Advanced Tuning Strategies and Algorithmic Tricks)

算法转变 routinely 在投资回报率上击败硬件升级，通过减少工作而非推动它更快。自动调优、FlashAttention、通信/计算重叠和分片解锁规模同时减少浪费。

> Algorithmic shifts routinely beat hardware upgrades on ROI by reducing work rather than pushing it faster. Autotuning, FlashAttention, overlap of comm/compute, and sharding unlock scale while cutting waste.

具体来说，自动调优内核和层参数，替换为融合/FlashAttention内核，并在分布式训练中重叠通信与计算。使用流水线/张量并行和ZeRO分片扩展深度模型，并考虑异步更新或剪枝/稀疏性以用一点精度工作换取大幅的吞吐量收益。以下是一些高级性能优化和算法技巧：

> Specifically, autotune kernel and layer parameters, swap in fused/FlashAttention kernels, and overlap communication with computation in distributed training. Scale deep models with pipeline/tensor parallelism and ZeRO sharding, and consider asynchronous updates or pruning/sparsity to trade a little accuracy work for big throughput wins. The following are some advanced performance optimizations and algorithmic tricks:

### 自动调优内核参数 (Autotune kernel parameters)

为目标GPU自动调优您的自定义CUDA内核。选择正确的块大小、瓦片大小、展开因子等会影响性能，最优设置通常因GPU代际而异，如Ampere、Hopper、Blackwell及以后。使用自动调优脚本或OpenAI Triton等框架——甚至在预处理步骤中进行暴力搜索——以找到最佳启动配置。这可以轻松产生20%-30%的改进，而您会错过静态"合理"设置。在自动调优循环中使用Triton功能——例如，设置num_warps和num_stages，启用自动warp专业化，并测试异步TMA布局。优先使用张量映射描述符API进行共享内存暂存。迁移到不同硬件时重新基准测试瓦片形状，因为最优选择会因GPU代际而异。

> Autotune your custom CUDA kernels for the target GPU. Choosing the correct block size, tile size, unroll factors, etc., can affect performance, and the optimal settings often differ between GPUs' generations, such as Ampere, Hopper, Blackwell, and beyond. Use autotuning scripts or frameworks like OpenAI Triton-or even brute-force search in a preprocessing step-to find the best launch config. This can easily yield 20%-30% improvements that you'd miss with static "reasonable" settings. Use Triton features in your autotuning loop-for instance, set num_warps and num_stages, enable automatic warp specialization, and test asynchronous TMA layouts. Prefer tensor map descriptor APIs for shared-memory staging. Re-benchmark tile shapes when migrating to different hardware, as optimal choices will differ across GPU generations.

### 在ML工作负载中使用内核融合 (Use kernel fusion in ML workloads)

利用深度学习库提供的融合内核。例如，启用融合优化器将融合元素操作如权重更新、动量等。这也将使用融合的多头注意力实现和融合归一化内核。NVIDIA的库和一些开源项目如Transformer Engine和FasterTransformer为常见模式提供融合操作，如融合的LayerNorm + dropout。这些减少启动开销并更高效地使用内存。

> Utilize fused kernels provided by deep learning libraries. For example, enabling fused optimizers will fuse elementwise ops like weight update, momentum, etc. This will also use fused multihead attention implementations and fused normalization kernels. NVIDIA's libraries and some open source projects like Transformer Engine and FasterTransformer provide fused operations for common patterns, such as fused LayerNorm + dropout. These reduce launch overhead and use memory more efficiently.

### 利用内存高效注意力如FlashAttention (Utilize memory-efficient attention like FlashAttention)

为transformer模型集成FlashAttention等高级算法。FlashAttention以瓦片化、流式方式计算注意力，避免物化大型中间矩阵，大幅减少内存使用并提高速度——特别是对于长序列。用FlashAttention替换标准注意力可以提高吞吐量和内存占用，允许在相同硬件上使用更大的批量大小或序列长度。

> Integrate advanced algorithms like FlashAttention for transformer models. FlashAttention computes attention in a tiled, streaming fashion to avoid materializing large intermediate matrices, drastically reducing memory usage and increasing speed-especially for long sequences. Replacing the standard attention with FlashAttention can improve both throughput and memory footprint, allowing larger batch sizes or sequence lengths on the same hardware.

### 重叠通信和计算 (Overlap communication and computation)

在分布式训练中，尽可能重叠网络通信与GPU计算。例如，使用梯度全归约时，一旦每层梯度准备好就异步启动全归约，而下一层仍在计算反向传播。如果做得正确，这种流水线可以完全隐藏全归约延迟。使用异步NCCL调用或PyTorch的分布式数据并行（DDP）等框架库，它们开箱即用地提供重叠。这确保GPU不会空闲等待网络。

> In distributed training, overlap network communication with GPU computation whenever possible. For example, with gradient all-reduce, launch the all-reduce asynchronously as soon as each layer's gradients are ready, while the next layer is still computing the backward pass. This pipelining can hide all-reduce latency entirely if done right. Use asynchronous NCCL calls or framework libraries like PyTorch's Distributed Data Parallel (DDP), which provide overlapping out of the box. This ensures the GPU isn't idle waiting for the network.

### 对深度模型使用流水线并行 (Use pipeline parallelism for deep models)

当模型大小迫使您跨GPU使用张量并行或流水线并行进行流水线时，您可以使用足够的微批次保持所有流水线阶段忙碌。利用NVLink/NVSwitch在阶段之间快速发送激活。通过使用交错调度重叠和减少流水线气泡。一些框架自动化这种调度。NVL72结构在这里特别有用，因为即使是通信密集的流水线阶段也可以以每秒多TB的速度交换数据，最小化流水线停滞。

> When model size forces you to pipeline across GPUs using tensor parallelism or pipeline parallelism, you can use enough microbatches to keep all pipeline stages busy. Exploit NVLink/NVSwitch to send activations quickly between stages. Overlap and reduce pipeline bubbles by using an interleaved schedule. Some frameworks automate this type of scheduling. The NVL72 fabric is especially helpful here, as even communication-heavy pipeline stages can exchange data at multiterabyte speeds, minimizing pipeline stalls.

### 利用分布式优化器分片 (Utilize distributed optimizer sharding)

使用像Zero冗余优化器（ZeRO）这样的内存节省优化策略，它在GPU之间分片优化器状态和梯度等张量，而不是复制它们。这允许通过分布内存和通信负载来扩展到极端模型大小。它通过减少每GPU内存压力、避免交换到CPU，并在分块完成时减少通信量来提高吞吐量。DeepSpeed和Megatron-LM等许多框架提供这种分片。利用它来保持大型模型的高速，而不会遇到OOM或交换导致的减速。

> Use a memory-saving optimization strategy like Zero Redundancy Optimizer (ZeRO), which shards tensors like optimizer states and gradients across GPUs instead of replicating them. This allows scaling to extreme model sizes by distributing the memory and communication load. It improves throughput by reducing per-GPU memory pressure, avoiding swapping to CPU, and reducing communication volume if done in chunks. Many frameworks like DeepSpeed and Megatron-LM provide this type of sharding. Leverage it for large models to maintain high speed without running OOM or hitting slowdown from swapping.

### 在可能时异步训练 (Train asynchronously when possible)

如果适用，考虑异步更新。例如，您可以使用陈旧随机梯度下降（SGD），其中工作线程不总是等待彼此共享更新。这种方法可以增加吞吐量，尽管可能需要仔细调整以不影响收敛。如果做得正确，异步训练可以提供大幅的性能优势。

> If applicable, consider asynchronous updates. For example, you can use stale stochastic gradient descent (SGD) in which workers don't always wait for one another to share updates. This approach can increase throughput, though it may require careful tuning to not impact convergence. Asynchronous training can provide large performance benefits if done properly.

### 整合稀疏性和剪枝 (Incorporate sparsity and pruning)

大型模型通常有冗余。在训练期间使用剪枝技术引入稀疏性，您可以在推理时利用——如果支持，也可以在训练期间部分利用。现代GPU硬件支持加速稀疏矩阵乘法（2:4），未来的GPU可能会扩展此功能。即使您将训练保持为密集，仅对推理进行剪枝，较小的模型也会运行得更快并使用更少的内存。这提高了模型部署的成本效率。探索彩票票假设、蒸馏或结构化剪枝以在减小模型大小的同时保持精度。

> Large models often have redundancy. Use pruning techniques during training to introduce sparsity, which you can exploit at inference-and partially during training if supported. Modern GPU hardware supports accelerated sparse matrix multiply (2:4), and future GPUs will likely extend this feature. Even if you leave training as dense and prune only for inference, a smaller model will run faster and use less memory. This increases cost-efficiency for model deployments. Explore the lottery ticket hypothesis, distillation, or structured pruning to maintain accuracy while trimming model size.

## 分布式训练与网络优化 (Distributed Training and Network Optimization)

在集群规模下，网络成为限制因素。未经处理，网络会破坏线性扩展并增加成本。RDMA/巨型帧、分层集合操作、亲和性和压缩保护带宽并驯服延迟。

> At cluster scale, the network becomes the limiter. Untreated, the network can break linear scaling and inflate costs. RDMA/Jumbo frames, hierarchical collectives, affinity, and compression protect bandwidth and tame latency.

在可用时使用RDMA（InfiniBand/RoCE）；如果在以太网上，调整TCP缓冲区，启用巨型帧，并选择现代拥塞控制。对齐NIC/CPU亲和性，调整NCCL线程/缓冲区（并在支持的地方使用SHARP/CollNet），压缩或累积梯度，并测试结构以捕获丢失或配置错误。遵循此指导优化多GPU和多节点模型训练等分布式环境的网络：

> Use RDMA (InfiniBand/RoCE) when available; if on Ethernet, tune TCP buffers, enable jumbo frames, and select modern congestion control. Align NIC/CPU affinity, adjust NCCL threads/buffers (and SHARP/CollNet where supported), compress or accumulate gradients, and test the fabric to catch loss or misconfigurations. Follow this guidance to optimize your network for distributed environments such as multi-GPU and multinode model training:

### 在可用时使用RDMA网络 (Use RDMA networking when available)

为您的多节点集群配备InfiniBand或RoCE以获得低延迟和高吞吐量。确保NCCL和MPI在训练中使用RDMA。如果可用，NCCL将自动检测InfiniBand并使用GPUDirect RDMA。RDMA绕过内核网络堆栈，可以显著降低延迟 versus 传统TCP。如果您只有以太网，在支持RDMA的NIC上启用RoCE以获得类似RDMA的性能。在NVLink域系统（NVL72、GB200/GB300等）上，尽可能将集合操作保持在结构上。为主机网络保留岛际链路。将NCCL拓扑提示与您的NVLink/NVSwitch域对齐。

> Equip your multinode cluster with InfiniBand or RoCE for low latency and high throughput. Ensure NCCL and MPI are using RDMA for training. NCCL will autodetect InfiniBand and use GPUDirect RDMA if available. RDMA bypasses the kernel networking stack and can reduce latency significantly versus traditional TCP. If you only have Ethernet, enable RoCE on RDMA-capable NICs to get RDMA-like performance. On NVLink domain systems (NVL72, GB200/GB300, etc.), keep collectives on-fabric when possible. Reserve host networking for inter-island links. Align NCCL topology hints with your NVLink/NVSwitch domains.

### 如果使用以太网则调整TCP/IP堆栈 (Tune the TCP/IP stack if using Ethernet)

对于基于TCP的集群，增加网络缓冲区大小。提高/proc/sys/net/core/{r,w}mem_max和自动调优限制（net.ipv4.tcp_{r,w}mem）以允许更大的发送/接收缓冲区。这有助于饱和10/40/100 GbE链路。在所有节点和交换机上启用巨型帧（MTU 9000）以减少每包开销，这提高吞吐量并减少CPU使用。还要考虑现代TCP拥塞控制如BBR用于广域网或拥塞网络。

> For TCP-based clusters, increase network buffer sizes. Raise /proc/sys/net/core/{r,w}mem_max and the autotuning limits (net.ipv4.tcp_{r,w}mem) to allow larger send/receive buffers. This helps saturate 10/40/100 GbE links. Enable jumbo frames (MTU 9000) on all nodes and switches to reduce overhead per packet, which improves throughput and reduces CPU usage. Also consider modern TCP congestion control like BBR for wide-area or congested networks.

### 为NIC分配CPU亲和性 (Assign CPU affinity for NICs)

将网络中断和线程固定到与NIC在同一NUMA节点上的CPU核心。这避免了网络流量的跨NUMA惩罚，并保持网络堆栈的内存访问本地。检查/proc/interrupts并使用irqaffinity设置确保，例如，NUMA节点0中的NIC由NUMA节点0中的核心处理。这可以提高网络性能和一致性，特别是在高包率下。

> Pin network interrupts and threads to the CPU core(s) on the same NUMA node as the NIC. This avoids cross-NUMA penalties for network traffic and keeps the networking stack's memory accesses local. Check /proc/interrupts and use irqaffinity settings to ensure, for example, your NIC in NUMA node 0 is handled by a core in NUMA node 0. This can improve network performance and consistency, especially under high packet rates.

### 为您的环境优化NCCL环境变量 (Optimize NCCL environment variables for your environment)

为大型多节点作业试验NCCL参数。例如，将NCCL_NTHREADS（NCCL每GPU的CPU线程数）从默认4增加到8或16，以在更多CPU使用成本的代价下驱动更高带宽。将NCCL_BUFFSIZE（每GPU的缓冲区大小）从默认1 MB增加到4 MB或更多，以在大型消息上获得更好吞吐量。如果您的集群使用支持SHARP的交换机，安装NCCL SHARP插件并通过设置NCCL_COLLNET_ENABLE=1启用CollNet，然后使用SHARP插件变量如SHARP_COLL_LOCK_ON_COMM_INIT=1和SHARP_COLL_NUM_COLL_GROUP_RESOURCE_ALLOC_THRESHOLD=0。只有当您的归约足够大且网络结构支持SHARP卸载时期望加速。

> Experiment with NCCL parameters for large multinode jobs. For example, increase NCCL_NTHREADS, the number of CPU threads per GPU for NCCL, from the default 4 to 8 or 16 to drive higher bandwidth at the cost of more CPU usage. Increase NCCL_BUFFSIZE, the buffer size per GPU, from the default 1 MB to 4 MB or more for better throughput on large messages. If your cluster uses SHARP-capable switches, install the NCCL SHARP plugin and enable CollNet by setting NCCL_COLLNET_ENABLE=1, then use the SHARP plugin variables such as SHARP_COLL_LOCK_ON_COMM_INIT=1 and SHARP_COLL_NUM_COLL_GROUP_RESOURCE_ALLOC_THRESHOLD=0 as documented. Expect speedups only when your reductions are large enough and the network fabric supports SHARP offload.

### 对慢速网络使用梯度累积 (Use gradient accumulation for slow networks)

如果您的网络成为瓶颈，因为您正在扩展太多由中等性能互连链接的节点，使用梯度累积执行更少、更大的全归约操作。在同步之前累积几个小批次的梯度，这样您可以为N批次通信一次而不是每批次。这用一点额外的内存和一些模型精度调整换取显著减少的网络开销。当您添加更多GPU因通信成本而产生收益递减时，这特别有帮助。

> If your network becomes the bottleneck because you are scaling too many nodes linked by a moderate-performance interconnect, use gradient accumulation to perform fewer, larger all-reduce operations. Accumulate gradients over a few minibatches before syncing so that you communicate once for N batches instead of every batch. This trades a bit of extra memory and some model accuracy tuning for significantly reduced network overhead. It's especially helpful when adding more GPUs yields diminishing returns due to communication costs.

### 优化全归约拓扑 (Optimize all-reduce topologies)

确保您为集群拓扑使用最优的全归约算法。NCCL会自动选择环或树算法，但在混合互连上，如每个节点内通过NVLink连接的GPU和节点间通过InfiniBand或以太网连接，分层全归约可能是有益的。分层全归约首先在节点内执行全归约操作，然后在节点间进行。大多数框架默认执行基于NCCL的分层聚合，但通过分析验证。在传统MPI设置中，您可以考虑手动进行相同的双层归约——首先节点内，然后节点间。

> Ensure you're using the optimal all-reduce algorithm for your cluster topology. NCCL will choose ring or tree algorithms automatically, but on mixed interconnects like GPUs connected by NVLink on each node and InfiniBand or Ethernet between nodes, hierarchical all-reduce can be beneficial. Hierarchical all-reduce will first perform the all-reduce operation within the node, then it will proceed across nodes. Most frameworks will perform NCCL-based hierarchical aggregations by default but verify by profiling. In traditional MPI setups, you may consider manually doing this same two-level reduction-first intranode and then internode.

### 避免网络超额订阅 (Avoid network oversubscription)

在多GPU服务器上，确保GPU的组合流量不会超额订阅NIC。例如，八个GPU在全归约期间可以轻松生成超过200 Gbps的流量，因此只有一个100 Gbps NIC会限制您。如果扩展到每节点许多GPU，考虑每节点多个NIC和200/400 Gbps InfiniBand。同样，如果您的NIC和GPU共享相同的PCIe根复合体，注意PCIe带宽限制。

> On multi-GPU servers, ensure the combined traffic of GPUs doesn't oversubscribe the NIC. For example, eight GPUs can easily generate more than 200 Gbps of traffic during all-reduce, so having only a single 100 Gbps NIC will constrain you. Consider multiple NICs per node and 200/400 Gbps InfiniBand if scaling to many GPUs per node. Likewise, watch out for PCIe bandwidth limits if your NIC and GPUs share the same PCIe root complex.

### 压缩通信 (Compress communication)

与单节点内存一样，考虑压缩网络传输的数据。技术包括16位或8位梯度压缩、量化跨节点流水线传输的激活，或甚至更奇特的方法如草图。如果您的网络是最慢的组件，压缩/解压数据的稍高计算成本可能是值得的。NVIDIA的NCCL不原生支持压缩，但您可以在框架中集成压缩（例如，Horovod中的梯度压缩或PyTorch中的自定义AllReduce钩子）。这是DeepSeek成功的关键之一——压缩梯度以应对有限的节点间带宽。

> Just as with single-node memory, consider compressing data for network transfer. Techniques include 16-bit or 8-bit gradient compression, quantizing activations for cross-node pipeline transfers, or even more exotic methods like sketching. If your network is the slowest component, a slightly higher compute cost to compress/decompress data can be worth it. NVIDIA's NCCL doesn't natively compress, but you can integrate compression in frameworks (e.g., gradient compression in Horovod or custom AllReduce hooks in PyTorch). This was one key to DeepSeek's success-compressing gradients to cope with limited internode bandwidth.

### 监控网络健康 (Monitor network health)

确保没有静默问题阻碍您的分布式训练。检查丢包（这会显示为重试或超时——在InfiniBand上使用重传计数器，在以太网上检查TCP重传）。即使是小量丢包也会因拥塞控制启动而严重降低吞吐量。使用带外网络测试（如iPerf或NCCL测试）验证您是否获得预期的带宽和延迟。如果没有，调查交换机配置、NIC固件或CPU亲和性。

> Ensure no silent issues are hampering your distributed training. Check for packet loss (which would show up as retries or timeouts-on InfiniBand, use counters for resend, and on Ethernet, check for TCP retransmits). Even a small packet loss can severely degrade throughput due to congestion control kicking in. Use out-of-band network tests (like iPerf or NCCL tests) to validate you're getting expected bandwidth and latency. If not, investigate switch configurations, NIC firmware, or CPU affinity.

## 高效推理与服务 (Efficient Inference and Serving)

服务是一场成本和延迟的游戏——利用率通过编排和批处理提高，而不仅仅是更大的GPU。专门的运行时、KV缓存策略和预热保持高吞吐量而不违反SLO。

> Serving is a cost-and-latency game-utilization rises through orchestration and batching, not just bigger GPUs. Specialized runtimes, KV cache strategies, and warmups keep throughput high without violating SLOs.

通过自动扩展、微服务和动态/连续批处理来编排需求，以保持GPU热而不违反延迟SLO。使用专门的运行时（vLLM、SGLang、TensorRT-LLM），利用NIXL和KV缓存卸载进行分解服务，预热模型，并隔离资源以控制尾部延迟。遵循这些技术来提高模型推理效率和性能：

> Orchestrate for demand with autoscaling, microservices, and dynamic/continuous batching to keep GPUs hot without violating latency SLOs. Use specialized runtimes (vLLM, SGLang, TensorRT-LLM), exploit NIXL and KV cache offloading for disaggregated serving, warm models, and isolate resources to control tail latency. Follow these techniques to improve model inference efficiency and performance:

### 高效编排动态资源 (Orchestrate dynamic resources efficiently)

集成高级容器编排平台，如Kubernetes增强自定义性能指标。这基于实时使用模式和吞吐量目标实现动态扩展和工作负载平衡。

> Integrate advanced container orchestration platforms, such as Kubernetes augmented with custom performance metrics. This enables dynamic scaling and balancing workloads based on live usage patterns and throughput targets.

### 采用无服务器架构进行推理 (Embrace serverless architectures for inference)

探索无服务器架构和微服务设计用于推理工作负载，这可以高效处理突发流量，并在需求低时通过缩减减少空闲资源开销。

> Explore serverless architectures and microservice designs for inference workloads, which can handle bursty traffic efficiently and reduce idle resource overhead by scaling down when demand is low.

### 优化批次和并发 (Optimize batch and concurrency)

对于推理工作负载，找到正确的批处理策略。对于推理工作负载，优先使用动态或连续批处理以自动批处理传入请求。较大的批量大小通过保持GPU忙碌来提高吞吐量，但太大可能增加延迟。此外，如果单个流不使用所有GPU资源，则并行运行多个推理流——例如，两个并发推理批次以充分利用GPU SM和Tensor Core。

> For inference workloads, find the right batching strategy. For inference workloads, favor dynamic or continuous batching to automatically batch incoming requests. Larger batch sizes improve throughput by keeping the GPU busy, but too large can add latency. Also, run multiple inference streams in parallel if one stream doesn't use all GPU resources-e.g., two concurrent inference batches to use both GPU SMs and Tensor Cores fully.

### 利用NIXL进行分布式推理 (Leverage NIXL for distributed inference)

在跨GPU或节点服务大型模型时，使用NVIDIA Inference Xfer Library通过RDMA在预填充和解码工作线程之间流式传输KV缓存。在NIXL的情况下，大型基于transformer的KV缓存在节点之间传输。NIXL提供高吞吐量、低延迟API，用于在分解LLM推理集群中从预填充GPU流式传输KV缓存到解码GPU。它使用GPUDirect RDMA和最优路径做到这一点——且不涉及CPU。这减少了跨节点分解预填充解码服务的尾部延迟。

> When serving large models across GPUs or nodes, use the NVIDIA Inference Xfer Library to stream KV cache between prefill and decode workers over RDMA. In the case of NIXL, the large transformer-based KV cache is transferred between nodes. NIXL provides a high-throughput, low-latency API for streaming the KV cache from a prefill GPU to a decode GPU in a disaggregated LLM inference cluster. It does this using GPUDirect RDMA and optimal paths-and without involving the CPU. This reduces tail latency for disaggregated prefill decode serving across nodes.

### 在必要时卸载KV缓存 (Offload KV cache if necessary)

如果LLM的注意力KV缓存超出GPU内存，使用分层卸载。NVIDIA Dynamo的分布式KV缓存管理器将访问较少的KV页面卸载到CPU内存、SSD或网络存储，而TensorRT-LLM和vLLM等推理引擎支持分页和量化KV缓存。重用缓存以降低内存压力和首令牌延迟。验证端到端影响，因为卸载未命中引入额外I/O延迟。这允许在否则会超出GPU内存的序列上进行推理——且由于快速NVMe和计算-I/O重叠，性能影响最小。如果您的推理服务器配置为使用此功能，请确保配置好，如果您预期非常长的提示或对话。卸载到磁盘比完全失败要好。

> If an LLM's attention KV cache grows beyond GPU memory, use hierarchical offloading. NVIDIA Dynamo's Distributed KV Cache Manager offloads less frequently accessed KV pages to CPU memory, SSD, or networked storage, while inference engines like TensorRT-LLM and vLLM support paged and quantized KV caches. Reuse caches to lower memory pressure and first-token latency. Validate end-to-end impact because offloaded misses introduce extra I/O latency. This allows inference on sequences that would otherwise exceed GPU memory-and with minimal performance hit thanks to fast NVMe and compute-I/O overlapping. Ensure your inference server is configured to use this if you expect very long prompts or chats. Offloading to disk is better than failing completely.

### 高效服务模型 (Serve models efficiently)

使用优化的模型推理系统，如vLLM、SGLang、NVIDIA Dynamo和NVIDIA TensorRT-LLM，以低延迟和高吞吐量服务大型模型。它们应该实现量化、低精度格式、融合、高度优化的注意力内核和其他技巧，以在推理期间最大化GPU利用率。这些库还应该处理张量并行、流水线并行、专家并行、上下文并行、推测解码、分块预填充、分解预填充/解码和动态请求批处理——以及许多其他高性能功能。

> Use optimized model inference systems, such as vLLM, SGLang, NVIDIA Dynamo, and NVIDIA TensorRT-LLM for serving large models with low latency and high throughput. They should implement quantization, low-precision formats, fusion, highly optimized attention kernels, and other tricks to maximize GPU utilization during inference. These libraries should also handle tensor parallelism, pipeline parallelism, expert parallelism, context parallelism, speculative decoding, chunked prefill, disaggregated prefill/decode, and dynamic request batching-among many other high-performance features.

### 监控和调整尾部延迟 (Monitor and tune for tail latency)

在实时服务中，平均延迟和（长）尾部延迟（第99百分位）都很重要。分析推理延迟的分布。如果尾部很高，识别异常值原因，如意外的CPU参与、垃圾回收（GC）暂停或过多的上下文切换。将推理服务器进程固定到特定核心，将其与嘈杂邻居隔离，并在必要时使用实时调度以获得更一致的延迟。

> In real-time services, both average latency and (long-)tail latency (99th percentile) matter. Profile the distribution of inference latencies. If the tail is high, identify outlier causes, such as unexpected CPU involvement, garbage-collection (GC) pauses, or excessive context switches. Pin your inference server process to specific cores, isolate it from noisy neighbors, and use real-time scheduling if necessary to get more consistent latency.

### 预热以避免冷启动延迟 (Warm up to avoid cold-start latency)

通过将模型加载到GPU并运行几个虚拟推理来预热GPU。这将避免当第一个真实请求进入推理服务器时的一次性冷启动延迟命中。

> Warm up the GPUs by loading the model into the GPU and running a few dummy inferences. This will avoid one-time, cold-start latency hits when the first real request comes into the inference server.

### 为服务质量（QoS）高效分区资源 (Partition resources efficiently for quality of service (QoS))

如果在相同基础设施上运行混合的异构工作负载，如训练和推理——或不同架构的模型——考虑分区资源以确保延迟敏感的推理获得优先级。这可能意味着将一些GPU完全专用于推理，或使用MIG为推理服务提供GPU的保证切片，如果它不需要完整GPU但需要可预测的延迟。如果可能，将推理与训练分离在不同的节点上，因为训练可能因重I/O或突然的通信突发而引入抖动。

> If running mixed, heterogeneous workloads, such as training and inference-or models with different architectures-on the same infrastructure, consider partitioning resources to ensure the latency-sensitive inference gets priority. This could mean dedicating some GPUs entirely to inference or using MIG to give an inference service a guaranteed slice of a GPU if it doesn't need a full GPU but requires predictable latency. Separate inference from training on different nodes if possible, as training can introduce jitter with heavy I/O or sudden bursts of communication.

### 利用Grace CPU进行推理预处理 (Utilize Grace CPU for inference preprocessing)

在Grace Blackwell系统中，服务器级CPU可以在与GPU相同的内存空间中极快地处理预处理——如标记化和批次整理。将此类任务卸载到CPU，并让它在共享内存中准备数据供GPU直接使用。这减少缓冲区重复并利用强大的CPU处理推理流水线的部分，释放GPU专注于更计算密集的神经网络计算。

> In Grace Blackwell systems, the server-class CPU can handle preprocessing-such as tokenization and batch collation-extremely fast in the same memory space as the GPU. Offload such tasks to the CPU and have it prepare data in the shared memory that the GPU can directly use. This reduces duplication of buffers and leverages the powerful CPU to handle parts of the inference pipeline, freeing the GPU to focus on more compute-intensive neural-network computations.

### 仔细调整边缘AI和延迟关键部署 (Tune carefully for edge AI and latency-critical deployments)

通过利用专门的边缘加速器和优化中央服务器与边缘设备之间的数据传输协议，将性能调优扩展到边缘。这将有助于为时间敏感的应用实现超低延迟。

> Extend performance tuning to the edge by leveraging specialized edge accelerators and optimizing data transfer protocols between central servers and edge devices. This will help achieve ultralow latency for time-sensitive applications.

## 多节点推理与服务 (Multinode Inference and Serving)

分解预填充/解码和分片模型让您可以处理更大的上下文和更多用户，并具有更高的占用率。连续批处理和分层内存/卸载即使在长提示和重并发下也能保持流畅。

> Disaggregating prefill/decode and sharding models lets you handle bigger contexts and more users with higher occupancy. Continuous batching and hierarchical memory/offload maintain flow even under long prompts and heavy concurrency.

具体来说，跨设备分解预填充和解码，跨请求连续池化令牌，并通过张量/流水线并行分片超大模型。为非常长的上下文添加分层内存/卸载，这样您可以在不OOM的情况下服务更多，用小的延迟换取更高的容量。以下性能技巧适用于多节点推理和服务：

> Specifically, disaggregate prefill and decode across devices, continuously pool tokens across requests, and shard oversized models via tensor/pipeline parallelism. Add hierarchical memory/offload for very long contexts so you serve more without OOMs, trading small latency for much higher capacity. The following performance tips apply to multinode inference and serving:

### 分解推理流水线 (Disaggregate inference pipelines)

将推理工作流分离为不同的阶段，包括处理输入提示通过所有模型层的"预填充"阶段，和逐令牌迭代生成输出的"解码"阶段。将这些阶段分配给不同的资源以允许独立扩展。这种两阶段方法防止更快的任务被较慢的任务阻塞。对于大型语言模型，一种策略是运行完整模型来编码提示，然后以阶段方式处理自回归解码，可能每个阶段都有专门的工作线程。通过分解流水线，您确保GPU持续工作在它们最高效的任务部分，避免队头阻塞，即一个长生成停滞其后的其他请求。

> Separate the inference workflow into distinct phases, including the "prefill" phase that processes the input prompt through all model layers, and the iterative "decode" phase that generates outputs token by token. Allocate these phases to different resources to allow for independent scaling. This two-stage approach prevents faster tasks from being bottlenecked by slower ones. For large language models, one strategy is to run the full model to encode the prompt, then handle autoregressive decoding on a stage-wise basis, possibly with specialized workers for each phase. By disaggregating the pipeline, you ensure that GPUs continuously work on the portion of the task they're most efficient at, avoiding head-of-line blocking, where one long generation stalls others behind it.

### 对LLM使用连续批处理 (Use continuous batch processing for LLMs)

超越简单请求批处理，使用连续批处理策略以在重负载下最大化吞吐量。传统动态批处理将传入请求分组并作为批次处理以提高GPU利用率。连续批处理通过实时跨请求动态合并和拆分令牌序列进一步做到这一点。vLLM等系统实现令牌池化，其中一旦任何线程准备好生成下一个令牌，它就被与其他就绪线程分组形成新批次。这种方法始终保持GPU高占用率，大幅减少空闲期。结果是显著提高的令牌吞吐量和更好的延迟一致性，特别是在为许多具有不同序列长度的并发用户服务时。

> Move beyond simple request batching and use continuous batching strategies to maximize throughput under heavy loads. Traditional dynamic batching groups incoming requests and processes them as a batch to improve GPU utilization. Continuous batching takes this further by dynamically merging and splitting sequences of tokens across requests in real time. Systems like vLLM implement token pooling, where as soon as any thread is ready to generate the next token, it gets grouped with other ready threads to form a new batch. This approach keeps the GPU at high occupancy at all times and drastically reduces idle periods. The result is significantly higher token throughput and better latency consistency, especially when serving many concurrent users with varying sequence lengths.

### 跨GPU和节点高效分片模型 (Shard models efficiently across GPUs and nodes)

对于太大而无法放入单个GPU内存的模型，采用模型并行推理技术，通过在多个GPU甚至多个服务器上分区模型。这可以通过张量并行完成，其中分割每层的权重和计算跨设备，或流水线并行，将模型的层分成段托管在不同的GPU上并顺序流式传输数据通过它们。虽然模型分片引入通信开销和一些额外延迟，因为数据必须在分片之间流动，但它使部署万亿参数模型成为可能，否则这些模型将无法服务。确保GPU之间的高速互连，如NVLink或InfiniBand，以使这可行，并尽可能重叠通信与计算。关键是平衡负载，使所有设备并行工作，没有单个阶段成为瓶颈。

> For models that are too large to fit into a single GPU's memory, employ model-parallel inference techniques by partitioning the model across multiple GPUs or even multiple servers. This can be done with tensor parallelism, in which it splits each layer's weights and computation across devices, or pipeline parallelism, which splits the model's layers into segments hosted on different GPUs and streams the data through them sequentially. While model sharding introduces communication overhead and some added latency as data must flow between shards, it enables deployment of trillion-parameter models that would otherwise be impossible to serve. Ensure high-speed interconnects, such as NVLink or InfiniBand, between GPUs to make this feasible, and overlap communication with computation where possible. The key is to balance the load so all devices work in parallel and no single stage becomes a bottleneck.

### 为扩展上下文卸载内存 (Offload memory for extended contexts)

使用分层内存策略支持需要比GPU可用内存更多的推理工作负载。在服务非常大的模型或长序列上下文时整合内存卸载，如长多轮对话和大型文档。访问较少的数据，如旧的注意力KV缓存条目或访问不频繁的模型权重，可以在GPU内存紧张时移动到CPU RAM甚至NVMe存储。现代推理框架可以自动交换这些张量并在需要时动态带回它们。虽然这为缓存未命中引入额外延迟，但它防止内存不足错误并允许您处理极端情况。通过深思熟虑地卸载和预取数据，您用一点速度换取服务具有大工作集的请求的能力，在内存约束下实现更好的整体吞吐量。

> Use hierarchical memory strategies to support inference workloads that demand more memory than GPUs have available. Incorporate memory offloading when serving very large models or long sequence contexts, such as long multiturn conversations and large documents. Less frequently used data, such as old attention KV cache entries or infrequently accessed model weights, can be moved to CPU RAM or even NVMe storage when GPU memory gets tight. Modern inference frameworks can automatically swap out these tensors and bring them back on the fly when needed. While this introduces additional latency for cache misses, it prevents out-of-memory errors and allows you to handle extreme cases. By thoughtfully offloading and prefetching data, you trade a bit of speed for the ability to serve requests with large working sets, achieving a better overall throughput under memory constraints.

## 电源与热管理 (Power and Thermal Management)

每瓦性能是一级指标——热或电源节流会抹去调优收益并缩短硬件寿命。电源上限、高效打包和主动冷却稳定时钟同时削减能源支出。

> Performance per watt is a first-class metric-thermal or power throttling erases tuning gains and shortens hardware life. Power caps, efficient packing, and proactive cooling stabilize clocks while cutting energy spend.

跟踪perf/watt和热特性 alongside 速度：为内存受限工作负载限制电源或降频内存以获得更好的效率，且吞吐量损失最小。主动管理冷却，整合作业以让GPU接近满载运行，监控每GPU功耗，并在能源价格/可再生能源减少成本时围绕能源进行调度。以下是管理AI系统电源和热特性的一些技巧：

> Track perf/watt and thermals alongside speed: cap power or underclock memory-bound workloads for better efficiency with minimal throughput loss. Proactively manage cooling, consolidate jobs to run GPUs near full, monitor per-GPU power draw, and schedule around energy price/renewables when it reduces cost. Here are some tips on managing your power and thermal characteristics of your AI systems:

### 在可能时使用高效和环保能源 (Utilize efficient and environmentally friendly energy when possible)

跟踪和优化能源消耗 alongside 性能。除了管理电源和热限制外，监控能源使用指标并考虑提高性能和可持续性的技术。例如，通过实施基于可再生能源可用性的动态电源限制或工作负载转移，您可以降低运营成本和碳足迹。这种双重关注降低运营成本并支持负责任的、环保的AI部署。

> Track and optimize energy consumption alongside performance. In addition to managing power and thermal limits, monitor energy usage metrics and consider techniques that improve both performance and sustainability. For example, by implementing dynamic power capping or workload shifting based on renewable energy availability, you can reduce operational costs and carbon footprint. This dual focus reduces operational costs and supports responsible, environmentally friendly AI deployments.

### 监控温度和时钟 (Monitor thermals and clocks)

关注运行期间的GPU温度和时钟频率。如果GPU接近热限制（某些情况下为85°C），它们可能开始节流时钟，这会降低性能。使用nvidia-smi dmon或遥测查看时钟是否从最大值下降。如果检测到节流，改进冷却、增加风扇速度、改进气流，或稍微降低功率限制以保持在稳定的热范围内。目标是没有热导致下降的一致性能。

> Keep an eye on GPU temperature and clock frequencies during runs. If GPUs approach thermal limits (85°C in some cases), they may start throttling clocks, which reduces performance. Use nvidia-smi dmon or telemetry to see if clocks drop from their max. If you detect throttling, improve cooling, increase fan speeds, improve airflow, or slightly reduce the power limit to keep within a stable thermal envelope. The goal is consistent performance without thermal-induced dips.

### 使用能源感知动态电源管理 (Use energy-aware dynamic power management)

现代数据中心越来越多地使用能源感知调度，基于实时能源成本和可再生能源可用性调整工作负载。整合自适应电源限制和动态时钟缩放可以帮助优化每瓦吞吐量，同时降低运营成本和碳足迹。

> Modern data centers are increasingly using energy-aware scheduling to adjust workloads based on real-time energy costs and renewable energy availability. Incorporating adaptive power capping and dynamic clock scaling can help optimize throughput per watt while reducing operational costs and carbon footprint.

### 优化perf/watt (Optimize for perf/watt)

在电源预算受限（或能源成本高）的多GPU部署中，考虑为效率进行调优。许多工作负载，特别是内存受限的，可以在稍微降低的GPU时钟下运行，吞吐量损失可忽略不计但功耗明显降低。例如，如果内核是内存受限的，将GPU锁定在较低时钟可以节省电源而不损害运行时。这增加每瓦吞吐量。使用nvidia-smi -pl测试几个功率限制，看看您的吞吐量/瓦特是否改善。对于某些模型，从100%到80%功率限制产生几乎相同的速度，但功耗减少20%。

> In multi-GPU deployments where power budget is constrained (or energy cost is high), consider tuning for efficiency. Many workloads, especially memory-bound ones, can run at slightly reduced GPU clocks with negligible performance loss but noticeably lower power draw. For example, if a kernel is memory bound, locking the GPU at a lower clock can save power while not hurting runtime. This increases throughput per watt. Test a few power limits using nvidia-smi -pl to see if your throughput/watt improves. For some models, going from a 100% to 80% power limit yields nearly the same speed at 20% less power usage.

### 使用自适应冷却策略 (Use adaptive cooling strategies)

如果在冷却或能源可用性可变的环境中运行，与集群管理整合以调整工作负载。例如，在一天中较凉爽的时间或可再生能源供应高时安排重作业——如果这是成本因素。一些站点实施策略将非紧急作业排队在夜间运行，当电力更便宜时。这不改变单作业性能，但显著削减成本。

> If running in environments with variable cooling or energy availability, integrate with cluster management to adjust workloads. For instance, schedule heavy jobs during cooler times of the day or when renewable energy supply is high-if that's a factor for cost. Some sites implement policies to queue nonurgent jobs to run at night when electricity is cheaper. This doesn't change single-job performance but significantly cuts costs.

### 整合工作负载 (Consolidate workloads)

让GPU在高利用率下运行，而不是让许多GPU在低利用率下运行。忙碌的GPU在每瓦完成的工作方面比空闲或轻度使用的GPU更节能。这是因为基线功率在GPU忙碌时更好地摊销。在90%利用率下在一个GPU上一个接一个地运行一个作业可能比在两个GPU上并行运行两个作业各45%更好——除非您需要优化最小的挂钟时间。计划调度以在不使用时关闭或空闲整个节点，而不是让许多硬件在低利用率下运行。

> Run GPUs at high utilization rather than running many GPUs at low utilization. A busy GPU is more energy efficient in terms of work done per watt than an idle or lightly used GPU. This is because the baseline power is better amortized when the GPU is busy. It may be better to run one job after another on one GPU at 90% utilization than two GPUs at 45% each in parallel-unless you need to optimize for the smallest wall-clock time. Plan scheduling to turn off or idle whole nodes when not in use, rather than leaving lots of hardware running at low utilization.

### 高效配置冷却 (Configure cooling efficiently)

对于风冷系统，考虑在重运行期间将GPU风扇设置为更高的固定速度以主动冷却GPU。一些数据中心始终将风扇运行在最大速度以提高一致性。确保数据中心的进气温度在规格范围内。定期检查服务器GPU是否有灰尘或障碍物。堵塞的散热片会大幅降低冷却效率。对于水冷，确保流量最优且水温受控。

> For air-cooled systems, consider setting GPU fans to a higher fixed speed during heavy runs to preemptively cool the GPUs. Some data centers always run fans at the maximum to improve consistency. Ensure inlet temps in the data center are within specifications. Check periodically for dust or obstructions in server GPUs. Clogged fins can greatly reduce cooling efficiency. For water-cooled, ensure flow rates are optimal and water temperature is controlled.

### 仔细监控电源 (Monitor power carefully)

使用工具监控每GPU功耗。nvidia-smi报告瞬时功耗，这有助于理解工作负载的电源配置文件。功耗峰值可能与某些阶段相关。例如，全归约阶段可能测量较少的计算负载和较少的功耗，而密集层会飙升负载和功耗测量。了解这一点，您可以潜在地排序工作负载以平滑功耗。这在受限电源电路上操作集群时很重要。在电源受限场景中，您可能需要避免在同一节点上同时运行多个功耗峰值作业以避免触发电源限制。

> Use tools to monitor per-GPU power draw. nvidia-smi reports instantaneous draw, which helps in understanding the power profile of your workload. Spikes in power might correlate with certain phases. For example, the all-reduce phase might measure less compute load and less power, while dense layers will spike the load and power measurements. Knowing this, you can potentially sequence workloads to smooth power draw. This is important if operating the cluster on a constrained power circuit. In the power-constrained scenario, you may need to avoid running multiple power-spikey jobs simultaneously on the same node to avoid tripping power limits.

### 提高长运行作业的作业弹性 (Improve job resilience for long-running jobs)

如果您正在运行数月长的训练作业或24-7推理作业，考虑热特性对硬件寿命的影响。在100%功率和热限制下持续运行会随时间略微增加故障风险。在实践中，数据中心GPU为此类弹性而构建，但如果您想格外安全，以90%功率目标运行可以减少组件压力，且减速最小。这是较长训练运行与较少硬件磨损之间的权衡——特别是如果该硬件将在很长一段时间内用于多个项目。

> If you are running a months-long training job or 24-7 inference job, consider the impact of thermals on hardware longevity. Running at 100% power and thermal limit constantly can marginally increase failure risk over time. In practice, data center GPUs are built for this type of resiliency, but if you want to be extra safe, running at 90% power target can reduce component stress with minimal slowdown. It's a trade-off of longer training runs versus less wear on the hardware-especially if that hardware will be reused for multiple projects over a long period of time.

## 结论 (Conclusion)

将检查清单视为可重复的行动手册：分析、在正确层调整正确的瓶颈，并在扩展之前验证收益。通过系统地应用这些实践——从操作系统和内核到分布式通信和服务——您将在任何规模上实现快速、成本高效和可靠的AI系统。

> Treat the checklist as a repeatable playbook: profile, tune the right bottleneck at the right layer, and verify gains before scaling out. By methodically applying these practices-from OS and kernels to distributed comms and serving-you'll achieve fast, cost-efficient, and reliable AI systems at any size.

这份清单虽然全面，但并非详尽无遗。AI系统性能工程领域将随着硬件、软件和算法的发展而继续增长。而且并非这里列出的每个最佳实践都适用于每种情况。但总体而言，它们涵盖了AI系统的性能工程场景广度。这些技巧封装了多年来优化AI系统性能积累的许多实践智慧。

> This list, while comprehensive, is not exhaustive. The field of AI systems performance engineering will continue to grow as hardware, software, and algorithms evolve. And not every best practice listed here applies to every situation. But, collectively, they cover the breadth of performance engineering scenarios for AI systems. These tips encapsulate much of the practical wisdom accumulated over years of optimizing AI system performance.

在调优AI系统时，您应该系统地浏览本章列出的每个相关类别并运行检查清单中的每个项目。例如，您应该确保操作系统已调优，确认GPU内核高效，检查您是否正确使用库，监控数据流水线，优化训练循环，调整推理策略，并优雅地扩展。通过遵循这些最佳实践，您可以诊断和解决大多数性能问题，并从AI系统中提取最大性能。

> When tuning your AI system, you should systematically go through each of the relevant categories listed in this chapter and run through each of the items in the checklist. For example, you should ensure the OS is tuned, confirm GPU kernels are efficient, check that you're using libraries properly, monitor the data pipeline, optimize the training loop, tune the inference strategies, and scale out gracefully. By following these best practices, you can diagnose and resolve most performance issues and extract the maximum performance from your AI system.

还要记住，在大幅扩展集群之前，您应该在较少数量的节点上进行性能分析并识别潜在的扩展瓶颈。例如，如果您看到全归约集合操作在8个GPU上已经占用迭代的20%，在更大规模下只会变得更糟——特别是当您超出单个计算节点或数据中心机架系统（如Grace Blackwell GB200和GB300 NVL72以及Vera Rubin VR200和VR300 NVL系统）的容量时。

> And remember that before you scale up your cluster drastically, you should profile on a smaller number of nodes and identify potential scale bottlenecks. For example, if you see an all-reduce collective operation already taking 20% of an iteration on 8 GPUs, it will only get worse at a larger scale-especially as you exceed the capacity of a single compute node or data center rack system, such as the Grace Blackwell GB200 and GB300 NVL72 and Vera Rubin VR200 and VR300 NVL systems.

将这份检查清单放在手边，并在发现新技巧时添加进去。将这些技巧和最佳实践与前面章节的深入理解相结合，您将设计和运行高效、可扩展、可维护、成本高效和可靠的AI系统。

> Keep this checklist handy and add to it as you discover new tricks. Combine these tips and best practices with the in-depth understanding from the earlier chapters, and you will design and run AI systems that are efficient, scalable, maintainable, cost-effective, and reliable.

现在去实现您最雄心勃勃的想法吧。祝您优化愉快！

> Now go forth and make your most ambitious ideas a reality. Happy optimizing!
