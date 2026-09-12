/* =========================================================
   Andrew Owoko — shared site script
   ========================================================= */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    initActiveNav();
    initScrollReveal();
    initCounters();
    initProductFilter();
    initPodcastPlayers();
    initChatWidget();
    initContentHub();
    initProductModal();
    initServiceModal();
  }

  /* ---------- Highlight active nav link by filename (sidebar + bottom nav) ---------- */
  function initActiveNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".sidebar-nav a, .bottom-nav a").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("active");
      }
    });
  }

  /* ---------- Fade/slide reveal on scroll ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Animated stat counters ---------- */
  function initCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    var animated = new WeakSet();

    function animate(el) {
      if (animated.has(el)) return;
      animated.add(el);
      var target = parseFloat(el.getAttribute("data-counter"));
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1400;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(target * eased);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Product category filtering ---------- */
  function initProductFilter() {
    var filterBar = document.querySelector("[data-product-filters]");
    var cards = document.querySelectorAll("[data-product-card]");
    if (!filterBar || !cards.length) return;

    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      var category = btn.getAttribute("data-filter");

      cards.forEach(function (card) {
        var match = category === "all" || card.getAttribute("data-category") === category;
        card.classList.toggle("hidden", !match);
      });
    });
  }

  /* ---------- Podcast audio player(s) ---------- */
  function initPodcastPlayers() {
    var players = document.querySelectorAll("[data-episode]");
    if (!players.length) return;

    var currentAudio = null;
    var currentBtn = null;

    players.forEach(function (card) {
      var btn = card.querySelector(".episode-play");
      var audio = card.querySelector("audio");
      var bar = card.querySelector(".episode-progress-bar");
      if (!btn || !audio) return;

      btn.addEventListener("click", function () {
        if (currentAudio && currentAudio !== audio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          if (currentBtn) {
            currentBtn.classList.remove("playing");
            currentBtn.innerHTML = playIcon();
          }
        }

        if (audio.paused) {
          audio.play().catch(function () {
            /* placeholder audio file may not exist yet — fail silently */
          });
          btn.classList.add("playing");
          btn.innerHTML = pauseIcon();
          currentAudio = audio;
          currentBtn = btn;
        } else {
          audio.pause();
          btn.classList.remove("playing");
          btn.innerHTML = playIcon();
        }
      });

      audio.addEventListener("timeupdate", function () {
        if (!bar || !audio.duration) return;
        bar.style.width = (audio.currentTime / audio.duration) * 100 + "%";
      });

      audio.addEventListener("ended", function () {
        btn.classList.remove("playing");
        btn.innerHTML = playIcon();
        if (bar) bar.style.width = "0%";
      });
    });
  }

  /* ---------- Articles / Talks tabs + shared content modal ---------- */
  function initContentHub() {
    var tabs = document.querySelectorAll(".tab-btn");
    var panels = document.querySelectorAll(".content-panel");
    if (tabs.length) {
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (t) {
            t.classList.remove("active");
            t.setAttribute("aria-selected", "false");
          });
          tab.classList.add("active");
          tab.setAttribute("aria-selected", "true");
          var target = tab.getAttribute("data-tab");
          panels.forEach(function (panel) {
            panel.hidden = panel.getAttribute("data-panel") !== target;
          });
        });
      });
    }

    var cards = document.querySelectorAll(".content-card");
    var backdrop = document.querySelector("[data-content-backdrop]");
    if (!cards.length || !backdrop) return;

    var closeBtn = document.querySelector("[data-content-close]");
    var titleEl = document.querySelector("[data-content-title]");
    var descEl = document.querySelector("[data-content-desc]");
    var tagEl = document.querySelector("[data-content-tag]");
    var linkEl = document.querySelector("[data-content-link]");
    var ctaEl = document.querySelector("[data-content-cta]");

    var TYPE_META = {
      article: { tag: "Article", cta: "Read" },
      video: { tag: "Talk", cta: "Watch" },
      discover: { tag: "Discover", cta: "Explore" }
    };

    function open(card) {
      var type = card.getAttribute("data-type");
      var meta = TYPE_META[type] || TYPE_META.article;
      titleEl.textContent = card.getAttribute("data-title");
      descEl.textContent = card.getAttribute("data-desc");
      tagEl.textContent = meta.tag;
      ctaEl.textContent = meta.cta;
      linkEl.setAttribute("href", card.getAttribute("data-link"));
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    }

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        open(card);
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- Service "View More" modal ---------- */
  function initServiceModal() {
    var moreBtns = document.querySelectorAll("[data-service-more]");
    var backdrop = document.querySelector("[data-service-backdrop]");
    if (!moreBtns.length || !backdrop) return;

    var closeBtn = document.querySelector("[data-service-close]");
    var nameEl = document.querySelector("[data-service-name]");
    var descEl = document.querySelector("[data-service-desc]");
    var contactBtn = document.querySelector("[data-service-contact]");

    function open(card) {
      nameEl.textContent = card.getAttribute("data-name");
      descEl.textContent = card.getAttribute("data-desc");
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    }

    var cards = document.querySelectorAll("[data-service-card]");
    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        open(card);
      });
      var cardContactBtn = card.querySelector(".service-btn-contact");
      if (cardContactBtn) {
        cardContactBtn.addEventListener("click", function (e) {
          e.stopPropagation();
        });
      }
    });

    moreBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var card = btn.closest("[data-service-card]");
        if (card) open(card);
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    if (contactBtn) {
      contactBtn.addEventListener("click", function () {
        close();
        var chatBubble = document.querySelector(".chat-bubble");
        if (chatBubble) chatBubble.click();
      });
    }
  }

  /* ---------- Product "View More" modal ---------- */
  function initProductModal() {
    var cards = document.querySelectorAll("[data-product-card]");
    var backdrop = document.querySelector("[data-product-backdrop]");
    if (!cards.length || !backdrop) return;

    var closeBtn = document.querySelector("[data-product-close]");
    var nameEl = document.querySelector("[data-product-name]");
    var descEl = document.querySelector("[data-product-desc]");
    var catEl = document.querySelector("[data-product-cat]");
    var emailEl = document.querySelector("[data-product-email]");
    var waEl = document.querySelector("[data-product-whatsapp]");

    var EMAIL = "malwike.tech@gmail.com";
    var WHATSAPP_NUMBER = "254715325834";

    function open(card) {
      var name = card.getAttribute("data-name");
      var desc = card.getAttribute("data-desc");
      var cat = card.getAttribute("data-cat-label");
      var message = 'I would like to order "' + name + '"';

      nameEl.textContent = name;
      descEl.textContent = desc;
      catEl.textContent = cat;
      emailEl.setAttribute(
        "href",
        "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Product enquiry — " + name) + "&body=" + encodeURIComponent(message)
      );
      waEl.setAttribute(
        "href",
        "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message)
      );

      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    }

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        open(card);
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- Chat bubble / contact modal ---------- */
  function initChatWidget() {
    var bubbles = document.querySelectorAll("[data-chat-open]");
    var backdrop = document.querySelector("[data-chat-backdrop]");
    var closeBtn = document.querySelector("[data-chat-close]");
    var typing = document.querySelector("[data-chat-typing]");
    var message = document.querySelector("[data-chat-message]");
    var actions = document.querySelector("[data-chat-actions]");
    if (!bubbles.length || !backdrop) return;

    var played = false;

    function playIntro() {
      if (played) return;
      played = true;
      typing.classList.remove("hide");
      message.classList.remove("show");
      actions.classList.remove("show");
      setTimeout(function () {
        typing.classList.add("hide");
        message.classList.add("show");
        actions.classList.add("show");
      }, 900);
    }

    function open() {
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
      playIntro();
    }
    function close() {
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    }

    bubbles.forEach(function (bubble) {
      bubble.addEventListener("click", open);
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    var chatTabs = document.querySelectorAll(".chat-tab-btn");
    var chatPanels = document.querySelectorAll(".chat-tab-panel");
    chatTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        chatTabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        var target = tab.getAttribute("data-chat-tab");
        chatPanels.forEach(function (panel) {
          panel.hidden = panel.getAttribute("data-chat-panel") !== target;
        });
      });
    });
  }

  function playIcon() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }
  function pauseIcon() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  }
})();
