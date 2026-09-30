import { put } from "@vercel/blob";

export default async function handler(request) {

    if (request.method !== "POST") {
        return new Response(
            JSON.stringify({
                error: "Método não permitido."
            }),
            {
                status: 405,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    try {

        const body = await request.json();

        console.log("[101] Dados recebidos:", {
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
        } = body;

        if (!orderCode || !evento || !nome) {

            return new Response(
                JSON.stringify({
                    error: "Dados do pedido incompletos."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        }

        const order = {

            orderCode,

            evento,

            eventoSlug: eventoSlug || "",

            nome,

            discord: discord || "",

            contacto: contacto || "",

            quantidade: Number(
                quantidade || 1
            ),

            precoUnitario: Number(
                precoUnitario || 0
            ),

            moeda: moeda || "€",

            total: Number(
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

        console.log(
            "[101] A tentar guardar no Vercel Blob..."
        );

        const blob = await put(
            `orders/${orderCode}.json`,
            JSON.stringify(order, null, 2),
            {
                access: "private"
            }
        );

        console.log(
            "[101] Pedido guardado:",
            blob.url
        );

        return new Response(
            JSON.stringify({
                ok: true,
                orderCode
            }),
            {
                status: 201,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    } catch (error) {

        console.error(
            "[101] ERRO REAL DO BLOB:",
            error
        );

        return new Response(
            JSON.stringify({
                error: "Falha ao guardar o pedido.",
                details:
                    error instanceof Error
                        ? error.message
                        : String(error)
            }),
            {
                status: 500,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    }

}
