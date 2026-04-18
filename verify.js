// api/verify.js — Vercel Serverless Function
// Vérifie le token signé avant d'autoriser l'accès à la page de téléchargement

const crypto = require("crypto");

const TOKEN_SECRET = process.env.TOKEN_SECRET;
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes de validité

module.exports = function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    const { t } = req.query;

    if (!t) {
        return res.status(400).json({ ok: false, reason: "missing_token" });
    }

    try {
        const decoded = Buffer.from(t, "base64url").toString();
        const parts = decoded.split(":");

        // Format attendu: userId:timestamp:signature
        if (parts.length !== 3) {
            return res.status(401).json({ ok: false, reason: "invalid_format" });
        }

        const [userId, timestamp, sig] = parts;
        const payload = `${userId}:${timestamp}`;
        const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");

        // Vérifier la signature (protection contre la falsification)
        if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
            return res.status(401).json({ ok: false, reason: "invalid_signature" });
        }

        // Vérifier l'expiration (15 min)
        const age = Date.now() - parseInt(timestamp, 10);
        if (age > TOKEN_TTL_MS) {
            return res.status(401).json({ ok: false, reason: "token_expired" });
        }

        // Token valide → renvoyer le lien de téléchargement
        return res.status(200).json({
            ok: true,
            downloadUrl: process.env.DOWNLOAD_URL,
        });

    } catch (e) {
        return res.status(401).json({ ok: false, reason: "error" });
    }
};
