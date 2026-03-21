// HFI main script

// Smooth scroll for in-page anchor links
(function () {
    "use strict";
    document.addEventListener("click", function (e) {
        var link = e.target.closest('a[href^="#"]');
        if (!link || link.getAttribute("href") === "#") return;
        var id = link.getAttribute("href").slice(1);
        var target = id ? document.getElementById(id) : null;
        if (target) {
        // Allow our custom toggle handler for the advisor form to control scrolling.
        if (id === "certification-usability-analyst-advisor-form-wrap") {
            e.preventDefault();
            return;
        }
        e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
})();

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

// Global selects: Choices.js
(function () {
    "use strict";

    if (typeof Choices === "undefined") return;

    // Exclude timezone custom dropdown's native select (hidden, synced by custom trigger/listbox)
    var selects = document.querySelectorAll("select:not(.upcoming-tracks-timezone-select-native):not(.experience-pathway-select):not(.experience-pathway-country-code)");
    // Exclude selects that have their own custom UI/behavior.
    var selects = document.querySelectorAll(
        "select:not(.upcoming-tracks-timezone-select-native):not(#pathway-country-code)"
    );
    Array.from(selects).forEach(function (select) {
        if (select.dataset.choicesInitialized === "true") return;

        new Choices(select, {
            allowHTML: false,
            searchEnabled: false,
            shouldSort: false,
            itemSelectText: "",
            position: "bottom"
        });

        select.dataset.choicesInitialized = "true";
    });
})();

// Course calendar: interactive schedule
(function () {
    "use strict";

    var section = document.querySelector(".course-calendar-section");
    if (!section) return;

    var monthGrid = section.querySelector(".course-calendar-month-grid");
    var yearLabel = section.querySelector(".course-calendar-year");
    var content = section.querySelector(".course-calendar-content");
    var timezoneSelect = document.getElementById("course-calendar-timezone-select");
    var filterSelects = section.querySelectorAll(".course-calendar-filter-select");
    var certificationSelect = filterSelects[0] || null;
    var courseSelect = filterSelects[1] || null;

    // Timezone functionality disabled: always use fixed timezone
    var FIXED_TIMEZONE = "America/Los_Angeles";

    if (!monthGrid || !yearLabel || !content) return;

    var MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var sessions = [
        { type: "certification", code: "cua", course: "all", label: "Certified Usability Architect (CUA)", price: 48000, start: "2026-03-08T16:00:00Z", end: "2026-03-08T19:30:00Z", registrationDeadline: "2026-02-25", href: "cua-certification.html" },
        { type: "certification", code: "cdpa", course: "all", label: "Certified Digital Persuasion Architect (CDPA)", price: 52000, start: "2026-03-08T20:00:00Z", end: "2026-03-08T23:00:00Z", registrationDeadline: "2026-03-01", href: "#" },
        { type: "course", code: "all", course: "science-of-experience-design", label: "Science of Experience Design", price: 48000, start: "2026-03-24T15:30:00Z", end: "2026-03-24T18:30:00Z", registrationDeadline: "2026-03-10", href: "courses-science.html" },
        { type: "course", code: "all", course: "experience-research-strategy", label: "Experience Research & Strategy", price: 36000, start: "2026-03-29T14:00:00Z", end: "2026-03-29T17:00:00Z", registrationDeadline: "2026-03-15", href: "#" },
        { type: "course", code: "all", course: "interface-design-systems", label: "Interface Design & Design Systems", price: 39000, start: "2026-04-12T16:00:00Z", end: "2026-04-12T19:00:00Z", registrationDeadline: "2026-03-30", href: "#" },
        { type: "certification", code: "cxa", course: "all", label: "Certified Experience Architect (CXA)", price: 58000, start: "2026-05-06T13:30:00Z", end: "2026-05-06T17:30:00Z", registrationDeadline: "2026-04-22", href: "#" },
        { type: "certification", code: "cua", course: "all", label: "Certified Usability Architect (CUA)", price: 48000, start: "2026-09-14T15:00:00Z", end: "2026-09-14T18:30:00Z", registrationDeadline: "2026-08-31", href: "cua-certification.html" },
        { type: "course", code: "all", course: "science-of-experience-design", label: "Science of Experience Design", price: 48000, start: "2026-11-18T17:00:00Z", end: "2026-11-18T20:00:00Z", registrationDeadline: "2026-11-02", href: "courses-science.html" },
        { type: "certification", code: "cdpa", course: "all", label: "Certified Digital Persuasion Architect (CDPA)", price: 52000, start: "2027-01-21T16:30:00Z", end: "2027-01-21T19:30:00Z", registrationDeadline: "2027-01-07", href: "#" },
        { type: "course", code: "all", course: "interface-design-systems", label: "Interface Design & Design Systems", price: 39000, start: "2027-02-11T14:30:00Z", end: "2027-02-11T17:30:00Z", registrationDeadline: "2027-01-28", href: "#" }
    ];

    var state = {
        year: 2026,
        month: 2,
        timezone: FIXED_TIMEZONE
    };

    function getDateInfo(dateValue) {
        var date = new Date(dateValue);
        var formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: state.timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
        var parts = formatter.formatToParts(date).reduce(function (acc, part) {
            if (part.type !== "literal") acc[part.type] = part.value;
            return acc;
        }, {});

        return {
            year: Number(parts.year),
            month: Number(parts.month) - 1,
            day: Number(parts.day)
        };
    }

    function formatParts(dateValue, timeZone) {
        var date = new Date(dateValue);
        var formatter = new Intl.DateTimeFormat("en-GB", {
            timeZone: timeZone,
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        return formatter.formatToParts(date).reduce(function (acc, part) {
            if (part.type !== "literal") acc[part.type] = part.value;
            return acc;
        }, {});
    }

    function formatGroupDate(dateValue, timeZone) {
        var parts = formatParts(dateValue, timeZone);
        return parts.day + " " + parts.month + " " + parts.year;
    }

    function formatDeadlineDate(dateValue) {
        var safeDate = new Date(dateValue + "T12:00:00Z");
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(safeDate); 
    }

    function formatTimeRange(startValue, endValue, timeZone) {
        function render(value) {
            var parts = formatParts(value, timeZone);
            return parts.hour + "." + parts.minute + " " + parts.dayPeriod.toLowerCase();
        }
        return render(startValue) + " - " + render(endValue);
    }

    function formatPrice(value) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(value);
    }

    function getFilteredItems() {
        var selectedCertification = certificationSelect ? certificationSelect.value : "all";
        var selectedCourse = courseSelect ? courseSelect.value : "all";

        return sessions.filter(function (item) {
            var localStart = getDateInfo(item.start);
            var matchesMonth = localStart.year === state.year && localStart.month === state.month;
            var matchesCertification = selectedCertification === "all" || item.code === selectedCertification;
            var matchesCourse = selectedCourse === "all" || item.course === selectedCourse;
            return matchesMonth && matchesCertification && matchesCourse;
        }).sort(function (a, b) {
            return new Date(a.start) - new Date(b.start);
        });
    }

    function getYears() {
        var years = sessions.map(function (item) {
            return getDateInfo(item.start).year;
        });
        return Array.from(new Set(years)).sort();
    }

    function getAvailableMonths(year) {
        var months = sessions.map(function (item) {
            return item.start;
        }).filter(function (itemStart) {
            return getDateInfo(itemStart).year === year;
        }).map(function (itemStart) {
            return getDateInfo(itemStart).month;
        });

        return Array.from(new Set(months)).sort(function (a, b) { return a - b; });
    }

    function ensureValidSelection() {
        var years = getYears();
        if (years.indexOf(state.year) === -1) {
            state.year = years[0];
        }

        var availableMonths = getAvailableMonths(state.year);
        if (availableMonths.indexOf(state.month) === -1) {
            state.month = availableMonths[0];
        }
    }

    function renderMonths() {
        var availableMonths = getAvailableMonths(state.year);
        monthGrid.innerHTML = MONTH_NAMES.map(function (label, index) {
            var isAvailable = availableMonths.indexOf(index) !== -1;
            var isActive = state.month === index;
            return [
                "<button type=\"button\" class=\"course-calendar-month body-small",
                isActive ? " is-active" : "",
                "\" data-month=\"", index, "\" role=\"tab\" aria-selected=\"", isActive ? "true" : "false",
                "\"", isAvailable ? "" : " disabled", ">",
                label,
                "</button>"
            ].join("");
        }).join("");
    }

    function renderResults() {
        var items = getFilteredItems();
        var grouped = items.reduce(function (acc, item) {
            var key = formatGroupDate(item.start, state.timezone);
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});

        var html = "";
        Object.keys(grouped).forEach(function (dateKey) {
            html += "<div class=\"course-calendar-date-group\">";
            html += "<h2 class=\"course-calendar-date heading-6\">" + dateKey + "</h2>";
            html += "<div class=\"course-calendar-list\">";

            grouped[dateKey].forEach(function (item) {
                html += "<article class=\"course-calendar-item\">";
                html += "<div class=\"course-calendar-item-main\">";
                html += "<div class=\"course-calendar-item-course\">";
                html += "<p class=\"course-calendar-item-type caption\">" + item.type.toUpperCase() + "</p>";
                html += "<h3 class=\"course-calendar-item-title body\">" + item.label + "</h3>";
                html += "</div>";
                html += "<div class=\"course-calendar-item-schedule\">";
                html += "<p class=\"course-calendar-item-meta body-small\"><span class=\"course-calendar-item-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M7 3V6M17 3V6M4 9H20M5 5H19C19.5523 5 20 5.44772 20 6V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V6C4 5.44772 4.44772 5 5 5Z\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></span>" + formatDeadlineDate(item.registrationDeadline) + "</p>";
                html += "<p class=\"course-calendar-item-meta body-small\"><span class=\"course-calendar-item-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><circle cx=\"12\" cy=\"12\" r=\"8\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M12 8V12L14.5 14.5\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></span>" + formatTimeRange(item.start, item.end, state.timezone) + "</p>";
                html += "</div>";
                html += "</div>";
                html += "<div class=\"course-calendar-item-side\">";
                html += "<p class=\"course-calendar-item-price heading-6\">" + formatPrice(item.price) + "</p>";
                html += "<a href=\"" + item.href + "\" class=\"course-calendar-item-cta hero-btn hero-btn-secondary body-small\">Register</a>";
                html += "</div>";
                html += "</article>";
            });

            html += "</div></div>";
        });

        var summary = items.length === 1 ? "1 session in " + MONTH_NAMES[state.month] + " " + state.year : items.length + " sessions in " + MONTH_NAMES[state.month] + " " + state.year;
        content.innerHTML = [
            "<div class=\"course-calendar-results-header\">",
            "<p class=\"course-calendar-results-label caption\">Schedule</p>",
            "<p class=\"course-calendar-results-summary body-small\" aria-live=\"polite\">", summary, "</p>",
            "</div>",
            html || "<div class=\"course-calendar-empty-state\"><h2 class=\"course-calendar-empty-title heading-6\">No programs found</h2><p class=\"course-calendar-empty-copy body-small\">Try another month or clear one of the filters to see more sessions.</p></div>"
        ].join("");
    }

    function render() {
        ensureValidSelection();
        yearLabel.textContent = state.year;
        renderMonths();
        // renderResults();
    }

    function moveYear(direction) {
        var years = getYears();
        var index = years.indexOf(state.year);
        var nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= years.length) return;
        state.year = years[nextIndex];
        state.month = getAvailableMonths(state.year)[0];
        render();
    }

    var monthCard = section.querySelector(".course-calendar-month-card");
    if (monthCard && !section.querySelector(".course-calendar-month-card-header")) {
        var originalYearLabel = yearLabel;
        monthCard.insertAdjacentHTML(
            "afterbegin",
            "<div class=\"course-calendar-month-card-header\"><div class=\"course-calendar-year body-small\"></div><div class=\"course-calendar-nav-btns\"><button type=\"button\" class=\"course-calendar-nav-btn\" data-year-nav=\"prev\" aria-label=\"Show previous year\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" aria-hidden=\"true\"><path d=\"M15 6 9 12l6 6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /></svg></button><button type=\"button\" class=\"course-calendar-nav-btn\" data-year-nav=\"next\" aria-label=\"Show next year\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" aria-hidden=\"true\"><path d=\"m9 6 6 6-6 6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" /></svg></button></div></div>"
        );
        yearLabel = monthCard.querySelector(".course-calendar-year");
        if (originalYearLabel && originalYearLabel.parentNode) {
            originalYearLabel.parentNode.removeChild(originalYearLabel);
        }
    }

    section.addEventListener("click", function (event) {
        var monthButton = event.target.closest(".course-calendar-month");
        var yearButton = event.target.closest("[data-year-nav]");

        if (monthButton && monthButton.hasAttribute("data-month") && !monthButton.disabled) {
            state.month = Number(monthButton.getAttribute("data-month"));
            render();
        }

        if (yearButton) {
            moveYear(yearButton.getAttribute("data-year-nav") === "prev" ? -1 : 1);
        }
    });

    [certificationSelect, courseSelect].forEach(function (select) {
        if (!select) return;
        select.addEventListener("change", render);
    });

    render();
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

// Checkout: multistep form shell
(function () {
    "use strict";

    var flow = document.querySelector("[data-checkout-flow]");
    if (!flow) return;

    var panels = Array.from(flow.querySelectorAll("[data-step-panel]"));
    var stepItems = Array.from(flow.querySelectorAll("[data-step-nav]"));
    var stepButtons = Array.from(flow.querySelectorAll("[data-step-trigger]"));
    var nextButtons = Array.from(flow.querySelectorAll("[data-step-next]"));
    var backButtons = Array.from(flow.querySelectorAll("[data-step-back]"));
    var summaryCta = flow.querySelector(".checkout-summary-cta");
    var backLink = flow.querySelector("[data-checkout-back]");
    var currentStep = 0;
    var summaryStepConfig = [
        { target: 1, label: "Continue to Secure your Seat" },
        { target: 2, label: "Proceed to Checkout" },
        { target: 3, label: "Complete Enrollment" },
        { target: null, label: "Enrollment Confirmed" }
    ];

    function clampStep(step) {
        return Math.max(0, Math.min(step, panels.length - 1));
    }

    function setStep(step) {
        currentStep = clampStep(step);

        panels.forEach(function (panel, index) {
            var isActive = index === currentStep;
            panel.classList.toggle("is-active", isActive);
            panel.hidden = !isActive;
        });

        stepItems.forEach(function (item, index) {
            var button = item.querySelector(".checkout-step-button");
            var isActive = index === currentStep;
            var isComplete = index < currentStep;

            item.classList.toggle("is-active", isActive);
            item.classList.toggle("is-complete", isComplete);

            if (button) {
                if (isActive) {
                    button.setAttribute("aria-current", "step");
                } else {
                    button.removeAttribute("aria-current");
                }
            }
        });

        if (summaryCta) {
            var config = summaryStepConfig[currentStep] || summaryStepConfig[0];
            summaryCta.textContent = config.label;

            if (typeof config.target === "number") {
                summaryCta.hidden = false;
                summaryCta.setAttribute("data-step-trigger", String(config.target));
            } else {
                summaryCta.hidden = true;
                summaryCta.removeAttribute("data-step-trigger");
            }
        }

        if (backLink) {
            backLink.setAttribute("href", currentStep === 0 ? "all-courses.html" : "#");
        }
    }

    stepButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var target = Number(button.getAttribute("data-step-trigger"));
            if (!Number.isNaN(target)) {
                setStep(target);
            }
        });
    });

    nextButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            setStep(currentStep + 1);
        });
    });

    backButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            setStep(currentStep - 1);
        });
    });

    if (backLink) {
        backLink.addEventListener("click", function (event) {
            if (currentStep > 0) {
                event.preventDefault();
                setStep(currentStep - 1);
            }
        });
    }

    setStep(0);
})();
// CUA journey timeline: auto-run steps (checkboxes) sequentially once.
(function () {
    "use strict";

    var timeline = document.querySelector(".your-cua-journey-timeline");
    if (!timeline) return;

    var checkboxes = Array.from(timeline.querySelectorAll(".your-cua-journey-checkbox"));
    if (!checkboxes.length) return;

    var hasRun = false;
    var stepDelayMs = 600;

    function activateSequential() {
        if (hasRun) return;
        hasRun = true;

        checkboxes.forEach(function (checkbox, idx) {
            window.setTimeout(function () {
                if (!checkbox) return;
                if (!checkbox.checked) {
                    checkbox.checked = true;
                    // Fire change so any listeners/styles relying on it update.
                    checkbox.dispatchEvent(
                        new Event("change", { bubbles: true })
                    );
                }
            }, idx * stepDelayMs);
        });
    }

    // Start ONLY on first mouseover of the timeline.
    function start() {
        activateSequential();
    }

    timeline.addEventListener("mouseover", start, { once: true });
})();

// Certified Usability Analyst: advisor form toggle (hidden -> show on click)
(function () {
    "use strict";

    document.addEventListener("click", function (e) {
        var trigger = e.target.closest("#certification-usability-analyst-advisor-trigger");
        if (!trigger) return;

        var formWrap = document.getElementById("certification-usability-analyst-advisor-form-wrap");
        if (!formWrap) return;

        e.preventDefault();
        e.stopPropagation();

        formWrap.classList.toggle("show");

    });
})();
