(async function () {
    "use strict";

    console.log("[101] PEDIDOS.JS INICIADO");

    async function api(path, options = {}) {
        console.log("[101] API:", path, options);

        const response = await fetch(path, {
            ...options,
            credentials: "same-origin"
        });

        console.log("[101] API STATUS:", path, response.status);

        if (response.status === 401) {
            location.replace("/admin/");
            throw new Error("Sessão expirada.");
        }

        const data = await response.json().catch(() => ({}));

        console.log("[101] API RESPONSE:", data);

        if (!response.ok) {
            throw new Error(data.error || `Erro HTTP ${response.status}`);
        }

        return data;
    }

    function esc(value) {
        return String(value ?? "").replace(/[&<>'"]/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        }[char]));
    }

    function money(order) {
        const currency = order.currency || "€";
        const total = Number(order.total || 0);

        return `${esc(currency)}${total.toFixed(2)}`;
    }

    function statusClass(status) {
        const value = String(status || "").toUpperCase();

        return [
            "PAGO",
            "CONFIRMADO",
            "PAGO / CONFIRMADO"
        ].includes(value)
            ? "paid"
            : "pending";
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return new Intl.DateTimeFormat(
            "pt-PT",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        ).format(date);
    }

    const email = document.getElementById("userEmail");
    const ordersBody = document.getElementById("ordersBody");
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const eventFilter = document.getElementById("eventFilter");
    const refreshBtn = document.getElementById("refreshBtn");

    const modal = document.getElementById("orderModal");
    const closeModalButton = document.getElementById("closeModal");

    const modalOrderCode = document.getElementById("modalOrderCode");
    const orderDetails = document.getElementById("orderDetails");
    const participantsContainer = document.getElementById("participantsContainer");
    const orderActions = document.getElementById("orderActions");

    const logoutBtn = document.getElementById("logoutBtn");

    let allOrders = [];
    let allParticipants = [];

    let currentOrder = null;

    // =========================================================
    // UTILIZADOR
    // =========================================================

    async function loadUser() {
        try {
            const me = await api("/api/auth/me");

            if (email) {
                email.textContent = me.email || "Admin";
            }

        } catch (error) {
            console.error("[101] ERRO USER:", error);
        }
    }

    // =========================================================
    // CARREGAR PEDIDOS
    // =========================================================

    async function load() {
        try {

            ordersBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty">
                        A carregar…
                    </td>
                </tr>
            `;

            const data = await api("/api/admin/overview");

            allOrders =
                Array.isArray(data.orders)
                    ? data.orders
                    : [];

            allParticipants =
                Array.isArray(data.participants)
                    ? data.participants
                    : [];

            console.log("[101] PEDIDOS:", allOrders);
            console.log("[101] PARTICIPANTES:", allParticipants);

            populateEvents();

            render();

        } catch (error) {

            console.error(
                "[101] ERRO AO CARREGAR PEDIDOS:",
                error
            );

            ordersBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty">
                        ${esc(error.message)}
                    </td>
                </tr>
            `;
        }
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
                allOrders
                    .map(order => order.event)
                    .filter(Boolean)
            )
        ].sort((a, b) =>
            String(a).localeCompare(String(b))
        );

        eventFilter.innerHTML = `
            <option value="">
                Todos os eventos
            </option>

            ${events.map(event => `
                <option value="${esc(event)}">
                    ${esc(event)}
                </option>
            `).join("")}
        `;

        if (events.includes(current)) {
            eventFilter.value = current;
        }
    }

    // =========================================================
    // FILTROS
    // =========================================================

    function getFilteredOrders() {

        const search =
            String(
                searchInput?.value || ""
            )
            .trim()
            .toLowerCase();

        const status =
            String(
                statusFilter?.value || ""
            )
            .toUpperCase();

        const event =
            eventFilter?.value || "";

        return allOrders.filter(order => {

            const text = [
                order.number,
                order.event,
                order.customer,
                order.discord
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            if (
                search &&
                !text.includes(search)
            ) {
                return false;
            }

            if (
                status &&
                String(order.status || "")
                    .toUpperCase() !== status
            ) {
                return false;
            }

            if (
                event &&
                order.event !== event
            ) {
                return false;
            }

            return true;
        });
    }

    // =========================================================
    // TABELA
    // =========================================================

    function render() {

        const orders =
            getFilteredOrders();

        if (!orders.length) {

            ordersBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty">
                        Não existem pedidos com estes filtros.
                    </td>
                </tr>
            `;

            return;
        }

        ordersBody.innerHTML =
            orders.map(order => `
                <tr>

                    <td>
                        <strong>
                            ${esc(order.number)}
                        </strong>
                    </td>

                    <td>
                        ${esc(order.event)}
                    </td>

                    <td>
                        ${esc(order.customer)}
                    </td>

                    <td>
                        ${esc(order.discord || "—")}
                    </td>

                    <td>
                        ${esc(String(order.bracelets ?? 0))}
                    </td>

                    <td>
                        ${money(order)}
                    </td>

                    <td>
                        <span class="status ${statusClass(order.status)}">
                            ${esc(order.status)}
                        </span>
                    </td>

                    <td>
                        <button
                            type="button"
                            class="ghost order-view"
                            data-order="${esc(order.number)}"
                        >
                            VER
                        </button>
                    </td>

                </tr>
            `).join("");
    }

    // =========================================================
    // ABRIR PEDIDO
    // =========================================================

    function openOrder(orderCode) {

        console.log(
            "[101] ABRIR PEDIDO:",
            orderCode
        );

        const order =
            allOrders.find(
                item =>
                    item.number === orderCode
            );

        if (!order) {
            console.error(
                "[101] PEDIDO NÃO ENCONTRADO:",
                orderCode
            );
            return;
        }

        currentOrder = order;

        console.log(
            "[101] PEDIDO ATUAL:",
            order
        );

        modalOrderCode.textContent =
            order.number;

        orderDetails.innerHTML = `

            <div class="order-detail">
                <small>EVENTO</small>
                <strong>
                    ${esc(order.event)}
                </strong>
            </div>

            <div class="order-detail">
                <small>CLIENTE</small>
                <strong>
                    ${esc(order.customer)}
                </strong>
            </div>

            <div class="order-detail">
                <small>DISCORD</small>
                <strong>
                    ${esc(order.discord || "—")}
                </strong>
            </div>

            <div class="order-detail">
                <small>CONTACTO</small>
                <strong>
                    ${esc(order.contact || "—")}
                </strong>
            </div>

            <div class="order-detail">
                <small>PULSEIRAS</small>
                <strong>
                    ${esc(String(order.bracelets ?? 0))}
                </strong>
            </div>

            <div class="order-detail">
                <small>VALOR</small>
                <strong>
                    ${money(order)}
                </strong>
            </div>

            <div class="order-detail">
                <small>ESTADO</small>
                <strong>
                    <span class="status ${statusClass(order.status)}">
                        ${esc(order.status)}
                    </span>
                </strong>
            </div>

            <div class="order-detail">
                <small>CRIADO EM</small>
                <strong>
                    ${esc(formatDate(order.createdAt))}
                </strong>
            </div>

        `;

        const participants =
            allParticipants.filter(
                participant =>
                    participant.order === order.number
            );

        participantsContainer.innerHTML = `

            <div class="eyebrow">
                PARTICIPANTES
            </div>

            <div class="participant-list">

                ${
                    participants.length

                        ? participants.map(
                            participant => `
                                <div class="participant-row">
                                    <strong>
                                        ${esc(participant.name)}
                                    </strong>

                                    <span>
                                        ${esc(participant.event)}
                                    </span>
                                </div>
                            `
                        ).join("")

                        : `
                            <div class="empty">
                                Sem participantes registados.
                            </div>
                        `
                }

            </div>
        `;

        renderActions(order);

        modal.classList.add("open");
    }

    // =========================================================
    // BOTÕES DO PEDIDO
    // =========================================================

    function renderActions(order) {

        const currentStatus =
            String(order.status || "")
                .trim()
                .toUpperCase();

        console.log(
            "[101] ESTADO DO PEDIDO:",
            currentStatus
        );

        let actions = "";

        if (currentStatus === "PENDENTE") {

            actions += `
                <button
                    type="button"
                    class="order-action primary"
                    data-action="confirm-payment"
                >
                    CONFIRMAR PAGAMENTO
                </button>
            `;

        } else if (currentStatus === "PAGO") {

            actions += `
                <button
                    type="button"
                    class="order-action primary"
                    data-action="confirm-order"
                >
                    MARCAR COMO CONFIRMADO
                </button>

                <button
                    type="button"
                    class="order-action"
                    data-action="pending"
                >
                    VOLTAR A PENDENTE
                </button>
            `;

        } else if (currentStatus === "CONFIRMADO") {

            actions += `
                <button
                    type="button"
                    class="order-action"
                    data-action="pending"
                >
                    VOLTAR A PENDENTE
                </button>
            `;
        }

        actions += `
            <button
                type="button"
                class="order-action danger"
                data-action="delete"
            >
                ELIMINAR PEDIDO
            </button>
        `;

        orderActions.innerHTML = actions;
    }

    // =========================================================
    // EVENT DELEGATION DOS BOTÕES
    // =========================================================

    orderActions.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    "button[data-action]"
                );

            if (!button) {
                return;
            }

            if (!currentOrder) {
                console.error(
                    "[101] NÃO EXISTE PEDIDO ATUAL"
                );
                return;
            }

            const action =
                button.dataset.action;

            console.log(
                "[101] BOTÃO CLICADO:",
                action,
                currentOrder.number
            );

            if (
                button.dataset.busy === "true"
            ) {
                return;
            }

            button.dataset.busy = "true";
            button.disabled = true;

            const originalText =
                button.textContent;

            button.textContent =
                "A PROCESSAR...";

            try {

                if (
                    action ===
                    "confirm-payment"
                ) {

                    await changeStatus(
                        currentOrder.number,
                        "pago"
                    );

                } else if (
                    action ===
                    "confirm-order"
                ) {

                    await changeStatus(
                        currentOrder.number,
                        "confirmado"
                    );

                } else if (
                    action === "pending"
                ) {

                    await changeStatus(
                        currentOrder.number,
                        "pendente"
                    );

                } else if (
                    action === "delete"
                ) {

                    await deleteOrder(
                        currentOrder.number
                    );
                }

            } catch (error) {

                console.error(
                    "[101] AÇÃO FALHOU:",
                    error
                );

                alert(
                    error?.message ||
                    "Ocorreu um erro."
                );

                button.disabled = false;
                button.dataset.busy = "false";
                button.textContent =
                    originalText;
            }
        }
    );

    // =========================================================
    // ALTERAR ESTADO
    // =========================================================

    async function changeStatus(
        orderCode,
        status
    ) {

        console.log(
            "[101] A ALTERAR ESTADO:",
            orderCode,
            status
        );

        const response =
            await api(
                "/api/orders/update",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        orderCode,
                        estado: status
                    })
                }
            );

        console.log(
            "[101] UPDATE RESPONSE:",
            response
        );

        if (
            response.ok !== true
        ) {

            throw new Error(
                response.error ||
                "Não foi possível atualizar o pedido."
            );
        }

        // Fecha imediatamente
        closeModal();

        // Recarrega os dados
        await load();

        console.log(
            "[101] ESTADO ALTERADO COM SUCESSO:",
            orderCode,
            status
        );
    }

    // =========================================================
    // ELIMINAR
    // =========================================================

async function deleteOrder(orderCode) {

    const confirmModal =
        document.getElementById("confirmDeleteModal");

    const confirmOrder =
        document.getElementById("confirmDeleteOrder");

    const confirmButton =
        document.getElementById("confirmDeleteBtn");

    const cancelButton =
        document.getElementById("cancelDeleteBtn");

    if (!confirmModal) {
        console.error(
            "[101] Modal de confirmação não encontrado."
        );
        return;
    }

    confirmOrder.textContent = orderCode;

    confirmModal.classList.add("open");

    const closeConfirm = () => {
        confirmModal.classList.remove("open");

        confirmButton.onclick = null;
        cancelButton.onclick = null;
    };

    cancelButton.onclick = () => {
        closeConfirm();
    };

    confirmModal.onclick = (event) => {
        if (event.target === confirmModal) {
            closeConfirm();
        }
    };

    confirmButton.onclick = async () => {

        confirmButton.disabled = true;
        confirmButton.textContent = "A ELIMINAR...";

        try {

            const response =
                await api(
                    "/api/orders/delete",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            orderCode
                        })
                    }
                );

            if (response.ok !== true) {
                throw new Error(
                    response.error ||
                    "Não foi possível eliminar o pedido."
                );
            }

            closeConfirm();
            closeModal();

            await load();

        } catch (error) {

            console.error(
                "[101] DELETE:",
                error
            );

            alert(error.message);

            confirmButton.disabled = false;
            confirmButton.textContent =
                "ELIMINAR PEDIDO";
        }
    };
}

    // =========================================================
    // MODAL
    // =========================================================

    function closeModal() {

        modal.classList.remove(
            "open"
        );

        currentOrder = null;
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
                event.key === "Escape"
            ) {
                closeModal();
            }
        }
    );

    // =========================================================
    // CLIQUE VER
    // =========================================================

    ordersBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".order-view"
                );

            if (!button) {
                return;
            }

            openOrder(
                button.dataset.order
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

// =========================================================
// LOGOUT
// =========================================================

logoutBtn?.addEventListener("click", async () => {

    logoutBtn.disabled = true;
    logoutBtn.textContent = "A SAIR...";

    try {

        const response = await fetch(
            "/api/auth/logout",
            {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                    "Cache-Control": "no-cache"
                }
            }
        );

        console.log(
            "[101] LOGOUT STATUS:",
            response.status
        );

        const data = await response.json().catch(() => null);

        console.log(
            "[101] LOGOUT RESPONSE:",
            data
        );

    } catch (error) {

        console.error(
            "[101] LOGOUT ERROR:",
            error
        );

    }

    setTimeout(() => {
        window.location.href =
            "/admin/?logout=1";
    }, 150);

});

    // =========================================================
    // START
    // =========================================================

    await loadUser();
    await load();

})();
