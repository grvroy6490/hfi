// HFI main script
(function () {
    "use strict";

    const siteHeader = document.querySelector(".site-header");
    const headerNav = document.querySelector(".header-nav");
    const headerMenu = document.getElementById("headerMenu");
    const mobileMegaHost = document.getElementById("mobileMegaContent");
    const sharedBg = document.getElementById("shared-bg");
    const triggers = Array.from(
        document.querySelectorAll(".header-link-trigger[data-menu]")
    );
    const panels = Array.from(document.querySelectorAll(".menu-content"));
    const closeTargets = document.querySelectorAll(
        ".header-links a, .header-account-link, .header-cta, .header-logo"
    );
    const desktopQuery = window.matchMedia("(min-width: 992px)");
    let mobilePanels = [];

    if (!sharedBg || !triggers.length || !panels.length) {
        return;
    }

    let activeMenuId = "";

    const getPanel = (id) => document.getElementById("content-" + id);

    function setExpanded(activeId) {
        triggers.forEach((trigger) => {
            const isActive = trigger.dataset.menu === activeId;
            trigger.setAttribute("aria-expanded", String(isActive));
            trigger.classList.toggle("is-active", isActive);
        });
    }

    function ensureMobilePanels() {
        if (!mobileMegaHost || mobilePanels.length) {
            return;
        }

        mobilePanels = triggers
            .map((trigger) => {
                const menuId = trigger.dataset.menu;
                const sourcePanel = menuId ? getPanel(menuId) : null;

                if (!menuId || !sourcePanel) {
                    return null;
                }

                const clone = sourcePanel.cloneNode(true);
                clone.id = "mobile-content-" + menuId;
                clone.classList.remove("visible");
                clone.classList.add("mobile-menu-panel");
                clone.dataset.mobileMenu = menuId;
                mobileMegaHost.appendChild(clone);
                return clone;
            })
            .filter(Boolean);
    }

    function openMobilePanel(menuId) {
        if (!mobileMegaHost) {
            return;
        }

        ensureMobilePanels();
        const nextPanel = mobilePanels.find(
            (panel) => panel.dataset.mobileMenu === menuId
        );

        if (!nextPanel) {
            return;
        }

        mobilePanels.forEach((panel) => {
            const isActive = panel.dataset.mobileMenu === menuId;
            panel.classList.toggle("visible", isActive);
        });
        const nextScrollArea = nextPanel.querySelector(".mega-menu-container");
        if (nextScrollArea) {
            nextScrollArea.scrollTop = 0;
        }

        setExpanded(menuId);
        activeMenuId = menuId;
    }

    function updateMobileMenuMetrics() {
        if (!siteHeader || !headerNav) {
            return;
        }

        const navRect = headerNav.getBoundingClientRect();
        const menuTop = Math.max(0, Math.round(navRect.bottom));
        siteHeader.style.setProperty("--mobile-menu-top", menuTop + "px");
    }

    function updateDesktopMenuMetrics() {
        if (!siteHeader || !headerNav || !desktopQuery.matches) {
            return;
        }

        const navRect = headerNav.getBoundingClientRect();
        const menuTop = Math.max(0, Math.round(navRect.bottom));
        siteHeader.style.setProperty("--mega-menu-top", menuTop + "px");
    }

    function setMobileMenuOpen(isOpen) {
        if (!siteHeader) {
            return;
        }

        const wasOpen = siteHeader.classList.contains("mobile-menu-open");

        if (isOpen && !wasOpen) {
            updateMobileMenuMetrics();
        }

        siteHeader.classList.toggle("mobile-menu-open", isOpen);
        document.body.classList.toggle("mobile-menu-open", isOpen);

        if (isOpen) {
            openMobilePanel(activeMenuId || triggers[0].dataset.menu);
        }
    }

    function hideMobileCollapseMenu() {
        if (!headerMenu || !headerMenu.classList.contains("show")) {
            return;
        }
        if (window.bootstrap && window.bootstrap.Collapse) {
            window.bootstrap.Collapse.getOrCreateInstance(headerMenu).hide();
            return;
        }
        headerMenu.classList.remove("show");
        setMobileMenuOpen(false);
    }

    function openMenu(menuId) {
        const panel = getPanel(menuId);
        if (!panel) {
            return;
        }

        panels.forEach((item) => item.classList.remove("visible"));
        panel.classList.add("visible");
        sharedBg.classList.add("is-active");
        updateDesktopMenuMetrics();

        setExpanded(menuId);
        activeMenuId = menuId;
    }

    function closeMenu() {
        if (!sharedBg.classList.contains("is-active")) {
            return;
        }

        sharedBg.classList.remove("is-active");

        setExpanded("");
        activeMenuId = "";
    }

    sharedBg.addEventListener("transitionend", (event) => {
        if (event.propertyName !== "transform" && event.propertyName !== "opacity") {
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
                event.preventDefault();
                openMobilePanel(menuId);
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
            if (desktopQuery.matches) {
                closeMenu();
                return;
            }
            hideMobileCollapseMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (desktopQuery.matches && sharedBg.classList.contains("is-active")) {
            updateDesktopMenuMetrics();
        }
        if (!desktopQuery.matches && headerMenu && headerMenu.classList.contains("show")) {
            updateMobileMenuMetrics();
        }
    });

    if (headerMenu) {
        headerMenu.addEventListener("show.bs.collapse", () => {
            if (!desktopQuery.matches) {
                setMobileMenuOpen(true);
            }
        });

        headerMenu.addEventListener("shown.bs.collapse", () => {
            if (!desktopQuery.matches) {
                updateMobileMenuMetrics();
            }
        });

        headerMenu.addEventListener("hide.bs.collapse", () => {
            if (!desktopQuery.matches) {
                setMobileMenuOpen(false);
            }
        });

        headerMenu.addEventListener("hidden.bs.collapse", () => {
            setMobileMenuOpen(false);
        });
    }

    desktopQuery.addEventListener("change", (event) => {
        closeMenu();
        if (event.matches) {
            setMobileMenuOpen(false);
            updateDesktopMenuMetrics();
            return;
        }
        ensureMobilePanels();
    });

    ensureMobilePanels();
    updateDesktopMenuMetrics();
    window.addEventListener("load", updateDesktopMenuMetrics);
})();

// Core capability courses slider
(function () {
    "use strict";

    const sliderEl = document.querySelector(".capability-courses-swiper");
    if (!sliderEl || typeof Swiper === "undefined") {
        return;
    }

    new Swiper(sliderEl, {
        slidesPerView: 1.08,
        spaceBetween: 16,
        speed: 650,
        // grabCursor: true,
        watchOverflow: true,
        pagination: {
            el: ".capability-courses-pagination",
            type: "bullets",
            clickable: true
        },
        navigation: {
            nextEl: ".capability-courses-next",
            prevEl: ".capability-courses-prev"
        },
        breakpoints: {
            576: {
                slidesPerView: 1,
                spaceBetween: 18
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            992: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            1200: {
                slidesPerView: 3,
                spaceBetween: 20
            }
        }
    });
})();

// Logo sliders now use CSS marquee (constant linear motion) – no Swiper init needed

// Certifications slider
(function () {
    "use strict";

    const sliderEl = document.querySelector(".certifications-swiper");
    if (!sliderEl || typeof Swiper === "undefined") {
        return;
    }

    new Swiper(sliderEl, {
        slidesPerView: 1.08,
        spaceBetween: 16,
        speed: 650,
        // grabCursor: true,
        watchOverflow: true,
        pagination: {
            el: ".certifications-pagination",
            type: "bullets",
            clickable: true
        },
        navigation: {
            nextEl: ".certifications-next",
            prevEl: ".certifications-prev"
        },
        breakpoints: {
            576: {
                slidesPerView: 1,
                spaceBetween: 18
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            992: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            1200: {
                slidesPerView: 3,
                spaceBetween: 20
            }
        }
    });
})();

// Experience in practice slider
(function () {
    "use strict";

    const sliderEl = document.querySelector(".experience-practice-swiper");
    if (!sliderEl || typeof Swiper === "undefined") {
        return;
    }

    new Swiper(sliderEl, {
        slidesPerView: 1.08,
        spaceBetween: 16,
        speed: 650,
        watchOverflow: true,
        pagination: {
            el: ".experience-practice-pagination",
            type: "bullets",
            clickable: true
        },
        navigation: {
            nextEl: ".experience-practice-next",
            prevEl: ".experience-practice-prev"
        },
        breakpoints: {
            576: {
                slidesPerView: 1,
                spaceBetween: 18
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            992: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            1200: {
                slidesPerView: 3,
                spaceBetween: 20
            }
        }
    });
})();

// Experience pathway: country code flag (country-flag-icons via jsDelivr CDN)
(function () {
    "use strict";

    const FLAG_CDN = "https://cdn.jsdelivr.net/npm/country-flag-icons/3x2";
    const select = document.getElementById("pathway-country-code");
    if (!select) return;

    const wrap = select.closest(".experience-pathway-country-code-wrap");
    const flagImg = wrap ? wrap.querySelector(".experience-pathway-flag") : null;
    if (!flagImg) return;

    function setFlag() {
        const opt = select.options[select.selectedIndex];
        const iso = opt ? opt.getAttribute("data-iso") : null;
        flagImg.src = iso ? FLAG_CDN + "/" + iso + ".svg" : "";
        flagImg.alt = iso ? "Flag of " + iso : "";
    }

    setFlag();
    select.addEventListener("change", setFlag);
})();
