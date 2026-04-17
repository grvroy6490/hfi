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

// About page: stats counter animation
(function () {
    "use strict";

    var section = document.querySelector(".about-stats-counter-section");
    if (!section) return;

    var counters = Array.from(section.querySelectorAll(".about-stats-counter-card-title"));
    if (!counters.length) return;

    function parseCounterValue(text) {
        var raw = (text || "").trim().toUpperCase();
        var plus = raw.includes("+");
        var isK = raw.includes("K");
        var numeric = parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;
        var target = isK ? numeric * 1000 : numeric;

        return {
            target: target,
            plus: plus,
            isK: isK
        };
    }

    function formatCounterValue(value, meta) {
        var rounded = Math.round(value);
        var display = meta.isK ? (rounded / 1000).toFixed(0) + "K" : String(rounded);
        return meta.plus ? display + "+" : display;
    }

    function animateCounter(el) {
        var meta = parseCounterValue(el.textContent);
        if (!meta.target) return;

        var duration = 1300;
        var start = performance.now();

        function tick(now) {
            var progress = Math.min((now - start) / duration, 1);
            // easeOutCubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = meta.target * eased;
            el.textContent = formatCounterValue(current, meta);

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    function runCounters() {
        counters.forEach(function (el) {
            animateCounter(el);
        });
    }

    if (!("IntersectionObserver" in window)) {
        runCounters();
        return;
    }

    var hasRun = false;
    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting || hasRun) return;
                hasRun = true;
                runCounters();
                observer.disconnect();
            });
        },
        {
            threshold: 0.35,
            rootMargin: "0px 0px -10% 0px"
        }
    );

    observer.observe(section);
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
        slidesPerGroup: 1,
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
                slidesPerGroup: 1,
                spaceBetween: 18
            },
            768: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 20
            },
            992: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 20
            },
            1200: {
                slidesPerView: 3,
                slidesPerGroup: 3,
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
        slidesPerGroup: 1,
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
                slidesPerGroup: 1,
                spaceBetween: 18
            },
            768: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 20
            },
            992: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 20
            },
            1200: {
                slidesPerView: 3,
                slidesPerGroup: 3,
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

    // Populate testimonial slides (keeps the existing SVGs and avatar image).
    const swiperWrapper = sliderEl.querySelector(".swiper-wrapper");
    const templateSlide = swiperWrapper ? swiperWrapper.querySelector(".swiper-slide") : null;

    function setSlideText(slideEl, testimonial) {
        const quoteEl = slideEl.querySelector(".experience-practice-quote");
        const authorEl = slideEl.querySelector(".experience-practice-author");
        const designationEl = slideEl.querySelector(".experience-practice-designation");
        const companyEl = slideEl.querySelector(".experience-practice-company");
        const avatarEl = slideEl.querySelector(".experience-practice-avatar img");

        if (quoteEl) {
            const startSvg = quoteEl.querySelector("svg.start_quote");
            const endSvg = quoteEl.querySelector("svg.end_quote");
            if (startSvg && endSvg) {
                // Replace only the text between the existing SVGs.
                const quoteText = (testimonial.quote || "").trim();
                quoteEl.innerHTML = "";
                quoteEl.appendChild(startSvg);
                quoteEl.appendChild(document.createTextNode(quoteText));
                if (quoteText) {
                    // Keep the closing quote with the quote text (avoid orphan wrap).
                    quoteEl.appendChild(document.createTextNode("\u00A0"));
                }
                quoteEl.appendChild(endSvg);
            }
        }

        if (authorEl) {
            authorEl.innerHTML = "";
            if (testimonial.name) {
                const dashSpan = document.createElement("span");
                dashSpan.setAttribute("aria-hidden", "true");
                dashSpan.textContent = "—";
                authorEl.appendChild(dashSpan);
                authorEl.appendChild(document.createTextNode(" " + testimonial.name));
            }
        }

        if (avatarEl) {
            avatarEl.src = "./assets/images/" + testimonial.image || "";
        }

        if (designationEl) {
            designationEl.textContent = testimonial.designation || "";
        }
        if (companyEl) {
            companyEl.textContent = testimonial.company || "";
        }
    }

    if (swiperWrapper && templateSlide) {
        const testimonials = [
            {
                name: "Shalaka Sathaye",
                designation: "Senior Specialist - UX",
                company: "SunGard",
                image: "testimonial-avator.jpg",
                regionPage: "index.html",
                quote: "HFI transformed my approach to design, making it more structured and focused on usability. I only wish I had started earlier."
            },
            {
                name: "Amol Jambhekar",
                designation: "UX Engineer",
                company: "Index Engines",
                image: "amoljambhekar.jpg",
                regionPage: "index.html",
                quote: "The support and learning experience strengthened my skills significantly, and I look forward to continuing the journey."
            },
            {
                name: "Sujeesh Sukumaran",
                designation: "Founder",
                company: "Pepper Wellness, PVT LTD",
                image: "Sujeesh-Sukumaran.jpg",
                regionPage: "index.html",
                quote: "My approach is now systematic and user-driven. I rely less on instinct and more on research and validation."
            },
            {
                name: "Sandesh Subedi",
                designation: "Co-founder",
                company: "ProCreator - Global Design Agency & ProApp",
                image: "Sandesh-Subedi.jpg",
                regionPage: "index.html",
                quote: "HFI helped me turn curiosity into real capability. I now design with deeper user understanding and communicate ideas with confidence."
            },
            {
                name: "Bony John",
                designation: "Asst. UI/UX Design Manager",
                company: "HT Digital Systems",
                image: "BonyJohn.jpg",
                regionPage: "index.html",
                quote: "A valuable experience with strong expertise, inspiring peers, and meaningful learning that brought me closer to my goals."
            },
            {
                name: "Joydeep MItra",
                designation: "Associate Director UX",
                company: "Kyndryl Vital Studios",
                image: "JoydeepMitra.jpg",
                regionPage: "index.html",
                quote: "HFI stands out as a credible leader in experience design. The learning strengthened both my foundation and the quality of my work."
            },
            {
                name: "Pragya Jawar",
                designation: "UX Professional",
                company: "",
                image: "PragyaJhawar.jpg",
                regionPage: "index.html",
                quote: "The experience exceeded my expectations. I gained clarity, confidence, and the ability to justify decisions with solid reasoning."
            },
            {
                name: "Leena Khatri",
                designation: "Senior User Experience Designer",
                company: "SAPS Labs",
                image: "LeenaKhatri.jpg",
                regionPage: "index.html",
                quote: "I now have a structured foundation that helps me refine processes, mentor others, and contribute more effectively to experience strategy."
            },
            {
                name: "Anishka Gurjar",
                designation: "Principal User Experience Designer",
                company: "UBS",
                image: "Anishka-Gurjar.jpg",
                regionPage: "index.html",
                quote: "The learning helped me think beyond individual interactions and identify high-impact opportunities within complex systems."
            },
            {
                name: "Sathish Sankaraiah",
                designation: "Advisor - Experience Design Strategy",
                company: "Innova Solutions",
                image: "Sathish-Sankaraiah.jpg",
                regionPage: "index.html",
                quote: "An insightful experience that encouraged strong collaboration and brought new perspectives to how teams work together."
            },
            {
                name: "Chow Sok Mui Murie",
                designation: "Senior Creative Consultant",
                company: "NCS",
                image: "Chow-Sok-Mui-Murie.jpg",
                regionPage: "sg.html",
                quote: "HFI training gave me the confidence to approach usability challenges with clarity and structure."
            },
            {
                name: "Carl Jhon Steven M. Ignacio",
                designation: "UI/UX Designer",
                company: "Shopping Center Management Corporation",
                image: "Carl-Jhon.jpg",
                regionPage: "au.html",
                quote: "My thinking has evolved to design with empathy, structure, and a deeper understanding of user behavior."
            },
            {
                name: "Rachel Shong",
                designation: "Senior Manager",
                company: "GovTech Singapore",
                image: "Rachel-Shong.jpg",
                regionPage: "sg.html",
                quote: "The learning helped me bridge complex technology with real user needs, creating more meaningful outcomes."
            },
            {
                name: "Kausar Jahan",
                designation: "Senior UX Specialist",
                company: "Road Transport Authority",
                image: "Kausar-Jahan.jpg",
                regionPage: "uae.html",
                quote: "HFI transformed how I see design. It is about the entire experience, not just individual interfaces."
            },
            {
                name: "Richa Gupta",
                designation: "Lead UX Design & Researcher",
                company: "SC Ventures - myZoi",
                image: "Richa-Gupta.jpg",
                regionPage: "uae.html",
                quote: "A highly engaging experience that broadened my perspective and brought valuable insights into service design."
            },
            {
                name: "Nombulelo Mahoda",
                designation: "Service Designer",
                company: "NedBank",
                image: "Nombulelo-Mahoda.jpg",
                regionPage: "sa.html",
                quote: "The learning introduced fresh perspectives and practical tools, especially in understanding systems and ecosystems."
            },
            {
                name: "Kamohelo Kuaho",
                designation: "Senior Design Research Lead",
                company: "Nedbank",
                image: "Kamohelo-Kuaho.jpg",
                regionPage: "sa.html",
                quote: "A strong, science-backed approach that brought structure and influence to how I approach design research."
            },
            {
                name: "Stefan Grobler",
                designation: "Principal Service Design",
                company: "NedBank",
                image: "Stefan-Grobler.jpg",
                regionPage: "sa.html",
                quote: "The program helped me standardize processes and adopt new tools that improved how I work."
            },
            {
                name: "Bheki Ntanzi",
                designation: "UX Specialist",
                company: "First National Bank",
                image: "Bheki-Ntanzi.jpg",
                regionPage: "sa.html",
                quote: "I now approach design with data and insight, uncovering user needs and creating more impactful solutions."
            },
            {
                name: "Supreetha Pavan",
                designation: "Lead UX Designer",
                company: "Siemens",
                image: "SupreethaPavan.jpg",
                regionPage: "uk.html",
                quote: "The experience helped me shift to a truly user-centered approach, with the confidence to design for the future."
            },
            {
                name: "Art Zippel",
                designation: "Information Architect",
                company: "Word and Brown Companies",
                image: "Art-Zippel.jpg",
                regionPage: "us.html",
                quote: "A career-defining decision that delivered real impact within a short span of time."
            },
            {
                name: "Amy Bogatch",
                designation: "Information Architect",
                company: "AXA Equitable",
                image: "Amy-Bogatch.jpg",
                regionPage: "us.html",
                quote: "Our team now follows a more structured and scientific approach, clearly reflected in the quality of our work."
            },
            {
                name: "VJ Francisco",
                designation: "Head of Experience Design",
                company: "Global Telecom",
                image: "VJ-Francisco.jpg",
                regionPage: "us.html",
                quote: "The learning strengthened my credibility and helped me communicate the value of design more effectively."
            },
            {
                name: "Christine J. Tahvonen",
                designation: "Web & App Design",
                company: "TransUnion",
                image: "testimonial-avator.jpg",
                regionPage: "us.html",
                quote: "I now design with greater confidence, using a research-driven approach to guide decisions."
            },
            {
                name: "Vince Conti",
                designation: "Manager, Interactive Development",
                company: "American Express",
                image: "Vince-Conti.jpg",
                regionPage: "us.html",
                quote: "A well-balanced learning experience with the right mix of theory, discussion, and practical application."
            },
            {
                name: "Leah Gillespie",
                designation: "Senior Web Producer",
                company: "Baltimore Gas & Electric",
                image: "Leah-Gillespie.jpg",
                regionPage: "us.html",
                quote: "The program expanded my understanding of usability and introduced new techniques I now actively apply."
            },
            {
                name: "Jim O'Brien",
                designation: "Senior Interaction Designer",
                company: "AutoTrader.com",
                image: "testimonial-avator.jpg",
                regionPage: "us.html",
                quote: "It reinforced my skills and gave me the confidence to present ideas with clarity and conviction."
            },
            {
                name: "Linda Moir",
                designation: "Manager, Web Communications",
                company: "Alberta Blue Cross",
                image: "testimonial-avator.jpg",
                regionPage: "us.html",
                quote: "HFI sets a high standard in usability, helping professionals deliver stronger and more consistent results."
            },
            {
                name: "Lisanne Wirth",
                designation: "UX/CX Content Strategist, Founder and Owner",
                company: "Contentment Communications",
                image: "testimonial-avator.jpg",
                regionPage: "us.html",
                quote: "The learning improved my effectiveness and deepened my understanding of experience driven by human behavior."
            },
            {
                name: "Zakariah Lewis Longo",
                designation: "Manager and UX Lead",
                company: "AAA Auto Club Enterprises",
                image: "testimonial-avator.jpg",
                regionPage: "us.html",
                quote: "An insightful and valuable experience guided by expert instructors and well-structured sessions."
            },
            {
                name: "Cissy Liu",
                designation: "Program Manager",
                company: "Salesforce",
                image: "testimonial-avator.jpg",
                regionPage: "us.html",
                quote: "A strong foundation that made learning practical, engaging, and immediately applicable."
            },
            {
                name: "Crilly Butler Jr",
                designation: "Senior Information Systems Analyst and Intranet Webmaster",
                company: "Department of Fish and Game",
                image: "testimonial-avator.jpg",
                regionPage: "us.html",
                quote: "It improved how I structure and communicate ideas, strengthening both clarity and credibility."
            },
            {
                name: "Caitlin Ing",
                designation: "",
                company: "",
                image: "testimonial-avator.jpg",
                regionPage: "us.html",
                quote: "The experience deepened my understanding of user psychology and improved how I make design decisions."
            },
            {
                name: "Brenda Halvorson",
                designation: "Fractional UX Design & Research Consultant",
                company: "Steep Perspectives",
                image: "testimonial-avator.jpg",
                regionPage: "us.html",
                quote: "It helped me articulate and refine practices I had been using intuitively for years."
            },
            {
                name: "Eugenia Ovenko",
                designation: "Designer",
                company: "UBS",
                image: "Eugenia-Ovenko.jpg",
                regionPage: "us.html",
                quote: "A clear and well-delivered learning experience that made complex concepts easy to understand."
            },
            {
                name: "Maheen Riaz Qureshi",
                designation: "Senior UX Designer | Product Designer Independent UX Consultant",
                company: "Freelance",
                image: "testimonial-avator.jpg",
                regionPage: "ca.html",
                quote: "A highly informative program that strengthened my understanding of usability principles and frameworks."
            },
            {
                name: "Jennifer Cunningham",
                designation: "Experience Lead",
                company: "State Farm Insurance",
                image: "testimonial-avator.jpg",
                regionPage: "us.html",
                quote: "A challenging and rewarding experience that connected theory with real-world application."
            },
            {
                name: "Maheen Riaz Qureshi",
                designation: "Senior UX Designer | Product Designer Independent UX Consultant",
                company: "Freelance",
                image: "testimonial-avator.jpg",
                regionPage: "ca.html",
                quote: "The learning provided strong insights into analytics and how to use data to improve experiences."
            },
            {
                name: "Sydney Chen",
                designation: "",
                company: "",
                image: "testimonial-avator.jpg",
                regionPage: "us.html",
                quote: "Hands-on learning significantly improved my confidence in conducting and applying research."
            }
        ];

        const blankTestimonial = { name: "", designation: "", company: "", quote: "", image: "" };

        const pageFile = ((window.location && window.location.pathname) ? window.location.pathname : "")
            .split(/[\\/]/)
            .pop()
            .toLowerCase()
            .split("?")[0]
            .split("#")[0];

        const resolvedPageFile = pageFile && pageFile.endsWith(".html") ? pageFile : "index.html";

        // Render only testimonials that match the current HTML page.
        const regionTestimonials = testimonials.filter(function (t) {
            return t.regionPage === resolvedPageFile;
        });

        const slidesToRender = regionTestimonials.length ? regionTestimonials : [blankTestimonial];

        // Clear any existing slides to avoid duplication, then re-append the template as slide #1.
        swiperWrapper.innerHTML = "";
        swiperWrapper.appendChild(templateSlide);

        slidesToRender.forEach(function (t, idx) {
            if (idx === 0) {
                setSlideText(templateSlide, t);
                return;
            }
            const newSlide = templateSlide.cloneNode(true);
            setSlideText(newSlide, t);
            swiperWrapper.appendChild(newSlide);
        });
    }

    new Swiper(sliderEl, {
        slidesPerView: 1.08,
        slidesPerGroup: 1,
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
                slidesPerGroup: 1,
                spaceBetween: 18
            },
            768: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 20
            },
            992: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 20
            },
            1200: {
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 20
            }
        }
    });
})();

