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

// All courses listing: dropdown filtering
(function () {
    "use strict";

    var results = document.getElementById("all-courses-results");
    if (!results) return;

    var cards = Array.from(results.querySelectorAll("[data-filter-card]"));
    var programSelect = document.getElementById("all-courses-filter-program");
    var levelSelect = document.getElementById("all-courses-filter-level");
    var topicSelect = document.getElementById("all-courses-filter-topic");
    var emptyState = document.getElementById("all-courses-empty-state");

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function matchesFilter(cardValue, selectedValue) {
        return selectedValue === "all" || normalize(cardValue) === selectedValue;
    }

    function applyFilters() {
        var selectedProgram = normalize(programSelect ? programSelect.value : "all");
        var selectedLevel = normalize(levelSelect ? levelSelect.value : "all");
        var selectedTopic = normalize(topicSelect ? topicSelect.value : "all");
        var visibleCount = 0;

        cards.forEach(function (card) {
            var matchesProgram = matchesFilter(card.getAttribute("data-program"), selectedProgram);
            var matchesLevel = matchesFilter(card.getAttribute("data-level"), selectedLevel);
            var matchesTopic = matchesFilter(card.getAttribute("data-topic"), selectedTopic);
            var isVisible = matchesProgram && matchesLevel && matchesTopic;

            card.hidden = !isVisible;
            if (isVisible) visibleCount += 1;
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    [programSelect, levelSelect, topicSelect].forEach(function (control) {
        if (!control) return;
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
    });

    applyFilters();
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

// Upcoming CUA Tracks: timezone dropdown
(function () {
    "use strict";

    const trigger = document.getElementById("upcoming-tracks-timezone-trigger");
    const listbox = document.getElementById("upcoming-tracks-timezone-listbox");
    const nativeSelect = document.getElementById("upcoming-tracks-timezone-select");
    const triggerText = trigger ? trigger.querySelector(".upcoming-tracks-timezone-trigger-text") : null;

    if (!trigger || !listbox || !nativeSelect || !triggerText) return;

    function open() {
        trigger.setAttribute("aria-expanded", "true");
        listbox.removeAttribute("hidden");
        var selected = listbox.querySelector("[aria-selected=\"true\"]");
        if (selected && selected.focus) selected.focus();
    }

    function close() {
        trigger.setAttribute("aria-expanded", "false");
        listbox.setAttribute("hidden", "");
        trigger.focus();
    }

    function setValue(value, label) {
        const opt = nativeSelect.querySelector("option[value=\"" + value + "\"]");
        if (opt) {
            opt.selected = true;
            nativeSelect.value = value;
        }
        triggerText.textContent = label || (opt ? opt.textContent : value);
        listbox.querySelectorAll("[role=\"option\"]").forEach(function (el) {
            var isSelected = el.getAttribute("data-value") === value;
            el.setAttribute("aria-selected", isSelected ? "true" : "false");
            el.setAttribute("tabindex", isSelected ? "0" : "-1");
        });
        nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }

    trigger.addEventListener("click", function (e) {
        e.preventDefault();
        if (trigger.getAttribute("aria-expanded") === "true") {
            close();
        } else {
            open();
        }
    });

    trigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault();
            if (trigger.getAttribute("aria-expanded") !== "true") open();
        }
    });

    listbox.addEventListener("click", function (e) {
        const option = e.target.closest("[role=\"option\"]");
        if (!option) return;
        var value = option.getAttribute("data-value");
        var label = option.textContent.trim();
        setValue(value, label);
        close();
    });

    listbox.addEventListener("keydown", function (e) {
        var options = Array.from(listbox.querySelectorAll("[role=\"option\"]"));
        var current = listbox.querySelector("[aria-selected=\"true\"]");
        var idx = current ? options.indexOf(current) : -1;

        if (e.key === "Escape") {
            close();
            e.preventDefault();
            return;
        }
        if (e.key === "ArrowDown" && idx < options.length - 1) {
            idx += 1;
            e.preventDefault();
            options[idx].focus();
            return;
        }
        if (e.key === "ArrowUp" && idx > 0) {
            idx -= 1;
            e.preventDefault();
            options[idx].focus();
            return;
        }
        if ((e.key === "Enter" || e.key === " ") && current) {
            setValue(current.getAttribute("data-value"), current.textContent.trim());
            close();
            e.preventDefault();
        }
    });

    document.addEventListener("click", function (e) {
        if (trigger.getAttribute("aria-expanded") === "true" && !trigger.contains(e.target) && !listbox.contains(e.target)) {
            close();
        }
    });
})();

// What You'll Learn in CUA: accordion — only one open at a time
(function () {
    "use strict";
    function initLearnAccordion() {
        var accordion = document.querySelector(".what-you-ll-learn-accordion");
        if (!accordion) return;
        var items = accordion.querySelectorAll(".what-you-ll-learn-accordion-item");
        items.forEach(function (details) {
            details.addEventListener("toggle", function () {
                if (details.hasAttribute("open")) {
                    items.forEach(function (other) {
                        if (other !== details) {
                            other.removeAttribute("open");
                        }
                    });
                }
            });
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLearnAccordion);
    } else {
        initLearnAccordion();
    }
})();

// Industry Pioneers: hover expand (70% / 15% / 15%) — only >= 768px
(function () {
    "use strict";
    var PIONEERS_MEDIA = "(min-width: 768px)";

    function initIndustryPioneers() {
        var grid = document.getElementById("industry-pioneers-grid");
        if (!grid) return;
        var cards = grid.querySelectorAll(".industry-pioneers-card");
        var hoverHandlersAttached = false;

        function removeAllExpanded() {
            for (var i = 0; i < cards.length; i++) {
                cards[i].classList.remove("is-expanded");
            }
        }
        function clearExpanded() {
            grid.classList.remove("has-hover");
            removeAllExpanded();
            if (cards[0]) {
                cards[0].classList.add("is-expanded");
            }
        }
        function setExpanded(card) {
            removeAllExpanded();
            grid.classList.add("has-hover");
            card.classList.add("is-expanded");
        }

        function onMouseOver(e) {
            if (!window.matchMedia(PIONEERS_MEDIA).matches) return;
            var card = e.target.closest(".industry-pioneers-card");
            if (card && grid.contains(card)) {
                setExpanded(card);
            }
        }
        function onMouseLeave() {
            if (!window.matchMedia(PIONEERS_MEDIA).matches) return;
            clearExpanded();
        }

        function attachHoverHandlers() {
            if (hoverHandlersAttached) return;
            grid.addEventListener("mouseover", onMouseOver);
            grid.addEventListener("mouseleave", onMouseLeave);
            hoverHandlersAttached = true;
        }
        function detachHoverHandlers() {
            if (!hoverHandlersAttached) return;
            grid.removeEventListener("mouseover", onMouseOver);
            grid.removeEventListener("mouseleave", onMouseLeave);
            hoverHandlersAttached = false;
        }

        function updateHoverState() {
            if (window.matchMedia(PIONEERS_MEDIA).matches) {
                attachHoverHandlers();
            } else {
                detachHoverHandlers();
                clearExpanded();
            }
        }

        clearExpanded();
        updateHoverState();
        var mql = window.matchMedia(PIONEERS_MEDIA);
        if (mql.addEventListener) {
            mql.addEventListener("change", updateHoverState);
        } else if (mql.addListener) {
            mql.addListener(updateHoverState);
        }
        window.addEventListener("resize", updateHoverState);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initIndustryPioneers);
    } else {
        initIndustryPioneers();
    }
})();
