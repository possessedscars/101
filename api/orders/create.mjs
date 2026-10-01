import { put } from "@vercel/blob";

export default async function handler(req, res) {

    console.log("[101] CREATE ORDER - INICIO");

    // ==========================================================
    // MÉTODO
    // ==========================================================

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Método não permitido."
        });

    }

    try {

        // ======================================================
        // BODY
        // ======================================================

        const body =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : req.body;

        console.log("[101] BODY RECEBIDO:", {
            orderCode: body?.orderCode,
            evento: body?.evento,
            eventoSlug: body?.eventoSlug,
            nome: body?.nome,
            quantidade: body?.quantidade
        });

        // ======================================================
        // DADOS
        // ======================================================

        const {
            orderCode,
            evento,
            eventoSlug,
            nome,
            discord,
            contacto,
            quantidade,
            precoUnitario,
            moeda,
            total,
            participantes,
            estado
        } = body || {};

        // ======================================================
        // EVENTO
        // ======================================================

        const eventoFinal =
            typeof evento === "string" &&
            evento.trim()
                ? evento.trim()
                : (
                    typeof eventoSlug === "string" &&
                    eventoSlug.trim()
                        ? eventoSlug.trim()
                        : "Evento 1Ø1"
                );

        // ======================================================
        // VALIDAÇÃO
        // ======================================================

        if (!orderCode || !nome) {

            return res.status(400).json({
                error: "Dados do pedido incompletos."
            });

        }

        // ======================================================
        // PEDIDO
        // ======================================================

        const order = {

            orderCode,

            evento:
                eventoFinal,

            eventoSlug:
                eventoSlug || "",

            nome:
                nome.trim(),

            discord:
                discord || "",

            contacto:
                contacto || "",

            quantidade:
                Number(
                    quantidade || 1
                ),

            precoUnitario:
                Number(
                    precoUnitario || 0
                ),

            moeda:
                moeda || "€",

            total:
                Number(
                    total || 0
                ),

            participantes:
                Array.isArray(participantes)
                    ? participantes
                    : [nome],

            estado:
                estado || "pendente",

            criadoEm:
                new Date().toISOString()

        };

        // ======================================================
        // LOG
        // ======================================================

        console.log(
            "[101] PEDIDO PREPARADO:",
            {
                orderCode:
                    order.orderCode,

                evento:
                    order.evento,

                eventoSlug:
                    order.eventoSlug,

                nome:
                    order.nome,

                quantidade:
                    order.quantidade
            }
        );

        console.log(
            "[101] A GUARDAR NO VERCEL BLOB..."
        );

        // ======================================================
        // VERCEL BLOB
        // ======================================================

        const blob = await put(

            `orders/${orderCode}.json`,

            JSON.stringify(
                order,
                null,
                2
            ),

            {
                access: "private"
            }

        );

        // ======================================================
        // SUCESSO
        // ======================================================

        console.log(
            "[101] BLOB OK:",
            blob.url
        );

        return res.status(201).json({

            ok: true,

            orderCode,

            evento:
                order.evento

        });

    } catch (error) {

        // ======================================================
        // ERRO
        // ======================================================

        console.error(
            "[101] ERRO AO CRIAR PEDIDO:",
            error
        );

        return res.status(500).json({

            ok: false,

            error:
                error?.message ||
                "Não foi possível guardar o pedido."

        });

    }

}