// About page: journey vertical year + content swipers
(function () {
    "use strict";

    const yearsEl = document.querySelector(".about-journey-years-swiper");
    const contentEl = document.querySelector(".about-journey-content-swiper");
    const yearPaginationEl = document.querySelector(".about-journey-years-pagination");
    if (!yearsEl || !contentEl || !yearPaginationEl || typeof Swiper === "undefined") return;

    const yearsSwiper = new Swiper(yearsEl, {
        direction: "vertical",
        slidesPerView: 2,
        centeredSlides: false,
        spaceBetween: 0,
        speed: 650,
        allowTouchMove: false,
        breakpoints: {
            0: {
                slidesPerView: 2
            },
            992: {
                slidesPerView: 2
            }
        }
    });

    const contentSwiper = new Swiper(contentEl, {
        direction: "vertical",
        slidesPerView: 1,
        spaceBetween: 14,
        speed: 650,
        autoHeight: true,
        mousewheel: {
            forceToAxis: true
        }
    });

    const totalSlides = contentEl.querySelectorAll(".swiper-slide").length;
    const paginationLines = [];

    for (let i = 0; i < totalSlides; i += 1) {
        const line = document.createElement("button");
        line.type = "button";
        line.className = "about-journey-years-page-line";
        line.setAttribute("aria-label", "Go to year " + (i + 1));
        line.addEventListener("click", function () {
            contentSwiper.slideTo(i);
        });
        yearPaginationEl.appendChild(line);
        paginationLines.push(line);
    }

    const syncYearsToContent = function () {
        const activeIndex = contentSwiper.activeIndex;
        yearsSwiper.slideTo(activeIndex);
        paginationLines.forEach(function (line, idx) {
            line.classList.toggle("is-active", idx === activeIndex);
        });
    };

    contentSwiper.on("init", syncYearsToContent);
    contentSwiper.on("slideChange", syncYearsToContent);
    contentSwiper.on("slideChangeTransitionEnd", syncYearsToContent);

    yearsSwiper.on("click", function () {
        const clicked = yearsSwiper.clickedIndex;
        if (typeof clicked === "number" && clicked >= 0) {
            contentSwiper.slideTo(clicked);
        }
    });

    syncYearsToContent();
})();

