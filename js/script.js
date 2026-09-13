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
    initStoryViewer();
    initMobileTypewriter();
    initGuard();
  }

  /* ---------- Deter right-click and dev-tools shortcuts ----------
     Note: this only discourages casual copying; it cannot fully
     block anyone determined (disabling JS, browser menus, mobile
     "view source", etc. all still work), and it also blocks the
     right-click / keyboard shortcuts some users and screen readers
     rely on. */
  function initGuard() {
    document.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

    document.addEventListener("keydown", function (e) {
      var key = e.key ? e.key.toUpperCase() : "";
      var blockDevTools =
        key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === "I" || key === "J" || key === "C")) ||
        ((e.ctrlKey || e.metaKey) && key === "U");
      if (blockDevTools) {
        e.preventDefault();
      }
    });
  }

  /* ---------- Mobile-only typewriter effect for the hero heading ---------- */
  function initMobileTypewriter() {
    var heading = document.querySelector("[data-typewriter]");
    if (!heading) return;
    if (!window.matchMedia || !window.matchMedia("(max-width: 900px)").matches) return;

    var original = Array.prototype.slice.call(heading.childNodes);
    var queue = [];
    original.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split("").forEach(function (ch) {
          queue.push({ tag: null, ch: ch });
        });
      } else if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        node.textContent.split("").forEach(function (ch) {
          queue.push({ tag: tag, ch: ch });
        });
      }
    });

    heading.textContent = "";
    heading.classList.add("typing");

    var currentEl = null;
    var currentTag = null;
    var i = 0;

    function step() {
      if (i >= queue.length) {
        heading.classList.remove("typing");
        return;
      }
      var item = queue[i];
      if (item.tag === null) {
        currentEl = null;
        currentTag = null;
        heading.appendChild(document.createTextNode(item.ch));
      } else {
        if (currentTag !== item.tag) {
          currentEl = document.createElement(item.tag);
          heading.appendChild(currentEl);
          currentTag = item.tag;
        }
        currentEl.textContent += item.ch;
      }
      i++;
      setTimeout(step, 38);
    }
    setTimeout(step, 300);
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
    var cards = document.querySelectorAll("[data-service-card]");
    var backdrop = document.querySelector("[data-service-backdrop]");
    if (!cards.length || !backdrop) return;

    var closeBtn = document.querySelector("[data-service-close]");
    var nameEl = document.querySelector("[data-service-name]");
    var descEl = document.querySelector("[data-service-desc]");

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

    if (closeBtn) closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
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
    var imageEl = document.querySelector("[data-product-image]");

    var EMAIL = "malwike.tech@gmail.com";
    var WHATSAPP_NUMBER = "254715325834";

    function open(card) {
      var name = card.getAttribute("data-name");
      var desc = card.getAttribute("data-desc");
      var cat = card.getAttribute("data-cat-label");
      var image = card.getAttribute("data-image");
      var message = 'I would like to order "' + name + '"';

      nameEl.textContent = name;
      descEl.textContent = desc;
      catEl.textContent = cat;
      if (imageEl && image) {
        imageEl.setAttribute("src", image);
        imageEl.setAttribute("alt", name + " packaging placeholder");
      }
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

  /* ---------- Achievement gallery "story" viewer ---------- */
  function initStoryViewer() {
    var triggers = document.querySelectorAll("[data-story-trigger]");
    var backdrop = document.querySelector("[data-story-backdrop]");
    if (!triggers.length || !backdrop) return;

    var imageEl = document.querySelector("[data-story-image]");
    var captionEl = document.querySelector("[data-story-caption]");
    var progressEl = document.querySelector("[data-story-progress]");
    var closeBtn = document.querySelector("[data-story-close]");
    var prevZone = document.querySelector("[data-story-prev]");
    var nextZone = document.querySelector("[data-story-next]");

    var items = Array.prototype.map.call(triggers, function (t) {
      return { image: t.getAttribute("data-image"), label: t.getAttribute("data-label") };
    });
    var current = 0;

    progressEl.innerHTML = items.map(function () { return "<span></span>"; }).join("");
    var segments = progressEl.querySelectorAll("span");

    function render() {
      var item = items[current];
      imageEl.setAttribute("src", item.image);
      imageEl.setAttribute("alt", item.label);
      captionEl.textContent = item.label;
      segments.forEach(function (seg, i) {
        seg.classList.toggle("done", i <= current);
      });
    }
    function open(index) {
      current = index;
      render();
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    }
    function next() {
      if (current < items.length - 1) {
        current += 1;
        render();
      } else {
        close();
      }
    }
    function prev() {
      if (current > 0) {
        current -= 1;
        render();
      }
    }

    triggers.forEach(function (trigger, i) {
      trigger.addEventListener("click", function () {
        open(i);
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (nextZone) nextZone.addEventListener("click", next);
    if (prevZone) prevZone.addEventListener("click", prev);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!backdrop.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
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