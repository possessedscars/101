/* ==========================================================
   101 • SISTEMA DE PULSEIRAS
   ==========================================================
   Módulo reutilizável de compra de pulseiras para eventos.

   COMO USAR NUMA PÁGINA DE EVENTO:

   1) Antes de incluir este ficheiro, define a configuração:

        <script>
          window.PULSEIRAS_CONFIG = {
            evento: "SubmundØ Funk",       // nome mostrado ao utilizador
            eventoSlug: "submundo-funk",   // usado no código do pedido
            data: "29 Julho 2026",         // texto livre
            preco: 150,                    // preço de 1 pulseira
            moeda: "$",                    // símbolo (dinheiro do jogo)
            maxPorPessoa: 6,                // limite de pulseiras por pedido
            // Cola aqui o URL do teu Webhook do Discord:
            // Servidor > Definições do Canal > Integrações > Webhooks > Novo Webhook > Copiar URL
            webhookUrl: "COLOCA_AQUI_O_TEU_DISCORD_WEBHOOK_URL"
          };
        </script>
        <link rel="stylesheet" href="../css/pulseiras.css">
        <script src="../js/pulseiras.js"></script>

   2) Qualquer botão/elemento com o atributo [data-open-pulseiras]
      abre o modal de compra automaticamente:

        <button data-open-pulseiras>COMPRAR PULSEIRA →</button>

   3) (Opcional) Se a página tiver um bloco de seleção de
      quantidade com estes IDs, o script sincroniza-os:

        #pzQty          -> span com o número de pulseiras
        #pzQtyMinus     -> botão "-"
        #pzQtyPlus      -> botão "+"
        #pzTotal        -> span com o total calculado

   Sem backend: o pedido (dados + print do comprovativo) é
   enviado diretamente para um Webhook do Discord através de
   fetch/FormData. A equipa confirma o pagamento manualmente
   no canal do Discord.
========================================================== */

