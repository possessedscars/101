import {
    list,
    del
} from "@vercel/blob";

import {
    readSession
} from "../auth/_session.mjs";


export default async function handler(
    req,
    res
) {

    console.log(
        "[101] DELETE ORDER - INICIO"
    );


    if (
        req.method !== "POST"
    ) {

        return res.status(405).json({
            ok: false,
            error:
                "Método não permitido."
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
                "[101] DELETE ORDER - SEM SESSAO"
            );

            return res.status(401).json({
                ok: false,
                error:
                    "Não autenticado."
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
            orderCode
        } = body || {};



        if (!orderCode) {

            return res.status(400).json({
                ok: false,
                error:
                    "Pedido inválido."
            });
        }



        // =====================================================
        // FIND
        // =====================================================

        const result =
            await list({
                prefix:
                    "orders/",

                access:
                    "private"
            });


        const pathname =
            `orders/${orderCode}.json`;


        const blob =
            result.blobs.find(
                item =>
                    item.pathname ===
                    pathname
            );


        if (!blob) {

            return res.status(404).json({
                ok: false,
                error:
                    "Pedido não encontrado."
            });
        }



        // =====================================================
        // DELETE
        // =====================================================

        await del(
            blob.url
        );


        console.log(
            "[101] DELETE ORDER - OK:",
            orderCode
        );


        return res.status(200).json({

            ok: true,

            orderCode

        });


    } catch (error) {

        console.error(
            "[101] DELETE ORDER - ERRO:",
            error
        );


        return res.status(500).json({

            ok: false,

            error:
                error?.message ||
                "Não foi possível eliminar o pedido."

        });
    }
}
