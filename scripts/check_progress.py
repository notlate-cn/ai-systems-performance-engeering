#!/usr/bin/env python3
"""
翻译进度检查工具
检查各章节的翻译状态
"""

import os
import re
from pathlib import Path

DOCS_DIR = Path(__file__).parent.parent / "docs" / "chapters"

CHAPTERS = {
    "ch01": "Introduction and AI System Overview",
    "ch02": "AI System Hardware Overview",
    "ch03": "OS, Docker, and Kubernetes Tuning for GPU-Based Environments",
    "ch04": "Tuning Distributed Networking Communication",
    "ch05": "GPU-Based Storage I/O Optimizations",
    "ch06": "GPU Architecture, CUDA Programming, and Maximizing Occupancy",
    "ch07": "Profiling and Tuning GPU Memory Access Patterns",
    "ch08": "Occupancy Tuning, Warp Efficiency, and Instruction-Level Parallelism",
    "ch09": "Increasing CUDA Kernel Efficiency and Arithmetic Intensity",
    "ch10": "Intra-Kernel Pipelining, Warp Specialization, and Cooperative Thread Block Clusters",
    "ch11": "Inter-Kernel Pipelining, Synchronization, and CUDA Stream-Ordered Memory Allocations",
    "ch12": "Dynamic Scheduling, CUDA Graphs, and Device-Initiated Kernel Orchestration",
    "ch13": "Profiling, Tuning, and Scaling PyTorch",
    "ch14": "PyTorch Compiler, OpenAI Triton, and XLA Backends",
    "ch15": "Multinode Inference, Parallelism, Decoding, and Routing Optimizations",
    "ch16": "Profiling, Debugging, and Tuning Inference at Scale",
    "ch17": "Scaling Disaggregated Prefill and Decode for Inference",
    "ch18": "Advanced Prefill-Decode and KV Cache Tuning",
    "ch19": "Dynamic and Adaptive Inference Engine Optimizations",
    "ch20": "AI-Assisted Performance Optimizations and Scaling Toward Multimillion GPU Clusters",
}

def check_chapter_status(file_path: Path) -> dict:
    """检查章节翻译状态"""
    if not file_path.exists():
        return {"exists": False, "lines": 0, "has_content": False, "progress": "❌ 未创建"}
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    lines = len(content.strip().split("\n"))
    has_placeholder = "🚧" in content or "翻译进行中" in content
    
    if has_placeholder and lines < 20:
        progress = "⏳ 待翻译"
    elif lines > 100:
        progress = "✅ 已完成"
    elif lines > 50:
        progress = "🔄 进行中"
    else:
        progress = "⏳ 待翻译"
    
    return {
        "exists": True,
        "lines": lines,
        "has_content": lines > 10 and not has_placeholder,
        "progress": progress
    }

def main():
    print("=" * 60)
    print("📚 AI Systems Performance Engineering 翻译进度")
    print("=" * 60)
    print()
    
    total = len(CHAPTERS)
    completed = 0
    in_progress = 0
    pending = 0
    
    for ch_id, ch_title in CHAPTERS.items():
        file_path = DOCS_DIR / f"{ch_id}.md"
        status = check_chapter_status(file_path)
        
        if "✅" in status["progress"]:
            completed += 1
        elif "🔄" in status["progress"]:
            in_progress += 1
        else:
            pending += 1
        
        lines_info = f"({status['lines']} 行)" if status["exists"] else ""
        print(f"  {ch_id}: {status['progress']} {ch_title} {lines_info}")
    
    print()
    print("-" * 60)
    print(f"  📊 统计: ✅ 已完成 {completed} | 🔄 进行中 {in_progress} | ⏳ 待翻译 {pending}")
    print(f"  📈 总进度: {completed}/{total} ({completed/total*100:.1f}%)")
    print("=" * 60)

if __name__ == "__main__":
    main()