// logos-marquee-slider
(function () {
    "use strict";
    const logoTracks = document.querySelectorAll(".logo-marquee-track");
    if (!logoTracks || logoTracks.length === 0) return;
    const logos = [
        // APAC
        { image: "assets/images/logos/APAC/Banglalink Digital Communication Ltd.png", region: "apac", alt: "Banglalink Digital Communication Ltd" },
        { image: "assets/images/logos/APAC/BDO_Unibank.png", region: "apac", alt: "BDO Unibank" },
        { image: "assets/images/logos/APAC/Cebu-Pacific.png", region: "apac", alt: "Cebu-Pacific" },
        { image: "assets/images/logos/APAC/Cimb Bank Berhad.png", region: "apac", alt: "Cimb Bank Berhad" },
        { image: "assets/images/logos/APAC/DBS Bank Limited.png", region: "apac", alt: "DBS Bank Limited" },
        { image: "assets/images/logos/APAC/Globe Telecom.png", region: "apac", alt: "Globe Telecom" },
        { image: "assets/images/logos/APAC/Manulife.png", region: "apac", alt: "Manulife" },
        { image: "assets/images/logos/APAC/Maybank Singapore Limited.png", region: "apac", alt: "Maybank Singapore Limited" },
        { image: "assets/images/logos/APAC/Metrobank.png", region: "apac", alt: "Metrobank" },
        { image: "assets/images/logos/APAC/NTUC LearingHub.png", region: "apac", alt: "NTUC LearingHub" },
        { image: "assets/images/logos/APAC/Union Bank of the Philippines.png", region: "apac", alt: "Union Bank of the Philippines" },

        // EU
        { image: "assets/images/logos/EU/Air_France.png", region: "eu", alt: "Air France" },
        { image: "assets/images/logos/EU/Bayer.png", region: "eu", alt: "Bayer" },
        { image: "assets/images/logos/EU/Capegemini.png", region: "eu", alt: "Capegemini" },
        { image: "assets/images/logos/EU/Danske-Bank.png", region: "eu", alt: "Danske-Bank" },
        { image: "assets/images/logos/EU/Deloitte.png", region: "eu", alt: "Deloitte" },
        { image: "assets/images/logos/EU/Ericsson.png", region: "eu", alt: "Ericsson" },
        { image: "assets/images/logos/EU/GE Healthcare.png", region: "eu", alt: "GE Healthcare" },
        { image: "assets/images/logos/EU/GlaxoSmithKline.png", region: "eu", alt: "GlaxoSmithKline" },
        { image: "assets/images/logos/EU/Old Mutual.png", region: "eu", alt: "Old Mutual" },
        { image: "assets/images/logos/EU/Rabobank.png", region: "eu", alt: "Rabobank" },
        { image: "assets/images/logos/EU/Royal Dutch Airlines.png", region: "eu", alt: "Royal Dutch Airlines" },

        // IN
        { image: "assets/images/logos/IN/Accenture.png", region: "in", alt: "Accenture Pvt Ltd" },
        // { image: "assets/images/logos/IN/Aditya_Birla_Group.png", region: "in", alt: "Aditya Birla Group" },
        { image: "assets/images/logos/IN/Boston Consulting Group.png", region: "in", alt: "Boston Consulting Group" },
        // { image: "assets/images/logos/IN/BSH.png", region: "in", alt: "BSH" },
        // { image: "assets/images/logos/IN/Citiustech.png", region: "in", alt: "Citiustech" },
        // { image: "assets/images/logos/IN/Cognizant.png", region: "in", alt: "Cognizant" },
        { image: "assets/images/logos/IN/HDFC Bank.png", region: "in", alt: "HDFC Bank" },
        { image: "assets/images/logos/IN/ICICI_Bank_Logo.png", region: "in", alt: "ICICI Bank Logo" },
        { image: "assets/images/logos/IN/IDFC Bank.png", region: "in", alt: "IDFC Bank" },
        { image: "assets/images/logos/IN/Publicis Sapient.png", region: "in", alt: "Publicis Sapient" },
        { image: "assets/images/logos/IN/Siemens.png", region: "in", alt: "Siemens" },
        { image: "assets/images/logos/IN/TCS.png", region: "in", alt: "TCS" },
        { image: "assets/images/logos/IN/Tech Mahindra.png", region: "in", alt: "Tech Mahindra" },
        // { image: "assets/images/logos/IN/Wells_Fargo.png", region: "in", alt: "Wells Fargo" },
        // { image: "assets/images/logos/IN/Wipro.png", region: "in", alt: "Wipro" },

        // ME
        { image: "assets/images/logos/ME/DEWA.AE_BIG.png", region: "me", alt: "DEWA.AE BIG" },
        { image: "assets/images/logos/ME/Ecobank.png", region: "me", alt: "Ecobank" },
        { image: "assets/images/logos/ME/Emirates.png", region: "me", alt: "Emirates" },
        { image: "assets/images/logos/ME/Masdar.png", region: "me", alt: "Masdar" },
        { image: "assets/images/logos/ME/Navcon.png", region: "me", alt: "Navcon" },
        { image: "assets/images/logos/ME/Qatar Islamic Bank.png", region: "me", alt: "Qatar Islamic Bank" },
        { image: "assets/images/logos/ME/RTA.png", region: "me", alt: "RTA" },
        { image: "assets/images/logos/ME/smart-dubai.png", region: "me", alt: "smart-dubai" },
        { image: "assets/images/logos/ME/tsys.png", region: "me", alt: "tsys" },

        // NA
        { image: "assets/images/logos/NA/3M.png", region: "na", alt: "3M" },
        { image: "assets/images/logos/NA/Booz Allen Hamiliton.png", region: "na", alt: "Booz Allen Hamiliton" },
        { image: "assets/images/logos/NA/California Department of Technology.png", region: "na", alt: "California Department of Technology" },
        { image: "assets/images/logos/NA/Christiana Care.png", region: "na", alt: "Christiana Care" },
        { image: "assets/images/logos/NA/City of San Antonio.png", region: "na", alt: "City of San Antonio" },
        { image: "assets/images/logos/NA/CVS Health.png", region: "na", alt: "CVS Health" },
        { image: "assets/images/logos/NA/FedEx.png", region: "na", alt: "FedEx" },
        { image: "assets/images/logos/NA/Florida Power & Light.png", region: "na", alt: "Florida Power & Light" },
        { image: "assets/images/logos/NA/National Park Service (NPS).png", region: "na", alt: "National Park Service (NPS)" },
        { image: "assets/images/logos/NA/State Farm.png", region: "na", alt: "State Farm" },
        { image: "assets/images/logos/NA/UBS.png", region: "na", alt: "UBS" },
        { image: "assets/images/logos/NA/Veritas_Technologies.png", region: "na", alt: "Veritas Technologies" },
        { image: "assets/images/logos/NA/Verizon_Wireless_logo.png", region: "na", alt: "Verizon Wireless logo" },

        // SA
        { image: "assets/images/logos/SA/Absa Bank.png", region: "sa", alt: "Absa Bank" },
        { image: "assets/images/logos/SA/Capitec_Bank.png", region: "sa", alt: "Capitec Bank" },
        { image: "assets/images/logos/SA/Discovery_Holding_Company.png", region: "sa", alt: "Discovery Holding Company" },
        { image: "assets/images/logos/SA/Ecobank.png", region: "sa", alt: "Ecobank" },
        { image: "assets/images/logos/SA/First National Bank.png", region: "sa", alt: "First National Bank" },
        { image: "assets/images/logos/SA/Investec.png", region: "sa", alt: "Investec" },
        { image: "assets/images/logos/SA/Multichoice Group.png", region: "sa", alt: "Multichoice Group" },
        { image: "assets/images/logos/SA/Nedbank_idvPPE6CB0_1.png", region: "sa", alt: "Nedbank idvPPE6CB0 1" },
        { image: "assets/images/logos/SA/Old Mutual.png", region: "sa", alt: "Old Mutual" },
        { image: "assets/images/logos/SA/Standard Bank Group.png", region: "sa", alt: "Standard Bank Group" },
        { image: "assets/images/logos/SA/Vodacom.png", region: "sa", alt: "Vodacom" },
        { image: "assets/images/logos/SA/Momentum Inc..png", region: "sa", alt: "Momentum Inc." }

    ];

    const pageFile = ((window.location && window.location.pathname) ? window.location.pathname : "")
        .split(/[\\/]/)
        .pop()
        .toLowerCase()
        .split("?")[0]
        .split("#")[0];
    const resolvedPageFile = pageFile && pageFile.endsWith(".html") ? pageFile : "index.html";

    const logoRegionByPage = {
        "index.html": "in",
        "sg.html": "apac",
        "au.html": "apac",
        "uae.html": "me",
        "sa.html": "sa",
        "uk.html": "eu",
        "us.html": "na",
        "ca.html": "na"
    };

    const activeRegion = logoRegionByPage[resolvedPageFile] || "in";
    const regionalLogos = logos.filter(function (logo) {
        return logo.region === activeRegion;
    });
    const logosToRender = regionalLogos.length ? regionalLogos : logos;

    // Rebuild tracks from the logos list (duplicate once for seamless marquee).
    logoTracks.forEach(function (track) {
        track.innerHTML = "";
        const repeated = logosToRender.concat(logosToRender);
        repeated.forEach(function (logo) {
            const item = document.createElement("div");
            item.classList.add("logo-marquee-item");
            item.innerHTML = `<img src="${logo.image}" class="hero-logo-img" alt="${logo.alt}">`;
            track.appendChild(item);
        });
    });
})();



