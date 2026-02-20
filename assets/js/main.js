// HFI main script
(function () {
  "use strict";

  const sharedBg = document.getElementById("shared-bg");
  const sharedBgInner = sharedBg ? sharedBg.querySelector(".container") : null;
  const triggers = Array.from(
    document.querySelectorAll(".header-link-trigger[data-menu]")
  );
  const panels = Array.from(document.querySelectorAll(".menu-content"));
  const closeTargets = document.querySelectorAll(
    ".header-links a, .header-account-link, .header-cta, .header-logo"
  );
  const desktopQuery = window.matchMedia("(min-width: 992px)");

  if (!sharedBg || !triggers.length || !panels.length) {
    return;
  }

  let activeMenuId = "";

  const getPanel = (id) => document.getElementById("content-" + id);

  function setExpanded(activeId) {
    triggers.forEach((trigger) => {
      const isActive = trigger.dataset.menu === activeId;
      trigger.setAttribute("aria-expanded", String(isActive));
    });
  }

  function syncHeight() {
    const nextHeight = sharedBgInner
      ? sharedBgInner.scrollHeight
      : sharedBg.scrollHeight;

    if (!sharedBg.classList.contains("is-active")) {
      sharedBg.style.height = "0px";
      return;
    }
    sharedBg.style.height = nextHeight + "px";
  }

  function openMenu(menuId) {
    const panel = getPanel(menuId);
    if (!panel) {
      return;
    }

    panels.forEach((item) => item.classList.remove("visible"));
    panel.classList.add("visible");
    sharedBg.classList.add("is-active");

    setExpanded(menuId);
    activeMenuId = menuId;

    sharedBg.style.height = sharedBg.offsetHeight + "px";
    requestAnimationFrame(() => {
      requestAnimationFrame(syncHeight);
    });
  }

  function closeMenu() {
    if (!sharedBg.classList.contains("is-active")) {
      return;
    }

    const currentHeight = sharedBgInner
      ? sharedBgInner.scrollHeight
      : sharedBg.scrollHeight;
    sharedBg.style.height = currentHeight + "px";
    requestAnimationFrame(() => {
      sharedBg.style.height = "0px";
      sharedBg.classList.remove("is-active");
    });

    setExpanded("");
    activeMenuId = "";
  }

  sharedBg.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "height") {
      return;
    }
    if (sharedBg.classList.contains("is-active")) {
      return;
    }
    panels.forEach((panel) => panel.classList.remove("visible"));
  });

  triggers.forEach((trigger) => {
    const menuId = trigger.dataset.menu;
    if (!menuId) {
      return;
    }

    trigger.addEventListener("mouseenter", () => {
      if (desktopQuery.matches) {
        openMenu(menuId);
      }
    });

    trigger.addEventListener("click", (event) => {
      if (!desktopQuery.matches) {
        return;
      }
      event.preventDefault();
      if (activeMenuId === menuId) {
        closeMenu();
      } else {
        openMenu(menuId);
      }
    });
  });

  closeTargets.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      if (desktopQuery.matches) {
        closeMenu();
      }
    });
  });

  sharedBg.addEventListener("mouseleave", () => {
    if (desktopQuery.matches) {
      closeMenu();
    }
  });

  document.addEventListener("mouseover", (event) => {
    if (!desktopQuery.matches) {
      return;
    }
    if (!event.target.closest(".site-header")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (desktopQuery.matches && activeMenuId) {
      syncHeight();
    }
  });

  desktopQuery.addEventListener("change", closeMenu);
  sharedBg.style.height = "0px";
})();

// Logo slider (Swiper)
(function () {
  "use strict";
  if (typeof Swiper === "undefined") return;
  const logoSlider = document.querySelector(".logo-swiper");
  if (logoSlider) {
    new Swiper(".logo-swiper", {
      spaceBetween: 40,
      loop: true,
      speed: 600,
      autoplay: { delay: 2000, disableOnInteraction: false },
      breakpoints: {
        320: { slidesPerView: 2, spaceBetween: 24 },
        576: { slidesPerView: 3, spaceBetween: 32 },
        768: { slidesPerView: 4, spaceBetween: 40 },
        992: { slidesPerView: 5, spaceBetween: 48 },
      },
    });
  }
  const heroLogoSlider = document.querySelector(".hero-logo-swiper");
  if (heroLogoSlider) {
    new Swiper(".hero-logo-swiper", {
      spaceBetween: 40,
      loop: true,
      speed: 600,
      autoplay: { delay: 2000, disableOnInteraction: false },
      breakpoints: {
        320: { slidesPerView: 2, spaceBetween: 24 },
        576: { slidesPerView: 3, spaceBetween: 32 },
        768: { slidesPerView: 4, spaceBetween: 40 },
        992: { slidesPerView: 5, spaceBetween: 48 },
      },
    });
  }
})();
