(async function () {

    async function api(path, options = {}) {

        const response = await fetch(
            path,
            {
                ...options,
                credentials: "same-origin"
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
                data.error || "Erro."
            );
        }

        return data;
    }


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


    function money(order) {

        const currency =
            order.currency || "€";

        const total =
            Number(order.total || 0);

        return `${esc(currency)}${total.toFixed(2)}`;
    }


    function statusClass(status) {

        const value =
            String(
                status || ""
            ).toUpperCase();

        return [
            "PAGO",
            "CONFIRMADO",
            "PAGO / CONFIRMADO"
        ].includes(value)
            ? "paid"
            : "pending";
    }


    function formatDate(value) {

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
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        ).format(date);
    }


    const email =
        document.getElementById(
            "userEmail"
        );


    try {

        const me =
            await api(
                "/api/auth/me"
            );

        email.textContent =
            me.email || "Admin";

    } catch {
        return;
    }


    let allOrders = [];


    // =========================================================
    // CARREGAR
    // =========================================================

    async function load() {

        try {

            const data =
                await api(
                    "/api/admin/overview"
                );


            allOrders =
                Array.isArray(data.orders)
                    ? data.orders
                    : [];


            populateEvents(
                allOrders
            );


            render();


        } catch (error) {

            document
                .getElementById(
                    "ordersBody"
                )
                .innerHTML = `

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
    // EVENTOS
    // =========================================================

    function populateEvents(
        orders
    ) {

        const select =
            document.getElementById(
                "eventFilter"
            );


        const current =
            select.value;


        const events =
            [
                ...new Set(
                    orders
                        .map(
                            order =>
                                order.event
                        )
                        .filter(Boolean)
                )
            ]
                .sort(
                    (a, b) =>
                        String(a)
                            .localeCompare(
                                String(b)
                            )
                );


        select.innerHTML = `

            <option value="">
                Todos os eventos
            </option>

            ${events.map(
                event => `
                    <option value="${esc(event)}">
                        ${esc(event)}
                    </option>
                `
            ).join("")}

        `;


        if (
            events.includes(current)
        ) {

            select.value =
                current;
        }
    }


    // =========================================================
    // FILTRAR
    // =========================================================

    function filteredOrders() {

        const search =
            document
                .getElementById(
                    "searchInput"
                )
                .value
                .trim()
                .toLowerCase();


        const status =
            document
                .getElementById(
                    "statusFilter"
                )
                .value;


        const event =
            document
                .getElementById(
                    "eventFilter"
                )
                .value;


        return allOrders.filter(
            order => {

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
                    String(
                        order.status || ""
                    ).toUpperCase()
                    !== status
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
            }
        );
    }


    // =========================================================
    // RENDER
    // =========================================================

    function render() {

        const body =
            document.getElementById(
                "ordersBody"
            );


        const orders =
            filteredOrders();


        if (!orders.length) {

            body.innerHTML = `

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


        body.innerHTML =
            orders.map(
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
                                class="status ${statusClass(
                                    order.status
                                )}"
                            >
                                ${esc(
                                    order.status
                                )}
                            </span>

                        </td>


                        <td>

                            <button
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
            ).join("");


        document
            .querySelectorAll(
                ".order-view"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () =>
                            openOrder(
                                button.dataset.order
                            )
                    );

                }
            );
    }


    // =========================================================
    // DETALHES
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


        document
            .getElementById(
                "modalOrderCode"
            )
            .textContent =
                order.number;


        document
            .getElementById(
                "orderDetails"
            )
            .innerHTML = `

                <div
                    style="
                        display:grid;
                        gap:14px;
                    "
                >

                    <div>
                        <div class="eyebrow">
                            EVENTO
                        </div>
                        <strong>
                            ${esc(
                                order.event
                            )}
                        </strong>
                    </div>


                    <div>
                        <div class="eyebrow">
                            CLIENTE
                        </div>
                        <strong>
                            ${esc(
                                order.customer
                            )}
                        </strong>
                    </div>


                    <div>
                        <div class="eyebrow">
                            DISCORD
                        </div>
                        <strong>
                            ${esc(
                                order.discord ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <div class="eyebrow">
                            PULSEIRAS
                        </div>
                        <strong>
                            ${esc(
                                String(
                                    order.bracelets ??
                                    0
                                )
                            )}
                        </strong>
                    </div>


                    <div>
                        <div class="eyebrow">
                            VALOR
                        </div>
                        <strong>
                            ${money(order)}
                        </strong>
                    </div>


                    <div>
                        <div class="eyebrow">
                            ESTADO
                        </div>

                        <span
                            class="status ${statusClass(
                                order.status
                            )}"
                        >
                            ${esc(
                                order.status
                            )}
                        </span>
                    </div>


                    <div>
                        <div class="eyebrow">
                            DATA
                        </div>
                        <strong>
                            ${esc(
                                formatDate(
                                    order.createdAt
                                )
                            )}
                        </strong>
                    </div>

                </div>
            `;


        document
            .getElementById(
                "orderModal"
            )
            .style.display =
                "flex";
    }


    // =========================================================
    // FECHAR MODAL
    // =========================================================

    document
        .getElementById(
            "closeModal"
        )
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "orderModal"
                    )
                    .style.display =
                        "none";
            }
        );


    document
        .getElementById(
            "orderModal"
        )
        .addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "orderModal"
                ) {

                    event.currentTarget
                        .style
                        .display =
                            "none";
                }
            }
        );


    // =========================================================
    // FILTROS
    // =========================================================

    document
        .getElementById(
            "searchInput"
        )
        .addEventListener(
            "input",
            render
        );


    document
        .getElementById(
            "statusFilter"
        )
        .addEventListener(
            "change",
            render
        );


    document
        .getElementById(
            "eventFilter"
        )
        .addEventListener(
            "change",
            render
        );


    document
        .getElementById(
            "refreshBtn"
        )
        .addEventListener(
            "click",
            load
        );


    // =========================================================
    // LOGOUT
    // =========================================================

    document
        .getElementById(
            "logoutBtn"
        )
        .addEventListener(
            "click",
            async () => {

                await fetch(
                    "/api/auth/logout",
                    {
                        method: "POST",
                        credentials:
                            "same-origin"
                    }
                );

                location.replace(
                    "/admin/"
                );
            }
        );


    load();

})();