// Experience pathway: full country list + dial code, flag sync, searchable Choices
(function () {
    "use strict";

    var FLAG_CDN = "https://cdn.jsdelivr.net/npm/country-flag-icons/3x2";
    var METADATA_URL =
        "https://cdn.jsdelivr.net/npm/libphonenumber-js@1.11.14/metadata.min.json";

    var select = document.getElementById("pathway-country-code");
    if (!select) return;

    var wrap = select.closest(".experience-pathway-country-code-wrap");
    var flagImg = wrap ? wrap.querySelector(".experience-pathway-flag") : null;
    if (!flagImg) return;

    var pathwayChoices = null;
    var dialHidden = document.getElementById("pathway-country-dial");

    function dialDisplay(dialDigits) {
        if (dialDigits == null || dialDigits === "") return "";
        var s = String(dialDigits);
        return s.charAt(0) === "+" ? s : "+" + s;
    }

    function setFlag() {
        var opt = select.options[select.selectedIndex];
        var iso = opt ? opt.getAttribute("data-iso") || opt.value : null;
        if (!iso) {
            flagImg.src = "";
            flagImg.alt = "";
            if (dialHidden) dialHidden.value = "";
            return;
        }
        iso = iso.toUpperCase();
        flagImg.src = FLAG_CDN + "/" + iso + ".svg";
        flagImg.alt = "Flag of " + iso;
        if (dialHidden && opt) {
            var dial = opt.getAttribute("data-dial") || "";
            dialHidden.value = dial;
        }
    }

    function destroyPathwayChoices() {
        if (pathwayChoices && typeof pathwayChoices.destroy === "function") {
            pathwayChoices.destroy();
            pathwayChoices = null;
        }
    }

    function extractDialFromChoice(choice) {
        if (!choice || !choice.customProperties) return null;
        var cp = choice.customProperties;
        if (typeof cp === "string") {
            try {
                cp = JSON.parse(cp);
            } catch (e) {
                return null;
            }
        }
        if (cp && typeof cp === "object" && cp.dial) return String(cp.dial);
        return null;
    }

    function initPathwayChoices() {
        if (typeof Choices === "undefined") return;
        destroyPathwayChoices();

        var defaultItemTemplate = Choices.defaults.templates.item;
        var phoneRow = wrap ? wrap.closest(".experience-pathway-phone") : null;

        pathwayChoices = new Choices(select, {
            allowHTML: false,
            searchEnabled: true,
            shouldSort: false,
            itemSelectText: "",
            searchPlaceholderValue: "Search country",
            position: "bottom",
            callbackOnCreateTemplates: function () {
                return {
                    item: function (templateOpts, choice) {
                        var dial = extractDialFromChoice(choice);
                        if (dial && !choice.placeholder) {
                            return defaultItemTemplate.call(
                                this,
                                templateOpts,
                                Object.assign({}, choice, { label: dial }),
                                false
                            );
                        }
                        return defaultItemTemplate.call(this, templateOpts, choice, false);
                    }
                };
            }
        });

        if (phoneRow && pathwayChoices && pathwayChoices.passedElement) {
            var rootEl = pathwayChoices.passedElement.element;
            rootEl.addEventListener("showDropdown", function () {
                phoneRow.classList.add("is-country-dropdown-open");
            });
            rootEl.addEventListener("hideDropdown", function () {
                phoneRow.classList.remove("is-country-dropdown-open");
            });
        }
    }

    function applyFallbackOptions() {
        var rows = [
            { iso: "IN", dial: "+91", name: "India" },
            { iso: "US", dial: "+1", name: "United States" },
            { iso: "CA", dial: "+1", name: "Canada" },
            { iso: "GB", dial: "+44", name: "United Kingdom" },
            { iso: "AU", dial: "+61", name: "Australia" },
            { iso: "JP", dial: "+81", name: "Japan" },
            { iso: "AE", dial: "+971", name: "United Arab Emirates" },
            { iso: "SG", dial: "+65", name: "Singapore" },
            { iso: "DE", dial: "+49", name: "Germany" },
            { iso: "FR", dial: "+33", name: "France" },
            { iso: "CN", dial: "+86", name: "China" }
        ];
        var defaultIso = (select.dataset.defaultIso || "IN").toUpperCase();
        select.innerHTML = "";
        rows.forEach(function (row) {
            var opt = document.createElement("option");
            opt.value = row.iso;
            opt.setAttribute("data-iso", row.iso);
            opt.setAttribute("data-dial", row.dial);
            opt.setAttribute("data-custom-properties", JSON.stringify({ dial: row.dial }));
            opt.textContent = row.name + " (" + row.dial + ")";
            if (row.iso === defaultIso) opt.selected = true;
            select.appendChild(opt);
        });
        setFlag();
        initPathwayChoices();
    }

    function populateFromMetadata(meta) {
        var countries = meta && meta.countries;
        if (!countries) {
            applyFallbackOptions();
            return;
        }

        var displayNames =
            typeof Intl !== "undefined" && Intl.DisplayNames
                ? new Intl.DisplayNames(["en"], { type: "region" })
                : null;

        var defaultIso = (select.dataset.defaultIso || "IN").toUpperCase();
        var rows = [];

        Object.keys(countries).forEach(function (iso2) {
            var entry = countries[iso2];
            if (!entry || !entry.length) return;
            var dialDigits = entry[0];
            if (dialDigits == null || dialDigits === "") return;
            var dial = dialDisplay(dialDigits);
            var label;
            try {
                label = displayNames ? displayNames.of(iso2) : iso2;
            } catch (e) {
                label = iso2;
            }
            if (!label) label = iso2;
            rows.push({ iso: iso2, dial: dial, name: label });
        });

        rows.sort(function (a, b) {
            return a.name.localeCompare(b.name, "en");
        });

        destroyPathwayChoices();
        select.innerHTML = "";

        rows.forEach(function (row) {
            var opt = document.createElement("option");
            opt.value = row.iso;
            opt.setAttribute("data-iso", row.iso);
            opt.setAttribute("data-dial", row.dial);
            opt.setAttribute("data-custom-properties", JSON.stringify({ dial: row.dial }));
            opt.textContent = row.name + " (" + row.dial + ")";
            if (row.iso === defaultIso) opt.selected = true;
            select.appendChild(opt);
        });

        if (!select.querySelector("option[selected]") && select.options.length) {
            select.options[0].selected = true;
        }

        setFlag();
        initPathwayChoices();
    }

    select.addEventListener("change", setFlag);

    if (select.dataset.pathwayCountriesLoaded === "true") {
        setFlag();
        return;
    }

    fetch(METADATA_URL)
        .then(function (res) {
            if (!res.ok) throw new Error("metadata fetch failed");
            return res.json();
        })
        .then(populateFromMetadata)
        .catch(function () {
            applyFallbackOptions();
        })
        .finally(function () {
            select.dataset.pathwayCountriesLoaded = "true";
        });
})();

