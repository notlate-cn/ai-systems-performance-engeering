(function() {
  var toggleBtn = null;
  var isHidden = localStorage.getItem("english-hidden") === "true";
  
  function createButton() {
    if (document.getElementById("toggle-english-btn")) {
      return;
    }
    toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-english-btn";
    toggleBtn.id = "toggle-english-btn";
    toggleBtn.addEventListener("click", toggleEnglish);
    document.body.appendChild(toggleBtn);
    updateButtonText();
  }
  
  function updateButtonText() {
    if (!toggleBtn) return;
    if (isHidden) {
      toggleBtn.innerHTML = '<span class="icon">📖</span><span>显示原文</span>';
      toggleBtn.classList.add("hidden-english");
    } else {
      toggleBtn.innerHTML = '<span class="icon">📕</span><span>隐藏原文</span>';
      toggleBtn.classList.remove("hidden-english");
    }
  }
  
  function toggleEnglish() {
    isHidden = !isHidden;
    localStorage.setItem("english-hidden", isHidden);
    updateButtonText();
    applyToggle();
  }
  
  function applyToggle() {
    var blockquotes = document.querySelectorAll("blockquote");
    blockquotes.forEach(function(bq) {
      if (isHidden) {
        bq.classList.add("english-hidden");
      } else {
        bq.classList.remove("english-hidden");
      }
    });
  }
  
  function init() {
    createButton();
    applyToggle();
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  
  document.addEventListener("DOMContentSwitch", function() {
    applyToggle();
  });
  
  if (typeof document$ !== "undefined") {
    document$.subscribe(function() {
      init();
      applyToggle();
    });
  }
})();
