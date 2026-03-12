# AI Systems Performance Engineering 中英对照翻译

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://github.com/notlate-cn/ai-systems-performance-engeering)
[![License](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

> **AI Systems Performance Engineering (Chris Fregly)** 中英对照翻译项目

🌐 **在线阅读**: https://aispe.notlate.cn/

---

## 📚 关于本书

本书深入探讨 AI 系统性能工程的各个方面，从硬件架构到软件优化，从分布式训练到推理效率。通过 DeepSeek 等实际案例，展示了如何在资源受限的情况下榨取系统的最大性能。

### 原书信息

| 项目 | 内容 |
|------|------|
| **书名** | AI Systems Performance Engineering |
| **作者** | Chris Fregly |
| **出版社** | O'Reilly Media |

---

## ✨ 项目特色

- **📖 中英对照**: 每个段落同时展示英文原文和中文翻译，便于对照学习
- **🔍 全文搜索**: 支持中英文内容搜索
- **🌓 深色模式**: 支持浅色/深色主题切换
- **✏️ 文本标注**: 支持高亮和添加笔记（需登录 GitHub）
- **📱 响应式设计**: 适配桌面和移动设备

---

## 📑 目录结构

本项目包含 20 个章节的完整翻译：

1. [第1章 引言与AI系统概述](https://aispe.notlate.cn/chapters/ch01/)
2. [第2章 AI系统硬件概述](https://aispe.notlate.cn/chapters/ch02/)
3. [第3章 GPU环境的OS、Docker与Kubernetes调优](https://aispe.notlate.cn/chapters/ch03/)
4. [第4章 分布式网络通信调优](https://aispe.notlate.cn/chapters/ch04/)
5. [第5章 GPU存储I/O优化](https://aispe.notlate.cn/chapters/ch05/)
6. [第6章 GPU架构、CUDA编程与最大化占用率](https://aispe.notlate.cn/chapters/ch06/)
7. [第7章 GPU内存访问模式分析与调优](https://aispe.notlate.cn/chapters/ch07/)
8. [第8章 占用率调优、Warp效率与指令级并行](https://aispe.notlate.cn/chapters/ch08/)
9. [第9章 提高CUDA内核效率与算术强度](https://aispe.notlate.cn/chapters/ch09/)
10. [第10章 内核内流水线、Warp特化与协作线程块集群](https://aispe.notlate.cn/chapters/ch10/)
11. [第11章 内核间流水线、同步与CUDA流有序内存分配](https://aispe.notlate.cn/chapters/ch11/)
12. [第12章 动态调度、CUDA图与设备发起的内核编排](https://aispe.notlate.cn/chapters/ch12/)
13. [第13章 PyTorch性能分析、调优与扩展](https://aispe.notlate.cn/chapters/ch13/)
14. [第14章 PyTorch编译器、OpenAI Triton与XLA后端](https://aispe.notlate.cn/chapters/ch14/)
15. [第15章 多节点推理、并行、解码与路由优化](https://aispe.notlate.cn/chapters/ch15/)
16. [第16章 大规模推理的性能分析、调试与调优](https://aispe.notlate.cn/chapters/ch16/)
17. [第17章 扩展分离式预填充与解码推理](https://aispe.notlate.cn/chapters/ch17/)
18. [第18章 高级预填充-解码与KV缓存调优](https://aispe.notlate.cn/chapters/ch18/)
19. [第19章 动态自适应推理引擎优化](https://aispe.notlate.cn/chapters/ch19/)
20. [第20章 AI辅助性能优化与向百万GPU集群扩展](https://aispe.notlate.cn/chapters/ch20/)

📎 [附录](https://aispe.notlate.cn/appendix/appendix/)

---

## 🛠️ 技术栈

- **[MkDocs](https://www.mkdocs.org/)** - 静态网站生成器
- **[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)** - Material Design 主题
- **[Supabase](https://supabase.com/)** - 后端数据库（用于标注和访问统计）
- **GitHub Pages** - 网站托管
- **GitHub Actions** - 自动部署

---

## 🚀 本地构建

如果你想在本地构建和预览：

```bash
# 克隆仓库
git clone https://github.com/notlate-cn/ai-systems-performance-engeering.git
cd ai-systems-performance-engeering

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
mkdocs serve

# 访问 http://127.0.0.1:8000
```

---

## 🤝 参与贡献

本项目欢迎各种形式的贡献：

- 🐛 **报告错误** - 发现问题请提 [PR](https://github.com/notlate-cn/ai-systems-performance-engeering/pulls)
- 📝 **改进翻译** - 翻译不准确的地方欢迎 [PR](https://github.com/notlate-cn/ai-systems-performance-engeering/pulls)
- 💡 **功能建议** - 有新功能想法请提交 [Issue](https://github.com/notlate-cn/ai-systems-performance-engeering/issues)

---

## ⚠️ 翻译说明

本项目使用 **GLM5 翻译 + 人工校对**。采用中英对照格式，便于对照学习。

**注意**: 目前完成初稿，尚存在诸多格式错乱、中文翻译不准确、不合理、生硬等问题，由于精力有限，后续慢慢改进。

---

## 📄 许可声明

**本项目仅供学习交流使用，请勿用于商业用途。**

原书版权归 [O'Reilly Media](https://www.oreilly.com/) 所有。

本项目文档采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可协议。

---

## ⭐ 致谢

感谢原作者 **Chris Fregly** 的杰出著作，以及所有为本项目提供反馈和建议的读者。

如果本项目对你有帮助，请给个 Star ⭐ 支持一下！

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/notlate-cn">notlate-cn</a>
</p>
