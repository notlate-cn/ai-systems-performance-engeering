/**
 * 页面访问统计模块
 * 使用 Supabase 存储访问数据
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    // 从 annotation-config.js 复用 Supabase 配置
    SUPABASE_URL: window.SUPABASE_ANNOTATION_URL || '',
    SUPABASE_KEY: window.SUPABASE_ANNOTATION_KEY || '',
    // 本地存储键
    VISITOR_ID_KEY: 'page_stats_visitor_id',
    VIEWED_PAGES_KEY: 'page_stats_viewed',
    // 防抖时间（毫秒）
    DEBOUNCE_TIME: 2000,
    // 是否启用调试
    DEBUG: false
  };

  // 工具函数：生成 UUID
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 工具函数：获取或创建访客ID
  function getVisitorId() {
    let visitorId = localStorage.getItem(CONFIG.VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = generateUUID();
      localStorage.setItem(CONFIG.VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  }

  // 工具函数：防抖
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 工具函数：调试日志
  function log(...args) {
    if (CONFIG.DEBUG) {
      console.log('[PageStats]', ...args);
    }
  }

  // 页面统计类
  class PageStats {
    constructor() {
      this.supabase = null;
      this.pageUrl = window.location.pathname;
      this.pageTitle = document.title;
      this.visitorId = getVisitorId();
      this.initialized = false;
    }

    // 初始化 Supabase 客户端
    async init() {
      if (this.initialized) return;

      // 检查 Supabase 配置
      if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY) {
        log('Supabase 配置未找到，尝试从全局变量获取');
        // 等待 annotation-config.js 加载
        await this.waitForConfig();
      }

      // 检查 Supabase 库是否可用
      if (typeof supabase === 'undefined') {
        log('Supabase 库未加载，使用本地存储模式');
        this.useLocalStorage = true;
      } else {
        this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
        this.useLocalStorage = false;
      }

      this.initialized = true;
      log('初始化完成，访客ID:', this.visitorId);
    }

    // 等待配置加载
    waitForConfig() {
      return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50;
        const interval = setInterval(() => {
          attempts++;
          if (window.SUPABASE_ANNOTATION_URL && window.SUPABASE_ANNOTATION_KEY) {
            CONFIG.SUPABASE_URL = window.SUPABASE_ANNOTATION_URL;
            CONFIG.SUPABASE_KEY = window.SUPABASE_ANNOTATION_KEY;
            clearInterval(interval);
            resolve();
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            log('等待配置超时');
            resolve();
          }
        }, 100);
      });
    }

    // 记录页面访问
    async trackPageView() {
      await this.init();

      // 检查是否已经记录过（避免重复）
      if (this.hasViewedRecently()) {
        log('最近已记录过访问，跳过');
        return;
      }

      try {
        if (this.useLocalStorage) {
          await this.trackWithLocalStorage();
        } else {
          await this.trackWithSupabase();
        }
        this.markAsViewed();
      } catch (error) {
        log('记录访问失败:', error);
        // 降级到本地存储
        await this.trackWithLocalStorage();
      }
    }

    // 使用 Supabase 记录访问
    async trackWithSupabase() {
      // 调用 RPC 函数原子性地增加访问次数
      const { data, error } = await this.supabase.rpc('increment_page_view', {
        p_page_url: this.pageUrl,
        p_page_title: this.pageTitle,
        p_visitor_id: this.visitorId
      });

      if (error) {
        // 如果 RPC 函数不存在，使用备用方案
        log('RPC 调用失败，使用备用方案:', error);
        await this.trackWithFallback();
      } else {
        log('访问已记录，当前次数:', data);
        this.updateViewCount(data);
      }
    }

    // 备用方案：直接操作数据库
    async trackWithFallback() {
      // 1. 插入访问日志
      await this.supabase.from('page_view_logs').insert({
        page_url: this.pageUrl,
        visitor_id: this.visitorId
      });

      // 2. 检查页面是否已存在
      const { data: existing } = await this.supabase
        .from('page_views')
        .select('view_count')
        .eq('page_url', this.pageUrl)
        .single();

      if (existing) {
        // 更新现有记录
        const { data } = await this.supabase
          .from('page_views')
          .update({ view_count: existing.view_count + 1 })
          .eq('page_url', this.pageUrl)
          .select('view_count')
          .single();
        this.updateViewCount(data?.view_count);
      } else {
        // 创建新记录
        const { data } = await this.supabase
          .from('page_views')
          .insert({
            page_url: this.pageUrl,
            page_title: this.pageTitle,
            view_count: 1
          })
          .select('view_count')
          .single();
        this.updateViewCount(data?.view_count);
      }
    }

    // 使用本地存储记录访问（降级方案）
    async trackWithLocalStorage() {
      const storageKey = `page_stats_${this.pageUrl}`;
      const stats = JSON.parse(localStorage.getItem(storageKey) || '{"count": 0}');
      stats.count++;
      stats.lastVisit = new Date().toISOString();
      localStorage.setItem(storageKey, JSON.stringify(stats));
      this.updateViewCount(stats.count);
      log('本地存储访问次数:', stats.count);
    }

    // 获取页面访问统计
    async getPageStats() {
      await this.init();

      try {
        if (this.useLocalStorage) {
          return this.getLocalStats();
        }

        const { data, error } = await this.supabase
          .from('page_views')
          .select('view_count, unique_visitors')
          .eq('page_url', this.pageUrl)
          .single();

        if (error) {
          log('获取统计失败:', error);
          return this.getLocalStats();
        }

        return {
          viewCount: data?.view_count || 0,
          uniqueVisitors: data?.unique_visitors || 0
        };
      } catch (error) {
        log('获取统计异常:', error);
        return this.getLocalStats();
      }
    }

    // 获取本地统计
    getLocalStats() {
      const storageKey = `page_stats_${this.pageUrl}`;
      const stats = JSON.parse(localStorage.getItem(storageKey) || '{"count": 0}');
      return {
        viewCount: stats.count,
        uniqueVisitors: 0
      };
    }

    // 检查最近是否已访问（避免重复计数）
    hasViewedRecently() {
      const viewedPages = JSON.parse(localStorage.getItem(CONFIG.VIEWED_PAGES_KEY) || '{}');
      const lastView = viewedPages[this.pageUrl];
      if (!lastView) return false;

      // 10分钟内不重复计数
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      return new Date(lastView).getTime() > tenMinutesAgo;
    }

    // 标记为已访问
    markAsViewed() {
      const viewedPages = JSON.parse(localStorage.getItem(CONFIG.VIEWED_PAGES_KEY) || '{}');
      viewedPages[this.pageUrl] = new Date().toISOString();
      localStorage.setItem(CONFIG.VIEWED_PAGES_KEY, JSON.stringify(viewedPages));
    }

    // 更新页面上的访问计数显示
    updateViewCount(count) {
      if (!count) return;

      const elements = document.querySelectorAll('.page-view-count');
      elements.forEach(el => {
        el.textContent = this.formatNumber(count);
        el.setAttribute('title', `访问量: ${count}`);
      });

      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('pageStatsUpdated', {
        detail: { count, pageUrl: this.pageUrl }
      }));
    }

    // 格式化数字
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }

    // 创建访问计数显示元素
    createViewCountElement() {
      const container = document.createElement('span');
      container.className = 'page-view-count-wrapper';
      container.innerHTML = `
        <span class="page-view-icon">👁</span>
        <span class="page-view-count">-</span>
      `;
      return container;
    }

    // 初始化页面上的访问计数显示
    async initViewCountDisplay() {
      // 查找或创建显示位置
      let container = document.querySelector('.page-view-count-container');

      if (!container) {
        // 尝试在文章标题下方插入
        const article = document.querySelector('.md-content__inner');
        const header = document.querySelector('h1');

        if (header) {
          container = document.createElement('div');
          container.className = 'page-view-count-container';
          container.appendChild(this.createViewCountElement());
          header.parentNode.insertBefore(container, header.nextSibling);
        }
      }

      // 获取并显示统计
      const stats = await this.getPageStats();
      this.updateViewCount(stats.viewCount);
    }
  }

  // 创建全局实例
  window.pageStats = new PageStats();

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageStats);
  } else {
    initPageStats();
  }

  function initPageStats() {
    // 延迟执行，确保其他脚本已加载
    setTimeout(() => {
      window.pageStats.trackPageView();
      window.pageStats.initViewCountDisplay();
    }, 1000);
  }

  // 处理单页应用路由变化
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      window.pageStats = new PageStats();
      window.pageStats.trackPageView();
      window.pageStats.initViewCountDisplay();
    }
  }).observe(document, { subtree: true, childList: true });

})();
