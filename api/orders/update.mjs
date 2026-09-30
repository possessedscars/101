import {
    list,
    get,
    put
} from "@vercel/blob";

import {
    readSession
} from "../auth/_session.mjs";


export default async function handler(req, res) {

    console.log(
        "[101] UPDATE ORDER - INICIO"
    );


    if (req.method !== "POST") {

        return res.status(405).json({
            ok: false,
            error: "Método não permitido."
        });

    }


    try {

        // =====================================================
        // AUTH
        // =====================================================

        const session =
            readSession(req);


        if (!session) {

            console.log(
                "[101] UPDATE ORDER - SEM SESSAO"
            );

            return res.status(401).json({
                ok: false,
                error: "Não autenticado."
            });

        }


        // =====================================================
        // BODY
        // =====================================================

        const body =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : req.body;


        const {
            orderCode,
            estado
        } = body || {};


        // =====================================================
        // VALIDAR ESTADO
        // =====================================================

        const allowedStatuses = [
            "pendente",
            "pago",
            "confirmado"
        ];


        const normalizedStatus =
            String(
                estado || ""
            )
                .trim()
                .toLowerCase();


        if (!orderCode) {

            return res.status(400).json({
                ok: false,
                error: "Pedido não indicado."
            });

        }


        if (
            !allowedStatuses.includes(
                normalizedStatus
            )
        ) {

            return res.status(400).json({
                ok: false,
                error: "Estado inválido."
            });

        }


        // =====================================================
        // LOCALIZAR BLOB
        // =====================================================

        const pathname =
            `orders/${orderCode}.json`;


        const result =
            await list({
                prefix: "orders/",
                access: "private"
            });


        const blob =
            result.blobs.find(
                item =>
                    item.pathname === pathname
            );


        if (!blob) {

            return res.status(404).json({
                ok: false,
                error: "Pedido não encontrado."
            });

        }


        // =====================================================
        // LER BLOB
        // =====================================================

        const current =
            await get(
                pathname,
                {
                    access: "private",
                    useCache: false
                }
            );


        if (
            !current ||
            current.statusCode !== 200
        ) {

            return res.status(404).json({
                ok: false,
                error: "Pedido não encontrado."
            });

        }


        const reader =
            current.stream.getReader();


        const decoder =
            new TextDecoder();


        let text = "";


        while (true) {

            const {
                done,
                value
            } =
                await reader.read();


            if (done) {
                break;
            }


            text +=
                decoder.decode(
                    value,
                    {
                        stream: true
                    }
                );

        }


        text +=
            decoder.decode();


        // =====================================================
        // PARSE
        // =====================================================

        const order =
            JSON.parse(text);


        // =====================================================
        // ATUALIZAR
        // =====================================================

        order.estado =
            normalizedStatus;


        order.atualizadoEm =
            new Date().toISOString();


        // =====================================================
        // GUARDAR NOVAMENTE
        // =====================================================

        await put(
            pathname,

            JSON.stringify(
                order,
                null,
                2
            ),

            {
                access: "private",

                // IMPORTANTE:
                // estamos a substituir
                // o pedido existente
                allowOverwrite: true,

                // não criar outro nome
                addRandomSuffix: false
            }
        );


        console.log(
            "[101] UPDATE ORDER - OK:",
            orderCode,
            normalizedStatus
        );


        return res.status(200).json({

            ok: true,

            order: {

                orderCode:
                    order.orderCode,

                estado:
                    order.estado

            }

        });


    } catch (error) {

        console.error(
            "[101] UPDATE ORDER - ERRO:",
            error
        );


        return res.status(500).json({

            ok: false,

            error:
                error?.message ||
                "Não foi possível atualizar o pedido."

        });

    }

}
