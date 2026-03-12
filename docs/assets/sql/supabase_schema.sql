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

-- ============================================
-- 页面访问统计表
-- ============================================

-- 页面访问统计表
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_url TEXT NOT NULL,
  page_title TEXT,
  view_count INTEGER DEFAULT 1,
  unique_visitors INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 访问记录表（用于统计独立访客）
CREATE TABLE IF NOT EXISTS page_view_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_url TEXT NOT NULL,
  visitor_id TEXT NOT NULL,  -- 访客唯一标识（基于浏览器指纹或IP）
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url);
CREATE INDEX IF NOT EXISTS idx_page_view_logs_page_url ON page_view_logs(page_url);
CREATE INDEX IF NOT EXISTS idx_page_view_logs_visitor ON page_view_logs(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_view_logs_page_visitor ON page_view_logs(page_url, visitor_id);

-- 启用行级安全策略 (RLS)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_view_logs ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看访问统计（公开数据）
CREATE POLICY "Allow public read page_views" ON page_views
  FOR SELECT USING (true);

-- 允许所有人插入访问记录（匿名访问统计）
CREATE POLICY "Allow public insert page_views" ON page_views
  FOR INSERT WITH CHECK (true);

-- 允许所有人更新访问统计
CREATE POLICY "Allow public update page_views" ON page_views
  FOR UPDATE USING (true);

-- 允许服务角色插入访问日志
CREATE POLICY "Allow public insert page_view_logs" ON page_view_logs
  FOR INSERT WITH CHECK (true);

-- 自动更新 page_views 的 updated_at 字段
CREATE TRIGGER update_page_views_updated_at
  BEFORE UPDATE ON page_views
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 增加访问次数的函数（用于原子操作）
CREATE OR REPLACE FUNCTION increment_page_view(
  p_page_url TEXT,
  p_page_title TEXT,
  p_visitor_id TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_is_unique BOOLEAN;
  v_current_count INTEGER;
BEGIN
  -- 检查是否是独立访客（24小时内同一页面同一访客只算一次）
  SELECT NOT EXISTS (
    SELECT 1 FROM page_view_logs
    WHERE page_url = p_page_url
      AND visitor_id = p_visitor_id
      AND created_at > NOW() - INTERVAL '24 hours'
  ) INTO v_is_unique;

  -- 插入访问日志
  INSERT INTO page_view_logs (page_url, visitor_id)
  VALUES (p_page_url, p_visitor_id);

  -- 更新或插入页面访问统计
  INSERT INTO page_views (page_url, page_title, view_count, unique_visitors)
  VALUES (p_page_url, p_page_title, 1, CASE WHEN v_is_unique THEN 1 ELSE 0 END)
  ON CONFLICT (page_url) DO UPDATE SET
    view_count = page_views.view_count + 1,
    unique_visitors = page_views.unique_visitors + CASE WHEN v_is_unique THEN 1 ELSE 0 END,
    updated_at = NOW()
  RETURNING view_count INTO v_current_count;

  RETURN v_current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
