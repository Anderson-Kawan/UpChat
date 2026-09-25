document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("#siteHeader");

    if (!header) return;

    const handleScroll = () => {
        header.classList.toggle("scrolled", window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const menuButton = header.querySelector("#mobileMenuButton");
    const navigation = header.querySelector("#mobileNavigation");

    if (!menuButton || !navigation) return;

    const setMenuOpen = (isOpen) => {
        navigation.classList.toggle("open", isOpen);
        document.body.classList.toggle("mobile-menu-open", isOpen);
        navigation.toggleAttribute("inert", !isOpen);
        navigation.setAttribute("aria-hidden", String(!isOpen));
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    };

    menuButton.addEventListener("click", () => {
        setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
    });

    navigation.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            setMenuOpen(false);
        }
    });

    document.addEventListener("pointerdown", (event) => {
        if (menuButton.getAttribute("aria-expanded") === "true" && !header.contains(event.target)) {
            setMenuOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
            setMenuOpen(false);
            menuButton.focus();
        }
    });

    // Mantém o estado do menu consistente ao alternar entre desktop e celular.
    window.matchMedia("(max-width: 900px)").addEventListener("change", () => {
        setMenuOpen(false);
    });

    setMenuOpen(false);
});



/* =========================================
   UPCHAT - NAVEGAÇÃO ENTRE MÓDULOS
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const moduleTabs = document.querySelectorAll(".module-tab");
    const modulePanels = document.querySelectorAll(".module-panel");

    if (!moduleTabs.length || !modulePanels.length) {
        return;
    }

    function activateModule(moduleName, moveFocus = false) {

        const selectedTab = document.querySelector(
            '.module-tab[data-module="' + moduleName + '"]'
        );

        const selectedPanel = document.querySelector(
            '.module-panel[data-panel="' + moduleName + '"]'
        );

        if (!selectedTab || !selectedPanel) {
            return;
        }

        // Atualiza as abas
        moduleTabs.forEach(function (tab) {

            const isActive = tab === selectedTab;

            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
            tab.tabIndex = isActive ? 0 : -1;

        });

        // Atualiza os painéis
        modulePanels.forEach(function (panel) {

            const isActive = panel === selectedPanel;

            panel.classList.toggle("active", isActive);
            panel.hidden = !isActive;

        });

        if (moveFocus) {
            selectedTab.focus();
        }
    }

    // Clique nas abas
    moduleTabs.forEach(function (tab, index) {

        tab.addEventListener("click", function () {
            activateModule(tab.dataset.module);
        });

        // Navegação acessível pelo teclado
        tab.addEventListener("keydown", function (event) {

            let nextIndex = index;

            if (event.key === "ArrowRight") {
                nextIndex = (index + 1) % moduleTabs.length;
            }
            else if (event.key === "ArrowLeft") {
                nextIndex = (index - 1 + moduleTabs.length) % moduleTabs.length;
            }
            else if (event.key === "Home") {
                nextIndex = 0;
            }
            else if (event.key === "End") {
                nextIndex = moduleTabs.length - 1;
            }
            else {
                return;
            }

            event.preventDefault();

            const nextTab = moduleTabs[nextIndex];

            activateModule(nextTab.dataset.module, true);

        });

    });

    // Garante que Atendimento comece selecionado
    activateModule("atendimento");

});


/* =========================================
   UPCHAT - CARROSSEL DE INTEGRAÇÕES
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.querySelector("[data-integrations-carousel]");

    if (!carousel) {
        return;
    }

    const viewport = carousel.querySelector("[data-carousel-viewport]");
    const track = carousel.querySelector("[data-carousel-track]");
    const previousButton = carousel.querySelector("[data-integrations-previous]");
    const nextButton = carousel.querySelector("[data-integrations-next]");
    const originalCards = Array.from(track?.querySelectorAll(".integration-card") || []);

    if (!viewport || !track || !originalCards.length) {
        return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const autoplaySpeed = 58;
    let isDragging = false;
    let isTouching = false;
    let isVisible = true;
    let dragStartX = 0;
    let dragStartScroll = 0;
    let hasDragged = false;
    let resumeAt = 0;
    let previousFrame = null;
    let automaticPosition = 0;

    originalCards.forEach(function (card) {
        const clone = card.cloneNode(true);

        clone.setAttribute("aria-hidden", "true");
        clone.tabIndex = -1;

        const cloneImage = clone.querySelector("img");

        if (cloneImage) {
            cloneImage.alt = "";
        }

        track.appendChild(clone);
    });

    const getGap = () => {
        const styles = window.getComputedStyle(track);
        return Number.parseFloat(styles.columnGap || styles.gap) || 0;
    };

    const getLoopWidth = () => (track.scrollWidth + getGap()) / 2;

    const normalizePosition = (position) => {
        const loopWidth = getLoopWidth();

        if (!loopWidth) {
            return 0;
        }

        while (position >= loopWidth) {
            position -= loopWidth;
        }

        while (position < 0) {
            position += loopWidth;
        }

        return position;
    };

    const canAutoplay = (timestamp) => (
        !document.hidden &&
        isVisible &&
        !isDragging &&
        !isTouching &&
        timestamp >= resumeAt
    );

    const animate = (timestamp) => {
        if (previousFrame === null) {
            previousFrame = timestamp;
        }

        const elapsed = Math.min(timestamp - previousFrame, 50);
        previousFrame = timestamp;

        if (canAutoplay(timestamp)) {
            automaticPosition = normalizePosition(
                automaticPosition + autoplaySpeed * (elapsed / 1000)
            );
            viewport.scrollLeft = automaticPosition;
        }

        window.requestAnimationFrame(animate);
    };

    viewport.addEventListener("pointerleave", (event) => {
        if (event.pointerType === "mouse") {
            if (isDragging) {
                isDragging = false;
                viewport.classList.remove("is-dragging");
            }
        }
    });

    viewport.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "mouse") {
            isTouching = true;
            return;
        }

        isDragging = true;
        hasDragged = false;
        dragStartX = event.clientX;
        dragStartScroll = viewport.scrollLeft;
        automaticPosition = dragStartScroll;
        viewport.classList.add("is-dragging");
        viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener("pointermove", (event) => {
        if (!isDragging || event.pointerType !== "mouse") {
            return;
        }

        const distance = event.clientX - dragStartX;

        if (Math.abs(distance) > 4) {
            hasDragged = true;
        }

        automaticPosition = normalizePosition(dragStartScroll - distance);
        viewport.scrollLeft = automaticPosition;
    });

    const finishInteraction = (event) => {
        if (event.pointerType === "mouse") {
            if (isDragging && viewport.hasPointerCapture(event.pointerId)) {
                viewport.releasePointerCapture(event.pointerId);
            }

            isDragging = false;
            viewport.classList.remove("is-dragging");
        } else {
            isTouching = false;
            automaticPosition = normalizePosition(viewport.scrollLeft);
        }

        resumeAt = performance.now() + 1200;
    };

    viewport.addEventListener("pointerup", finishInteraction);
    viewport.addEventListener("pointercancel", finishInteraction);

    viewport.addEventListener("wheel", () => {
        resumeAt = performance.now() + 1000;

        window.requestAnimationFrame(() => {
            automaticPosition = normalizePosition(viewport.scrollLeft);
        });
    }, { passive: true });

    carousel.addEventListener("click", (event) => {
        if (hasDragged) {
            event.preventDefault();
            hasDragged = false;
        }
    }, true);

    carousel.addEventListener("focusout", (event) => {
        if (!carousel.contains(event.relatedTarget)) {
            resumeAt = performance.now() + 800;
        }
    });

    viewport.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
            return;
        }

        event.preventDefault();

        const firstCard = originalCards[0];
        const step = firstCard.getBoundingClientRect().width + getGap();

        automaticPosition = normalizePosition(
            viewport.scrollLeft + (event.key === "ArrowRight" ? step : -step)
        );

        viewport.scrollTo({
            left: automaticPosition,
            behavior: reducedMotion.matches ? "auto" : "smooth"
        });

        resumeAt = performance.now() + 1200;
    });

    const moveCarousel = (direction) => {
        const firstCard = originalCards[0];
        const step = firstCard.getBoundingClientRect().width + getGap();
        const loopWidth = getLoopWidth();
        let currentPosition = viewport.scrollLeft;

        if (direction < 0 && currentPosition < step) {
            currentPosition += loopWidth;
            viewport.scrollLeft = currentPosition;
        }

        automaticPosition = normalizePosition(currentPosition + (step * direction));
        viewport.scrollTo({
            left: automaticPosition,
            behavior: reducedMotion.matches ? "auto" : "smooth"
        });
        resumeAt = performance.now() + 1600;
    };

    previousButton?.addEventListener("click", () => moveCarousel(-1));
    nextButton?.addEventListener("click", () => moveCarousel(1));

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0]?.isIntersecting ?? true;
        }, { threshold: 0.15 });

        observer.observe(carousel);
    }

    window.requestAnimationFrame(animate);
});


/* =========================================
   UPCHAT - DEPOIMENTOS DE CLIENTES
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.querySelector("[data-testimonial-carousel]");

    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll("[data-testimonial-slide]"));
    const previousButton = carousel.querySelector("[data-testimonial-previous]");
    const nextButton = carousel.querySelector("[data-testimonial-next]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!slides.length || !previousButton || !nextButton) {
        return;
    }

    let activeIndex = 0;
    let autoplayTimer = null;
    let isInteracting = false;
    let isVisible = true;

    const showSlide = (index) => {
        activeIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            const isActive = slideIndex === activeIndex;
            slide.hidden = !isActive;
            slide.setAttribute("aria-hidden", String(!isActive));
        });
    };

    const stopAutoplay = () => {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
    };

    const startAutoplay = () => {
        stopAutoplay();

        if (reducedMotion.matches || isInteracting || !isVisible || document.hidden) {
            return;
        }

        autoplayTimer = window.setInterval(() => {
            showSlide(activeIndex + 1);
        }, 6500);
    };

    const navigate = (direction) => {
        showSlide(activeIndex + direction);
        startAutoplay();
    };

    previousButton.addEventListener("click", () => navigate(-1));
    nextButton.addEventListener("click", () => navigate(1));

    carousel.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            navigate(event.key === "ArrowRight" ? 1 : -1);
        }
    });

    carousel.addEventListener("pointerenter", () => {
        isInteracting = true;
        stopAutoplay();
    });

    carousel.addEventListener("pointerleave", () => {
        isInteracting = false;
        startAutoplay();
    });

    carousel.addEventListener("focusin", () => {
        isInteracting = true;
        stopAutoplay();
    });

    carousel.addEventListener("focusout", (event) => {
        if (!carousel.contains(event.relatedTarget)) {
            isInteracting = false;
            startAutoplay();
        }
    });

    document.addEventListener("visibilitychange", startAutoplay);
    reducedMotion.addEventListener("change", startAutoplay);

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0]?.isIntersecting ?? true;
            startAutoplay();
        }, { threshold: .25 });

        observer.observe(carousel);
    }

    showSlide(0);
    startAutoplay();
});
