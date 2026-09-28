/* ==========================================================
   101 • SISTEMA DE PULSEIRAS
   ========================================================== */

(function () {

    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */

    const cfg = Object.assign({
        evento: "Evento 1Ø1",
        eventoSlug: "evento",
        data: "",
        preco: 400,
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


    /* =====================================================
       CRIAR MODAL
       ===================================================== */

    function buildModal() {

        const wrap = document.createElement("div");

        wrap.innerHTML = `

        <div class="pz-overlay" id="pzOverlay">

            <div
                class="pz-modal"
                role="dialog"
                aria-modal="true"
            >

                <button
                    class="pz-close"
                    id="pzClose"
                    aria-label="Fechar"
                >
                    ✕
                </button>


                <div class="pz-steps-track">

                    <span data-step="1" class="active"></span>
                    <span data-step="2"></span>
                    <span data-step="3"></span>
                    <span data-step="4"></span>

                </div>


                <!-- =================================================
                     STEP 1 • QUANTIDADE
                ================================================== -->

                <div
                    class="pz-step active"
                    data-step="1"
                >

                    <span class="pz-eyebrow">
                        ${escapeHtml(cfg.evento.toUpperCase())}
                    </span>


                    <h3>
                        ESCOLHE A QUANTIDADE
                    </h3>


                    <p class="pz-sub">
                        Cada pulseira dá acesso ao evento.
                        Escolhe abaixo a quantidade que pretendes.
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


                            <strong style="font-size:20px;">
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
                     STEP 2 • DADOS
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
                        Introduz os teus dados para podermos
                        associar o pagamento ao pedido.
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
                            placeholder="Opcional"
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
                        Realiza primeiro a transferência para o
                        <strong>IBAN 253</strong> no valor
                        correspondente ao teu pedido.
                        Depois, tira um print da transação e
                        envia-o abaixo como comprovativo.
                    </p>


                    <!-- =================================================
                         CAIXA DE PAGAMENTO
                    ================================================== -->

                    <div
                        style="
                            margin:24px 0;
                            padding:22px;
                            border:1px solid rgba(145,70,255,.35);
                            border-radius:18px;
                            background:
                                linear-gradient(
                                    135deg,
                                    rgba(145,70,255,.12),
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
                                margin-bottom:18px;
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
                                        font-size:28px;
                                        letter-spacing:2px;
                                    "
                                >
                                    253
                                </strong>

                            </div>


                            <div
                                style="
                                    text-align:right;
                                "
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
                                margin-bottom:16px;
                            "
                        ></div>


                        <div
                            style="
                                font-size:12px;
                                line-height:1.6;
                                color:#aaa;
                            "
                        >

                            <strong style="color:#fff;">
                                IMPORTANTE:
                            </strong>

                            A transferência deve ser feita para o
                            <strong style="color:#fff;">
                                IBAN 253
                            </strong>.

                            Após concluir o pagamento,

                            <strong style="color:#fff;">
                                tira um print da transação
                            </strong>

                            e envia-o neste formulário.

                        </div>

                    </div>


                    <!-- =================================================
                         COMPROVATIVO
                    ================================================== -->

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


                    <!-- =================================================
                         PREVIEW
                    ================================================== -->

                    <div
                        class="pz-preview"
                        id="pzPreview"
                    >

                        <img
                            id="pzPreviewImg"
                            alt="Pré-visualização do comprovativo"
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


                    <!-- =================================================
                         CONFIRMAÇÃO
                    ================================================== -->

                    <label class="pz-checkbox">

                        <input
                            type="checkbox"
                            id="pzConfirm"
                        >

                        <span>

                            Confirmo que fiz a transferência
                            para o <strong>IBAN 253</strong>
                            e que o comprovativo enviado
                            corresponde a uma transferência real.

                        </span>

                    </label>


                    <div
                        class="pz-error"
                        id="pzErrorStep3"
                    >
                        Faz a transferência para o IBAN 253,
                        envia o print do pagamento e confirma
                        a caixa acima para continuar.
                    </div>


                    <!-- =================================================
                         BOTÕES
                    ================================================== -->

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
                        Tenta novamente ou contacta a equipa
                        no Discord.
                    </div>

                </div>


                <!-- =================================================
                     STEP 4 • SUCESSO
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

                            O teu pedido foi enviado para a
                            equipa da 1Ø1.

                            Assim que o comprovativo for validado,
                            a tua pulseira fica confirmada.

                            Guarda o código abaixo.

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
                document.getElementById("pzOverlay"),

            close:
                document.getElementById("pzClose"),

            modalQty:
                document.getElementById("pzModalQty"),

            modalTotal:
                document.getElementById("pzModalTotal"),

            paymentTotal:
                document.getElementById("pzPaymentTotal"),

            minus:
                document.getElementById("pzModalMinus"),

            plus:
                document.getElementById("pzModalPlus"),

            toStep2:
                document.getElementById("pzToStep2"),

            toStep3:
                document.getElementById("pzToStep3"),

            nome:
                document.getElementById("pzNome"),

            discord:
                document.getElementById("pzDiscord"),

            contacto:
                document.getElementById("pzContacto"),

            errorStep2:
                document.getElementById("pzErrorStep2"),

            errorStep3:
                document.getElementById("pzErrorStep3"),

            errorSubmit:
                document.getElementById("pzErrorSubmit"),

            dropzone:
                document.getElementById("pzDropzone"),

            fileInput:
                document.getElementById("pzFile"),

            preview:
                document.getElementById("pzPreview"),

            previewImg:
                document.getElementById("pzPreviewImg"),

            previewName:
                document.getElementById("pzPreviewName"),

            previewRemove:
                document.getElementById("pzPreviewRemove"),

            confirm:
                document.getElementById("pzConfirm"),

            submit:
                document.getElementById("pzSubmit"),

            submitLabel:
                document.getElementById("pzSubmitLabel"),

            orderCode:
                document.getElementById("pzOrderCode"),

            copyCode:
                document.getElementById("pzCopyCode"),

            finish:
                document.getElementById("pzFinish"),

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
       MUDAR STEP
       ===================================================== */

    function goToStep(n) {

        state.step = n;


        els.steps.forEach(step => {

            step.classList.toggle(
                "active",
                Number(step.dataset.step) === n
            );

        });


        els.stepsTrack.forEach(step => {

            const stepN =
                Number(step.dataset.step);


            step.classList.toggle(
                "done",
                stepN < n
            );


            step.classList.toggle(
                "active",
                stepN <= n
            );

        });

    }


    /* =====================================================
       ATUALIZAR QUANTIDADE
       ===================================================== */

    function updateQtyUI() {

        const total =
            state.qty * cfg.preco;


        if (els.modalQty) {

            els.modalQty.textContent =
                state.qty;

        }


        if (els.modalTotal) {

            els.modalTotal.textContent =
                cfg.moeda + total;

        }


        /*
         * VALOR A TRANSFERIR
         */

        if (els.paymentTotal) {

            els.paymentTotal.textContent =
                cfg.moeda + total;

        }


        /*
         * ELEMENTOS OPCIONAIS
         */

        const pageQty =
            document.getElementById("pzQty");


        const pageTotal =
            document.getElementById("pzTotal");


        if (pageQty) {

            pageQty.textContent =
                state.qty;

        }


        if (pageTotal) {

            pageTotal.textContent =
                cfg.moeda + total;

        }

    }


    function changeQty(delta) {

        const next =
            state.qty + delta;


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
       ABRIR MODAL
       ===================================================== */

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


    /* =====================================================
       FECHAR MODAL
       ===================================================== */

    function closeModal() {

        els.overlay.classList.remove(
            "open"
        );


        els.overlay.style.removeProperty(
            "opacity"
        );


        els.overlay.style.removeProperty(
            "visibility"
        );


        els.overlay.style.removeProperty(
            "pointer-events"
        );


        document.body.style.overflow =
            "";

    }


    /* =====================================================
       UPLOAD
       ===================================================== */

    function handleFile(file) {

        if (!file) {

            return;

        }


        if (
            !file.type.startsWith("image/")
        ) {

            alert(
                "Por favor envia uma imagem (PNG ou JPG)."
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


        state.file =
            file;


        const reader =
            new FileReader();


        reader.onload = e => {

            els.previewImg.src =
                e.target.result;


            els.previewName.textContent =
                file.name;


            els.preview.classList.add(
                "show"
            );

        };


        reader.readAsDataURL(
            file
        );

    }


    /* =====================================================
       COMPRESSÃO DA IMAGEM
       ===================================================== */

    function compressImage(file) {

        return new Promise(resolve => {

            const img =
                new Image();


            const reader =
                new FileReader();


            reader.onload = e => {

                img.onload = () => {

                    const maxW =
                        1400;


                    const scale =
                        Math.min(
                            1,
                            maxW / img.width
                        );


                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    canvas.width =
                        img.width * scale;


                    canvas.height =
                        img.height * scale;


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    ctx.drawImage(
                        img,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );


                    canvas.toBlob(

                        blob => {

                            resolve(
                                blob || file
                            );

                        },

                        "image/jpeg",

                        0.82

                    );

                };


                img.onerror = () => {

                    resolve(file);

                };


                img.src =
                    e.target.result;

            };


            reader.onerror = () => {

                resolve(file);

            };


            reader.readAsDataURL(
                file
            );

        });

    }


    /* =====================================================
       GERAR CÓDIGO DO PEDIDO
       ===================================================== */

    function generateOrderCode() {

        const prefix =
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


        const rand =
            Math.random()
                .toString(36)
                .slice(2, 6)
                .toUpperCase();


        const time =
            Date.now()
                .toString(36)
                .slice(-4)
                .toUpperCase();


        return `101-${prefix}-${rand}${time}`;

    }


    /* =====================================================
       ENVIAR PEDIDO PARA DISCORD
       ===================================================== */

    async function sendOrder(orderCode) {

        console.log(
            "[101] A iniciar envio do pedido:",
            orderCode
        );


        /* -------------------------------------------------
           VALIDAR WEBHOOK
        ------------------------------------------------- */

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


        /* -------------------------------------------------
           VALIDAR COMPROVATIVO
        ------------------------------------------------- */

        if (!state.file) {

            throw new Error(
                "Nenhum comprovativo foi selecionado."
            );

        }


        /* -------------------------------------------------
           DADOS
        ------------------------------------------------- */

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
           EMBED DISCORD
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

                        `Um novo pedido foi submetido através do ` +
                        `sistema oficial de pulseiras da **1Ø1**.`,


                    color:
                        0x9146FF,


                    fields: [

                        /* ---------------------------------
                           CÓDIGO
                        --------------------------------- */

                        {

                            name:
                                "🎫  CÓDIGO DO PEDIDO",

                            value:
                                `\`${orderCode}\``,

                            inline:
                                false

                        },


                        /* ---------------------------------
                           COMPRADOR
                        --------------------------------- */

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


                        /* ---------------------------------
                           PEDIDO
                        --------------------------------- */

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


                        /* ---------------------------------
                           PAGAMENTO
                        --------------------------------- */

                        {

                            name:
                                "💳  PAGAMENTO",

                            value:
                                [
                                    "**IBAN**",
                                    "`253`",
                                    "",
                                    "**Valor transferido**",
                                    `**${total}**`,
                                    "",
                                    "📸 Comprovativo anexado abaixo."
                                ].join("\n"),

                            inline:
                                false

                        },


                        /* ---------------------------------
                           ESTADO
                        --------------------------------- */

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


                    /* -------------------------------------
                       COMPROVATIVO
                    ------------------------------------- */

                    image: {

                        url:
                            "attachment://comprovativo.jpg"

                    },


                    /* -------------------------------------
                       FOOTER
                    ------------------------------------- */

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
           COMPRIMIR COMPROVATIVO
        ================================================= */

        console.log(
            "[101] A comprimir comprovativo..."
        );


        const compressed =
            await compressImage(
                state.file
            );


        console.log(
            "[101] Comprovativo pronto:",
            compressed.size,
            "bytes"
        );


        /* =================================================
           FORM DATA
        ================================================= */

        const form =
            new FormData();


        form.append(
            "payload_json",
            JSON.stringify(payload)
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

        } catch (error) {

            console.error(
                "[101] Webhook inválido:",
                error
            );


            throw new Error(
                "O URL do webhook do Discord é inválido."
            );

        }


        webhookUrl.searchParams.set(
            "wait",
            "true"
        );


        /* =================================================
           ENVIAR
        ================================================= */

        let response;


        try {

            console.log(
                "[101] A enviar pedido para o Discord..."
            );


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


        } catch (networkError) {

            console.error(
                "[101] Erro de rede:",
                networkError
            );


            throw new Error(
                "Não foi possível contactar o Discord. Verifica a ligação ou o webhook."
            );

        }


        /* =================================================
           RESPOSTA
        ================================================= */

        const responseText =
            await response.text();


        console.log(
            "[101] Resposta Discord:",
            response.status,
            responseText
        );


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


        /* =================================================
           SUCESSO
        ================================================= */

        console.log(
            "[101] Pedido enviado com sucesso."
        );


        return true;

    }


    /* =====================================================
       CONFETTI
       ===================================================== */

    function fireConfetti() {

        let canvas =
            document.getElementById(
                "pz-confetti-canvas"
            );


        if (!canvas) {

            canvas =
                document.createElement(
                    "canvas"
                );


            canvas.id =
                "pz-confetti-canvas";


            document.body.appendChild(
                canvas
            );

        }


        canvas.width =
            window.innerWidth;


        canvas.height =
            window.innerHeight;


        const ctx =
            canvas.getContext(
                "2d"
            );


        const colors = [
            "#7C3AED",
            "#A855F7",
            "#d1b8ff",
            "#ffffff",
            "#34d399"
        ];


        const pieces =
            Array.from(
                {
                    length: 140
                },

                () => ({

                    x:
                        Math.random() *
                        canvas.width,

                    y:
                        -20 -
                        Math.random() *
                        canvas.height *
                        0.3,

                    r:
                        4 +
                        Math.random() *
                        5,

                    c:
                        colors[
                            Math.floor(
                                Math.random() *
                                colors.length
                            )
                        ],

                    vy:
                        2 +
                        Math.random() *
                        3,

                    vx:
                        -2 +
                        Math.random() *
                        4,

                    rot:
                        Math.random() *
                        360,

                    vr:
                        -6 +
                        Math.random() *
                        12

                })

            );


        let frame =
            0;


        const maxFrames =
            130;


        function tick() {

            frame++;


            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            pieces.forEach(p => {

                p.x += p.vx;

                p.y += p.vy;

                p.rot += p.vr;


                ctx.save();


                ctx.translate(
                    p.x,
                    p.y
                );


                ctx.rotate(
                    p.rot *
                    Math.PI /
                    180
                );


                ctx.fillStyle =
                    p.c;


                ctx.fillRect(
                    -p.r / 2,
                    -p.r / 2,
                    p.r,
                    p.r * 0.6
                );


                ctx.restore();

            });


            if (
                frame <
                maxFrames
            ) {

                requestAnimationFrame(
                    tick
                );

            } else {

                ctx.clearRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

            }

        }


        requestAnimationFrame(
            tick
        );

    }


    /* =====================================================
       VALIDAR STEP 2
       ===================================================== */

    function validateStep2() {

        const ok =
            els.nome.value.trim().length > 1 &&
            els.discord.value.trim().length > 1;


        els.errorStep2.classList.toggle(
            "show",
            !ok
        );


        return ok;

    }


    /* =====================================================
       VALIDAR STEP 3
       ===================================================== */

    function validateStep3() {

        const ok =
            !!state.file &&
            els.confirm.checked;


        els.errorStep3.classList.toggle(
            "show",
            !ok
        );


        return ok;

    }


    /* =====================================================
       EVENTOS
       ===================================================== */

    function wireEvents() {


        /* =================================================
           FECHAR
        ================================================= */

        els.close.addEventListener(
            "click",
            closeModal
        );


        /* =================================================
           CLICAR FORA
        ================================================= */

        els.overlay.addEventListener(
            "click",
            e => {

                if (
                    e.target ===
                    els.overlay
                ) {

                    closeModal();

                }

            }
        );


        /* =================================================
           ESC
        ================================================= */

        document.addEventListener(
            "keydown",
            e => {

                if (
                    e.key === "Escape" &&
                    els.overlay.classList.contains(
                        "open"
                    )
                ) {

                    closeModal();

                }

            }
        );


        /* =================================================
           QUANTIDADE
        ================================================= */

        els.minus.addEventListener(
            "click",
            () => changeQty(-1)
        );


        els.plus.addEventListener(
            "click",
            () => changeQty(1)
        );


        /* =================================================
           STEP 1 → STEP 2
        ================================================= */

        els.toStep2.addEventListener(
            "click",
            () => {

                goToStep(2);

            }
        );


        /* =================================================
           STEP 2 → STEP 3
        ================================================= */

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


        /* =================================================
           VOLTAR
        ================================================= */

        document
            .querySelectorAll(
                "[data-back]"
            )
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        goToStep(
                            Number(
                                btn.dataset.back
                            )
                        );

                    }
                );

            });


        /* =================================================
           DRAGOVER
        ================================================= */

        els.dropzone.addEventListener(
            "dragover",
            e => {

                e.preventDefault();

                els.dropzone.classList.add(
                    "drag"
                );

            }
        );


        /* =================================================
           DRAG LEAVE
        ================================================= */

        els.dropzone.addEventListener(
            "dragleave",
            () => {

                els.dropzone.classList.remove(
                    "drag"
                );

            }
        );


        /* =================================================
           DROP
        ================================================= */

        els.dropzone.addEventListener(
            "drop",
            e => {

                e.preventDefault();

                els.dropzone.classList.remove(
                    "drag"
                );


                if (
                    e.dataTransfer.files[0]
                ) {

                    handleFile(
                        e.dataTransfer.files[0]
                    );

                }

            }
        );


        /* =================================================
           FILE
        ================================================= */

        els.fileInput.addEventListener(
            "change",
            e => {

                handleFile(
                    e.target.files[0]
                );

            }
        );


        /* =================================================
           REMOVER COMPROVATIVO
        ================================================= */

        els.previewRemove.addEventListener(
            "click",
            () => {

                state.file =
                    null;


                els.fileInput.value =
                    "";


                els.preview.classList.remove(
                    "show"
                );


                els.previewImg.src =
                    "";


                els.previewName.textContent =
                    "";

            }
        );


        /* =================================================
           ENVIAR PEDIDO
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


                    /* -------------------------------------
                       SUCESSO
                    ------------------------------------- */

                    els.orderCode.textContent =
                        orderCode;


                    goToStep(4);


                    fireConfetti();


                } catch (err) {

                    console.error(
                        "[pulseiras] erro ao enviar pedido:",
                        err
                    );


                    els.errorSubmit.textContent =
                        err &&
                        err.message
                            ? err.message
                            : "Não foi possível enviar o pedido.";


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


        /* =================================================
           COPIAR CÓDIGO
        ================================================= */

        els.copyCode.addEventListener(
            "click",
            () => {

                navigator.clipboard
                    .writeText(
                        els.orderCode.textContent
                    )
                    .then(
                        () => {

                            els.copyCode.textContent =
                                "COPIADO ✓";


                            setTimeout(
                                () => {

                                    els.copyCode.textContent =
                                        "COPIAR";

                                },
                                1800
                            );

                        }
                    );

            }
        );


        /* =================================================
           CONCLUIR
        ================================================= */

        els.finish.addEventListener(
            "click",
            () => {

                closeModal();


                setTimeout(
                    () => {

                        state.qty =
                            1;


                        state.file =
                            null;


                        els.nome.value =
                            "";


                        els.discord.value =
                            "";


                        els.contacto.value =
                            "";


                        els.confirm.checked =
                            false;


                        els.fileInput.value =
                            "";


                        els.preview.classList.remove(
                            "show"
                        );


                        els.previewImg.src =
                            "";


                        els.previewName.textContent =
                            "";


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

                    },
                    400
                );

            }
        );


        /* =================================================
           ABRIR MODAL
        ================================================= */

        document
            .querySelectorAll(
                "[data-open-pulseiras]"
            )
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    e => {

                        e.preventDefault();


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

            });


        /* =================================================
           STEPPER OPCIONAL
        ================================================= */

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
       BOTÃO FLUTUANTE
       ===================================================== */

    function setupFloatingButton() {

        const section =
            document.getElementById(
                "pulseiras"
            );


        if (!section) {

            return;

        }


        const fab =
            document.createElement(
                "button"
            );


        fab.className =
            "pz-floating-btn";


        fab.setAttribute(
            "data-open-pulseiras",
            ""
        );


        fab.innerHTML =
            `🎟️ <span class="pz-fb-text">COMPRAR PULSEIRA</span>`;


        document.body.appendChild(
            fab
        );


        window.addEventListener(
            "scroll",
            () => {

                const rect =
                    section.getBoundingClientRect();


                const pastSection =
                    rect.top < 0;


                const nearBottom =
                    (
                        window.innerHeight +
                        window.scrollY
                    ) >=
                    (
                        document.body.scrollHeight -
                        300
                    );


                fab.classList.toggle(
                    "visible",
                    pastSection &&
                    !nearBottom
                );

            }
        );

    }


    /* =====================================================
       INIT
       ===================================================== */

    function init() {

        buildModal();

        cacheEls();

        wireEvents();

        updateQtyUI();

        setupFloatingButton();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.Pulseiras = {

        open:
            openModal,

        close:
            closeModal

    };


})();
