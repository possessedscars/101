const blob = require("@vercel/blob");

module.exports = async function handler(req, res) {

    console.log("[101] ADMIN OVERVIEW - INICIO");

    if (req.method !== "GET") {
        return res.status(405).json({
            ok: false,
            error: "Método não permitido."
        });
    }

    try {

        // =====================================================
        // CARREGAR SESSION ESM
        // =====================================================

        const sessionModule =
            await import("../auth/_session.mjs");

        const readSession =
            sessionModule.readSession;

        if (typeof readSession !== "function") {

            console.error(
                "[101] readSession não é uma função."
            );

            return res.status(500).json({
                ok: false,
                error: "Sistema de sessão inválido."
            });
        }

        // =====================================================
        // VALIDAR SESSÃO
        // =====================================================

        const session = readSession(req);

        if (!session) {

            console.log(
                "[101] ADMIN OVERVIEW - SEM SESSÃO"
            );

            return res.status(401).json({
                ok: false,
                error: "Não autenticado."
            });
        }

        console.log(
            "[101] ADMIN OVERVIEW - SESSÃO OK"
        );

        // =====================================================
        // LISTAR PEDIDOS NO VERCEL BLOB
        // =====================================================

        const result = await blob.list({
            prefix: "orders/",
            access: "private"
        });

        console.log(
            "[101] ADMIN OVERVIEW - BLOBs:",
            result.blobs?.length || 0
        );

        const orders = [];
        const participants = [];
        const eventsMap = {};

        // =====================================================
        // LER CADA PEDIDO
        // =====================================================

        for (const item of result.blobs || []) {

            try {

                const response =
                    await blob.get(
                        item.pathname,
                        {
                            access: "private"
                        }
                    );

                if (!response) {
                    continue;
                }

                const text =
                    await response.text();

                const order =
                    JSON.parse(text);

                const eventName =
                    order.evento ||
                    order.eventoSlug ||
                    "Evento 1Ø1";

                const quantity =
                    Number(
                        order.quantidade || 0
                    );

                // =================================================
                // PEDIDO
                // =================================================

                orders.push({

                    number:
                        order.orderCode || "—",

                    event:
                        eventName,

                    customer:
                        order.nome || "—",

                    bracelets:
                        quantity,

                    status:
                        String(
                            order.estado ||
                            "pendente"
                        ).toUpperCase(),

                    total:
                        Number(
                            order.total || 0
                        )

                });

                // =================================================
                // EVENTO
                // =================================================

                if (!eventsMap[eventName]) {

                    eventsMap[eventName] = {

                        name:
                            eventName,

                        orders:
                            0,

                        bracelets:
                            0

                    };
                }

                eventsMap[eventName].orders += 1;

                eventsMap[eventName].bracelets +=
                    quantity;

                // =================================================
                // PARTICIPANTES
                // =================================================

                const names =
                    Array.isArray(
                        order.participantes
                    )
                        ? order.participantes
                        : [order.nome];

                for (const name of names) {

                    if (!name) {
                        continue;
                    }

                    participants.push({

                        name:
                            name,

                        order:
                            order.orderCode || "—",

                        event:
                            eventName,

                        discord:
                            order.discord || "",

                        contact:
                            order.contacto || ""

                    });
                }

            } catch (error) {

                console.error(
                    "[101] ERRO A LER PEDIDO:",
                    item.pathname,
                    error
                );
            }
        }

        // =====================================================
        // ESTATÍSTICAS
        // =====================================================

        const stats = {

            orders:
                orders.length,

            bracelets:
                orders.reduce(
                    (total, order) =>
                        total +
                        Number(
                            order.bracelets || 0
                        ),
                    0
                ),

            paid:
                orders.filter(
                    order =>
                        order.status === "PAGO"
                ).length,

            events:
                Object.keys(
                    eventsMap
                ).length

        };

        console.log(
            "[101] ADMIN OVERVIEW - STATS:",
            stats
        );

        // =====================================================
        // RESPOSTA
        // =====================================================

        return res.status(200).json({

            ok: true,

            stats,

            orders:
                orders
                    .slice(-10)
                    .reverse(),

            events:
                Object.values(
                    eventsMap
                ),

            participants

        });

    } catch (error) {

        console.error(
            "[101] ADMIN OVERVIEW - ERRO:",
            error
        );

        return res.status(500).json({

            ok: false,

            error:
                error?.message ||
                "Erro interno no dashboard."

        });
    }
};
