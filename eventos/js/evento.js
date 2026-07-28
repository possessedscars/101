/*==========================================================
101 EVENT EXPERIENCE
==========================================================*/

const EVENT_DATE = new Date("2026-07-29T22:00:00").getTime();

/*==========================================================
COUNTDOWN
==========================================================*/

const days = document.getElementById("days");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");

function updateCountdown() {

    const now = new Date().getTime();
    const distance = EVENT_DATE - now;

    if (distance <= 0) {

        days.textContent = "00";
        hours.textContent = "00";
        minutes.textContent = "00";
        seconds.textContent = "00";

        clearInterval(countdownInterval);

        return;

    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    days.textContent = String(d).padStart(2, "0");
    hours.textContent = String(h).padStart(2, "0");
    minutes.textContent = String(m).padStart(2, "0");
    seconds.textContent = String(s).padStart(2, "0");

}

updateCountdown();

const countdownInterval = setInterval(updateCountdown, 1000);

/*==========================================================
HEADER
==========================================================*/

const header = document.querySelector(".event-header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 60) {

        header.style.background = "rgba(5,5,5,.90)";
        header.style.backdropFilter = "blur(18px)";
        header.style.padding = "22px 70px";

    } else {

        header.style.background =
            "linear-gradient(rgba(0,0,0,.65), transparent)";

        header.style.backdropFilter = "blur(10px)";
        header.style.padding = "32px 70px";

    }

});

/*==========================================================
PARALLAX HERO
==========================================================*/

const heroImage = document.querySelector(".hero-image");

window.addEventListener("scroll", () => {

    const offset = window.scrollY * 0.20;

    heroImage.style.transform =
        `translateY(${offset}px) scale(1.08)`;

});

/*==========================================================
REVEAL ON SCROLL
==========================================================*/

const reveals = document.querySelectorAll(

    ".info-card, .event-about, .event-video, .gallery-item, .location-section, .event-cta"

);

const observer = new IntersectionObserver(

(entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

},

{

    threshold:0.15

}

);

reveals.forEach(item => {

    item.classList.add("hidden");

    observer.observe(item);

});

/*==========================================================
GALLERY
==========================================================*/

document.querySelectorAll(".gallery-item img").forEach(image => {

    image.addEventListener("click", () => {

        window.open(image.src, "_blank");

    });

});

/*==========================================================
BUTTON EFFECT
==========================================================*/

document.querySelectorAll(

".primary-btn,.secondary-btn,.location-btn"

).forEach(button => {

    button.addEventListener("mouseenter", () => {

        button.style.transform = "translateY(-6px)";

    });

    button.addEventListener("mouseleave", () => {

        button.style.transform = "";

    });

});

/*==========================================================
SMOOTH SCROLL
==========================================================*/

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        const target = document.querySelector(

            this.getAttribute("href")

        );

        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({

            behavior:"smooth"

        });

    });

});
