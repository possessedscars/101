import {
    sessionCookie
} from "./_session.mjs";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método não permitido."
        });
    }

    try {

        const body =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : (req.body || {});

        const email =
            String(body.email || "").trim();

        const password =
            String(body.password || "");

        const adminEmail =
            String(process.env.ADMIN_EMAIL || "").trim();

        const adminPassword =
            String(process.env.ADMIN_PASSWORD || "");

        if (!adminEmail || !adminPassword) {

            console.error(
                "[101] ADMIN_EMAIL ou ADMIN_PASSWORD não configurado."
            );

            return res.status(500).json({
                error:
                    "Autenticação do administrador não configurada."
            });
        }

        if (
            email.toLowerCase() !==
            adminEmail.toLowerCase() ||
            password !== adminPassword
        ) {

            return res.status(401).json({
                error:
                    "Email ou palavra-passe incorretos."
            });
        }

        const cookie =
            sessionCookie(email);

        res.setHeader(
            "Set-Cookie",
            cookie
        );

        return res.status(200).json({
            ok: true,
            email
        });

    } catch (error) {

        console.error(
            "[101] ERRO LOGIN:",
            error
        );

        return res.status(500).json({
            error:
                error?.message ||
                "Não foi possível iniciar sessão."
        });
    }
}
