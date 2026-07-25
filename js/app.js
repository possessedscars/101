// ==========================================
// 101 WEBSITE
// APP.JS
// ==========================================

// -------------------------------
// LOADER
// -------------------------------

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        loader.style.opacity = "0";
        loader.style.visibility = "hidden";

    }, 1200);

});

// -------------------------------
// NAVBAR
// -------------------------------

const header = document.querySelector("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 80) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

});

// -------------------------------
// CURSOR
// -------------------------------

const cursor = document.querySelector(".cursor");

if (cursor) {

    document.addEventListener("mousemove", (e) => {

        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";

    });

    document.querySelectorAll("a, button").forEach(item => {

        item.addEventListener("mouseenter", () => {
            cursor.style.transform = "translate(-50%,-50%) scale(2)";
        });

        item.addEventListener("mouseleave", () => {
            cursor.style.transform = "translate(-50%,-50%) scale(1)";
        });

    });

}

// -------------------------------
// SCROLL REVEAL
// -------------------------------

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {
    threshold: .15
});

document.querySelectorAll("section").forEach(section => {

    section.classList.add("hidden");

    observer.observe(section);

});

// =========================
// Parallax Hero Vídeo
// =========================

const experience = document.querySelector(".experience-video");

window.addEventListener("scroll", () => {

    if (!experience) return;

    const rect = experience.getBoundingClientRect();

    const visible = window.innerHeight - rect.top;

    if (visible > 0) {

        experience.style.transform =
            `scale(${1 + visible * 0.00008})`;

    }

});