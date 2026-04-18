# 🔐 GUIDE D'INSTALLATION — Système Discord OAuth2
## Pack Neon LS by Gamryan

---

## ✅ CE QUE ÇA FAIT

Quand quelqu'un arrive sur ton site :
1. Il clique "Se connecter avec Discord"
2. Discord lui demande d'autoriser l'accès
3. Le serveur vérifie automatiquement **s'il est membre de TON serveur**
4. ✅ Membre → accès au téléchargement
5. ❌ Pas membre → page de refus avec lien pour rejoindre

**Impossible d'accéder au lien sans être dans le Discord. Aucun mot de passe partageable.**

---

## ÉTAPE 1 — Créer une Application Discord (5 min)

1. Va sur https://discord.com/developers/applications
2. Clique **"New Application"** (donne-lui un nom, ex: "Pack Neon LS")
3. Dans le menu gauche, clique **"OAuth2"**
4. Note le **Client ID** (tu en auras besoin)
5. Clique **"Reset Secret"** et note le **Client Secret**
6. Dans **"Redirects"**, ajoute cette URL (on la complètera à l'étape 3) :
   ```
   https://TON-PROJET.vercel.app/api/callback
   ```
   Remplace `TON-PROJET` par le nom de ton projet Vercel (tu le sauras à l'étape 2)

---

## ÉTAPE 2 — Trouver l'ID de ton serveur Discord

1. Ouvre Discord
2. Paramètres → Avancé → Active **"Mode développeur"**
3. Fais un **clic droit sur ton serveur** (l'icône dans la barre de gauche)
4. Clique **"Copier l'identifiant"**
5. Note ce numéro (c'est ton **Guild ID**)

---

## ÉTAPE 3 — Déployer sur Vercel (gratuit, 5 min)

1. Crée un compte gratuit sur https://vercel.com
2. Clique **"Add New Project"** → **"Upload"** (ou connecte GitHub si tu préfères)
3. Dépose le dossier `neon-ls-site` entier
4. Avant de valider le déploiement, va dans **"Environment Variables"** et ajoute :

| Variable               | Valeur                                                        |
|------------------------|---------------------------------------------------------------|
| `DISCORD_CLIENT_ID`    | Le Client ID de l'étape 1                                     |
| `DISCORD_CLIENT_SECRET`| Le Client Secret de l'étape 1                                 |
| `DISCORD_GUILD_ID`     | L'ID de ton serveur Discord (étape 2)                         |
| `TOKEN_SECRET`         | Une chaîne aléatoire longue (ex: `mK9xP2nQ8rL4vZ6tY3wA5cE7`) |
| `DOWNLOAD_URL`         | `https://www.swisstransfer.com/d/43475b8c-6c81-4725-a764-2e0665b7b5ed` |

5. Clique **Deploy** et attends 1 minute
6. Vercel te donne une URL du type `https://neon-ls.vercel.app`

---

## ÉTAPE 4 — Finaliser l'application Discord

1. Retourne sur https://discord.com/developers/applications
2. Sélectionne ton application → **OAuth2**
3. Dans **Redirects**, ajoute l'URL exacte de ton callback :
   ```
   https://neon-ls.vercel.app/api/callback
   ```
   (remplace par ton URL Vercel réelle)
4. Sauvegarde

---

## ÉTAPE 5 — Mettre à jour index.html

Dans `index.html`, à la fin du fichier dans le script, remplace :
```javascript
const CLIENT_ID = "TON_CLIENT_ID";
```
Par ton vrai Client ID Discord.

Puis re-déploie sur Vercel (tu peux juste re-uploader le dossier).

---

## 🎯 TEST FINAL

1. Va sur ton URL Vercel
2. Clique "Se connecter avec Discord"
3. Si t'es dans le serveur → tu arrives sur la page de téléchargement ✅
4. Déconnecte-toi de ton serveur et réessaie → page de refus ✅

---

## ❓ EN CAS DE PROBLÈME

- **"Redirect URI mismatch"** → L'URL dans l'app Discord ne correspond pas exactement à ton URL Vercel. Vérifie les deux.
- **"Invalid client"** → Le CLIENT_ID dans index.html est incorrect.
- **Page blanche** → Vérifie que toutes les variables d'environnement sont bien renseignées sur Vercel.

Pour toute aide → Discord : https://discord.gg/eq4Y5AaVCZ

---
Créé par Gamryan — Système de protection Discord OAuth2
