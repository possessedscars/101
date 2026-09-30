import { list, get } from "@vercel/blob";
import { json, readSession } from "../auth/_session.mjs";

export default async function handler(req, res) {

    console.log("[101] ADMIN OVERVIEW - INICIO");

    try {

        const session = readSession(req);

        if (!session) {

            console.log("[101] ADMIN OVERVIEW - SEM SESSAO");

            return json(res, 401, {
                ok: false,
                error: "Não autenticado."
            });
        }

        console.log("[101] ADMIN OVERVIEW - SESSAO OK");

        const result = await list({
            prefix: "orders/",
            access: "private"
        });

        console.log(
            "[101] ADMIN OVERVIEW - BLOBS:",
            result.blobs?.length || 0
        );

        const orders = [];
        const participants = [];
        const eventsMap = {};

        for (const blob of result.blobs || []) {

            try {

                const response = await get(
                    blob.pathname,
                    {
                        access: "private"
                    }
                );

                if (!response) {
                    continue;
                }

                const text = await response.text();
                const order = JSON.parse(text);

                const eventName =
                    order.evento ||
                    order.eventoSlug ||
                    "Evento 1Ø1";

                const quantity =
                    Number(order.quantidade || 0);

                orders.push({
                    number:
                        order.orderCode || "",

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
                        ).toUpperCase()
                });

                if (!eventsMap[eventName]) {

                    eventsMap[eventName] = {
                        name: eventName,
                        orders: 0,
                        bracelets: 0
                    };
                }

                eventsMap[eventName].orders += 1;
                eventsMap[eventName].bracelets += quantity;

                const names =
                    Array.isArray(order.participantes)
                        ? order.participantes
                        : [order.nome];

                for (const name of names) {

                    if (!name) {
                        continue;
                    }

                    participants.push({

                        name,

                        order:
                            order.orderCode || "",

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
                    "[101] ERRO A LER BLOB:",
                    blob.pathname,
                    error
                );
            }
        }

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
                Object.keys(eventsMap).length
        };

        console.log(
            "[101] ADMIN OVERVIEW - STATS:",
            stats
        );

        return json(res, 200, {

            ok: true,

            stats,

            orders:
                orders
                    .slice(-10)
                    .reverse(),

            events:
                Object.values(eventsMap),

            participants

        });

    } catch (error) {

        console.error(
            "[101] ADMIN OVERVIEW - ERRO:",
            error
        );

        return json(res, 500, {

            ok: false,

            error:
                error?.message ||
                "Erro interno no dashboard."

        });
    }
}
