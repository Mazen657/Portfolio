/* ============================================================
   main.js  —  Portfolio (Enhanced)
   ============================================================ */


/* ============================================================
   TYPED.JS — Animated headline
   ============================================================ */
var typed = new Typed(".span7", {
  strings: [
    "",
    "Web Designer",
    "Web Developer",
    "ML Enthusiast",
    "Embedded Linux",
    "Security Curious",
  ],
  typeSpeed  : 80,
  backSpeed  : 45,
  backDelay  : 1800,
  startDelay : 400,
  loop       : true,
});


/* ============================================================
   MOBILE NAVIGATION
   ============================================================ */
const navToggle = document.getElementById("nav-toggle");
const navMenu   = document.getElementById("nav-menu");

// Toggle open / close
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("show-menu");
    navToggle.classList.toggle("active");
    navToggle.setAttribute("aria-expanded", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });
}

// Close when a nav link is clicked
document.querySelectorAll(".nav_link").forEach(link => {
  link.addEventListener("click", closeMenu);
});

// Close when clicking outside the menu
document.addEventListener("click", e => {
  if (navMenu && navMenu.classList.contains("show-menu")) {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      closeMenu();
    }
  }
});

// Close on Escape key
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeMenu();
});

function closeMenu() {
  navMenu.classList.remove("show-menu");
  navToggle.classList.remove("active");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}


/* ============================================================
   SMOOTH SCROLL
   Scrolls to anchored sections while accounting for the fixed
   header height.
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href === "#") return;

    e.preventDefault();

    const target       = document.querySelector(href);
    const headerHeight = document.querySelector(".header")?.offsetHeight || 64;

    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});


/* ============================================================
   ACTIVE NAV LINK ON SCROLL
   Highlights the nav item matching the currently visible
   section using IntersectionObserver.
   ============================================================ */
const sections = document.querySelectorAll("section[id]");
const navLinks  = document.querySelectorAll(".nav_link");

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove("active"));
        const activeLink = document.querySelector(
          `.nav_link[href="#${entry.target.id}"]`
        );
        if (activeLink) activeLink.classList.add("active");
      }
    });
  },
  { threshold: 0.35, rootMargin: "-64px 0px 0px 0px" }
);

sections.forEach(section => sectionObserver.observe(section));


/* ============================================================
   STICKY HEADER SHADOW
   Adds / removes a shadow class as the user scrolls.
   ============================================================ */
const header = document.querySelector(".header");

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("scrolled", window.scrollY > 10),
  { passive: true }
);


/* ============================================================
   SCROLL REVEAL
   Fades-in sections as they enter the viewport.
   ============================================================ */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
);

document
  .querySelectorAll(".skills-card, .project-card, .container1, .about-content, .title")
  .forEach(el => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });


/* ============================================================
   HOME ↔ ABOUT PARALLAX IMAGE
   Animates the profile image panel as the user scrolls
   between the Home and About sections (desktop only).
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < 1024) return;

  const homeSection  = document.getElementById("Home");
  const aboutSection = document.getElementById("About");
  const homeRight    = document.querySelector(".home-right");
  const homeDarkDiv  = document.querySelector(".home-dark-div");
  let moved = false;

  /**
   * Animates an element to a given set of keyframes.
   * @param {Element} el   - Target DOM element
   * @param {object[]} kf  - Web Animations API keyframes
   * @param {number} dur   - Duration in ms
   * @param {number} delay - Delay in ms (default 0)
   */
  function animEl(el, kf, dur, delay = 0) {
    if (!el) return;
    el.animate(kf, {
      duration : dur,
      easing   : "cubic-bezier(0.25, 0.1, 0.25, 1)",
      fill     : "forwards",
      delay,
    });
  }

  // When Home section re-enters → slide image back in
  const homeObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && moved) {
        animEl(homeRight, [
          { transform: "translate(-150%, 100%)" },
          { transform: "translateY(0) translateX(0) scale(1)" },
        ], 1200);
        animEl(homeDarkDiv, [
          { right: "auto", left: "20px", bottom: "0", opacity: 0.8 },
          { right: "-32px", left: "auto", bottom: "0", opacity: 1 },
        ], 1000, 200);
        moved = false;
      }
    });
  }, { threshold: 0.5 });

  // When About section enters → slide image out
  const aboutObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !moved) {
        animEl(homeRight, [
          { transform: "translateY(0) translateX(0) scale(1)" },
          { transform: "translate(-150%, 100%) scale(0.9)" },
        ], 1200);
        animEl(homeDarkDiv, [
          { right: "-32px", left: "auto", bottom: "0", opacity: 1 },
          { right: "auto",  left: "20px", bottom: "0", opacity: 1 },
        ], 1000, 200);
        moved = true;
      }
    });
  }, { threshold: 0.5 });

  if (homeSection)  homeObs.observe(homeSection);
  if (aboutSection) aboutObs.observe(aboutSection);
});


