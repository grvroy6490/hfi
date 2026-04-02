    <main>
        <!--------------------------- 
            HEADER
        ------------------------------>
        <header class="site-header bg-white position-relative">
            <div class="header-announcement">
                <div class="container">
                    <p class="header-announcement-text mb-0 text-center body-small">
                        HFI Institute builds on the global legacy of Human Factors International.
                        <a href="#" class="header-announcement-link">Discover Our Story</a>
                    </p>
                </div>
            </div>
            <nav class="header-nav navbar navbar-expand-lg">
                <div class="container">
                    <div class="row">
                        <div class="col-12 col-lg-12">
                            <a href="<?php echo base_url(); ?>" class="header-logo navbar-brand">
                                <img src="<?php echo base_url(); ?>assets/images/logo.svg" alt="HFI">
                            </a>
                            <button class="navbar-toggler header-toggler" type="button" data-bs-toggle="collapse"
                                data-bs-target="#headerMenu" aria-controls="headerMenu" aria-expanded="false"
                                aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <div class="collapse navbar-collapse" id="headerMenu">
                                <div class="row">
                                    <div class="col-12 col-lg-12">
                                        <div class="header-menu-inner">
                                            <div class="header-links-spacer" aria-hidden="true"></div>
                                            <ul class="header-links list-unstyled mb-0">
                                                <li>
                                                    <button class="header-link-trigger" data-menu="certified"
                                                        aria-expanded="false" aria-haspopup="true"
                                                        aria-controls="content-certified">
                                                        Get Certified
                                                    </button>
                                                </li>
                                                <li>
                                                    <button class="header-link-trigger" data-menu="teams"
                                                        aria-expanded="false" aria-haspopup="true"
                                                        aria-controls="content-teams">
                                                        Transform Teams
                                                    </button>
                                                </li>
                                                <li>
                                                    <button class="header-link-trigger" >
                                                        Explore Insights
                                                    </button>
                                                </li>
                                            </ul>
                                            <div class="mobile-mega-content" id="mobileMegaContent" aria-live="polite">
                                            </div>
                                            <div class="header-right">
                                                <a href="#" class="header-account-link body-small">My Account</a>
                                                <a href="#" class="header-cta btn body">Start Here</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div id="shared-bg" role="region" aria-live="polite">
                <div class="container">
                    <div class="row">
                        <div class="col-12 col-lg-12">
                            <div class="menu-content" id="content-certified" role="menu">
                                <div class="mega-menu-container">
                                    <div class="menu-col-intro">
                                        <h2>Become the<br>Experience Architect.</h2>
                                        <p>
                                            Structured certification pathways that build usability mastery, ethical
                                            persuasion
                                            capability, and enterprise-scale experience leadership.
                                        </p>
                                        <a href="#" class="explore-link mb-1 mb-sm-3">Explore Certification Pathway</a>
                                        <a href="<?php echo base_url(); ?>courses/all-courses" class="courses-link">All Courses</a>
                                    </div>
                                    <div class="menu-col-certs">
                                        <span class="col-label">Certifications</span>
                                        <ul>
                                            <li class="cert-items">
                                                <a href="<?php echo base_url(); ?>certification/cua" class="cert-item menu-link">
                                                    <h3>Certified Usability Architect (CUA&trade;)</h3>
                                                    <p>
                                                        Design scalable, human-centered systems grounded in cognitive
                                                        science,
                                                        evidence, and usability leadership.
                                                    </p>
                                                </a>
                                            </li>
                                            <li class="cert-items">
                                                <a href="<?php echo base_url(); ?>certification/cdpa" class="cert-item menu-link">
                                                    <h3>Certified Digital Persuasion Architect (CDPA&trade;)</h3>
                                                    <p>
                                                        Architect ethical persuasion systems that guide decisions, build
                                                        trust, and
                                                        drive sustainable digital performance.
                                                    </p>
                                                </a>
                                            </li>
                                            <li class="cert-items">
                                                <a href="<?php echo base_url(); ?>certification/cxa" class="cert-item menu-link">
                                                    <h3>Certified Experience Architect (CXA&trade;)</h3>
                                                    <p>
                                                        Lead experience as an enterprise capability by aligning
                                                        strategy,
                                                        governance, and organizational maturity.
                                                    </p>
                                                </a>
                                            </li>
                                            <li class="cert-items">
                                                <a href="#" class="cert-item menu-link">
                                                    <h3>Certification Exams</h3>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="menu-col-courses">
                                        <span class="col-label">Courses</span>
                                        <div class="course-group">
                                            <span class="group-label">Foundations</span>
                                            <ul>
                                                <li><a href="<?php echo base_url(); ?>courses/science-of-experience-design" class="menu-link">Science of Experience Design</a></li>
                                                <li><a href="<?php echo base_url(); ?>courses/principles-of-experience-research-and-strategy" class="menu-link">Principles of
                                                        Experience Research and Strategy</a>
                                                </li>
                                            </ul>
                                        </div>
                                        <div class="course-group">
                                            <span class="group-label">Systems and Interfaces</span>
                                            <ul>
                                                <li><a href="<?php echo base_url(); ?>courses/principles-of-interface-design-and-design-systems" class="menu-link">Principles of Interface Design and
                                                        Design
                                                        Systems</a></li>
                                                <li><a href="<?php echo base_url(); ?>courses/experience-performance-evaluation" class="menu-link">Experience Performance Evaluation</a>
                                                </li>
                                            </ul>
                                        </div>
                                        <div class="course-group">
                                            <span class="group-label">Influence and Trust</span>
                                            <ul>
                                                <li><a href="#" class="menu-link">Persuasion, Emotion and Trust in
                                                        Design</a></li>
                                                <li><a href="#" class="menu-link">Digital Persuasion Architecture</a>
                                                </li>
                                            </ul>
                                        </div>
                                        <div class="course-group">
                                            <span class="group-label">Strategy and Enterprise Leadership</span>
                                            <ul>
                                                <li><a href="#" class="menu-link">CX and Strategy Architect</a></li>
                                                <li><a href="#" class="menu-link">Experience Practice Architect</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="menu-content teams-grid" id="content-teams" role="menu">
                                <div class="mega-menu-container">
                                    <div class="menu-col-intro">
                                        <h2>Build Experience<br>Capability that Scales.</h2>
                                        <p>
                                            Structured programs that align teams, leaders, and organizations around
                                            usable,
                                            ethical, and high-performing digital experiences.
                                        </p>
                                        <a href="#" class="explore-link">Explore Enterprise Programs</a>
                                    </div>

                                    <div class="menu-col-certs">
                                        <span class="col-label">Programs</span>
                                        <div class="cert-items">
                                            <a href="#" class="cert-item menu-link">
                                                <h3>Essentials of Experience Design</h3>
                                                <p>
                                                    Create a shared human-centered language across cross-functional
                                                    teams to improve
                                                    usability, clarity, and decision-making.
                                                </p>
                                            </a>
                                        </div>

                                        <div class="cert-items">
                                            <a href="#" class="cert-item menu-link">
                                                <h3>AI-Powered Persuasion Strategist</h3>
                                                <p>
                                                    Enable responsible influence in AI-driven ecosystems through
                                                    PET-aligned
                                                    frameworks for teams and leaders.
                                                </p>
                                            </a>
                                        </div>
                                    </div>

                                    <div class="menu-col-courses">
                                        <span class="col-label">Work with us</span>

                                        <div class="course-group">
                                            <ul>
                                                <li><a href="#" class="menu-link">Case Studies</a></li>
                                                <li><a href="#" class="menu-link">Industry Focus</a></li>
                                                <li><a href="#" class="menu-link">Request a Proposal</a></li>
                                                <li><a href="#" class="menu-link">Download Corporate Brochure</a></li>
                                                <li><a href="#" class="menu-link">Speak to an Enterprise Advisor</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="logo-slider-section">
                                <div class="row">
                                    <div class="col-12 col-lg-12">
                                        <p class="body text-center logo-slider-text">Building experience capability from individual practitioners to global enterprises.</p>
                                    </div>
                                </div>
                                <br>
                                <div class="logo-marquee">
                                    <div class="logo-marquee-track">
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>