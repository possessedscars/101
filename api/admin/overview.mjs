import { list, get } from "@vercel/blob";
import { readSession } from "../auth/_session.mjs";

export default async function handler(req, res) {

    console.log("[101] ADMIN OVERVIEW - INICIO");

    try {

        // =====================================================
        // SESSÃO
        // =====================================================

        const session = readSession(req);

        if (!session) {

            console.log(
                "[101] ADMIN OVERVIEW - SEM SESSAO"
            );

            return res.status(401).json({
                ok: false,
                error: "Não autenticado."
            });
        }

        console.log(
            "[101] ADMIN OVERVIEW - SESSAO OK"
        );


        // =====================================================
        // LISTAR PEDIDOS
        // =====================================================

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


        // =====================================================
        // FUNÇÃO PARA LER STREAM DO BLOB
        // =====================================================

        async function streamToText(stream) {

            if (!stream) {
                return "";
            }

            const reader =
                stream.getReader();

            const decoder =
                new TextDecoder();

            let text = "";

            while (true) {

                const {
                    done,
                    value
                } = await reader.read();

                if (done) {
                    break;
                }

                text += decoder.decode(
                    value,
                    {
                        stream: true
                    }
                );
            }

            text += decoder.decode();

            return text;
        }


        // =====================================================
        // LER CADA PEDIDO
        // =====================================================

        for (const blob of result.blobs || []) {

            try {

                console.log(
                    "[101] A LER:",
                    blob.pathname
                );


                const blobResult =
                    await get(
                        blob.pathname,
                        {
                            access: "private"
                        }
                    );


                if (
                    !blobResult ||
                    blobResult.statusCode !== 200
                ) {

                    console.warn(
                        "[101] BLOB NÃO DISPONÍVEL:",
                        blob.pathname,
                        blobResult?.statusCode
                    );

                    continue;
                }


                const text =
                    await streamToText(
                        blobResult.stream
                    );


                const order =
                    JSON.parse(text);


                console.log(
                    "[101] PEDIDO LIDO:",
                    order.orderCode
                );


                // =================================================
                // DADOS NORMALIZADOS
                // =================================================

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

                    total:
                        Number(
                            order.total || 0
                        ),

                    status:
                        String(
                            order.estado ||
                            "pendente"
                        ).toUpperCase()

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
                    "[101] ERRO A LER BLOB:",
                    blob.pathname,
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
                    (
                        total,
                        order
                    ) =>
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
}
