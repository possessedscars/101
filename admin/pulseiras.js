(async function () {

    "use strict";


    console.log("[101] PULSEIRAS.JS INICIADO");


    // =========================================================
    // API
    // =========================================================

    async function api(path, options = {}) {

        const response = await fetch(
            path,
            {
                ...options,
                credentials: "same-origin",
                cache: "no-store"
            }
        );


        if (response.status === 401) {

            location.replace("/admin/");

            throw new Error(
                "Sessão expirada."
            );

        }


        const data =
            await response
                .json()
                .catch(() => ({}));


        if (!response.ok) {

            throw new Error(
                data.error ||
                `Erro HTTP ${response.status}`
            );

        }


        return data;

    }


    // =========================================================
    // ESCAPE
    // =========================================================

    function esc(value) {

        return String(
            value ?? ""
        ).replace(
            /[&<>'"]/g,
            char => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;"
            }[char])
        );

    }


    // =========================================================
    // ELEMENTOS
    // =========================================================

    const email =
        document.getElementById(
            "userEmail"
        );


    const body =
        document.getElementById(
            "pulseirasBody"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const eventFilter =
        document.getElementById(
            "eventFilter"
        );


    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );


    const modal =
        document.getElementById(
            "braceletModal"
        );


    const closeModalButton =
        document.getElementById(
            "closeBraceletModal"
        );


    const modalBraceletCode =
        document.getElementById(
            "modalBraceletCode"
        );


    const braceletDetails =
        document.getElementById(
            "braceletDetails"
        );


    const braceletParticipant =
        document.getElementById(
            "braceletParticipant"
        );


    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    // =========================================================
    // ESTADO
    // =========================================================

    let bracelets = [];

    let currentBracelet = null;


    // =========================================================
    // UTILIZADOR
    // =========================================================

    async function loadUser() {

        try {

            const me =
                await api(
                    "/api/auth/me"
                );


            if (email) {

                email.textContent =
                    me.email ||
                    "Admin";

            }

        } catch (error) {

            console.error(
                "[101] USER:",
                error
            );

        }

    }


    // =========================================================
    // GERAR PULSEIRAS
    // =========================================================

    function buildBracelets(data) {

        const orders =
            Array.isArray(data.orders)
                ? data.orders
                : [];


        const participants =
            Array.isArray(data.participants)
                ? data.participants
                : [];


        const result = [];


        for (const order of orders) {

            const quantity =
                Math.max(
                    0,
                    Number(
                        order.bracelets || 0
                    )
                );


            const orderParticipants =
                participants.filter(
                    participant =>
                        participant.order ===
                        order.number
                );


            for (
                let index = 0;
                index < quantity;
                index++
            ) {

                const participant =
                    orderParticipants[index] ||
                    null;


                const braceletNumber =
                    String(
                        index + 1
                    ).padStart(
                        2,
                        "0"
                    );


                result.push({

                    id:
                        `${order.number}-${braceletNumber}`,

                    number:
                        braceletNumber,

                    code:
                        `${order.number}-${braceletNumber}`,

                    participant:
                        participant?.name ||
                        "Participante por definir",

                    discord:
                        participant?.discord ||
                        order.discord ||
                        "—",

                    contact:
                        participant?.contact ||
                        "—",

                    order:
                        order.number,

                    event:
                        order.event ||
                        "—",

                    status:
                        String(
                            order.status ||
                            "PENDENTE"
                        ).toUpperCase(),

                    total:
                        order.total,

                    createdAt:
                        order.createdAt

                });

            }

        }


        return result;

    }


    // =========================================================
    // CARREGAR
    // =========================================================

    async function load() {

        try {

            body.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="empty"
                    >
                        A carregar…
                    </td>
                </tr>
            `;


            const data =
                await api(
                    "/api/admin/overview"
                );


            bracelets =
                buildBracelets(
                    data
                );


            populateEvents();

            updateStats();

            render();


            console.log(
                "[101] PULSEIRAS:",
                bracelets
            );


        } catch (error) {

            console.error(
                "[101] ERRO PULSEIRAS:",
                error
            );


            body.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="empty"
                    >
                        ${esc(error.message)}
                    </td>
                </tr>
            `;

        }

    }


    // =========================================================
    // ESTATÍSTICAS
    // =========================================================

    function updateStats() {

        const total =
            bracelets.length;


        const paid =
            bracelets.filter(
                item =>
                    item.status ===
                    "PAGO"
            ).length;


        const confirmed =
            bracelets.filter(
                item =>
                    item.status ===
                    "CONFIRMADO"
            ).length;


        const pending =
            bracelets.filter(
                item =>
                    item.status ===
                    "PENDENTE"
            ).length;


        document.getElementById(
            "statTotal"
        ).textContent =
            total;


        document.getElementById(
            "statPaid"
        ).textContent =
            paid;


        document.getElementById(
            "statConfirmed"
        ).textContent =
            confirmed;


        document.getElementById(
            "statPending"
        ).textContent =
            pending;

    }


    // =========================================================
    // EVENTOS
    // =========================================================

    function populateEvents() {

        if (!eventFilter) {
            return;
        }


        const current =
            eventFilter.value;


        const events = [
            ...new Set(
                bracelets
                    .map(
                        bracelet =>
                            bracelet.event
                    )
                    .filter(Boolean)
            )
        ].sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b)
                )
        );


        eventFilter.innerHTML = `
            <option value="">
                Todos os eventos
            </option>

            ${events.map(
                event => `
                    <option
                        value="${esc(event)}"
                    >
                        ${esc(event)}
                    </option>
                `
            ).join("")}
        `;


        if (
            events.includes(
                current
            )
        ) {

            eventFilter.value =
                current;

        }

    }


    // =========================================================
    // FILTROS
    // =========================================================

    function filtered() {

        const search =
            String(
                searchInput?.value ||
                ""
            )
                .trim()
                .toLowerCase();


        const status =
            String(
                statusFilter?.value ||
                ""
            )
                .trim()
                .toUpperCase();


        const event =
            eventFilter?.value ||
            "";


        return bracelets.filter(
            bracelet => {

                const text = [

                    bracelet.code,

                    bracelet.participant,

                    bracelet.order,

                    bracelet.event,

                    bracelet.discord

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                if (
                    search &&
                    !text.includes(
                        search
                    )
                ) {

                    return false;

                }


                if (
                    status &&
                    bracelet.status !==
                        status
                ) {

                    return false;

                }


                if (
                    event &&
                    bracelet.event !==
                        event
                ) {

                    return false;

                }


                return true;

            }
        );

    }


    // =========================================================
    // STATUS
    // =========================================================

    function statusClass(status) {

        return [
            "PAGO",
            "CONFIRMADO"
        ].includes(
            String(status)
                .toUpperCase()
        )
            ? "paid"
            : "pending";

    }


    // =========================================================
    // TABELA
    // =========================================================

    function render() {

        const items =
            filtered();


        if (!items.length) {

            body.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="empty"
                    >
                        Não existem pulseiras
                        com estes filtros.
                    </td>
                </tr>
            `;

            return;

        }


        body.innerHTML =
            items.map(
                bracelet => `

                    <tr>

                        <td>

                            <strong>
                                ${esc(
                                    bracelet.code
                                )}
                            </strong>

                        </td>


                        <td>

                            ${esc(
                                bracelet.participant
                            )}

                        </td>


                        <td>

                            ${esc(
                                bracelet.event
                            )}

                        </td>


                        <td>

                            ${esc(
                                bracelet.order
                            )}

                        </td>


                        <td>

                            ${esc(
                                bracelet.discord
                            )}

                        </td>


                        <td>

                            <span
                                class="status ${statusClass(
                                    bracelet.status
                                )}"
                            >
                                ${esc(
                                    bracelet.status
                                )}
                            </span>

                        </td>


                        <td>

                            <button
                                type="button"
                                class="ghost bracelet-view"
                                data-bracelet="${esc(
                                    bracelet.id
                                )}"
                            >
                                VER
                            </button>

                        </td>

                    </tr>

                `
            ).join("");

    }


    // =========================================================
    // MODAL
    // =========================================================

    function openBracelet(id) {

        const bracelet =
            bracelets.find(
                item =>
                    item.id === id
            );


        if (!bracelet) {
            return;
        }


        currentBracelet =
            bracelet;


        modalBraceletCode.textContent =
            bracelet.code;


        braceletDetails.innerHTML = `

            <div class="order-detail">

                <small>
                    PARTICIPANTE
                </small>

                <strong>
                    ${esc(
                        bracelet.participant
                    )}
                </strong>

            </div>


            <div class="order-detail">

                <small>
                    EVENTO
                </small>

                <strong>
                    ${esc(
                        bracelet.event
                    )}
                </strong>

            </div>


            <div class="order-detail">

                <small>
                    PEDIDO
                </small>

                <strong>
                    ${esc(
                        bracelet.order
                    )}
                </strong>

            </div>


            <div class="order-detail">

                <small>
                    DISCORD
                </small>

                <strong>
                    ${esc(
                        bracelet.discord
                    )}
                </strong>

            </div>


            <div class="order-detail">

                <small>
                    CONTACTO
                </small>

                <strong>
                    ${esc(
                        bracelet.contact
                    )}
                </strong>

            </div>


            <div class="order-detail">

                <small>
                    ESTADO
                </small>

                <strong>

                    <span
                        class="status ${statusClass(
                            bracelet.status
                        )}"
                    >
                        ${esc(
                            bracelet.status
                        )}
                    </span>

                </strong>

            </div>

        `;


        braceletParticipant.innerHTML = `

            <div class="eyebrow">
                IDENTIFICAÇÃO
            </div>

            <div class="placeholder">

                <span>
                    1Ø1
                </span>

                <p>
                    Código da pulseira:
                    <strong>
                        ${esc(
                            bracelet.code
                        )}
                    </strong>
                    <br>
                    Este código poderá
                    futuramente ser associado
                    a um QR Code individual.
                </p>

            </div>

        `;


        modal.classList.add(
            "open"
        );

    }


    // =========================================================
    // FECHAR MODAL
    // =========================================================

    function closeModal() {

        modal.classList.remove(
            "open"
        );

        currentBracelet =
            null;

    }


    closeModalButton?.addEventListener(
        "click",
        closeModal
    );


    modal?.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeModal();

            }

        }
    );


    // =========================================================
    // CLIQUE VER
    // =========================================================

    body.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".bracelet-view"
                );


            if (!button) {
                return;
            }


            openBracelet(
                button.dataset.bracelet
            );

        }
    );


    // =========================================================
    // FILTROS
    // =========================================================

    searchInput?.addEventListener(
        "input",
        render
    );


    statusFilter?.addEventListener(
        "change",
        render
    );


    eventFilter?.addEventListener(
        "change",
        render
    );


    refreshBtn?.addEventListener(
        "click",
        load
    );


    // =========================================================
    // LOGOUT
    // =========================================================

    logoutBtn?.addEventListener(
        "click",
        async () => {

            logoutBtn.disabled =
                true;

            logoutBtn.textContent =
                "A SAIR...";


            try {

                await fetch(
                    "/api/auth/logout",
                    {
                        method: "POST",
                        credentials: "include",
                        cache: "no-store"
                    }
                );

            } catch (error) {

                console.error(
                    "[101] LOGOUT:",
                    error
                );

            }


            setTimeout(
                () => {

                    window.location.href =
                        "/admin/?logout=1";

                },
                150
            );

        }
    );


    // =========================================================
    // START
    // =========================================================

    await loadUser();

    await load();


})();
