import { list, get } from "@vercel/blob";
import {
    json,
    readSession
} from "./_session.mjs";


/* =========================================================
   LER JSON PRIVADO DO BLOB
========================================================= */

async function readBlobJson(pathname) {

    const result = await get(
        pathname,
        {
            access: "private"
        }
    );

    if (!result) {
        return null;
    }

    const text =
        await new Response(
            result.stream
        ).text();

    return JSON.parse(text);
}


/* =========================================================
   ADMIN OVERVIEW
========================================================= */

export default async function handler(request) {

    try {

        /* -------------------------------------------------
           AUTENTICAÇÃO
        ------------------------------------------------- */

        const session =
            readSession(request);

        if (!session) {

            return json(
                {
                    error: "Não autenticado."
                },
                401
            );
        }


        console.log(
            "[101] ADMIN OVERVIEW - INICIO"
        );


        /* -------------------------------------------------
           LISTAR PEDIDOS
        ------------------------------------------------- */

        const blobs = [];

        let cursor;


        do {

            const result =
                await list({
                    prefix: "orders/",
                    limit: 100,
                    ...(cursor
                        ? { cursor }
                        : {})
                });


            blobs.push(
                ...result.blobs
            );


            cursor =
                result.cursor ||
                undefined;


        } while (cursor);


        console.log(
            "[101] PEDIDOS ENCONTRADOS:",
            blobs.length
        );


        /* -------------------------------------------------
           LER PEDIDOS
        ------------------------------------------------- */

        const orders = [];


        for (const blob of blobs) {

            try {

                const order =
                    await readBlobJson(
                        blob.pathname
                    );


                if (order) {
                    orders.push(order);
                }


            } catch (error) {

                console.error(
                    "[101] ERRO AO LER:",
                    blob.pathname,
                    error
                );

            }

        }


        /* -------------------------------------------------
           ORDENAR POR DATA
        ------------------------------------------------- */

        orders.sort(
            (a, b) =>
                new Date(
                    b.criadoEm || 0
                ).getTime()
                -
                new Date(
                    a.criadoEm || 0
                ).getTime()
        );


        /* -------------------------------------------------
           ESTATÍSTICAS
        ------------------------------------------------- */

        const totalPedidos =
            orders.length;


        const totalPulseiras =
            orders.reduce(
                (total, order) =>
                    total +
                    Number(
                        order.quantidade || 0
                    ),
                0
            );


        const totalPagos =
            orders.filter(
                order => {

                    const estado =
                        String(
                            order.estado || ""
                        )
                            .toLowerCase()
                            .trim();


                    return [
                        "pago",
                        "paga",
                        "pagos",
                        "pagas",
                        "confirmado",
                        "confirmada",
                        "confirmed",
                        "paid"
                    ].includes(
                        estado
                    );

                }
            ).length;


        /* -------------------------------------------------
           EVENTOS
        ------------------------------------------------- */

        const eventMap =
            new Map();


        for (const order of orders) {

            const slug =
                String(
                    order.eventoSlug ||
                    order.evento ||
                    "evento"
                )
                    .toLowerCase()
                    .trim();


            const eventName =
                order.evento ||
                order.eventoSlug ||
                "Evento 1Ø1";


            if (!eventMap.has(slug)) {

                eventMap.set(
                    slug,
                    {
                        name: eventName,
                        orders: 0,
                        bracelets: 0
                    }
                );

            }


            const event =
                eventMap.get(slug);


            event.orders += 1;


            event.bracelets +=
                Number(
                    order.quantidade || 0
                );

        }


        const events =
            Array.from(
                eventMap.values()
            );


        /* -------------------------------------------------
           PEDIDOS PARA O FRONTEND
        ------------------------------------------------- */

        const recentOrders =
            orders
                .slice(0, 20)
                .map(order => {

                    const estado =
                        String(
                            order.estado ||
                            "pendente"
                        )
                            .toLowerCase()
                            .trim();


                    let status =
                        "PENDENTE";


                    if (
                        [
                            "pago",
                            "paga",
                            "pagos",
                            "pagas",
                            "confirmado",
                            "confirmada",
                            "confirmed",
                            "paid"
                        ].includes(
                            estado
                        )
                    ) {

                        status = "PAGO";

                    }


                    return {

                        number:
                            order.orderCode ||
                            "",

                        event:
                            order.evento ||
                            order.eventoSlug ||
                            "Evento 1Ø1",

                        customer:
                            order.nome ||
                            "",

                        bracelets:
                            Number(
                                order.quantidade ||
                                0
                            ),

                        status

                    };

                });


        /* -------------------------------------------------
           PARTICIPANTES
        ------------------------------------------------- */

        const participants = [];


        for (const order of orders) {

            const names =
                Array.isArray(
                    order.participantes
                )
                    ? order.participantes
                    : [order.nome];


            for (
                const participante
                of names
            ) {

                if (
                    !participante ||
                    !String(
                        participante
                    ).trim()
                ) {
                    continue;
                }


                participants.push({

                    name:
                        String(
                            participante
                        ).trim(),

                    order:
                        order.orderCode ||
                        "",

                    event:
                        order.evento ||
                        order.eventoSlug ||
                        "Evento 1Ø1",

                    discord:
                        order.discord ||
                        "",

                    contact:
                        order.contacto ||
                        ""

                });

            }

        }


        /* -------------------------------------------------
           LOG
        ------------------------------------------------- */

        console.log(
            "[101] OVERVIEW OK:",
            {
                pedidos: totalPedidos,
                pulseiras: totalPulseiras,
                pagos: totalPagos,
                eventos: events.length,
                participantes:
                    participants.length
            }
        );


        /* -------------------------------------------------
           RESPOSTA
        ------------------------------------------------- */

        return json({

            stats: {

                orders:
                    totalPedidos,

                bracelets:
                    totalPulseiras,

                paid:
                    totalPagos,

                events:
                    events.length

            },

            orders:
                recentOrders,

            events,

            participants

        });


    } catch (error) {

        console.error(
            "[101] ERRO ADMIN OVERVIEW:",
            error
        );


        return json(
            {
                error:
                    error?.message ||
                    "Não foi possível carregar o painel."
            },
            500
        );

    }

}
