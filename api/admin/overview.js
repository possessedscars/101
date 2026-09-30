import { list, get } from "@vercel/blob";
import { json, readSession } from "../auth/_session.mjs";


// ==========================================================
// LER CONTEÚDO DE UM BLOB PRIVADO
// ==========================================================

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


// ==========================================================
// HANDLER
// ==========================================================

export default async function handler(
    request,
    response
) {

    // ======================================================
    // AUTENTICAÇÃO
    // ======================================================

    const session =
        readSession(request);

    if (!session) {

        return response
            ? response.status(401).json({
                error: "Não autenticado."
            })
            : json(
                {
                    error: "Não autenticado."
                },
                401
            );

    }


    try {

        console.log(
            "[101] ADMIN OVERVIEW - INICIO"
        );


        // ==================================================
        // LISTAR PEDIDOS
        // ==================================================

        const blobs = [];

        let cursor = undefined;

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
                result.cursor || undefined;


        } while (cursor);


        console.log(
            "[101] BLOBs ENCONTRADOS:",
            blobs.length
        );


        // ==================================================
        // LER PEDIDOS
        // ==================================================

        const orders = [];

        for (
            const blob
            of blobs
        ) {

            try {

                const order =
                    await readBlobJson(
                        blob.pathname
                    );


                if (order) {

                    orders.push(
                        order
                    );

                }

            } catch (error) {

                console.error(
                    "[101] Erro ao ler pedido:",
                    blob.pathname,
                    error
                );

            }

        }


        // ==================================================
        // MAIS RECENTES PRIMEIRO
        // ==================================================

        orders.sort(
            (
                a,
                b
            ) => {

                return (
                    new Date(
                        b.criadoEm || 0
                    ).getTime()
                    -
                    new Date(
                        a.criadoEm || 0
                    ).getTime()
                );

            }
        );


        // ==================================================
        // ESTATÍSTICAS
        // ==================================================

        const totalPedidos =
            orders.length;


        const totalPulseiras =
            orders.reduce(
                (
                    total,
                    order
                ) => {

                    return (
                        total +
                        Number(
                            order.quantidade || 0
                        )
                    );

                },
                0
            );


        const totalConfirmados =
            orders.filter(
                order => {

                    const estado =
                        String(
                            order.estado || ""
                        )
                            .toLowerCase()
                            .trim();


                    return [
                        "confirmado",
                        "confirmada",
                        "pago",
                        "paga",
                        "paid",
                        "confirmed"
                    ].includes(
                        estado
                    );

                }
            ).length;


        // ==================================================
        // EVENTOS
        // ==================================================

        const eventMap =
            new Map();


        for (
            const order
            of orders
        ) {

            const slug =
                (
                    order.eventoSlug ||
                    order.evento ||
                    "evento"
                )
                    .toString()
                    .toLowerCase();


            const nome =
                order.evento ||
                order.eventoSlug ||
                "Evento 1Ø1";


            if (
                !eventMap.has(slug)
            ) {

                eventMap.set(
                    slug,
                    {
                        slug,
                        nome,
                        pedidos: 0,
                        pulseiras: 0
                    }
                );

            }


            const event =
                eventMap.get(
                    slug
                );


            event.pedidos += 1;


            event.pulseiras +=
                Number(
                    order.quantidade || 0
                );

        }


        const events =
            Array.from(
                eventMap.values()
            );


        // ==================================================
        // PARTICIPANTES
        // ==================================================

        const participants = [];


        for (
            const order
            of orders
        ) {

            const names =
                Array.isArray(
                    order.participantes
                )
                    ? order.participantes
                    : [
                        order.nome
                    ];


            names.forEach(
                (
                    participante,
                    index
                ) => {

                    if (
                        !participante ||
                        !String(
                            participante
                        ).trim()
                    ) {
                        return;
                    }


                    participants.push({

                        nome:
                            String(
                                participante
                            ).trim(),

                        pedido:
                            order.orderCode,

                        evento:
                            order.evento ||
                            order.eventoSlug ||
                            "Evento 1Ø1",

                        discord:
                            order.discord ||
                            "",

                        contacto:
                            order.contacto ||
                            "",

                        indice:
                            index + 1

                    });

                }
            );

        }


        // ==================================================
        // PEDIDOS PARA O DASHBOARD
        // ==================================================

        const recentOrders =
            orders
                .slice(
                    0,
                    20
                )
                .map(
                    order => ({

                        orderCode:
                            order.orderCode,

                        evento:
                            order.evento ||
                            order.eventoSlug ||
                            "Evento 1Ø1",

                        eventoSlug:
                            order.eventoSlug ||
                            "",

                        cliente:
                            order.nome ||
                            "",

                        nome:
                            order.nome ||
                            "",

                        quantidade:
                            Number(
                                order.quantidade || 0
                            ),

                        pulseiras:
                            Number(
                                order.quantidade || 0
                            ),

                        total:
                            Number(
                                order.total || 0
                            ),

                        precoUnitario:
                            Number(
                                order.precoUnitario || 0
                            ),

                        moeda:
                            order.moeda ||
                            "€",

                        estado:
                            order.estado ||
                            "pendente",

                        participantes:
                            Array.isArray(
                                order.participantes
                            )
                                ? order.participantes
                                : [],

                        discord:
                            order.discord ||
                            "",

                        contacto:
                            order.contacto ||
                            "",

                        criadoEm:
                            order.criadoEm ||
                            null

                    })
                );


        // ==================================================
        // RESPOSTA
        // ==================================================

        console.log(
            "[101] ADMIN OVERVIEW OK:",
            {
                pedidos:
                    totalPedidos,

                pulseiras:
                    totalPulseiras,

                confirmados:
                    totalConfirmados,

                eventos:
                    events.length,

                participantes:
                    participants.length
            }
        );


        return response
            ? response.status(200).json({

                stats: {

                    orders:
                        totalPedidos,

                    bracelets:
                        totalPulseiras,

                    paid:
                        totalConfirmados,

                    events:
                        events.length

                },

                orders:
                    recentOrders,

                events,

                participants

            })
            : json({

                stats: {

                    orders:
                        totalPedidos,

                    bracelets:
                        totalPulseiras,

                    paid:
                        totalConfirmados,

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


        if (response) {

            return response
                .status(500)
                .json({

                    error:
                        error?.message ||
                        "Não foi possível carregar o painel."

                });

        }


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
