import crypto from "crypto";

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).send("Method Not Allowed");
        }

        const event = req.headers["x-github-event"];

        if (event !== "push") {
            return res.status(200).send("Ignored");
        }

        const commit = req.body.head_commit;

        if (!commit) {
            return res.status(200).send("No commit");
        }

        const embed = {
            embeds: [
                {
                    color: 0xffffff,
                    title: "🚀 Nova Atualização",
                    description: `**${commit.message}**`,
                    url: commit.url,
                    author: {
                        name: commit.author.name
                    },
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
                    footer: {
                        text: "1Ø1 Community"
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };

        const response = await fetch(
            process.env.DISCORD_WEBHOOK_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(embed)
            }
        );

        if (!response.ok) {
            throw new Error(
                `Discord respondeu ${response.status}`
            );
        }

        return res.status(200).send("OK");

    } catch (err) {

        console.error(err);

        return res.status(500).send(err.message);

    }
}