(function () {

    const cfg = Object.assign({
        evento: "Evento 1Ø1",
        eventoSlug: "evento",
        data: "",
        preco: 100,
        moeda: "$",
        maxPorPessoa: 8,
        webhookUrl: ""
    }, window.PULSEIRAS_CONFIG || {});

    const MAX_IMG_MB = 8;
    const state = {
        qty: 1,
        file: null,
        step: 1,
        sending: false
    };

    /* ---------------------------------------------------
       INJETAR O MODAL NO DOM
    --------------------------------------------------- */

    function buildModal() {

        const wrap = document.createElement("div");

        wrap.innerHTML = `
        <div class="pz-overlay" id="pzOverlay">
            <div class="pz-modal" role="dialog" aria-modal="true">

                <button class="pz-close" id="pzClose" aria-label="Fechar">✕</button>

                <div class="pz-steps-track">
                    <span data-step="1" class="active"></span>
                    <span data-step="2"></span>
                    <span data-step="3"></span>
                    <span data-step="4"></span>
                </div>

                <!-- STEP 1: QUANTIDADE -->
                <div class="pz-step active" data-step="1">
                    <span class="pz-eyebrow">${escapeHtml(cfg.evento.toUpperCase())}</span>
                    <h3>ESCOLHE A QUANTIDADE</h3>
                    <p class="pz-sub">Cada pulseira dá acesso garantido ao evento. Confirma quantas queres levar.</p>

                    <div class="pz-summary-row">
                        <div class="qty-control">
                            <button type="button" class="qty-btn" id="pzModalMinus">−</button>
                            <span class="qty-value" id="pzModalQty">1</span>
                            <button type="button" class="qty-btn" id="pzModalPlus">+</button>
                        </div>
                        <div style="text-align:right">
                            <div style="color:#999;font-size:12px;letter-spacing:1px">PREÇO UNITÁRIO</div>
                            <strong style="font-size:20px">${cfg.moeda}${cfg.preco}</strong>
                        </div>
                    </div>

                    <div class="pz-total-line">
                        <span style="color:#999;font-size:13px;letter-spacing:2px">TOTAL A PAGAR</span>
                        <strong id="pzModalTotal">${cfg.moeda}${cfg.preco}</strong>
                    </div>

                    <div class="pz-actions">
                        <button type="button" class="pz-btn pz-btn-primary" id="pzToStep2" style="flex:1">
                            CONTINUAR →
                        </button>
                    </div>
                </div>

                <!-- STEP 2: DADOS DO COMPRADOR -->
                <div class="pz-step" data-step="2">
                    <span class="pz-eyebrow">OS TEUS DADOS</span>
                    <h3>QUEM VAI LEVANTAR</h3>
                    <p class="pz-sub">Usa o teu nome de personagem e o teu Discord para a equipa te encontrar rápido.</p>

                    <div class="pz-field">
                        <label>NOME DA PERSONAGEM (IC)</label>
                        <input type="text" id="pzNome" placeholder="Ex: John Doe" autocomplete="off">
                    </div>

                    <div class="pz-field">
                        <label>DISCORD (UTILIZADOR)</label>
                        <input type="text" id="pzDiscord" placeholder="Ex: nome_utilizador" autocomplete="off">
                    </div>

                    <div class="pz-field">
                        <label>CONTACTO / TELEMÓVEL (OPCIONAL)</label>
                        <input type="text" id="pzContacto" placeholder="Opcional" autocomplete="off">
                    </div>

                    <div class="pz-error" id="pzErrorStep2">Preenche o nome e o Discord para continuar.</div>

                    <div class="pz-actions">
                        <button type="button" class="pz-btn pz-btn-ghost" data-back="1">← VOLTAR</button>
                        <button type="button" class="pz-btn pz-btn-primary" id="pzToStep3">CONTINUAR →</button>
                    </div>
                </div>

                <!-- STEP 3: COMPROVATIVO -->
                <div class="pz-step" data-step="3">
                    <span class="pz-eyebrow">PAGAMENTO INGAME</span>
                    <h3>ENVIA O COMPROVATIVO</h3>
                    <p class="pz-sub">Faz a transferência ingame e anexa aqui o print (screenshot) da transação.</p>

                    <label class="pz-dropzone" id="pzDropzone">
                        <input type="file" id="pzFile" accept="image/*">
                        <div class="pz-drop-icon">📎</div>
                        <strong>Clica ou arrasta o print para aqui</strong>
                        <small>PNG ou JPG • até ${MAX_IMG_MB}MB</small>
                    </label>

                    <div class="pz-preview" id="pzPreview">
                        <img id="pzPreviewImg" alt="Pré-visualização">
                        <span class="pz-preview-name" id="pzPreviewName"></span>
                        <button type="button" class="pz-preview-remove" id="pzPreviewRemove">REMOVER</button>
                    </div>

                    <label class="pz-checkbox">
                        <input type="checkbox" id="pzConfirm">
                        Confirmo que o comprovativo enviado é verídico e corresponde a uma transferência real ingame.
                    </label>

                    <div class="pz-error" id="pzErrorStep3">Anexa o comprovativo e confirma a checkbox para continuar.</div>

                    <div class="pz-actions">
                        <button type="button" class="pz-btn pz-btn-ghost" data-back="2">← VOLTAR</button>
                        <button type="button" class="pz-btn pz-btn-primary" id="pzSubmit">
                            <span id="pzSubmitLabel">CONFIRMAR PEDIDO →</span>
                        </button>
                    </div>

                    <div class="pz-error" id="pzErrorSubmit">Não foi possível enviar o pedido. Tenta novamente ou contacta a equipa no Discord.</div>
                </div>

                <!-- STEP 4: SUCESSO -->
                <div class="pz-step" data-step="4">
                    <div class="pz-success">
                        <div class="pz-success-icon">✓</div>
                        <h3>PEDIDO ENVIADO!</h3>
                        <p class="pz-sub">
                            O teu pedido foi enviado para a equipa da 1Ø1. Assim que o comprovativo
                            for validado, a tua pulseira fica confirmada. Guarda o código abaixo.
                        </p>

                        <div class="pz-order-code">
                            <span id="pzOrderCode">101-0000</span>
                            <button type="button" id="pzCopyCode">COPIAR</button>
                        </div>

                        <div class="pz-actions">
                            <button type="button" class="pz-btn pz-btn-primary" id="pzFinish" style="flex:1">
                                CONCLUIR
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        `;

        document.body.appendChild(wrap.firstElementChild);
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, s => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[s]));
    }

    /* ---------------------------------------------------
       HELPERS DE UI
    --------------------------------------------------- */

    let els = {};

    function cacheEls() {
        els = {
            overlay: document.getElementById("pzOverlay"),
            close: document.getElementById("pzClose"),
            modalQty: document.getElementById("pzModalQty"),
            modalTotal: document.getElementById("pzModalTotal"),
            minus: document.getElementById("pzModalMinus"),
            plus: document.getElementById("pzModalPlus"),
            toStep2: document.getElementById("pzToStep2"),
            toStep3: document.getElementById("pzToStep3"),
            nome: document.getElementById("pzNome"),
            discord: document.getElementById("pzDiscord"),
            contacto: document.getElementById("pzContacto"),
            errorStep2: document.getElementById("pzErrorStep2"),
            errorStep3: document.getElementById("pzErrorStep3"),
            errorSubmit: document.getElementById("pzErrorSubmit"),
            dropzone: document.getElementById("pzDropzone"),
            fileInput: document.getElementById("pzFile"),
            preview: document.getElementById("pzPreview"),
            previewImg: document.getElementById("pzPreviewImg"),
            previewName: document.getElementById("pzPreviewName"),
            previewRemove: document.getElementById("pzPreviewRemove"),
            confirm: document.getElementById("pzConfirm"),
            submit: document.getElementById("pzSubmit"),
            submitLabel: document.getElementById("pzSubmitLabel"),
            orderCode: document.getElementById("pzOrderCode"),
            copyCode: document.getElementById("pzCopyCode"),
            finish: document.getElementById("pzFinish"),
            stepsTrack: document.querySelectorAll(".pz-steps-track span"),
            steps: document.querySelectorAll(".pz-step")
        };
    }

    function goToStep(n) {

        state.step = n;

        els.steps.forEach(s => {
            s.classList.toggle("active", Number(s.dataset.step) === n);
        });

        els.stepsTrack.forEach(s => {
            const stepN = Number(s.dataset.step);
            s.classList.toggle("done", stepN < n);
            s.classList.toggle("active", stepN <= n);
        });

    }

    function updateQtyUI() {

        if (els.modalQty) els.modalQty.textContent = state.qty;
        if (els.modalTotal) els.modalTotal.textContent = cfg.moeda + (state.qty * cfg.preco);

        // sincroniza com bloco da página, se existir
        const pageQty = document.getElementById("pzQty");
        const pageTotal = document.getElementById("pzTotal");

        if (pageQty) pageQty.textContent = state.qty;
        if (pageTotal) pageTotal.textContent = cfg.moeda + (state.qty * cfg.preco);

    }

    function changeQty(delta) {

        const next = state.qty + delta;

        if (next < 1 || next > cfg.maxPorPessoa) return;

        state.qty = next;
        updateQtyUI();

    }

    function openModal(presetQty) {

        if (presetQty && presetQty > 0) {
            state.qty = Math.min(presetQty, cfg.maxPorPessoa);
        }

        updateQtyUI();
        goToStep(1);

        els.overlay.classList.add("open");
        document.body.style.overflow = "hidden";

    }

    function closeModal() {

        els.overlay.classList.remove("open");
        els.overlay.style.removeProperty("opacity");
        els.overlay.style.removeProperty("visibility");
        els.overlay.style.removeProperty("pointer-events");
        document.body.style.overflow = "";

    }

    /* ---------------------------------------------------
       UPLOAD DO COMPROVATIVO
    --------------------------------------------------- */

    function handleFile(file) {

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Por favor envia uma imagem (PNG ou JPG).");
            return;
        }

        if (file.size > MAX_IMG_MB * 1024 * 1024) {
            alert(`A imagem excede o limite de ${MAX_IMG_MB}MB.`);
            return;
        }

        state.file = file;

        const reader = new FileReader();

        reader.onload = e => {
            els.previewImg.src = e.target.result;
            els.previewName.textContent = file.name;
            els.preview.classList.add("show");
        };

        reader.readAsDataURL(file);

    }

    // reduz o tamanho da imagem antes de enviar (mais rápido, cabe no webhook)
    function compressImage(file) {

        return new Promise(resolve => {

            const img = new Image();
            const reader = new FileReader();

            reader.onload = e => {

                img.onload = () => {

                    const maxW = 1400;
                    const scale = Math.min(1, maxW / img.width);

                    const canvas = document.createElement("canvas");
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob(blob => resolve(blob || file), "image/jpeg", 0.82);

                };

                img.onerror = () => resolve(file);
                img.src = e.target.result;

            };

            reader.onerror = () => resolve(file);
            reader.readAsDataURL(file);

        });

    }

    /* ---------------------------------------------------
       CÓDIGO DE PEDIDO
    --------------------------------------------------- */

    function generateOrderCode() {

        const prefix = (cfg.eventoSlug || "101").replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "101";
        const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
        const time = Date.now().toString(36).slice(-4).toUpperCase();

        return `101-${prefix}-${rand}${time}`;

    }

    /* ---------------------------------------------------
       ENVIO PARA O DISCORD (WEBHOOK)
    --------------------------------------------------- */

    async function sendOrder(orderCode) {

        const payload = {
            embeds: [{
                title: "🎟️ NOVO PEDIDO DE PULSEIRA",
                color: 0x7C3AED,
                fields: [
                    { name: "Evento", value: cfg.evento, inline: true },
                    { name: "Código", value: orderCode, inline: true },
                    { name: "Quantidade", value: String(state.qty), inline: true },
                    { name: "Total", value: `${cfg.moeda}${state.qty * cfg.preco}`, inline: true },
                    { name: "Nome (IC)", value: els.nome.value.trim() || "—", inline: true },
                    { name: "Discord", value: els.discord.value.trim() || "—", inline: true },
                    { name: "Contacto", value: els.contacto.value.trim() || "—", inline: true }
                ],
                footer: { text: "1Ø1 • Sistema de Pulseiras" },
                timestamp: new Date().toISOString()
            }]
        };

        const form = new FormData();
        form.append("payload_json", JSON.stringify(payload));

        if (state.file) {
            const compressed = await compressImage(state.file);
            form.append("files[0]", compressed, "comprovativo.jpg");
        }

        if (!cfg.webhookUrl || cfg.webhookUrl.includes("COLOCA_AQUI")) {
            throw new Error("Webhook não configurado");
        }

        const res = await fetch(cfg.webhookUrl, {
            method: "POST",
            body: form
        });

        if (!res.ok) throw new Error("Falha no envio (" + res.status + ")");

    }

    /* ---------------------------------------------------
       CONFETTI
    --------------------------------------------------- */

    function fireConfetti() {

        let canvas = document.getElementById("pz-confetti-canvas");

        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = "pz-confetti-canvas";
            document.body.appendChild(canvas);
        }

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext("2d");
        const colors = ["#7C3AED", "#A855F7", "#d1b8ff", "#ffffff", "#34d399"];

        const pieces = Array.from({ length: 140 }, () => ({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * canvas.height * 0.3,
            r: 4 + Math.random() * 5,
            c: colors[Math.floor(Math.random() * colors.length)],
            vy: 2 + Math.random() * 3,
            vx: -2 + Math.random() * 4,
            rot: Math.random() * 360,
            vr: -6 + Math.random() * 12
        }));

        let frame = 0;
        const maxFrames = 130;

        function tick() {

            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            pieces.forEach(p => {

                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.vr;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot * Math.PI / 180);
                ctx.fillStyle = p.c;
                ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
                ctx.restore();

            });

            if (frame < maxFrames) {
                requestAnimationFrame(tick);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

        }

        requestAnimationFrame(tick);

    }

    /* ---------------------------------------------------
       VALIDAÇÃO POR STEP
    --------------------------------------------------- */

    function validateStep2() {

        const ok = els.nome.value.trim().length > 1 && els.discord.value.trim().length > 1;
        els.errorStep2.classList.toggle("show", !ok);
        return ok;

    }

    function validateStep3() {

        const ok = !!state.file && els.confirm.checked;
        els.errorStep3.classList.toggle("show", !ok);
        return ok;

    }

    /* ---------------------------------------------------
       WIRING
    --------------------------------------------------- */

    function wireEvents() {

        els.close.addEventListener("click", closeModal);

        els.overlay.addEventListener("click", e => {
            if (e.target === els.overlay) closeModal();
        });

        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && els.overlay.classList.contains("open")) closeModal();
        });

        els.minus.addEventListener("click", () => changeQty(-1));
        els.plus.addEventListener("click", () => changeQty(1));

        els.toStep2.addEventListener("click", () => goToStep(2));

        els.toStep3.addEventListener("click", () => {
            if (validateStep2()) goToStep(3);
        });

        document.querySelectorAll("[data-back]").forEach(btn => {
            btn.addEventListener("click", () => goToStep(Number(btn.dataset.back)));
        });

        els.dropzone.addEventListener("dragover", e => {
            e.preventDefault();
            els.dropzone.classList.add("drag");
        });

        els.dropzone.addEventListener("dragleave", () => {
            els.dropzone.classList.remove("drag");
        });

        els.dropzone.addEventListener("drop", e => {
            e.preventDefault();
            els.dropzone.classList.remove("drag");
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        });

        els.fileInput.addEventListener("change", e => {
            handleFile(e.target.files[0]);
        });

        els.previewRemove.addEventListener("click", () => {
            state.file = null;
            els.fileInput.value = "";
            els.preview.classList.remove("show");
        });

        els.submit.addEventListener("click", async () => {

            if (!validateStep3() || state.sending) return;

            state.sending = true;
            els.submit.disabled = true;
            els.errorSubmit.classList.remove("show");
            els.submitLabel.textContent = "A ENVIAR...";

            const orderCode = generateOrderCode();

            try {

                await sendOrder(orderCode);

                els.orderCode.textContent = orderCode;
                goToStep(4);
                fireConfetti();

            } catch (err) {

                console.error("[pulseiras] erro ao enviar pedido:", err);
                els.errorSubmit.classList.add("show");

            } finally {

                state.sending = false;
                els.submit.disabled = false;
                els.submitLabel.textContent = "CONFIRMAR PEDIDO →";

            }

        });

        els.copyCode.addEventListener("click", () => {

            navigator.clipboard.writeText(els.orderCode.textContent).then(() => {
                els.copyCode.textContent = "COPIADO ✓";
                setTimeout(() => els.copyCode.textContent = "COPIAR", 1800);
            });

        });

        els.finish.addEventListener("click", () => {

            closeModal();

            setTimeout(() => {

                // reset para o próximo pedido
                state.qty = 1;
                state.file = null;
                els.nome.value = "";
                els.discord.value = "";
                els.contacto.value = "";
                els.confirm.checked = false;
                els.fileInput.value = "";
                els.preview.classList.remove("show");
                els.errorStep2.classList.remove("show");
                els.errorStep3.classList.remove("show");
                els.errorSubmit.classList.remove("show");
                goToStep(1);
                updateQtyUI();

            }, 400);

        });

        // gatilhos na página
        document.querySelectorAll("[data-open-pulseiras]").forEach(btn => {
            btn.addEventListener("click", e => {
                e.preventDefault();
                const preset = document.getElementById("pzQty");
                openModal(preset ? Number(preset.textContent) : null);
            });
        });

        // stepper opcional já presente na página
        const pageMinus = document.getElementById("pzQtyMinus");
        const pagePlus = document.getElementById("pzQtyPlus");

        if (pageMinus) pageMinus.addEventListener("click", () => changeQty(-1));
        if (pagePlus) pagePlus.addEventListener("click", () => changeQty(1));

    }

    /* ---------------------------------------------------
       BOTÃO FLUTUANTE
    --------------------------------------------------- */

    function setupFloatingButton() {

        const section = document.getElementById("pulseiras");
        if (!section) return;

        const fab = document.createElement("button");
        fab.className = "pz-floating-btn";
        fab.setAttribute("data-open-pulseiras", "");
        fab.innerHTML = `🎟️ <span class="pz-fb-text">COMPRAR PULSEIRA</span>`;
        document.body.appendChild(fab);

        window.addEventListener("scroll", () => {

            const rect = section.getBoundingClientRect();
            const pastSection = rect.top < 0;
            const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 300);

            fab.classList.toggle("visible", pastSection && !nearBottom);

        });

    }

    /* ---------------------------------------------------
       INIT
    --------------------------------------------------- */

    function init() {

        buildModal();
        cacheEls();
        wireEvents();
        updateQtyUI();
        setupFloatingButton();

    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // expõe uma API mínima caso seja preciso abrir o modal via outro script
    window.Pulseiras = {
        open: openModal,
        close: closeModal
    };

})();
