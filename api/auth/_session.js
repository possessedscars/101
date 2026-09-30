import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "101_admin_session";

const MAX_AGE = 60 * 60 * 8;


// ==========================================================
// SECRET
// ==========================================================

function secret() {

    if (!process.env.ADMIN_SESSION_SECRET) {

        throw new Error(
            "ADMIN_SESSION_SECRET não configurado."
        );

    }

    return process.env.ADMIN_SESSION_SECRET;

}


// ==========================================================
// ASSINATURA
// ==========================================================

function sign(value) {

    return createHmac(
        "sha256",
        secret()
    )
        .update(value)
        .digest("base64url");

}


// ==========================================================
// CRIAR SESSÃO
// ==========================================================

export function createSession(email) {

    const payload = Buffer
        .from(
            JSON.stringify({
                email,
                exp:
                    Math.floor(
                        Date.now() / 1000
                    ) + MAX_AGE
            })
        )
        .toString("base64url");


    return (
        `${payload}.${sign(payload)}`
    );

}


// ==========================================================
// LER SESSÃO
// ==========================================================

export function readSession(request) {

    const raw =
        request.headers.get("cookie") || "";


    const item =
        raw
            .split(";")
            .map(
                x => x.trim()
            )
            .find(
                x =>
                    x.startsWith(
                        `${COOKIE}=`
                    )
            );


    if (!item) {

        return null;

    }


    const token =
        decodeURIComponent(
            item.slice(
                COOKIE.length + 1
            )
        );


    const [
        payload,
        signature
    ] = token.split(".");


    if (
        !payload ||
        !signature
    ) {

        return null;

    }


    try {

        const expected =
            sign(payload);


        const a =
            Buffer.from(
                signature
            );


        const b =
            Buffer.from(
                expected
            );


        if (
            a.length !== b.length ||
            !timingSafeEqual(
                a,
                b
            )
        ) {

            return null;

        }


        const data =
            JSON.parse(
                Buffer
                    .from(
                        payload,
                        "base64url"
                    )
                    .toString("utf8")
            );


        if (
            !data.exp ||
            data.exp <
                Math.floor(
                    Date.now() / 1000
                )
        ) {

            return null;

        }


        return data;

    } catch {

        return null;

    }

}


// ==========================================================
// COOKIE DE SESSÃO
// ==========================================================

export function sessionCookie(email) {

    const token =
        createSession(
            email
        );


    return (
        `${COOKIE}=${encodeURIComponent(token)}; ` +
        `Path=/; ` +
        `Max-Age=${MAX_AGE}; ` +
        `HttpOnly; ` +
        `Secure; ` +
        `SameSite=Lax`
    );

}


// ==========================================================
// LIMPAR SESSÃO
// ==========================================================

export function clearSessionCookie() {

    return (
        `${COOKIE}=; ` +
        `Path=/; ` +
        `Max-Age=0; ` +
        `HttpOnly; ` +
        `Secure; ` +
        `SameSite=Lax`
    );

}


// ==========================================================
// JSON RESPONSE
// ==========================================================

export function json(
    data,
    status = 200,
    headers = {}
) {

    return new Response(
        JSON.stringify(data),
        {
            status,

            headers: {
                "Content-Type":
                    "application/json; charset=utf-8",

                ...headers
            }
        }
    );

}
