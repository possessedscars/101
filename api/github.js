import crypto from "crypto";
import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    const signature = req.headers["x-hub-signature-256"];

    const body = JSON.stringify(req.body);

    const expected =
        "sha256=" +
        crypto
            .createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET)
            .update(body)
            .digest("hex");

    if (signature !== expected) {
        return res.status(401).send("Invalid signature");
    }

    const event = req.headers["x-github-event"];

    if (event !== "push") {
        return res.status(200).send("Ignored");
    }

    const commit = req.body.head_commit;

    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
        embeds: [
            {
                color: 0xffffff,

                author: {
                    name: commit.author.name
                },

                title: "🚀 Nova Atualização",

                description:
                    `**${commit.message}**`,

                fields: [

                    {
                        name: "👤 Autor",
                        value: req.body.pusher.name,
                        inline: true
                    },

                    {
                        name: "🌿 Branch",
                        value: req.body.ref.replace(
                            "refs/heads/",
                            ""
                        ),
                        inline: true
                    }

                ],

                url: commit.url,

                timestamp: new Date().toISOString(),

                footer: {
                    text: "1Ø1 Community"
                }

            }
        ]
    });

    res.status(200).send("OK");
}
