import { clearSession } from "./_session.mjs";

export default function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            ok: false,
            error: "Método não permitido."
        });
    }

    try {

        clearSession(req, res);

        return res.status(200).json({
            ok: true
        });

    } catch (error) {

        console.error(
            "[101] LOGOUT ERROR:",
            error
        );

        return res.status(500).json({
            ok: false,
            error: "Não foi possível terminar a sessão."
        });
    }
}
