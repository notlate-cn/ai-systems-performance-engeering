(function() {
  'use strict';

  var supabaseClient = null;
  var currentUser = null;
  var annotations = [];
  var selectedRange = null;
  var toolbar = null;
  var highlightColors = ['yellow', 'green', 'blue', 'pink', 'orange'];
  var currentColor = 'yellow';

  var SUPABASE_URL = window.SUPABASE_ANNOTATION_URL || '';
  var SUPABASE_ANON_KEY = window.SUPABASE_ANNOTATION_KEY || '';

  function initSupabase() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('Supabase 配置缺失，标注功能将使用本地存储模式');
      return false;
    }
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return true;
    } catch (e) {
      console.error('Supabase 初始化失败:', e);
      return false;
    }
  }

  async function checkAuth() {
    if (!supabaseClient) return null;
    try {
      var _a = await supabaseClient.auth.getUser();
      var user = _a.data.user;
      var error = _a.error;
      if (error) throw error;
      return user;
    } catch (e) {
      return null;
    }
  }

  async function signInWithGitHub() {
    if (!supabaseClient) {
      alert('Supabase 未配置，请先配置 Supabase');
      return;
    }
    try {
      var _a = await supabaseClient.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.href
        }
      });
      var error = _a.error;
      if (error) throw error;
    } catch (e) {
      console.error('登录失败:', e);
      alert('登录失败: ' + e.message);
    }
  }

  async function signOut() {
    if (!supabaseClient) return;
    try {
      var _a = await supabaseClient.auth.signOut();
      var error = _a.error;
      if (error) throw error;
      currentUser = null;
      annotations = [];
      updateAuthUI();
      clearAllHighlights();
      loadFromLocalStorage();
    } catch (e) {
      console.error('登出失败:', e);
    }
  }

  function getStorageKey() {
    return 'annotations_' + window.location.pathname;
  }

  function saveToLocalStorage(data) {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
    } catch (e) {
      console.error('保存到本地存储失败:', e);
    }
  }

  function loadFromLocalStorage() {
    try {
      var data = localStorage.getItem(getStorageKey());
      if (data) {
        annotations = JSON.parse(data);
        renderHighlights();
      }
    } catch (e) {
      console.error('从本地存储加载失败:', e);
    }
  }

  async function loadAnnotations() {
    if (!supabaseClient || !currentUser) {
      loadFromLocalStorage();
      return;
    }
    try {
      var _a = await supabaseClient
        .from('annotations')
        .select('*')
        .eq('page_url', window.location.pathname);
      var data = _a.data;
      var error = _a.error;
      if (error) throw error;
      annotations = data || [];
      renderHighlights();
    } catch (e) {
      console.error('加载标注失败:', e);
      loadFromLocalStorage();
    }
  }

  async function saveAnnotation(annotation) {
    if (!supabaseClient || !currentUser) {
      annotation.id = 'local_' + Date.now();
      annotations.push(annotation);
      saveToLocalStorage(annotations);
      return annotation;
    }
    try {
      var _a = await supabaseClient
        .from('annotations')
        .insert(annotation)
        .select()
        .single();
      var data = _a.data;
      var error = _a.error;
      if (error) throw error;
      annotations.push(data);
      return data;
    } catch (e) {
      console.error('保存标注失败:', e);
      annotation.id = 'local_' + Date.now();
      annotations.push(annotation);
      saveToLocalStorage(annotations);
      return annotation;
    }
  }

  async function updateAnnotation(id, updates) {
    if (!supabaseClient || !currentUser || id.startsWith('local_')) {
      var index = annotations.findIndex(function(a) { return a.id === id; });
      if (index !== -1) {
        Object.assign(annotations[index], updates);
        saveToLocalStorage(annotations);
      }
      return;
    }
    try {
      var _a = await supabaseClient
        .from('annotations')
        .update(updates)
        .eq('id', id);
      var error = _a.error;
      if (error) throw error;
      var index = annotations.findIndex(function(a) { return a.id === id; });
      if (index !== -1) {
        Object.assign(annotations[index], updates);
      }
    } catch (e) {
      console.error('更新标注失败:', e);
    }
  }

  async function deleteAnnotation(id) {
    if (!supabaseClient || !currentUser || id.startsWith('local_')) {
      annotations = annotations.filter(function(a) { return a.id !== id; });
      saveToLocalStorage(annotations);
      return;
    }
    try {
      var _a = await supabaseClient
        .from('annotations')
        .delete()
        .eq('id', id);
      var error = _a.error;
      if (error) throw error;
      annotations = annotations.filter(function(a) { return a.id !== id; });
    } catch (e) {
      console.error('删除标注失败:', e);
    }
  }

  function createToolbar() {
    toolbar = document.createElement('div');
    toolbar.className = 'annotation-toolbar';
    toolbar.innerHTML = '\
      <div class="annotation-colors">\
        ' + highlightColors.map(function(c) {
          var colorName = {'yellow': '黄色', 'green': '绿色', 'blue': '蓝色', 'pink': '粉色', 'orange': '橙色'}[c] || c;
          return '<button class="color-btn color-' + c + '" data-color="' + c + '" title="' + colorName + '"></button>';
        }).join('') + '\
      </div>\
      <button class="annotation-btn highlight-btn" title="高亮选中文字">\
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.243 4.515l-6.738 6.737-.707 2.121-1.04 1.041 2.828 2.829 1.04-1.041 2.122-.707 6.737-6.738-4.242-4.242zm6.364 3.535l-1.414 1.414-4.243-4.243 1.414-1.414a2 2 0 0 1 2.828 0l1.415 1.415a2 2 0 0 1 0 2.828zM4.283 16.89l-.283.849-.849.283L1 19.586 4.414 23l1.564-2.151.283-.849.849-.283 1.04-1.04-2.828-2.828-1.04 1.04z"/></svg>\
        <span class="btn-text">高亮</span>\
      </button>\
      <button class="annotation-btn note-btn" title="添加笔记">\
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>\
        <span class="btn-text">笔记</span>\
      </button>\
      <button class="annotation-btn delete-btn" title="取消选择">\
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>\
        <span class="btn-text">取消</span>\
      </button>\
    ';
    document.body.appendChild(toolbar);

    toolbar.querySelectorAll('.color-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        currentColor = this.dataset.color;
        toolbar.querySelectorAll('.color-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
      });
    });

    toolbar.querySelector('.highlight-btn').addEventListener('click', function() {
      if (selectedRange) {
        addHighlight(selectedRange, currentColor);
        hideToolbar();
      }
    });

    toolbar.querySelector('.note-btn').addEventListener('click', function() {
      if (selectedRange) {
        showNoteDialog(selectedRange, currentColor);
        hideToolbar();
      }
    });

    toolbar.querySelector('.delete-btn').addEventListener('click', function() {
      if (selectedRange) {
        hideToolbar();
      }
    });
  }

  function showToolbar(x, y) {
    if (!toolbar) createToolbar();
    var toolbarWidth = toolbar.offsetWidth || 180;
    var windowWidth = window.innerWidth;
    var left = x;
    if (left - toolbarWidth / 2 < 10) {
      left = toolbarWidth / 2 + 10;
    } else if (left + toolbarWidth / 2 > windowWidth - 10) {
      left = windowWidth - toolbarWidth / 2 - 10;
    }
    toolbar.style.left = left + 'px';
    toolbar.style.top = (y - 45) + 'px';
    toolbar.classList.add('visible');
  }

  function hideToolbar() {
    if (toolbar) {
      toolbar.classList.remove('visible');
    }
    selectedRange = null;
  }

  function handleTextSelection(e) {
    var selection = window.getSelection();
    if (selection.rangeCount === 0 || selection.isCollapsed) {
      hideToolbar();
      return;
    }

    var range = selection.getRangeAt(0);
    var text = range.toString().trim();
    if (text.length === 0) {
      hideToolbar();
      return;
    }

    selectedRange = range.cloneRange();
    var rect = range.getBoundingClientRect();
    showToolbar(rect.left + rect.width / 2, rect.top + window.scrollY);
  }

  function getRangeInfo(range) {
    var startContainer = getXPath(range.startContainer);
    var endContainer = getXPath(range.endContainer);
    return {
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      startContainer: startContainer,
      endContainer: endContainer
    };
  }

  function getXPath(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }
    var parts = [];
    while (node && node.nodeType === Node.ELEMENT_NODE) {
      var index = 0;
      var sibling = node.previousSibling;
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === node.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      var tagName = node.tagName.toLowerCase();
      var part = tagName;
      if (index > 0) {
        part += '[' + (index + 1) + ']';
      }
      parts.unshift(part);
      node = node.parentNode;
    }
    return '/' + parts.join('/');
  }

  function addHighlight(range, color, note) {
    var text = range.toString().trim();
    var rangeInfo = getRangeInfo(range);

    var annotation = {
      user_id: currentUser ? currentUser.id : null,
      page_url: window.location.pathname,
      page_title: document.title,
      selected_text: text,
      start_offset: rangeInfo.startOffset,
      end_offset: rangeInfo.endOffset,
      start_container: rangeInfo.startContainer,
      end_container: rangeInfo.endContainer,
      color: color,
      note: note || null
    };

    saveAnnotation(annotation).then(function(saved) {
      highlightRange(range, saved);
    });

    window.getSelection().removeAllRanges();
  }

  function highlightRange(range, annotation) {
    try {
      var span = document.createElement('span');
      span.className = 'annotation-highlight color-' + annotation.color;
      span.dataset.annotationId = annotation.id;
      if (annotation.note) {
        span.dataset.note = annotation.note;
        span.classList.add('has-note');
      }
      range.surroundContents(span);

      span.addEventListener('click', function(e) {
        e.stopPropagation();
        showAnnotationPopup(annotation, span);
      });
    } catch (e) {
      console.warn('无法高亮此选区，可能跨越了多个元素');
    }
  }

  function showNoteDialog(range, color) {
    var dialog = document.createElement('div');
    dialog.className = 'annotation-dialog-overlay';
    dialog.innerHTML = '\
      <div class="annotation-dialog">\
        <h3>添加笔记</h3>\
        <textarea placeholder="输入你的笔记..." rows="4"></textarea>\
        <div class="dialog-buttons">\
          <button class="cancel-btn">取消</button>\
          <button class="save-btn">保存</button>\
        </div>\
      </div>\
    ';
    document.body.appendChild(dialog);

    var textarea = dialog.querySelector('textarea');
    var cancelBtn = dialog.querySelector('.cancel-btn');
    var saveBtn = dialog.querySelector('.save-btn');

    cancelBtn.addEventListener('click', function() {
      document.body.removeChild(dialog);
    });

    saveBtn.addEventListener('click', function() {
      var note = textarea.value.trim();
      addHighlight(range, color, note);
      document.body.removeChild(dialog);
    });

    dialog.addEventListener('click', function(e) {
      if (e.target === dialog) {
        document.body.removeChild(dialog);
      }
    });

    textarea.focus();
  }

  function showAnnotationPopup(annotation, element) {
    var existing = document.querySelector('.annotation-popup');
    if (existing) existing.remove();

    var popup = document.createElement('div');
    popup.className = 'annotation-popup';
    popup.innerHTML = '\
      <div class="popup-header">\
        <span class="popup-color color-' + annotation.color + '"></span>\
        <span class="popup-text">' + escapeHtml(annotation.selected_text.substring(0, 50) + (annotation.selected_text.length > 50 ? '...' : '')) + '</span>\
      </div>\
      ' + (annotation.note ? '<div class="popup-note">' + escapeHtml(annotation.note) + '</div>' : '') + '\
      <div class="popup-actions">\
        <button class="edit-note-btn" title="编辑笔记">\
          <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>\
        </button>\
        <button class="delete-btn" title="删除标注">\
          <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>\
        </button>\
      </div>\
    ';

    var rect = element.getBoundingClientRect();
    popup.style.left = rect.left + 'px';
    popup.style.top = (rect.bottom + window.scrollY + 5) + 'px';
    document.body.appendChild(popup);

    popup.querySelector('.edit-note-btn').addEventListener('click', function() {
      editAnnotationNote(annotation);
      popup.remove();
    });

    popup.querySelector('.delete-btn').addEventListener('click', function() {
      removeHighlight(annotation.id, element);
      popup.remove();
    });

    setTimeout(function() {
      document.addEventListener('click', function closePopup(e) {
        if (!popup.contains(e.target)) {
          popup.remove();
          document.removeEventListener('click', closePopup);
        }
      });
    }, 10);
  }

  function editAnnotationNote(annotation) {
    var dialog = document.createElement('div');
    dialog.className = 'annotation-dialog-overlay';
    dialog.innerHTML = '\
      <div class="annotation-dialog">\
        <h3>编辑笔记</h3>\
        <textarea placeholder="输入你的笔记..." rows="4">' + (annotation.note || '') + '</textarea>\
        <div class="dialog-buttons">\
          <button class="cancel-btn">取消</button>\
          <button class="save-btn">保存</button>\
        </div>\
      </div>\
    ';
    document.body.appendChild(dialog);

    var textarea = dialog.querySelector('textarea');
    var cancelBtn = dialog.querySelector('.cancel-btn');
    var saveBtn = dialog.querySelector('.save-btn');

    cancelBtn.addEventListener('click', function() {
      document.body.removeChild(dialog);
    });

    saveBtn.addEventListener('click', function() {
      var note = textarea.value.trim();
      updateAnnotation(annotation.id, { note: note }).then(function() {
        var span = document.querySelector('[data-annotation-id="' + annotation.id + '"]');
        if (span) {
          if (note) {
            span.dataset.note = note;
            span.classList.add('has-note');
          } else {
            delete span.dataset.note;
            span.classList.remove('has-note');
          }
        }
      });
      document.body.removeChild(dialog);
    });

    dialog.addEventListener('click', function(e) {
      if (e.target === dialog) {
        document.body.removeChild(dialog);
      }
    });

    textarea.focus();
  }

  function removeHighlight(id, element) {
    deleteAnnotation(id);
    var parent = element.parentNode;
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
  }

  function renderHighlights() {
    annotations.forEach(function(annotation) {
      try {
        var range = restoreRange(annotation);
        if (range) {
          highlightRange(range, annotation);
        }
      } catch (e) {
        console.warn('恢复标注失败:', e);
      }
    });
  }

  function restoreRange(annotation) {
    try {
      var startNode = getNodeByXPath(annotation.start_container);
      var endNode = getNodeByXPath(annotation.end_container);
      if (!startNode || !endNode) return null;

      var range = document.createRange();
      range.setStart(startNode, annotation.start_offset);
      range.setEnd(endNode, annotation.end_offset);
      return range;
    } catch (e) {
      return null;
    }
  }

  function getNodeByXPath(xpath) {
    var result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    var node = result.singleNodeValue;
    if (node && node.nodeType === Node.ELEMENT_NODE) {
      return node.firstChild;
    }
    return node;
  }

  function clearAllHighlights() {
    document.querySelectorAll('.annotation-highlight').forEach(function(el) {
      var parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function createAuthButton() {
    var btn = document.createElement('button');
    btn.className = 'annotation-auth-btn';
    btn.id = 'annotation-auth-btn';
    document.body.appendChild(btn);
    updateAuthUI();
    return btn;
  }

  function updateAuthUI() {
    var btn = document.getElementById('annotation-auth-btn');
    if (!btn) return;

    if (currentUser) {
      var displayName = currentUser.user_metadata?.user_name || currentUser.email?.split('@')[0] || '用户';
      if (displayName.length > 10) {
        displayName = displayName.substring(0, 10) + '...';
      }
      btn.innerHTML = '\
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>\
        <span class="user-name">' + displayName + '</span>\
      ';
      btn.title = currentUser.email || displayName + ' (点击登出)';
      btn.onclick = function() {
        if (confirm('确定要登出吗？')) {
          signOut();
        }
      };
    } else {
      btn.innerHTML = '\
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>\
        <span>登录</span>\
      ';
      btn.title = '登录以同步标注数据';
      btn.onclick = signInWithGitHub;
    }
  }

  function createAnnotationList() {
    var btn = document.createElement('button');
    btn.className = 'annotation-list-btn';
    btn.id = 'annotation-list-btn';
    btn.innerHTML = '\
      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>\
      <span>标注</span>\
    ';
    btn.title = '查看所有标注';
    btn.onclick = showAnnotationList;
    document.body.appendChild(btn);
  }

  function showAnnotationList() {
    var existing = document.querySelector('.annotation-list-panel');
    if (existing) {
      existing.remove();
      return;
    }

    var panel = document.createElement('div');
    panel.className = 'annotation-list-panel';
    panel.innerHTML = '\
      <div class="panel-header">\
        <h3>我的标注 (' + annotations.length + ')</h3>\
        <button class="close-btn">&times;</button>\
      </div>\
      <div class="panel-content">\
        ' + (annotations.length === 0 ? '<p class="empty">暂无标注</p>' : annotations.map(function(a) {
          return '\
            <div class="annotation-item" data-id="' + a.id + '">\
              <div class="item-header">\
                <span class="item-color color-' + a.color + '"></span>\
                <span class="item-page">' + (a.page_title || a.page_url) + '</span>\
              </div>\
              <div class="item-text">' + escapeHtml(a.selected_text.substring(0, 100) + (a.selected_text.length > 100 ? '...' : '')) + '</div>\
              ' + (a.note ? '<div class="item-note">' + escapeHtml(a.note) + '</div>' : '') + '\
            </div>\
          ';
        }).join('')) + '\
      </div>\
    ';
    document.body.appendChild(panel);

    panel.querySelector('.close-btn').addEventListener('click', function() {
      panel.remove();
    });

    panel.querySelectorAll('.annotation-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var id = this.dataset.id;
        var annotation = annotations.find(function(a) { return a.id === id; });
        if (annotation && annotation.page_url === window.location.pathname) {
          var el = document.querySelector('[data-annotation-id="' + id + '"]');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('flash');
            setTimeout(function() { el.classList.remove('flash'); }, 1000);
          }
        }
        panel.remove();
      });
    });
  }

  async function init() {
    createAuthButton();
    createAnnotationList();

    var hasSupabase = initSupabase();

    if (hasSupabase) {
      currentUser = await checkAuth();
      updateAuthUI();

      supabaseClient.auth.onAuthStateChange(function(event, session) {
        currentUser = session?.user || null;
        updateAuthUI();
        if (currentUser) {
          loadAnnotations();
        }
      });
    }

    await loadAnnotations();

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('touchend', function(e) {
      setTimeout(function() {
        handleTextSelection(e);
      }, 100);
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        hideToolbar();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('DOMContentSwitch', function() {
    clearAllHighlights();
    loadAnnotations();
  });

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
      clearAllHighlights();
      loadAnnotations();
    });
  }
})();