// Global selects: Choices.js
(function () {
    "use strict";

    if (typeof Choices === "undefined") return;

    // Exclude timezone custom dropdown's native select (hidden, synced by custom trigger/listbox)
    var selects = document.querySelectorAll("select:not(.upcoming-tracks-timezone-select-native):not(.experience-pathway-select):not(.experience-pathway-country-code)");
    // Exclude selects that have their own custom UI/behavior.
    var selects = document.querySelectorAll(
        "select:not(.upcoming-tracks-timezone-select-native):not(.country-region-bar-select-native):not(#pathway-country-code)"
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

// Country / region top bar: dismiss + re-open when linking from footer
(function () {
    "use strict";

    var bar = document.querySelector("[data-country-region-bar]");
    if (!bar) return;

    var closeBtn = document.getElementById("country-region-bar-close");
    if (closeBtn) {
        closeBtn.addEventListener("click", function () {
            bar.setAttribute("hidden", "");
        });
    }

    document.addEventListener(
        "click",
        function (e) {
            var link = e.target.closest('a[href="#country-region-bar"]');
            if (!link) return;
            bar.removeAttribute("hidden");
        },
        true
    );
})();

// Country / region navigation: route to region-specific pages
(function () {
    "use strict";

    var select = document.getElementById("country-region-select");
    if (!select) return;

    var bar = select.closest("[data-country-region-bar]") || document;
    var continueBtn = bar.querySelector(".country-region-bar-continue");

    // Map dropdown values -> html pages.
    var regionRouteByCode = {
        IN: "index.html",
        US: "us.html",
        GB: "uk.html",
        AU: "au.html",
        CA: "ca.html",
        SG: "sg.html",
        AE: "uae.html",
        ZA: "sa.html"
    };

    function routeByCode(code) {
        if (!code) return;
        var dest = regionRouteByCode[code] || "index.html";
        if (window.location && window.location.pathname && window.location.pathname.endsWith(dest)) return;
        window.location.href = dest;
    }

    var lastRoutedCode = null;
    function routeFromSelect() {
        var code = select.value;
        if (code && code === lastRoutedCode) return;
        lastRoutedCode = code;
        routeByCode(code);
    }

    // Route only on Continue click (not on dropdown change).
    if (continueBtn) continueBtn.addEventListener("click", routeFromSelect);

    // Modal options map based on button text.
    var routeByLabel = {
        "India": "index.html",
        "Europe": "uk.html",
        "United States of America": "us.html",
        "United States": "us.html",
        "Malaysia": "au.html",
        "South Africa": "sa.html",
        "Middle East": "uae.html",
        "Singapore": "sg.html",
        "Canada": "ca.html"
    };

    var modalOptions = document.querySelectorAll(".country-region-modal-option");
    Array.from(modalOptions).forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            var label = (e && e.target && e.target.textContent) ? e.target.textContent.trim() : "";
            var dest = routeByLabel[label];
            if (!dest) return;

            // Prevent any unexpected bootstrap focus handling; navigation wins.
            e.preventDefault();
            window.location.href = dest;
        });
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
    function initSingleOpenAccordion(accordionSelector, itemSelector) {
        var accordions = document.querySelectorAll(accordionSelector);
        if (!accordions.length) return;

        accordions.forEach(function (accordion) {
            var items = accordion.querySelectorAll(itemSelector);
            items.forEach(function (details) {
                var summary = details.querySelector("summary");
                if (!summary) return;

                summary.addEventListener("click", function (event) {
                    var isOpening = !details.hasAttribute("open");

                    event.preventDefault();

                    if (!isOpening) {
                        details.removeAttribute("open");
                        return;
                    }

                    items.forEach(function (other) {
                        if (other !== details) {
                            other.removeAttribute("open");
                        }
                    });

                    requestAnimationFrame(function () {
                        if (!details.hasAttribute("open")) {
                            details.setAttribute("open", "");
                        }
                    });
                });

                details.addEventListener("keydown", function (event) {
                    if (event.key === "Escape" && details.hasAttribute("open")) {
                        details.removeAttribute("open");
                    }
                });
            });
        });
    }

    function enforceSingleOpenState(accordionSelector, itemSelector) {
        var accordions = document.querySelectorAll(accordionSelector);
        if (!accordions.length) return;

        accordions.forEach(function (accordion) {
            var firstOpenFound = false;
            accordion.querySelectorAll(itemSelector).forEach(function (details) {
                if (!details.hasAttribute("open")) {
                    return;
                }

                if (!firstOpenFound) {
                    firstOpenFound = true;
                    return;
                }

                details.removeAttribute("open");
            });
        });
    }

    function initAccordions() {
        enforceSingleOpenState(".what-you-ll-learn-accordion", ".what-you-ll-learn-accordion-item");
        enforceSingleOpenState(".certification-faq-accordion", ".certification-faq-accordion-item");

        initSingleOpenAccordion(".what-you-ll-learn-accordion", ".what-you-ll-learn-accordion-item");
        initSingleOpenAccordion(".certification-faq-accordion", ".certification-faq-accordion-item");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAccordions);
    } else {
        initAccordions();
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

// About Visionaries: hover expand (70% / 15% / 15%) — only >= 768px
(function () {
    "use strict";
    var VISIONARIES_MEDIA = "(min-width: 768px)";

    function initAboutVisionaries() {
        var grid = document.getElementById("about-visionaries-behind-grid");
        if (!grid) return;
        var cards = grid.querySelectorAll(".about-visionaries-behind-card");
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
            if (!window.matchMedia(VISIONARIES_MEDIA).matches) return;
            var card = e.target.closest(".about-visionaries-behind-card");
            if (card && grid.contains(card)) {
                setExpanded(card);
            }
        }
        function onMouseLeave() {
            if (!window.matchMedia(VISIONARIES_MEDIA).matches) return;
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
            if (window.matchMedia(VISIONARIES_MEDIA).matches) {
                attachHoverHandlers();
            } else {
                detachHoverHandlers();
                clearExpanded();
            }
        }

        clearExpanded();
        updateHoverState();
        var mql = window.matchMedia(VISIONARIES_MEDIA);
        if (mql.addEventListener) {
            mql.addEventListener("change", updateHoverState);
        } else if (mql.addListener) {
            mql.addListener(updateHoverState);
        }
        window.addEventListener("resize", updateHoverState);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAboutVisionaries);
    } else {
        initAboutVisionaries();
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

    const flow = document.querySelector("[data-checkout-flow]");
    if (!flow) return;

    const panels = Array.from(flow.querySelectorAll("[data-step-panel]"));
    const stepNavItems = Array.from(flow.querySelectorAll("[data-step-nav]"));
    const stepTriggers = Array.from(flow.querySelectorAll("[data-step-trigger]"));
    const nextButtons = Array.from(flow.querySelectorAll("[data-step-next]"));
    const backButtons = Array.from(flow.querySelectorAll("[data-step-back]"));

    const paymentInputs = Array.from(flow.querySelectorAll("[name='checkout-payment-plan']"));
    const paymentStages = Array.from(flow.querySelectorAll("[data-payment-stage]"));

    const summaryCTA = flow.querySelector(".checkout-summary-cta");
    const backLink = flow.querySelector("[data-checkout-back]");
    const verificationSubmitBtn = flow.querySelector("[data-emi-submit]");
    const uploadZones = Array.from(flow.querySelectorAll("[data-upload-zone]"));
    const addReferenceButton = flow.querySelector("[data-add-reference]");
    const referenceList = flow.querySelector("[data-reference-list]");
    const referenceTemplate = flow.querySelector("[data-reference-template]");

    const verificationCard = flow.querySelector("[data-checkout-summary-mode='verification']");
    const normalSummaryCard = flow.querySelector(".checkout-summary-card:not([data-checkout-summary-mode])");
    const step3Panels = panels.filter(panel => panel.dataset.stepPanel === "3");

    let currentStep = 0;
    let paymentStage = "selection";
    let paymentPlan = "one-time";

    const stepConfig = [
        { nextStep: 1, label: "Continue to Secure your Seat" },
        { nextStep: 2, label: "Proceed to Checkout" },
        { nextStep: 3, label: "Complete Payment" },
        { nextStep: null, label: "Enrollment Confirmed" }
    ];

    function limitStep(step) {
        return Math.max(0, Math.min(step, stepConfig.length - 1));
    }

    function showOnly(elements, activeIndex) {
        elements.forEach((el, i) => {
            const isActive = i === activeIndex;
            el.classList.toggle("is-active", isActive);
            el.hidden = !isActive;
        });
    }

    function scrollCheckoutToTop() {
        const topTarget = flow.closest(".checkout-page-section") || flow;
        topTarget.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function updateStepNavigation() {
        stepNavItems.forEach((item, index) => {
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            item.classList.toggle("is-active", isActive);
            item.classList.toggle("is-complete", isComplete);

            const button = item.querySelector(".checkout-step-button");
            if (button) {
                if (isActive) {
                    button.setAttribute("aria-current", "step");
                } else {
                    button.removeAttribute("aria-current");
                }
            }
        });
    }

    function updatePaymentStage(stage) {
        paymentStage = stage === "verification" ? "verification" : "selection";

        paymentStages.forEach(stageEl => {
            const isActive = stageEl.dataset.paymentStage === paymentStage;
            stageEl.classList.toggle("is-active", isActive);
            stageEl.hidden = !isActive;
        });

        const isVerificationVisible = currentStep === 2 && paymentStage === "verification";

        if (normalSummaryCard) normalSummaryCard.hidden = isVerificationVisible;
        if (verificationCard) verificationCard.hidden = !isVerificationVisible;

        scrollCheckoutToTop();
    }

    function updateSummaryCTA() {
        if (!summaryCTA) return;

        let config = stepConfig[currentStep];
        let nextStep = config.nextStep;
        let label = config.label;

        if (currentStep === 2) {
            if (paymentStage === "verification") {
                summaryCTA.hidden = true;
                summaryCTA.removeAttribute("data-step-trigger");
                return;
            }

            if (paymentPlan === "emi-3" || paymentPlan === "emi-6") {
                nextStep = null;
                label = "Proceed to Verification";
            }
        }

        summaryCTA.hidden = false;
        summaryCTA.textContent = label;

        if (typeof nextStep === "number") {
            summaryCTA.setAttribute("data-step-trigger", nextStep);
        } else {
            summaryCTA.removeAttribute("data-step-trigger");
        }
    }

    function applyStep3PanelByPaymentPlan() {
        if (currentStep !== 3 || step3Panels.length < 2) return;
        const showEmiPanel = paymentPlan === "emi-3" || paymentPlan === "emi-6";
        const oneTimePanel = step3Panels[0];
        const emiPanel = step3Panels[1];

        oneTimePanel.classList.toggle("is-active", !showEmiPanel);
        oneTimePanel.hidden = showEmiPanel;

        emiPanel.classList.toggle("is-active", showEmiPanel);
        emiPanel.hidden = !showEmiPanel;
    }

    function goToStep(step) {
        currentStep = limitStep(step);
        flow.classList.toggle("is-step-2", currentStep === 2);
        flow.classList.toggle("is-step-3", currentStep === 3);

        showOnly(panels, currentStep);
        updateStepNavigation();

        if (currentStep !== 2) {
            updatePaymentStage("selection");
        }

        updateSummaryCTA();
        applyStep3PanelByPaymentPlan();

        if (backLink) {
            backLink.href = currentStep === 0 ? "all-courses.html" : "#";
        }

        scrollCheckoutToTop();
    }

    stepTriggers.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = Number(btn.dataset.stepTrigger);

            if (!Number.isNaN(target)) {
                goToStep(target);
                return;
            }

            if (
                currentStep === 2 &&
                paymentStage === "selection" &&
                (paymentPlan === "emi-3" || paymentPlan === "emi-6")
            ) {
                updatePaymentStage("verification");
                updateSummaryCTA();
            }
        });
    });

    // Next buttons
    nextButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            goToStep(currentStep + 1);
        });
    });

    // Back buttons
    backButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            goToStep(currentStep - 1);
        });
    });

    // Back link (top navigation)
    if (backLink) {
        backLink.addEventListener("click", (e) => {

            if (currentStep === 2 && paymentStage === "verification") {
                e.preventDefault();
                updatePaymentStage("selection");
                updateSummaryCTA();
                return;
            }

            if (currentStep > 0) {
                e.preventDefault();
                goToStep(currentStep - 1);
            }
        });
    }

    // Payment selection change
    paymentInputs.forEach(input => {
        input.addEventListener("change", () => {
            paymentPlan = input.value;
            updateSummaryCTA();
            applyStep3PanelByPaymentPlan();
        });
    });

    // Verification submit
    if (verificationSubmitBtn) {
        verificationSubmitBtn.addEventListener("click", () => {
            goToStep(3);
        });
    }

    function updateUploadState(zone, files) {
        if (!zone) return;

        const filename = zone.querySelector("[data-upload-filename]");
        const hasFiles = files && files.length > 0;

        zone.classList.toggle("is-filled", hasFiles);
        zone.classList.remove("is-invalid");

        if (!filename) return;

        if (!hasFiles) {
            filename.textContent = "No file selected";
            return;
        }

        if (files.length === 1) {
            filename.textContent = files[0].name;
            return;
        }

        filename.textContent = files.length + " files selected";
    }

    function showUploadError(zone, message) {
        if (!zone) return;

        const filename = zone.querySelector("[data-upload-filename]");
        zone.classList.remove("is-filled");
        zone.classList.add("is-invalid");

        if (filename) {
            filename.textContent = message;
        }
    }

    function getAcceptedFiles(fileList) {
        if (!fileList || !fileList.length) return [];

        return Array.from(fileList).filter(file => {
            const name = file.name ? file.name.toLowerCase() : "";
            const mime = (file.type || "").toLowerCase();

            return (
                mime === "image/jpeg" ||
                mime === "image/png" ||
                mime === "application/pdf" ||
                name.endsWith(".jpeg") ||
                name.endsWith(".jpg") ||
                name.endsWith(".png") ||
                name.endsWith(".pdf")
            );
        });
    }

    uploadZones.forEach(zone => {
        const input = zone.querySelector("[data-upload-input]");
        const box = zone.querySelector(".checkout-upload-box");
        if (!input || !box) return;

        ["dragenter", "dragover"].forEach(eventName => {
            zone.addEventListener(eventName, event => {
                event.preventDefault();
                zone.classList.add("is-dragover");
            });
        });

        ["dragleave", "dragend", "drop"].forEach(eventName => {
            zone.addEventListener(eventName, event => {
                event.preventDefault();
                zone.classList.remove("is-dragover");
            });
        });

        zone.addEventListener("drop", event => {
            const droppedFiles = event.dataTransfer && event.dataTransfer.files;
            if (!droppedFiles || !droppedFiles.length) return;

            const acceptedFiles = getAcceptedFiles(droppedFiles);
            if (!acceptedFiles.length || acceptedFiles.length !== droppedFiles.length) {
                input.value = "";
                showUploadError(zone, "Only JPEG, PNG, or PDF files are allowed");
                return;
            }

            const dataTransfer = new DataTransfer();
            acceptedFiles.forEach(file => dataTransfer.items.add(file));
            input.files = dataTransfer.files;
            updateUploadState(zone, dataTransfer.files);
        });

        input.addEventListener("change", () => {
            const acceptedFiles = getAcceptedFiles(input.files);

            if (!acceptedFiles.length && input.files && input.files.length) {
                input.value = "";
                showUploadError(zone, "Only JPEG, PNG, or PDF files are allowed");
                return;
            }

            if (input.files && acceptedFiles.length !== input.files.length) {
                input.value = "";
                showUploadError(zone, "Only JPEG, PNG, or PDF files are allowed");
                return;
            }

            updateUploadState(zone, acceptedFiles);
        });

        box.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                input.click();
            }
        });
    });

    function syncReferenceLabels() {
        if (!referenceList) return;

        const items = Array.from(referenceList.querySelectorAll("[data-reference-item]"));
        items.forEach((item, index) => {
            const number = index + 1;
            const title = item.querySelector(".checkout-reference-title");
            const nameInput = item.querySelector("input[type='text']");
            const phoneInput = item.querySelector("input[type='tel']");
            const relationshipSelect = item.querySelector("select");

            if (title) {
                title.textContent = "Reference " + number;
            }

            if (nameInput) {
                nameInput.setAttribute("aria-label", "Reference " + number + " Name");
            }

            if (phoneInput) {
                phoneInput.setAttribute("aria-label", "Reference " + number + " Contact Number");
            }

            if (relationshipSelect) {
                relationshipSelect.setAttribute("aria-label", "Reference " + number + " Relationship");
            }
        });
    }

    if (addReferenceButton && referenceList && referenceTemplate) {
        addReferenceButton.addEventListener("click", () => {
            const fragment = referenceTemplate.content.cloneNode(true);
            referenceList.appendChild(fragment);
            syncReferenceLabels();
        });
    }

    syncReferenceLabels();

    const selectedPlan = paymentInputs.find(input => input.checked);
    if (selectedPlan) paymentPlan = selectedPlan.value;

    goToStep(0);

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

