import {
    readSession
} from "./_session.mjs";

export default async function handler(req, res) {

    try {

        const session =
            readSession(req);

        if (!session) {

            return res.status(401).json({
                authenticated: false,
                error: "Não autenticado."
            });
        }

        return res.status(200).json({
            authenticated: true,
            email: session.email,
            expiresAt: session.exp
        });

    } catch (error) {

        console.error(
            "[101] ERRO AUTH ME:",
            error
        );

        return res.status(500).json({
            authenticated: false,
            error:
                error?.message ||
                "Não foi possível validar a sessão."
        });
    }
}
