import { put } from "@vercel/blob";

export default async function handler(request) {

    console.log("[101] CREATE ORDER - INICIO");

    try {

        const body = await request.json();

        console.log("[101] BODY RECEBIDO");

        const orderCode = body?.orderCode || `TEST-${Date.now()}`;

        console.log("[101] A TESTAR BLOB:", orderCode);

        const blob = await put(
            `orders/${orderCode}.json`,
            JSON.stringify({
                teste: true,
                orderCode,
                data: new Date().toISOString()
            }),
            {
                access: "private"
            }
        );

        console.log("[101] BLOB OK:", blob.url);

        return new Response(
            JSON.stringify({
                ok: true,
                message: "Blob funcionou!",
                orderCode
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {

        console.error("[101] ERRO BLOB:", error);

        return new Response(
            JSON.stringify({
                ok: false,
                error: error?.message || String(error)
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}
