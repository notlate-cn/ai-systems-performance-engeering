# 标注功能配置说明

## 功能概述

本功能允许用户在网站上进行文字高亮、标注和笔记，支持两种模式：

1. **本地模式**：数据存储在浏览器 localStorage，仅限当前浏览器使用
2. **云端模式**：数据存储在 Supabase，支持跨设备同步

## Supabase 配置步骤

### 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com) 并登录
2. 点击 "New Project" 创建新项目
3. 填写项目名称和数据库密码
4. 选择离你最近的区域（建议选择 Singapore 或 Tokyo）
5. 等待项目创建完成（约 2 分钟）

### 2. 创建数据库表

1. 进入项目后，点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制 `docs/assets/sql/supabase_schema.sql` 的内容并粘贴
4. 点击 "Run" 执行 SQL

### 3. 配置 GitHub OAuth（用于用户登录）

1. 在 GitHub 创建 OAuth App：
   - 访问 https://github.com/settings/developers
   - 点击 "New OAuth App"
   - 填写信息：
     - Application name: 你的应用名称
     - Homepage URL: 你的网站地址
     - Authorization callback URL: `https://你的项目ID.supabase.co/auth/v1/callback`
   - 获取 Client ID 和 Client Secret

2. 在 Supabase 配置 GitHub 登录：
   - 进入项目，点击左侧 "Authentication" → "Providers"
   - 找到 GitHub，点击启用
   - 填入 GitHub OAuth App 的 Client ID 和 Client Secret
   - 保存

### 4. 获取 API 密钥

1. 点击左侧 "Settings" → "API"
2. 复制以下两个值：
   - **Project URL**：`https://xxxxx.supabase.co`
   - **anon public key**：`eyJhbGciOiJIUzI1NiIsInR5cCI6...`

### 5. 配置网站

编辑 `docs/assets/js/annotation-config.js`：

```javascript
window.SUPABASE_ANNOTATION_URL = 'https://你的项目ID.supabase.co';
window.SUPABASE_ANNOTATION_KEY = '你的anon-public-key';
```

## 使用方法

### 高亮文字

1. 选中要高亮的文字
2. 在弹出的工具栏中选择颜色
3. 点击高亮按钮

### 添加笔记

1. 选中文字
2. 点击笔记按钮
3. 输入笔记内容并保存

### 查看/编辑/删除标注

- 点击已高亮的文字，弹出操作面板
- 可编辑笔记或删除标注

### 登录同步

- 点击右下角"登录同步标注"按钮
- 使用 GitHub 账号登录
- 登录后标注数据会自动同步到云端

## 文件说明

```
docs/assets/
├── css/
│   └── annotation.css      # 标注功能样式
├── js/
│   ├── annotation-config.js # Supabase 配置（需自行填写）
│   └── annotation.js        # 标注功能核心代码
└── sql/
    └── supabase_schema.sql  # 数据库表结构
```

## 注意事项

1. **免费额度**：Supabase 免费版有 500MB 数据库空间和 5GB/月流量，对于标注功能完全够用
2. **项目暂停**：免费版项目 1 周无活动会自动暂停，首次访问需要几秒唤醒
3. **安全**：anon key 是公开的，已通过 RLS（行级安全策略）保护用户数据
4. **隐私**：每个用户只能查看和管理自己的标注

## 故障排除

### 标注无法保存

1. 检查 Supabase 配置是否正确
2. 检查浏览器控制台是否有错误
3. 确认数据库表已创建

### 登录失败

1. 确认 GitHub OAuth 已正确配置
2. 检查回调 URL 是否正确
3. 确认 Supabase 中 GitHub provider 已启用

### 标注位置不准确

页面内容变化可能导致标注位置偏移，这是基于文本偏移量的技术限制。
