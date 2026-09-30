import { json, readSession } from "../_session.mjs";

export default function handler(request) {

    const session = readSession(request);

    if (!session) {

        return json(
            {
                error: "Não autenticado."
            },
            401
        );

    }

    return json({

        stats: {

            orders: 0,

            bracelets: 0,

            paid: 0,

            events: 0

        },

        orders: [],

        events: []

    });

}
