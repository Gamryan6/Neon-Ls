// api/callback.js — Vercel Serverless Function
// Vérifie que l'utilisateur est membre du serveur Discord avant d'autoriser l'accès

const crypto = require("crypto");

// ── CONFIGURATION ────────────────────────────────────────────────────────────
// Ces valeurs sont définies dans les variables d'environnement Vercel (Settings > Environment Variables)
const CLIENT_ID     = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const GUILD_ID      = process.env.DISCORD_GUILD_ID;   // L'ID de TON serveur Discord
const TOKEN_SECRET  = process.env.TOKEN_SECRET;        // Une chaîne aléatoire secrète (ex: openssl rand -hex 32)
const DOWNLOAD_URL  = process.env.DOWNLOAD_URL;        // Ton lien SwissTransfer
// ─────────────────────────────────────────────────────────────────────────────

// Génère un token signé valable 15 minutes
function generateToken(userId) {
    const payload = `${userId}:${Date.now()}`;
    const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
    return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

module.exports = async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send(errorPage("Paramètre manquant."));
    }

    const redirectUri = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/api/callback`;

    try {
        // 1. Échanger le code contre un access token Discord
        const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id:     CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type:    "authorization_code",
                code,
                redirect_uri:  redirectUri,
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
            return res.status(401).send(errorPage("Échec de l'authentification Discord."));
        }

        const accessToken = tokenData.access_token;

        // 2. Récupérer l'identité de l'utilisateur
        const userRes = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const user = await userRes.json();

        // 3. Récupérer ses serveurs
        const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const guilds = await guildsRes.json();

        // 4. Vérifier s'il est dans TON serveur
        const isMember = Array.isArray(guilds) && guilds.some(g => g.id === GUILD_ID);

        if (!isMember) {
            return res.status(403).send(notMemberPage(user.username));
        }

        // 5. Générer un token signé et rediriger vers la page de téléchargement
        const token = generateToken(user.id);
        res.redirect(302, `/pack.html?t=${token}`);

    } catch (err) {
        console.error(err);
        return res.status(500).send(errorPage("Erreur serveur. Réessaie dans quelques secondes."));
    }
};

// ── PAGES D'ERREUR HTML ───────────────────────────────────────────────────────
function errorPage(msg) {
    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Erreur</title>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{background:#04080f;color:#f0f4ff;font-family:'Share Tech Mono',monospace;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}.box{border:1px solid rgba(255,30,60,0.4);border-radius:6px;padding:40px;max-width:440px}h1{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:#ff2244;letter-spacing:4px;margin-bottom:16px}p{color:rgba(255,150,160,0.7);font-size:0.78rem;line-height:1.8;letter-spacing:1px;margin-bottom:24px}a{display:inline-block;padding:12px 28px;border:1px solid rgba(0,170,255,0.4);color:#0af;font-family:'Bebas Neue',sans-serif;letter-spacing:3px;text-decoration:none;border-radius:4px;font-size:1rem}</style>
    </head><body><div class="box"><h1>⚠ ERREUR</h1><p>${msg}</p><a href="/">← RETOUR</a></div></body></html>`;
}

function notMemberPage(username) {
    return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Accès Refusé</title>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{background:#04080f;color:#f0f4ff;font-family:'Share Tech Mono',monospace;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px}body::before{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px);pointer-events:none}.box{border:1px solid rgba(255,30,60,0.35);border-radius:6px;padding:44px 40px;max-width:460px;position:relative;z-index:1}h1{font-family:'Bebas Neue',sans-serif;font-size:2.4rem;color:#ff2244;letter-spacing:4px;margin-bottom:8px}.code{font-size:0.7rem;color:rgba(255,80,100,0.5);letter-spacing:3px;margin-bottom:24px}p{color:rgba(200,210,240,0.6);font-size:0.78rem;line-height:1.9;letter-spacing:0.5px;margin-bottom:28px}p strong{color:rgba(255,150,160,0.9)}.btns{display:flex;flex-direction:column;gap:12px}a{display:block;padding:14px;font-family:'Bebas Neue',sans-serif;letter-spacing:3px;text-decoration:none;border-radius:4px;font-size:1.1rem}.btn-join{background:rgba(88,101,242,0.2);border:1px solid rgba(88,101,242,0.5);color:#7289da}.btn-back{border:1px solid rgba(0,170,255,0.3);color:#0af}</style>
    </head><body><div class="box">
    <h1>🚫 ACCÈS REFUSÉ</h1>
    <p class="code">// VÉRIFICATION DISCORD ÉCHOUÉE //</p>
    <p>Salut <strong>${username}</strong>, tu n'es pas membre de notre serveur Discord.<br><br>Pour accéder au pack, tu dois d'abord <strong>rejoindre le serveur</strong> puis réessayer.</p>
    <div class="btns">
        <a href="https://discord.gg/eq4Y5AaVCZ" target="_blank" class="btn-join">REJOINDRE LE DISCORD</a>
        <a href="/" class="btn-back">← RÉESSAYER</a>
    </div></div></body></html>`;
}
