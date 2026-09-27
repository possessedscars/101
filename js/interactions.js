/* ==========================================================
   101 • MICRO-INTERAÇÕES
   ==========================================================
   Pequenos efeitos globais para tornar o site mais vivo:
   - botões "magnéticos" que seguem ligeiramente o cursor
   - inclinação 3D suave em cards ao passar o rato
   Sem dependências. Basta incluir este ficheiro em qualquer
   página (idealmente depois do resto do JS).
========================================================== */

(function () {

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return; // em telemóvel isto não faz sentido

    /* -------------------- BOTÕES MAGNÉTICOS -------------------- */

    const magneticSelectors = [
        ".primary-btn", ".secondary-btn", ".pz-buy-btn",
        ".pz-floating-btn", ".about-button", ".location-btn"
    ];

    document.querySelectorAll(magneticSelectors.join(",")).forEach(btn => {

        btn.addEventListener("mousemove", e => {

            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;

        });

        btn.addEventListener("mouseleave", () => {
            btn.style.transform = "";
        });

    });

    /* -------------------- TILT NOS CARDS -------------------- */

    const tiltSelectors = [".info-card", ".count-box", ".event-card"];

    document.querySelectorAll(tiltSelectors.join(",")).forEach(card => {

        card.style.transformStyle = "preserve-3d";
        card.style.willChange = "transform";

        card.addEventListener("mousemove", e => {

            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;

            card.style.transform =
                `perspective(700px) rotateX(${py * -8}deg) rotateY(${px * 8}deg) translateY(-6px)`;

        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });

    });

})();
