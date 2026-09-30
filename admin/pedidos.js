(async function () {

    "use strict";


    // =========================================================
    // API
    // =========================================================

    async function api(
        path,
        options = {}
    ) {

        const response =
            await fetch(
                path,
                {
                    ...options,
                    credentials:
                        "same-origin"
                }
            );


        if (
            response.status === 401
        ) {

            location.replace(
                "/admin/"
            );

            throw new Error(
                "Sessão expirada."
            );
        }


        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Erro."
            );
        }


        return data;
    }



    // =========================================================
    // HELPERS
    // =========================================================

    function esc(value) {

        return String(
            value ?? ""
        ).replace(
            /[&<>'"]/g,
            char => ({
                "&":
                    "&amp;",

                "<":
                    "&lt;",

                ">":
                    "&gt;",

                "'":
                    "&#39;",

                '"':
                    "&quot;"
            }[char])
        );
    }



    function money(order) {

        const currency =
            order.currency ||
            "€";


        const total =
            Number(
                order.total || 0
            );


        return (
            `${esc(currency)}${total.toFixed(2)}`
        );
    }



    function statusClass(
        status
    ) {

        const value =
            String(
                status || ""
            )
                .toUpperCase();


        return [
            "PAGO",
            "CONFIRMADO",
            "PAGO / CONFIRMADO"
        ].includes(value)

            ? "paid"

            : "pending";
    }



    function formatDate(
        value
    ) {

        if (!value) {

            return "—";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";
        }


        return new Intl.DateTimeFormat(
            "pt-PT",
            {
                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        ).format(date);
    }



    // =========================================================
    // DOM
    // =========================================================

    const email =
        document.getElementById(
            "userEmail"
        );


    const ordersBody =
        document.getElementById(
            "ordersBody"
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
            "orderModal"
        );


    const closeModalButton =
        document.getElementById(
            "closeModal"
        );


    const modalOrderCode =
        document.getElementById(
            "modalOrderCode"
        );


    const orderDetails =
        document.getElementById(
            "orderDetails"
        );


    const participantsContainer =
        document.getElementById(
            "participantsContainer"
        );


    const orderActions =
        document.getElementById(
            "orderActions"
        );


    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );



    // =========================================================
    // STATE
    // =========================================================

    let allOrders = [];

    let allParticipants = [];



    // =========================================================
    // USER
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

        } catch {

            // api() já trata 401
        }
    }



    // =========================================================
    // LOAD
    // =========================================================

    async function load() {

        try {

            ordersBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
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


            allOrders =
                Array.isArray(
                    data.orders
                )
                    ? data.orders
                    : [];


            allParticipants =
                Array.isArray(
                    data.participants
                )
                    ? data.participants
                    : [];


            populateEvents();


            render();


        } catch (error) {

            console.error(
                "[101] PEDIDOS:",
                error
            );


            ordersBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="empty"
                    >
                        ${esc(
                            error.message
                        )}
                    </td>

                </tr>

            `;
        }
    }



    // =========================================================
    // EVENTS FILTER
    // =========================================================

    function populateEvents() {

        if (!eventFilter) {
            return;
        }


        const current =
            eventFilter.value;


        const events =
            [
                ...new Set(
                    allOrders
                        .map(
                            order =>
                                order.event
                        )
                        .filter(
                            Boolean
                        )
                )
            ].sort(
                (a, b) =>
                    String(a)
                        .localeCompare(
                            String(b)
                        )
            );


        eventFilter.innerHTML = `

            <option value="">
                Todos os eventos
            </option>

            ${
                events
                    .map(
                        event => `

                            <option
                                value="${esc(event)}"
                            >
                                ${esc(event)}
                            </option>

                        `
                    )
                    .join("")
            }

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
    // FILTER
    // =========================================================

    function getFilteredOrders() {

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
                .toUpperCase();


        const event =
            eventFilter?.value ||
            "";


        return allOrders.filter(
            order => {

                const text = [

                    order.number,

                    order.event,

                    order.customer,

                    order.discord

                ]
                    .filter(
                        Boolean
                    )
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
                    String(
                        order.status ||
                        ""
                    )
                        .toUpperCase()
                    !== status
                ) {

                    return false;
                }


                if (
                    event &&
                    order.event !==
                    event
                ) {

                    return false;
                }


                return true;
            }
        );
    }



    // =========================================================
    // RENDER TABLE
    // =========================================================

    function render() {

        const orders =
            getFilteredOrders();


        if (!orders.length) {

            ordersBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="empty"
                    >
                        Não existem pedidos
                        com estes filtros.
                    </td>

                </tr>

            `;

            return;
        }


        ordersBody.innerHTML =
            orders
                .map(
                    order => `

                        <tr>

                            <td>

                                <strong>
                                    ${esc(
                                        order.number
                                    )}
                                </strong>

                            </td>


                            <td>
                                ${esc(
                                    order.event
                                )}
                            </td>


                            <td>
                                ${esc(
                                    order.customer
                                )}
                            </td>


                            <td>
                                ${esc(
                                    order.discord ||
                                    "—"
                                )}
                            </td>


                            <td>
                                ${esc(
                                    String(
                                        order.bracelets ??
                                        0
                                    )
                                )}
                            </td>


                            <td>
                                ${money(order)}
                            </td>


                            <td>

                                <span
                                    class="
                                        status
                                        ${statusClass(
                                            order.status
                                        )}
                                    "
                                >
                                    ${esc(
                                        order.status
                                    )}
                                </span>

                            </td>


                            <td>

                                <button
                                    type="button"
                                    class="ghost order-view"
                                    data-order="${esc(
                                        order.number
                                    )}"
                                >
                                    VER
                                </button>

                            </td>

                        </tr>

                    `
                )
                .join("");


        document
            .querySelectorAll(
                ".order-view"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            openOrder(
                                button.dataset.order
                            );

                        }
                    );

                }
            );
    }



    // =========================================================
    // OPEN ORDER
    // =========================================================

    function openOrder(
        orderCode
    ) {

        const order =
            allOrders.find(
                item =>
                    item.number ===
                    orderCode
            );


        if (!order) {

            return;
        }


        modalOrderCode.textContent =
            order.number;


        // =====================================================
        // DETAILS
        // =====================================================

        orderDetails.innerHTML = `

            <div class="order-detail">

                <small>
                    EVENTO
                </small>

                <strong>
                    ${esc(
                        order.event
                    )}
                </strong>

            </div>


            <div class="order-detail">

                <small>
                    CLIENTE
                </small>

                <strong>
                    ${esc(
                        order.customer
                    )}
                </strong>

            </div>


            <div class="order-detail">

                <small>
                    DISCORD
                </small>

                <strong>
                    ${esc(
                        order.discord ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="order-detail">

                <small>
                    CONTACTO
                </small>

                <strong>
                    ${esc(
                        order.contact ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="order-detail">

                <small>
                    PULSEIRAS
                </small>

                <strong>
                    ${esc(
                        String(
                            order.bracelets ??
                            0
                        )
                    )}
                </strong>

            </div>


            <div class="order-detail">

                <small>
                    VALOR
                </small>

                <strong>
                    ${money(order)}
                </strong>

            </div>


            <div class="order-detail">

                <small>
                    ESTADO
                </small>

                <strong>
                    <span
                        class="
                            status
                            ${statusClass(
                                order.status
                            )}
                        "
                    >
                        ${esc(
                            order.status
                        )}
                    </span>
                </strong>

            </div>


            <div class="order-detail">

                <small>
                    CRIADO EM
                </small>

                <strong>
                    ${esc(
                        formatDate(
                            order.createdAt
                        )
                    )}
                </strong>

            </div>

        `;



        // =====================================================
        // PARTICIPANTS
        // =====================================================

        const participants =
            allParticipants.filter(
                participant =>
                    participant.order ===
                    order.number
            );


        participantsContainer.innerHTML = `

            <div class="eyebrow">
                PARTICIPANTES
            </div>


            <div class="participant-list">

                ${
                    participants.length

                        ? participants
                            .map(
                                participant => `

                                    <div
                                        class="participant-row"
                                    >

                                        <strong>
                                            ${esc(
                                                participant.name
                                            )}
                                        </strong>

                                        <span>
                                            ${esc(
                                                participant.event
                                            )}
                                        </span>

                                    </div>

                                `
                            )
                            .join("")

                        : `

                            <div class="empty">
                                Sem participantes
                                registados.
                            </div>

                        `
                }

            </div>

        `;



        // =====================================================
        // ACTIONS
        // =====================================================

        const currentStatus =
            String(
                order.status ||
                ""
            )
                .toUpperCase();


        let actions = "";


        if (
            currentStatus ===
            "PENDENTE"
        ) {

            actions += `

                <button
                    type="button"
                    class="order-action primary"
                    id="confirmPaymentBtn"
                >
                    CONFIRMAR PAGAMENTO
                </button>

            `;

        }


        else if (
            currentStatus ===
            "PAGO"
        ) {

            actions += `

                <button
                    type="button"
                    class="order-action primary"
                    id="confirmOrderBtn"
                >
                    MARCAR COMO CONFIRMADO
                </button>


                <button
                    type="button"
                    class="order-action"
                    id="pendingOrderBtn"
                >
                    VOLTAR A PENDENTE
                </button>

            `;

        }


        else if (
            currentStatus ===
            "CONFIRMADO"
        ) {

            actions += `

                <button
                    type="button"
                    class="order-action"
                    id="pendingOrderBtn"
                >
                    VOLTAR A PENDENTE
                </button>

            `;

        }


        actions += `

            <button
                type="button"
                class="order-action danger"
                id="deleteOrderBtn"
            >
                ELIMINAR PEDIDO
            </button>

        `;


        orderActions.innerHTML =
            actions;



        // =====================================================
        // CONFIRM PAYMENT
        // =====================================================

        document
            .getElementById(
                "confirmPaymentBtn"
            )
            ?.addEventListener(
                "click",
                async () => {

                    await changeStatus(
                        order.number,
                        "pago"
                    );

                }
            );



        // =====================================================
        // CONFIRM ORDER
        // =====================================================

        document
            .getElementById(
                "confirmOrderBtn"
            )
            ?.addEventListener(
                "click",
                async () => {

                    await changeStatus(
                        order.number,
                        "confirmado"
                    );

                }
            );



        // =====================================================
        // PENDING
        // =====================================================

        document
            .getElementById(
                "pendingOrderBtn"
            )
            ?.addEventListener(
                "click",
                async () => {

                    await changeStatus(
                        order.number,
                        "pendente"
                    );

                }
            );



        // =====================================================
        // DELETE
        // =====================================================

        document
            .getElementById(
                "deleteOrderBtn"
            )
            ?.addEventListener(
                "click",
                async () => {

                    await deleteOrder(
                        order.number
                    );

                }
            );


        // =====================================================
        // OPEN
        // =====================================================

        modal.classList.add(
            "open"
        );
    }



    // =========================================================
    // CHANGE STATUS
    // =========================================================

    async function changeStatus(
        orderCode,
        status
    ) {

        try {

            const response =
                await api(
                    "/api/orders/update",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                orderCode,
                                estado:
                                    status
                            })
                    }
                );


            if (
                response.ok !==
                true
            ) {

                throw new Error(
                    response.error ||
                    "Não foi possível atualizar o pedido."
                );
            }


            closeModal();


            await load();


        } catch (error) {

            console.error(
                "[101] UPDATE:",
                error
            );


            alert(
                error.message
            );
        }
    }



    // =========================================================
    // DELETE
    // =========================================================

    async function deleteOrder(
        orderCode
    ) {

        const confirmed =
            window.confirm(
                `Tens a certeza que queres eliminar o pedido ${orderCode}?\n\nEsta ação não pode ser anulada.`
            );


        if (!confirmed) {

            return;
        }


        try {

            const response =
                await api(
                    "/api/orders/delete",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                orderCode
                            })
                    }
                );


            if (
                response.ok !==
                true
            ) {

                throw new Error(
                    response.error ||
                    "Não foi possível eliminar o pedido."
                );
            }


            closeModal();


            await load();


        } catch (error) {

            console.error(
                "[101] DELETE:",
                error
            );


            alert(
                error.message
            );
        }
    }



    // =========================================================
    // CLOSE MODAL
    // =========================================================

    function closeModal() {

        modal.classList.remove(
            "open"
        );
    }


    closeModalButton
        ?.addEventListener(
            "click",
            closeModal
        );


    modal
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    closeModal();

                }

            }
        );


    document
        .addEventListener(
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
    // FILTER EVENTS
    // =========================================================

    searchInput
        ?.addEventListener(
            "input",
            render
        );


    statusFilter
        ?.addEventListener(
            "change",
            render
        );


    eventFilter
        ?.addEventListener(
            "change",
            render
        );



    // =========================================================
    // REFRESH
    // =========================================================

    refreshBtn
        ?.addEventListener(
            "click",
            load
        );



    // =========================================================
    // LOGOUT
    // =========================================================

    logoutBtn
        ?.addEventListener(
            "click",
            async () => {

                try {

                    await fetch(
                        "/api/auth/logout",
                        {
                            method:
                                "POST",

                            credentials:
                                "same-origin"
                        }
                    );

                } finally {

                    location.replace(
                        "/admin/"
                    );
                }
            }
        );



    // =========================================================
    // START
    // =========================================================

    await loadUser();

    await load();

})();
