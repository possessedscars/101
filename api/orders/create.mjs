import { put } from "@vercel/blob";

export default async function handler(req, res) {

    console.log("[101] CREATE ORDER - INICIO");

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método não permitido."
        });
    }

    try {

        // A Vercel já disponibiliza o body através de req.body
        const body =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : req.body;

        console.log("[101] BODY RECEBIDO:", {
            orderCode: body?.orderCode,
            evento: body?.evento,
            nome: body?.nome,
            quantidade: body?.quantidade
        });

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

        if (!orderCode || !evento || !nome) {

            return res.status(400).json({
                error: "Dados do pedido incompletos."
            });

        }

        const order = {

            orderCode,

            evento,

            eventoSlug:
                eventoSlug || "",

            nome,

            discord:
                discord || "",

            contacto:
                contacto || "",

            quantidade:
                Number(quantidade || 1),

            precoUnitario:
                Number(precoUnitario || 0),

            moeda:
                moeda || "€",

            total:
                Number(total || 0),

            participantes:
                Array.isArray(participantes)
                    ? participantes
                    : [nome],

            estado:
                estado || "pendente",

            criadoEm:
                new Date().toISOString()

        };

        console.log(
            "[101] A GUARDAR NO BLOB..."
        );

        const blob = await put(
            `orders/${orderCode}.json`,
            JSON.stringify(order, null, 2),
            {
                access: "private"
            }
        );

        console.log(
            "[101] BLOB OK:",
            blob.url
        );

        return res.status(201).json({
            ok: true,
            orderCode
        });

    } catch (error) {

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
