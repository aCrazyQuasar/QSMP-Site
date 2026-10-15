import { Router } from "express";
import crypto from "node:crypto";

const router = Router();

router.get("/discord", (req, res) => {
    const state = crypto.randomBytes(32).toString("hex");

    req.session.oauthState = state;

    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
        response_type: "code",
        scope: "identify guilds.members.read",
        state
    });

    res.redirect(
        `https://discord.com/oauth2/authorize?${params}`
    );
});
router.get("/discord/callback", async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        return res.status(400).send("Discord login was cancelled.");
    }
    if (
        typeof state !== "string" ||
        typeof req.session.oauthState !== "string" ||
        state !== req.session.oauthState
    ) {
        return res.status(403).send("Invalid OAuth state.");
    }
    if (typeof code !== "string") {
        return res.status(400).send("Missing authorization code.");
    }

    delete req.session.oauthState;

    try {
        const tokenResponse = await fetch(
            "https://discord.com/api/v10/oauth2/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    client_id: process.env.DISCORD_CLIENT_ID,
                    client_secret: process.env.DISCORD_CLIENT_SECRET,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: process.env.DISCORD_REDIRECT_URI
                })
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error("Discord token exchange failed:", tokenData);
            return res.status(502).send("Could not complete Discord login.");
        }

        const userResponse = await fetch(
            "https://discord.com/api/v10/users/@me",
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`
                }
            }
        );

        const userData = await userResponse.json();
        if (!userResponse.ok) {
            console.error("Discord user lookup failed:", userData);
            return res.status(502).send("Could not retrieve Discord user.");
        }

        console.log("Discord user authenticated:", {
            id: userData.id,
            username: userData.username
        });
        
        const memberResponse = await fetch(
            `https://discord.com/api/v10/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`,
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`
                }
            }
        );

        const memberData = await memberResponse.json();
        if (!memberResponse.ok) {
            console.error("Discord membership check failed:", {
                status: memberResponse.status,
                response: memberData
            });

            if (memberResponse.status === 404) {
                return res.status(403).send(
                    "You must be a member of the Quasar SMP Discord server."
                );
            }

            return res.status(502).send(
                "Could not verify Discord server membership."
            );
        }
        console.log("Discord member verified:", {
            userId: userData.id,
            roles: memberData.roles
        });

        const isMedia = memberData.roles.includes(
            process.env.DISCORD_MEDIA_ROLE_ID
        );

        req.session.regenerate((err) => {
            if (err) {
                console.error("Session regeneration failed:", err);
                return res.status(500).send("Could not create login session.");
            }

            req.session.user = {
                id: userData.id,
                username: userData.username,
                isMedia
            };
            req.session.save((err) => {
                if (err) {
                    console.error("Session save failed:", err);
                    return res.status(500).send("Could not save login session.");
                }

                res.redirect("/dashboard.html");
            });
        });
    } catch (error) {
        console.error("Discord login error:", error);
        res.status(502).send("Could not contact Discord.");
    }
});

export default router;