// About page skill-building timeline: auto-run steps (checkboxes) sequentially once.
(function () {
    "use strict";

    var timeline = document.querySelector(".about-skill-building-timeline");
    if (!timeline) return;

    var checkboxes = Array.from(timeline.querySelectorAll(".about-skill-building-checkbox"));
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
                    checkbox.dispatchEvent(
                        new Event("change", { bubbles: true })
                    );
                }
            }, idx * stepDelayMs);
        });
    }

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

// Experience Architect pathway: reveal capability model steps on scroll
(function () {
    "use strict";

    var timeline = document.querySelector("[data-experience-architect-timeline]");
    if (!timeline) return;

    var steps = Array.from(
        timeline.querySelectorAll("[data-experience-architect-step]")
    );
    if (!steps.length) return;

    var checkboxes = Array.from(
        timeline.querySelectorAll(".experience-architect-model-checkbox")
    );
    if (!checkboxes.length) return;

    function activateSequentially(index) {
        steps.slice(0, index + 1).forEach(function (step, stepIndex) {
            step.classList.add("is-visible");

            var checkbox = checkboxes[stepIndex];
            if (!checkbox) return;

            if (!checkbox.checked) {
                checkbox.checked = true;
                checkbox.dispatchEvent(
                    new Event("change", { bubbles: true })
                );
            }
        });
    }

    if (!("IntersectionObserver" in window)) {
        steps.forEach(function (step) {
            step.classList.add("is-visible");
        });

        checkboxes.forEach(function (checkbox) {
            checkbox.checked = true;
        });
        return;
    }

    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var step = entry.target;
                var index = steps.indexOf(step);
                if (index === -1) return;

                activateSequentially(index);
                observer.unobserve(step);
            });
        },
        {
            threshold: 0.35,
            rootMargin: "0px 0px -12% 0px"
        }
    );

    steps.forEach(function (step) {
        observer.observe(step);
    });
})();
