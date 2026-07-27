// ==========================================
// 101 WEBSITE
// APP.JS
// ==========================================

// --------------------------
// LOADER
// --------------------------

window.addEventListener("load", () => {

    document.body.classList.add("loading");

    const loader = document.getElementById("loader");
    const reveal = document.querySelector(".logo-reveal");

    let progress = 0;

    const timer = setInterval(() => {

        progress++;

        reveal.style.width = progress + "%";

        if (progress >= 100) {

            clearInterval(timer);

            setTimeout(() => {

                loader.style.opacity = "0";
                loader.style.visibility = "hidden";

                document.body.classList.remove("loading");
                document.body.classList.add("loaded");

            }, 300);

        }

    }, 18);

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

/* ===========================
   EMAILJS
=========================== */

emailjs.init({
    publicKey: "hX_u9GAOjJ2vsqVVb"
});

document.addEventListener("DOMContentLoaded", () => {

    emailjs.init({
        publicKey: "hX_u9GAOjJ2vsqVVb"
    });

    const form = document.getElementById("contact-form");
    const button = document.getElementById("send-btn");

    if (!form || !button) {
        console.error("Formulário ou botão não encontrados.");
        return;
    }

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        button.disabled = true;
        button.textContent = "A ENVIAR...";

        try {

            await emailjs.sendForm(
                "service_96uq7qr",
                "template_st2eux6",
                form
            );

            button.textContent = "✓ MENSAGEM ENVIADA";
            form.reset();

        } catch (err) {

            console.error(err);

            button.textContent = "ERRO AO ENVIAR";

        }

        setTimeout(() => {

            button.disabled = false;
            button.textContent = "ENVIAR MENSAGEM →";

        },3000);

    });

});
const button = document.getElementById("send-btn");

if (form && button) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        button.disabled = true;
        button.textContent = "A ENVIAR...";

        try {

            await emailjs.sendForm(
                "service_96uq7qr",
                "template_st2eux6",
                form
            );

            button.textContent = "✓ MENSAGEM ENVIADA";

            form.reset();

            setTimeout(() => {

                button.disabled = false;
                button.textContent = "ENVIAR MENSAGEM →";

            }, 3000);

        } catch (error) {

            console.error("Erro EmailJS:", error);

            button.disabled = false;
            button.textContent = "ERRO AO ENVIAR";

            setTimeout(() => {

                button.textContent = "ENVIAR MENSAGEM →";

            }, 3000);

        }

    });

}