/* ============================================================
   CURSOR GLOW (desktop / pointer devices only)
   A soft radial gradient that lazily follows the cursor.
   ============================================================ */
if (window.matchMedia("(pointer: fine)").matches) {
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let curX   = 0, curY   = 0;

  document.addEventListener(
    "mousemove",
    e => { mouseX = e.clientX; mouseY = e.clientY; },
    { passive: true }
  );

  (function animateCursor() {
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    glow.style.transform = `translate(${curX - 160}px, ${curY - 160}px)`;
    requestAnimationFrame(animateCursor);
  })();
}


/* ============================================================
   STAGGERED CARD REVEALS
   Adds incremental transition delays to skill and project
   cards so they animate in one-by-one.
   ============================================================ */
document.querySelectorAll(".skills-content, .project-content").forEach(grid => {
  Array.from(grid.children).forEach((child, index) => {
    child.style.transitionDelay = `${index * 80}ms`;
  });
});


/* ============================================================
   PROJECT CATEGORY FILTER
   Dynamically builds a filter bar above the project grid and
   shows / hides cards by category with smooth animation.
   Waits for Admin.js to finish its async fetch via
   MutationObserver + a settling debounce.
   ============================================================ */
(function initProjectFilter() {

  const projectGrid    = document.querySelector(".project-content");
  const projectSection = document.getElementById("Projects");
  if (!projectGrid || !projectSection) return;

  let filterBar    = null;   // injected once into the DOM
  let activeFilter = "All";
  let allCards     = [];     // rebuilt each time new cards arrive

  /* ----------------------------------------------------------
     buildFilter
     Reads all project cards from the DOM, extracts their
     categories, and (re-)creates the filter button bar.
  ---------------------------------------------------------- */
  function buildFilter() {
    allCards = Array.from(projectGrid.querySelectorAll(".project-card"));
    if (!allCards.length) return;

    // Tag each card with its pipe-separated category list
    allCards.forEach(card => {
      if (card.dataset.categoriesReady) return; // already processed

      const catEl = card.querySelector(".project-catrgory");
      const raw   = catEl ? catEl.textContent : "";

      // Support comma- or slash-separated values: "Web, Game" / "Web / Game"
      const cats = raw.split(/[,\/]/).map(c => c.trim()).filter(Boolean);

      card.dataset.cats           = cats.join("||");
      card.dataset.categoriesReady = "1";

      // Base transition for show/hide animations
      card.style.transition =
        "opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1), " +
        "width 0s, margin 0s";
    });

    // Collect unique categories in insertion order
    const seen = new Set(["All"]);
    allCards.forEach(card =>
      card.dataset.cats.split("||").forEach(cat => cat && seen.add(cat))
    );
    const categories = Array.from(seen);

    // ── Create or rebuild the filter bar ──────────────────────
    if (filterBar) {
      filterBar.innerHTML = ""; // rebuild buttons only
    } else {
      filterBar = document.createElement("div");
      filterBar.className = "project-filter-bar";
      filterBar.setAttribute("role",       "tablist");
      filterBar.setAttribute("aria-label", "Filter projects by category");

      // Insert right after the section <h2>
      const sectionTitle = projectSection.querySelector(".title");
      sectionTitle
        ? sectionTitle.after(filterBar)
        : projectSection.prepend(filterBar);

      // Delegated click handler (works for dynamically added buttons)
      filterBar.addEventListener("click", e => {
        const btn = e.target.closest(".filter-btn");
        if (!btn || btn.dataset.cat === activeFilter) return;
        applyFilter(btn.dataset.cat);
      });

      // Arrow-key navigation between filter buttons
      filterBar.addEventListener("keydown", e => {
        const btns = Array.from(filterBar.querySelectorAll(".filter-btn"));
        const idx  = btns.indexOf(document.activeElement);
        if (e.key === "ArrowRight" && idx < btns.length - 1) btns[idx + 1].focus();
        if (e.key === "ArrowLeft"  && idx > 0)               btns[idx - 1].focus();
      });
    }

    // Category → icon mapping (extend as needed)
    const iconMap = {
      All      : "✦",
      Website  : "🌐",
      Game     : "🎮",
      Mobile   : "📱",
      Design   : "🎨",
      AI       : "🤖",
      Security : "🔒",
    };

    // Create one button per category
    categories.forEach(cat => {
      const btn  = document.createElement("button");
      const icon = iconMap[cat] || "";
      const isActive = cat === activeFilter;

      btn.className = "filter-btn" + (isActive ? " active" : "");
      btn.dataset.cat = cat;
      btn.setAttribute("role",          "tab");
      btn.setAttribute("aria-selected", isActive ? "true" : "false");

      btn.innerHTML = icon
        ? `<span class="filter-icon">${icon}</span><span>${cat}</span>`
        : `<span>${cat}</span>`;

      filterBar.appendChild(btn);
    });

    // Re-apply the current filter after rebuilding
    applyFilter(activeFilter, /* silent */ true);
  }


  /* ----------------------------------------------------------
     applyFilter
     Shows/hides cards matching `cat` with staggered animation.
     Pass silent = true to skip updating button active states.
  ---------------------------------------------------------- */
  function applyFilter(cat, silent = false) {
    activeFilter = cat;

    // Update button active states
    if (!silent && filterBar) {
      filterBar.querySelectorAll(".filter-btn").forEach(btn => {
        const isActive = btn.dataset.cat === cat;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    const visible = [];
    const hidden  = [];

    allCards.forEach(card => {
      const cardCats = card.dataset.cats ? card.dataset.cats.split("||") : [];
      const show     = cat === "All" || cardCats.includes(cat);
      (show ? visible : hidden).push(card);
    });

    // Collapse hidden cards instantly
    hidden.forEach(card => {
      card.style.transitionDelay = "0ms";
      card.style.opacity         = "0";
      card.style.transform       = "translateY(20px) scale(0.95)";
      card.style.pointerEvents   = "none";
      card.style.position        = "absolute";
      card.style.visibility      = "hidden";
      card.style.width           = "0";
      card.style.overflow        = "hidden";
      card.style.margin          = "0";
      card.style.padding         = "0";
      card.style.minHeight       = "0";
      card.style.border          = "none";
    });

    // Reveal visible cards with staggered entrance
    visible.forEach((card, i) => {
      // Reset collapse styles
      card.style.position   = "";
      card.style.visibility = "";
      card.style.width      = "";
      card.style.overflow   = "";
      card.style.margin     = "";
      card.style.padding    = "";
      card.style.minHeight  = "";
      card.style.border     = "";

      // Staggered entrance
      card.style.transitionDelay = `${i * 60}ms`;
      card.style.opacity         = "1";
      card.style.transform       = "translateY(0) scale(1)";
      card.style.pointerEvents   = "";
    });
  }


  /* ----------------------------------------------------------
     Wait for Admin.js to finish its async fetch.
     Admin.js uses insertAdjacentHTML inside a loop after
     await fetch(), so all cards arrive in a single tick.
     We use MutationObserver + a 150 ms settling debounce so
     buildFilter is only called once they are all in the DOM.
  ---------------------------------------------------------- */
  let settleTimer = null;

  const mutationObserver = new MutationObserver(() => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      mutationObserver.disconnect();
      buildFilter();
    }, 150);
  });

  mutationObserver.observe(projectGrid, { childList: true });

  // Safety fallback — call buildFilter if Admin.js never fires
  const fallbackTimer = setTimeout(() => {
    mutationObserver.disconnect();
    buildFilter();
  }, 5000);

  // Fast path — cards already in DOM (e.g. cached / synchronous render)
  if (projectGrid.querySelector(".project-card")) {
    clearTimeout(fallbackTimer);
    mutationObserver.disconnect();
    buildFilter();
  }

})();
