/* ==========================================================
   1Ø1 • SISTEMA DE PULSEIRAS
   Versão otimizada
   ========================================================== */

(function () {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */
/* =====================================================
   CONFIGURAÇÃO GLOBAL
===================================================== */

    const cfg = Object.assign({
        evento: "Evento 1Ø1",
        eventoSlug: "evento",
        data: "",
        preco: 100,
        moeda: "$",
        maxPorPessoa: 8,
        webhookUrl: ""
    }, window.PULSEIRAS_CONFIG || {});



    function getAutomaticEventName() {

    // 1. Tenta usar o título da página
    const title = document.title || "";

    if (title.includes("•")) {

        const titleEvent = title
            .split("•")
            .slice(1)
            .join("•")
            .trim();

        if (titleEvent) {
            return titleEvent;
        }

    }

    // 2. Tenta encontrar um título principal na página
    const heading = document.querySelector(
        "h1[data-event-name], .event-title, .hero-title, h1"
    );

    if (heading) {

        const headingText = heading.textContent
            .replace(/\s+/g, " ")
            .trim();

        if (headingText) {
            return headingText;
        }

    }

    // 3. Usa o slug da configuração
    if (cfg.eventoSlug) {

        return cfg.eventoSlug
            .replace(/[-_]+/g, " ")
            .toUpperCase();

    }

    // 4. Último fallback
    return "EVENTO 1Ø1";
}


if (
    !window.PULSEIRAS_CONFIG?.evento ||
    window.PULSEIRAS_CONFIG.evento.trim() === ""
) {

    cfg.evento = getAutomaticEventName();

}


    const MAX_IMG_MB = 8;

    const PAYMENT_IBAN = "ALT4263227";


    const state = {

        qty: 1,

        file: null,

        previewUrl: null,

        step: 1,

        sending: false

    };


    /* =====================================================
       MODAL
    ===================================================== */

    function buildModal() {

        const wrap =
            document.createElement("div");


        wrap.innerHTML = `

        <div
            class="pz-overlay"
            id="pzOverlay"
        >

            <div
                class="pz-modal"
                role="dialog"
                aria-modal="true"
            >

                <button
                    class="pz-close"
                    id="pzClose"
                    aria-label="Fechar"
                    type="button"
                >
                    ✕
                </button>


                <!-- PROGRESSO -->

                <div class="pz-steps-track">

                    <span
                        data-step="1"
                        class="active"
                    ></span>

                    <span data-step="2"></span>

                    <span data-step="3"></span>

                    <span data-step="4"></span>

                </div>


                <!-- =================================================
                     STEP 1
                ================================================== -->

                <div
                    class="pz-step active"
                    data-step="1"
                >

                    <span class="pz-eyebrow">
                        ${escapeHtml(
                            cfg.evento.toUpperCase()
                        )}
                    </span>


                    <h3>
                        ESCOLHE A QUANTIDADE
                    </h3>


                    <p class="pz-sub">
                        Cada pulseira dá acesso ao evento.
                        Escolhe a quantidade que pretendes.
                    </p>


                    <div class="pz-summary-row">

                        <div class="qty-control">

                            <button
                                type="button"
                                class="qty-btn"
                                id="pzModalMinus"
                            >
                                −
                            </button>


                            <span
                                class="qty-value"
                                id="pzModalQty"
                            >
                                1
                            </span>


                            <button
                                type="button"
                                class="qty-btn"
                                id="pzModalPlus"
                            >
                                +
                            </button>

                        </div>


                        <div style="text-align:right">

                            <div
                                style="
                                    color:#999;
                                    font-size:12px;
                                    letter-spacing:1px;
                                "
                            >
                                PREÇO UNITÁRIO
                            </div>


                            <strong
                                style="font-size:20px"
                            >
                                ${cfg.moeda}${cfg.preco}
                            </strong>

                        </div>

                    </div>


                    <div class="pz-total-line">

                        <span
                            style="
                                color:#999;
                                font-size:13px;
                                letter-spacing:2px;
                            "
                        >
                            TOTAL A PAGAR
                        </span>


                        <strong id="pzModalTotal">
                            ${cfg.moeda}${cfg.preco}
                        </strong>

                    </div>


                    <div class="pz-actions">

                        <button
                            type="button"
                            class="pz-btn pz-btn-primary"
                            id="pzToStep2"
                            style="flex:1"
                        >
                            CONTINUAR →
                        </button>

                    </div>

                </div>


                <!-- =================================================
                     STEP 2
                ================================================== -->

                <div
                    class="pz-step"
                    data-step="2"
                >

                    <span class="pz-eyebrow">
                        OS TEUS DADOS
                    </span>


                    <h3>
                        QUEM VAI LEVANTAR
                    </h3>


                    <p class="pz-sub">
                        Introduz os teus dados para associarmos
                        o pagamento ao pedido.
                    </p>


                    <div class="pz-field">

                        <label>
                            NOME DA PERSONAGEM (IC)
                        </label>

                        <input
                            type="text"
                            id="pzNome"
                            placeholder="Ex: John Doe"
                            autocomplete="off"
                        >

                    </div>


                    <div class="pz-field">

                        <label>
                            DISCORD (UTILIZADOR)
                        </label>

                        <input
                            type="text"
                            id="pzDiscord"
                            placeholder="Ex: nome_utilizador"
                            autocomplete="off"
                        >

                    </div>


                    <div class="pz-field">

                        <label>
                            CONTACTO / TELEMÓVEL
                        </label>

                        <input
                            type="text"
                            id="pzContacto"
                            autocomplete="off"
                        >

                    </div>


                    <div
                        class="pz-error"
                        id="pzErrorStep2"
                    >
                        Preenche o nome e o Discord para continuar.
                    </div>


                    <div class="pz-actions">

                        <button
                            type="button"
                            class="pz-btn pz-btn-ghost"
                            data-back="1"
                        >
                            ← VOLTAR
                        </button>


                        <button
                            type="button"
                            class="pz-btn pz-btn-primary"
                            id="pzToStep3"
                        >
                            CONTINUAR →
                        </button>

                    </div>

                </div>


                <!-- =================================================
                     STEP 3 • PAGAMENTO
                ================================================== -->

                <div
                    class="pz-step"
                    data-step="3"
                >

                    <span class="pz-eyebrow">
                        PAGAMENTO
                    </span>


                    <h3>
                        FAZ A TRANSFERÊNCIA
                    </h3>


                    <p class="pz-sub">
                        Faz a transferência para o
                        <strong>IBAN ${PAYMENT_IBAN}</strong>
                        no valor indicado abaixo.
                        Depois, tira um print da transação
                        e envia-o como comprovativo.
                    </p>


                    <!-- PAGAMENTO -->

                    <div
                        style="
                            margin:24px 0;
                            padding:22px;
                            border:1px solid rgba(255,32,32,.35);
                            border-radius:18px;
                            background:
                                linear-gradient(
                                    135deg,
                                    rgba(255,32,32,.10),
                                    rgba(255,255,255,.025)
                                );
                        "
                    >

                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                                align-items:center;
                                gap:20px;
                            "
                        >

                            <div>

                                <div
                                    style="
                                        font-size:10px;
                                        letter-spacing:2px;
                                        color:#999;
                                        margin-bottom:7px;
                                    "
                                >
                                    IBAN
                                </div>


                                <strong
                                    style="
                                        font-size:30px;
                                        letter-spacing:3px;
                                    "
                                >
                                    ${PAYMENT_IBAN}
                                </strong>

                            </div>


                            <div
                                style="text-align:right"
                            >

                                <div
                                    style="
                                        font-size:10px;
                                        letter-spacing:2px;
                                        color:#999;
                                        margin-bottom:7px;
                                    "
                                >
                                    VALOR A TRANSFERIR
                                </div>


                                <strong
                                    id="pzPaymentTotal"
                                    style="
                                        font-size:28px;
                                    "
                                >
                                    ${cfg.moeda}${cfg.preco}
                                </strong>

                            </div>

                        </div>


                        <div
                            style="
                                height:1px;
                                background:rgba(255,255,255,.08);
                                margin:18px 0;
                            "
                        ></div>


                        <div
                            style="
                                font-size:12px;
                                line-height:1.6;
                                color:#aaa;
                            "
                        >

                            <strong style="color:#fff">
                                IMPORTANTE:
                            </strong>

                            A transferência tem de ser feita
                            para o

                            <strong style="color:#fff">
                                IBAN ${PAYMENT_IBAN}
                            </strong>.

                            Depois de concluíres o pagamento,

                            <strong style="color:#fff">
                                tira um print da transação
                            </strong>

                            e envia-o abaixo.

                        </div>

                    </div>


                    <!-- COMPROVATIVO -->

                    <div
                        style="
                            font-size:11px;
                            letter-spacing:2px;
                            color:#999;
                            margin-bottom:10px;
                        "
                    >
                        COMPROVATIVO DE PAGAMENTO
                    </div>


                    <label
                        class="pz-dropzone"
                        id="pzDropzone"
                    >

                        <input
                            type="file"
                            id="pzFile"
                            accept="image/png,image/jpeg,image/jpg"
                        >


                        <div class="pz-drop-icon">
                            📎
                        </div>


                        <strong>
                            CLICA OU ARRASTA O PRINT PARA AQUI
                        </strong>


                        <small>
                            PNG ou JPG • até ${MAX_IMG_MB}MB
                        </small>

                    </label>


                    <!-- PREVIEW -->

                    <div
                        class="pz-preview"
                        id="pzPreview"
                    >

                        <img
                            id="pzPreviewImg"
                            alt="Pré-visualização"
                        >


                        <span
                            class="pz-preview-name"
                            id="pzPreviewName"
                        ></span>


                        <button
                            type="button"
                            class="pz-preview-remove"
                            id="pzPreviewRemove"
                        >
                            REMOVER
                        </button>

                    </div>


                    <!-- CONFIRMAÇÃO -->

                    <label class="pz-checkbox">

                        <input
                            type="checkbox"
                            id="pzConfirm"
                        >


                        <span>

                            Confirmo que fiz a transferência
                            para o

                            <strong>
                                IBAN ${PAYMENT_IBAN}
                            </strong>

                            e que o comprovativo enviado
                            corresponde a uma transferência real.

                        </span>

                    </label>


                    <div
                        class="pz-error"
                        id="pzErrorStep3"
                    >
                        Faz a transferência para o
                        IBAN ${PAYMENT_IBAN},
                        envia o print e confirma a caixa
                        acima para continuar.
                    </div>


                    <div class="pz-actions">

                        <button
                            type="button"
                            class="pz-btn pz-btn-ghost"
                            data-back="2"
                        >
                            ← VOLTAR
                        </button>


                        <button
                            type="button"
                            class="pz-btn pz-btn-primary"
                            id="pzSubmit"
                        >

                            <span id="pzSubmitLabel">
                                CONFIRMAR PEDIDO →
                            </span>

                        </button>

                    </div>


                    <div
                        class="pz-error"
                        id="pzErrorSubmit"
                    >
                        Não foi possível enviar o pedido.
                    </div>

                </div>


                <!-- =================================================
                     STEP 4
                ================================================== -->

                <div
                    class="pz-step"
                    data-step="4"
                >

                    <div class="pz-success">

                        <div class="pz-success-icon">
                            ✓
                        </div>


                        <h3>
                            PEDIDO ENVIADO!
                        </h3>


                        <p class="pz-sub">

                            O teu pedido foi enviado para
                            a equipa da 1Ø1.

                            Assim que o comprovativo for
                            validado, a tua pulseira fica
                            confirmada.

                        </p>


                        <div class="pz-order-code">

                            <span id="pzOrderCode">
                                101-0000
                            </span>


                            <button
                                type="button"
                                id="pzCopyCode"
                            >
                                COPIAR
                            </button>

                        </div>


                        <div class="pz-actions">

                            <button
                                type="button"
                                class="pz-btn pz-btn-primary"
                                id="pzFinish"
                                style="flex:1"
                            >
                                CONCLUIR
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

        `;


        document.body.appendChild(
            wrap.firstElementChild
        );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(str) {

        return String(str).replace(
            /[&<>"']/g,
            s => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[s])
        );

    }


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    let els = {};


    function cacheEls() {

        els = {

            overlay:
                document.getElementById(
                    "pzOverlay"
                ),

            close:
                document.getElementById(
                    "pzClose"
                ),

            modalQty:
                document.getElementById(
                    "pzModalQty"
                ),

            modalTotal:
                document.getElementById(
                    "pzModalTotal"
                ),

            paymentTotal:
                document.getElementById(
                    "pzPaymentTotal"
                ),

            minus:
                document.getElementById(
                    "pzModalMinus"
                ),

            plus:
                document.getElementById(
                    "pzModalPlus"
                ),

            toStep2:
                document.getElementById(
                    "pzToStep2"
                ),

            toStep3:
                document.getElementById(
                    "pzToStep3"
                ),

            nome:
                document.getElementById(
                    "pzNome"
                ),

            discord:
                document.getElementById(
                    "pzDiscord"
                ),

            contacto:
                document.getElementById(
                    "pzContacto"
                ),

            errorStep2:
                document.getElementById(
                    "pzErrorStep2"
                ),

            errorStep3:
                document.getElementById(
                    "pzErrorStep3"
                ),

            errorSubmit:
                document.getElementById(
                    "pzErrorSubmit"
                ),

            dropzone:
                document.getElementById(
                    "pzDropzone"
                ),

            fileInput:
                document.getElementById(
                    "pzFile"
                ),

            preview:
                document.getElementById(
                    "pzPreview"
                ),

            previewImg:
                document.getElementById(
                    "pzPreviewImg"
                ),

            previewName:
                document.getElementById(
                    "pzPreviewName"
                ),

            previewRemove:
                document.getElementById(
                    "pzPreviewRemove"
                ),

            confirm:
                document.getElementById(
                    "pzConfirm"
                ),

            submit:
                document.getElementById(
                    "pzSubmit"
                ),

            submitLabel:
                document.getElementById(
                    "pzSubmitLabel"
                ),

            orderCode:
                document.getElementById(
                    "pzOrderCode"
                ),

            copyCode:
                document.getElementById(
                    "pzCopyCode"
                ),

            finish:
                document.getElementById(
                    "pzFinish"
                ),

            stepsTrack:
                document.querySelectorAll(
                    ".pz-steps-track span"
                ),

            steps:
                document.querySelectorAll(
                    ".pz-step"
                )

        };

    }


    /* =====================================================
       STEPS
    ===================================================== */

    function goToStep(n) {

        state.step = n;


        els.steps.forEach(
            step => {

                step.classList.toggle(
                    "active",
                    Number(step.dataset.step) === n
                );

            }
        );


        els.stepsTrack.forEach(
            step => {

                const number =
                    Number(
                        step.dataset.step
                    );


                step.classList.toggle(
                    "done",
                    number < n
                );


                step.classList.toggle(
                    "active",
                    number <= n
                );

            }
        );

    }


    /* =====================================================
       QUANTIDADE
    ===================================================== */

    function updateQtyUI() {

        const total =
            state.qty *
            cfg.preco;


        if (els.modalQty) {

            els.modalQty.textContent =
                state.qty;

        }


        if (els.modalTotal) {

            els.modalTotal.textContent =
                cfg.moeda +
                total;

        }


        if (els.paymentTotal) {

            els.paymentTotal.textContent =
                cfg.moeda +
                total;

        }


        const pageQty =
            document.getElementById(
                "pzQty"
            );


        const pageTotal =
            document.getElementById(
                "pzTotal"
            );


        if (pageQty) {

            pageQty.textContent =
                state.qty;

        }


        if (pageTotal) {

            pageTotal.textContent =
                cfg.moeda +
                total;

        }

    }


    function changeQty(delta) {

        const next =
            state.qty +
            delta;


        if (
            next < 1 ||
            next > cfg.maxPorPessoa
        ) {

            return;

        }


        state.qty =
            next;


        updateQtyUI();

    }


    /* =====================================================
       ABRIR / FECHAR
    ===================================================== */

    
    /* ---------------------------------------------------
       PERFORMANCE — PAUSAR VÍDEOS ENQUANTO O MODAL ESTÁ ABERTO
       Evita que o vídeo do hero continue a consumir GPU/CPU
       por trás do modal.
    --------------------------------------------------- */

    let pausedBackgroundVideos = [];

    function pauseBackgroundMedia() {
        pausedBackgroundVideos = [];

        document.querySelectorAll("video").forEach(video => {
            if (!video.paused) {
                pausedBackgroundVideos.push(video);
                video.pause();
            }
        });
    }

    function resumeBackgroundMedia() {
        pausedBackgroundVideos.forEach(video => {
            video.play().catch(() => {});
        });

        pausedBackgroundVideos = [];
    }

function openModal(presetQty) {

        if (
            presetQty &&
            presetQty > 0
        ) {

            state.qty =
                Math.min(
                    presetQty,
                    cfg.maxPorPessoa
                );

        }


        updateQtyUI();

        goToStep(1);


        els.overlay.classList.add(
            "open"
        );


        document.body.style.overflow =
            "hidden";

    }


    function closeModal() {

        resumeBackgroundMedia();

        els.overlay.classList.remove(
            "open"
        );


        document.body.style.overflow =
            "";

    }


    /* =====================================================
       PREVIEW DA IMAGEM
       USAMOS OBJECT URL — MUITO MAIS LEVE
    ===================================================== */

    function clearPreview() {

        if (state.previewUrl) {

            URL.revokeObjectURL(
                state.previewUrl
            );

            state.previewUrl =
                null;

        }


        els.previewImg.removeAttribute(
            "src"
        );


        els.previewName.textContent =
            "";


        els.preview.classList.remove(
            "show"
        );

        if (els.dropzone) {
            els.dropzone.classList.remove(
                "pz-file-selected"
            );
        }

    }


    function handleFile(file) {

        if (!file) {

            return;

        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Por favor envia uma imagem PNG ou JPG."
            );

            return;

        }


        if (
            file.size >
            MAX_IMG_MB * 1024 * 1024
        ) {

            alert(
                `A imagem excede o limite de ${MAX_IMG_MB}MB.`
            );

            return;

        }


        clearPreview();


        state.file =
            file;


        state.previewUrl =
            URL.createObjectURL(
                file
            );


        els.previewImg.src =
            state.previewUrl;


        els.previewName.textContent =
            file.name;


        els.preview.classList.add(
            "show"
        );

        if (els.dropzone) {
            els.dropzone.classList.add(
                "pz-file-selected"
            );
        }

    }


    /* =====================================================
       COMPRESSÃO
       APENAS NO MOMENTO DO ENVIO
    ===================================================== */

    async function compressImage(file) {

        if (
            file.size <
            1.5 * 1024 * 1024
        ) {

            return file;

        }


        try {

            const bitmap =
                await createImageBitmap(
                    file
                );


            const maxW =
                1400;


            const scale =
                Math.min(
                    1,
                    maxW / bitmap.width
                );


            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.width =
                Math.round(
                    bitmap.width *
                    scale
                );


            canvas.height =
                Math.round(
                    bitmap.height *
                    scale
                );


            const ctx =
                canvas.getContext(
                    "2d"
                );


            ctx.drawImage(
                bitmap,
                0,
                0,
                canvas.width,
                canvas.height
            );


            bitmap.close();


            const blob =
                await new Promise(
                    resolve => {

                        canvas.toBlob(
                            resolve,
                            "image/jpeg",
                            0.80
                        );

                    }
                );


            return blob || file;

        } catch {

            return file;

        }

    }


    /* =====================================================
       CÓDIGO
    ===================================================== */

    function generateOrderCode() {

            const prefix = "PULS";
            (
                cfg.eventoSlug ||
                "101"
            )
                .replace(
                    /[^a-z0-9]/gi,
                    ""
                )
                .slice(
                    0,
                    4
                )
                .toUpperCase() ||
            "101";


        const random =
            Math.random()
                .toString(36)
                .slice(
                    2,
                    6
                )
                .toUpperCase();


        const time =
            Date.now()
                .toString(36)
                .slice(
                    -4
                )
                .toUpperCase();


        return (
            `101-${prefix}-${random}${time}`
        );

    }


    /* =====================================================
       ENVIO PARA DISCORD
    ===================================================== */

    async function sendOrder(orderCode) {

        if (
            !cfg.webhookUrl ||
            cfg.webhookUrl.includes(
                "COLOCA_AQUI"
            )
        ) {

            throw new Error(
                "O webhook do Discord não está configurado."
            );

        }


        if (!state.file) {

            throw new Error(
                "Nenhum comprovativo foi selecionado."
            );

        }


        const nome =
            els.nome.value.trim() ||
            "—";


        const discord =
            els.discord.value.trim() ||
            "—";


        const contacto =
            els.contacto.value.trim() ||
            "—";


        const quantidade =
            state.qty;


        const total =
            `${cfg.moeda}${state.qty * cfg.preco}`;


        /* =================================================
           EMBED
        ================================================= */

        const payload = {

            username:
                "1Ø1 • TICKETING",


            embeds: [

                {

                    title:
                        "🎟️  NOVO PEDIDO DE PULSEIRA",


                    description:

                        `**${cfg.evento}**\n\n` +

                        `Novo pedido submetido através ` +
                        `do sistema oficial de pulseiras da **1Ø1**.`,


                    color:
                        0x9146FF,


                    fields: [

                        {

                            name:
                                "🎫  CÓDIGO DO PEDIDO",

                            value:
                                `\`${orderCode}\``,

                            inline:
                                false

                        },


                        {

                            name:
                                "👤  COMPRADOR",

                            value:
                                [
                                    "**Nome (IC)**",
                                    nome,
                                    "",
                                    "**Discord**",
                                    discord,
                                    "",
                                    "**Contacto**",
                                    contacto
                                ].join("\n"),

                            inline:
                                true

                        },


                        {

                            name:
                                "🎟️  PEDIDO",

                            value:
                                [
                                    "**Quantidade**",
                                    `${quantidade} ${
                                        quantidade === 1
                                            ? "pulseira"
                                            : "pulseiras"
                                    }`,
                                    "",
                                    "**Preço unitário**",
                                    `${cfg.moeda}${cfg.preco}`,
                                    "",
                                    "**TOTAL**",
                                    `**${total}**`
                                ].join("\n"),

                            inline:
                                true

                        },


                        {

                            name:
                                "💳  PAGAMENTO",

                            value:
                                [
                                    "**IBAN**",
                                    `\`${PAYMENT_IBAN}\``,
                                    "",
                                    "**Valor a transferir**",
                                    `**${total}**`,
                                    "",
                                    "📸 Comprovativo anexado abaixo."
                                ].join("\n"),

                            inline:
                                false

                        },


                        {

                            name:
                                "🟢  ESTADO",

                            value:
                                [
                                    "**AGUARDA VALIDAÇÃO**",
                                    "O pagamento deve ser confirmado pela equipa 1Ø1."
                                ].join("\n"),

                            inline:
                                false

                        }

                    ],


                    image: {

                        url:
                            "attachment://comprovativo.jpg"

                    },


                    footer: {

                        text:
                            "1Ø1 • Sistema Oficial de Pulseiras"

                    },


                    timestamp:
                        new Date().toISOString()

                }

            ]

        };


        /* =================================================
           COMPRIMIR
        ================================================= */

        const compressed =
            await compressImage(
                state.file
            );


        /* =================================================
           FORM DATA
        ================================================= */

        const form =
            new FormData();


        form.append(
            "payload_json",
            JSON.stringify(
                payload
            )
        );


        form.append(
            "files[0]",
            compressed,
            "comprovativo.jpg"
        );


        /* =================================================
           WEBHOOK
        ================================================= */

        let webhookUrl;


        try {

            webhookUrl =
                new URL(
                    cfg.webhookUrl
                );

        } catch {

            throw new Error(
                "O URL do webhook do Discord é inválido."
            );

        }


        webhookUrl.searchParams.set(
            "wait",
            "true"
        );


        /* =================================================
           ENVIO
        ================================================= */

        let response;


        try {

            response =
                await fetch(
                    webhookUrl.toString(),
                    {

                        method:
                            "POST",

                        body:
                            form

                    }
                );

        } catch {

            throw new Error(
                "Não foi possível contactar o Discord. Verifica a ligação ou o webhook."
            );

        }


        const responseText =
            await response.text();


        /* =================================================
           ERRO
        ================================================= */

        if (!response.ok) {

            let details =
                "";


            try {

                const json =
                    JSON.parse(
                        responseText
                    );


                details =
                    json.message ||
                    json.error ||
                    "";

            } catch {

                details =
                    responseText;

            }


            throw new Error(

                `Discord recusou o pedido (${response.status})` +

                (
                    details
                        ? `: ${details}`
                        : ""
                )

            );

        }


        return true;

    }


    /* =====================================================
       VALIDAÇÃO
    ===================================================== */

    function validateStep2() {

        const valid =
            els.nome.value.trim().length > 1 &&
            els.discord.value.trim().length > 1;


        els.errorStep2.classList.toggle(
            "show",
            !valid
        );


        return valid;

    }


    function validateStep3() {

        const valid =
            !!state.file &&
            els.confirm.checked;


        els.errorStep3.classList.toggle(
            "show",
            !valid
        );


        return valid;

    }


    /* =====================================================
       EVENTOS
    ===================================================== */

    function wireEvents() {


        /* FECHAR */

        els.close.addEventListener(
            "click",
            closeModal
        );


        /* CLICAR FORA */

        els.overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    els.overlay
                ) {

                    closeModal();

                }

            }
        );


        /* ESC */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape" &&
                    els.overlay.classList.contains(
                        "open"
                    )
                ) {

                    closeModal();

                }

            }
        );


        /* QUANTIDADE */

        els.minus.addEventListener(
            "click",
            () => changeQty(-1)
        );


        els.plus.addEventListener(
            "click",
            () => changeQty(1)
        );


        /* STEP 1 */

        els.toStep2.addEventListener(
            "click",
            () => {

                goToStep(2);

            }
        );


        /* STEP 2 */

        els.toStep3.addEventListener(
            "click",
            () => {

                if (
                    validateStep2()
                ) {

                    goToStep(3);

                }

            }
        );


        /* VOLTAR */

        document
            .querySelectorAll(
                "[data-back]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            goToStep(
                                Number(
                                    button.dataset.back
                                )
                            );

                        }
                    );

                }
            );


        /* DRAG */

        els.dropzone.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                els.dropzone.classList.add(
                    "drag"
                );

            }
        );


        els.dropzone.addEventListener(
            "dragleave",
            () => {

                els.dropzone.classList.remove(
                    "drag"
                );

            }
        );


        els.dropzone.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                els.dropzone.classList.remove(
                    "drag"
                );


                const file =
                    event
                        .dataTransfer
                        .files[0];


                if (file) {

                    handleFile(
                        file
                    );

                }

            }
        );


        /* INPUT */

        els.fileInput.addEventListener(
            "change",
            event => {

                handleFile(
                    event.target.files[0]
                );

            }
        );


        /* REMOVER */

        els.previewRemove.addEventListener(
            "click",
            () => {

                state.file =
                    null;


                clearPreview();


                els.fileInput.value =
                    "";

            }
        );


        /* =================================================
           ENVIAR
        ================================================= */

        els.submit.addEventListener(
            "click",
            async () => {

                if (
                    !validateStep3() ||
                    state.sending
                ) {

                    return;

                }


                state.sending =
                    true;


                els.submit.disabled =
                    true;


                els.errorSubmit.classList.remove(
                    "show"
                );


                els.submitLabel.textContent =
                    "A ENVIAR...";


                const orderCode =
                    generateOrderCode();


                try {

                    await sendOrder(
                        orderCode
                    );


                    els.orderCode.textContent =
                        orderCode;


                    goToStep(4);


                } catch (error) {

                    console.error(
                        "[101] Erro:",
                        error
                    );


                    els.errorSubmit.textContent =
                        error.message ||
                        "Não foi possível enviar o pedido.";


                    els.errorSubmit.classList.add(
                        "show"
                    );


                } finally {

                    state.sending =
                        false;


                    els.submit.disabled =
                        false;


                    els.submitLabel.textContent =
                        "CONFIRMAR PEDIDO →";

                }

            }
        );


        /* COPIAR */

        els.copyCode.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        els.orderCode.textContent
                    );


                    els.copyCode.textContent =
                        "COPIADO ✓";


                    setTimeout(
                        () => {

                            els.copyCode.textContent =
                                "COPIAR";

                        },
                        1500
                    );

                } catch {

                    /* fallback silencioso */

                }

            }
        );


        /* CONCLUIR */

        els.finish.addEventListener(
            "click",
            () => {

                closeModal();


                setTimeout(
                    resetSystem,
                    250
                );

            }
        );


        /* BOTÕES DE ABRIR */

        document
            .querySelectorAll(
                "[data-open-pulseiras]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();


                            const preset =
                                document.getElementById(
                                    "pzQty"
                                );


                            openModal(
                                preset
                                    ? Number(
                                        preset.textContent
                                    )
                                    : null
                            );

                        }
                    );

                }
            );


        /* STEPPER EXTERNO */

        const pageMinus =
            document.getElementById(
                "pzQtyMinus"
            );


        const pagePlus =
            document.getElementById(
                "pzQtyPlus"
            );


        if (pageMinus) {

            pageMinus.addEventListener(
                "click",
                () => changeQty(-1)
            );

        }


        if (pagePlus) {

            pagePlus.addEventListener(
                "click",
                () => changeQty(1)
            );

        }

    }


    /* =====================================================
       RESET
    ===================================================== */

    function resetSystem() {

        state.qty =
            1;

        state.file =
            null;

        state.sending =
            false;


        clearPreview();


        els.fileInput.value =
            "";


        els.nome.value =
            "";

        els.discord.value =
            "";

        els.contacto.value =
            "";


        els.confirm.checked =
            false;


        els.errorStep2.classList.remove(
            "show"
        );


        els.errorStep3.classList.remove(
            "show"
        );


        els.errorSubmit.classList.remove(
            "show"
        );


        goToStep(1);

        updateQtyUI();

    }


    /* =====================================================
       INIT
    ===================================================== */

    function init() {

        buildModal();

        cacheEls();

        wireEvents();

        updateQtyUI();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();

    }


    /* =====================================================
       API
    ===================================================== */

    window.Pulseiras = {

        open:
            openModal,

        close:
            closeModal

    };


})();
