(async function () {

    async function api(path, options = {}) {

        const r = await fetch(
            path,
            {
                ...options,
                credentials: "same-origin"
            }
        );

        if (r.status === 401) {

            location.replace("/admin/");

            throw new Error(
                "Sessão expirada."
            );
        }

        const d =
            await r.json().catch(
                () => ({})
            );

        if (!r.ok) {

            throw new Error(
                d.error || "Erro."
            );
        }

        return d;
    }


    // =========================================================
    // UTILITÁRIOS
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


    function money(order) {

        const currency =
            order.currency || "€";

        const total =
            Number(order.total);

        return Number.isFinite(total)
            ? `${esc(currency)}${total.toFixed(2)}`
            : "—";
    }


    function statusClass(status) {

        return [
            "PAGO",
            "PAGO / CONFIRMADO",
            "CONFIRMADO"
        ].includes(
            String(status || "")
                .toUpperCase()
        )
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
            return value;
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


    // =========================================================
    // UTILIZADOR
    // =========================================================

    const email =
        document.getElementById(
            "userEmail"
        );

    try {

        const me =
            await api(
                "/api/auth/me"
            );

        if (email) {

            email.textContent =
                me.email || "Admin";
        }

    } catch {
        // Sessão tratada pelo api()
    }


    // =========================================================
    // CARREGAR DASHBOARD
    // =========================================================

    async function load() {

        try {

            const d =
                await api(
                    "/api/admin/overview"
                );


            console.log(
                "[101] DASHBOARD DATA:",
                d
            );


            // =================================================
            // ESTATÍSTICAS
            // =================================================

            document
                .getElementById("statOrders")
                .textContent =
                    d.stats?.orders ?? 0;


            document
                .getElementById("statBracelets")
                .textContent =
                    d.stats?.bracelets ?? 0;


            document
                .getElementById("statPaid")
                .textContent =
                    d.stats?.paid ?? 0;


            document
                .getElementById("statEvents")
                .textContent =
                    d.stats?.events ?? 0;


            // =================================================
            // PEDIDOS
            // =================================================

            const ordersBody =
                document.getElementById(
                    "ordersBody"
                );


            ordersBody.innerHTML =
                Array.isArray(d.orders) &&
                d.orders.length

                    ? d.orders.map(order => `

                        <tr
                            title="${esc(
                                formatDate(
                                    order.createdAt
                                )
                            )}"
                        >

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

                                <small
                                    class="table-sub"
                                >
                                    ${esc(
                                        order.discord || ""
                                    )}
                                </small>

                            </td>


                            <td>
                                ${esc(
                                    String(
                                        order.bracelets ?? 0
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

                        </tr>

                    `).join("")

                    : `
                        <tr>
                            <td
                                colspan="6"
                                class="empty"
                            >
                                Ainda não existem pedidos.
                            </td>
                        </tr>
                    `;


            // =================================================
            // EVENTOS
            // =================================================

            const eventsList =
                document.getElementById(
                    "eventsList"
                );


            eventsList.innerHTML =
                Array.isArray(d.events) &&
                d.events.length

                    ? d.events.map(event => `

                        <div
                            class="mini-event"
                        >

                            <div>

                                <strong>
                                    ${esc(
                                        event.name
                                    )}
                                </strong>

                                <small>
                                    ${esc(
                                        String(
                                            event.bracelets ?? 0
                                        )
                                    )}
                                    pulseiras
                                </small>

                            </div>

                            <span>
                                ${esc(
                                    String(
                                        event.orders ?? 0
                                    )
                                )}
                                pedidos
                            </span>

                        </div>

                    `).join("")

                    : `
                        <div class="empty">
                            Ainda não existem eventos.
                        </div>
                    `;


            // =================================================
            // PARTICIPANTES
            // =================================================

            const participantsList =
                document.getElementById(
                    "participantsList"
                );


            const participants =
                Array.isArray(
                    d.participants
                )
                    ? d.participants
                    : [];


            participantsList.innerHTML =
                participants.length

                    ? participants
                        .slice(0, 20)
                        .map(
                            participant => `

                            <div
                                class="mini-event"
                            >

                                <div>

                                    <strong>
                                        ${esc(
                                            participant.name
                                        )}
                                    </strong>

                                    <small>
                                        ${esc(
                                            participant.event
                                        )}
                                    </small>

                                </div>

                                <span>
                                    ${esc(
                                        participant.order
                                    )}
                                </span>

                            </div>

                        `
                        )
                        .join("")

                    : `
                        <div class="empty">
                            Ainda não existem participantes.
                        </div>
                    `;


        } catch (error) {

            console.error(
                "[101] ERRO DASHBOARD:",
                error
            );


            document
                .getElementById(
                    "ordersBody"
                )
                .innerHTML = `

                    <tr>

                        <td
                            colspan="6"
                            class="empty"
                        >
                            ${esc(
                                error.message
                            )}
                        </td>

                    </tr>

                `;


            document
                .getElementById(
                    "eventsList"
                )
                .innerHTML = `

                    <div class="empty">
                        ${esc(
                            error.message
                        )}
                    </div>

                `;


            document
                .getElementById(
                    "participantsList"
                )
                .innerHTML = `

                    <div class="empty">
                        ${esc(
                            error.message
                        )}
                    </div>

                `;
        }
    }


    // =========================================================
    // ATUALIZAR
    // =========================================================

    document
        .getElementById("refreshBtn")
        ?.addEventListener(
            "click",
            load
        );


    // =========================================================
    // LOGOUT
    // =========================================================

logoutBtn?.addEventListener("click", async () => {

    try {

        await fetch(
            "/api/auth/logout",
            {
                method: "POST",
                credentials: "same-origin"
            }
        );

    } catch (error) {

        console.error(
            "[101] LOGOUT:",
            error
        );

    } finally {

        location.replace("/admin/");

    }

});
    // =========================================================
    // INICIALIZAÇÃO
    // =========================================================

    load();

})();
