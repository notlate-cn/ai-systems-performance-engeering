-- Supabase 数据库表结构
-- 用于存储用户标注数据

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 标注表
CREATE TABLE IF NOT EXISTS annotations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  page_title TEXT,
  selected_text TEXT NOT NULL,
  start_offset INTEGER,
  end_offset INTEGER,
  start_container TEXT,
  end_container TEXT,
  color VARCHAR(20) DEFAULT 'yellow',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_annotations_user_id ON annotations(user_id);
CREATE INDEX IF NOT EXISTS idx_annotations_page_url ON annotations(page_url);
CREATE INDEX IF NOT EXISTS idx_annotations_user_page ON annotations(user_id, page_url);

-- 启用行级安全策略 (RLS)
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的标注
CREATE POLICY "Users can view own annotations" ON annotations
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的标注
CREATE POLICY "Users can insert own annotations" ON annotations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的标注
CREATE POLICY "Users can update own annotations" ON annotations
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的标注
CREATE POLICY "Users can delete own annotations" ON annotations
  FOR DELETE USING (auth.uid() = user_id);

-- 自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_annotations_updated_at
  BEFORE UPDATE ON annotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 允许匿名用户（可选，如果不需要登录可以使用此策略）
-- CREATE POLICY "Allow anonymous access" ON annotations
--   FOR ALL USING (true);
