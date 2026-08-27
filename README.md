# Alexis Romney — Portfolio

Portfolio professionnel public : digitalisation, automatisation, IA et solutions métier.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Motion (Framer Motion)
- Lenis
- GSAP (section projet phare)
- Resend (formulaire de contact, serveur uniquement)

## Développement

```bash
npm install
npm run dev
```

## Contenu éditable

- Profil / liens sociaux : `src/data/profile.ts`
- Projets & URLs : `src/data/projects.ts`
- Expertise / stack : `src/data/expertise.ts`
- Identité visuelle : `public/brand/` (voir `public/brand/README.md`)

## Démo interactive — Gestion des demandes

Route : `/gestion-demandes` (Nouvelle demande).

L’application est embarquée telle quelle (design et UX d’origine), isolée du chrome du portfolio.

### Développement local

```bash
npm run dev
npm run trigger:dev
```

Deux process sont nécessaires en local : Next.js + worker Trigger.dev DEV.

### Production (Vercel + Trigger.dev Cloud)

1. Déployer les tâches vers Trigger Cloud (plan gratuit Hobby ok pour une démo) :

```bash
npm run trigger:deploy
```

(`npx trigger.dev@4.5.10 deploy --env-file .env.local`)

Cette commande synchronise aussi vers Trigger **prod** les variables worker :
`DATABASE_URL`, `GD_DEMO_ISOLATED`, `RESEND_AUTOMATION_API_KEY`, `AUTOMATION_FROM_EMAIL`, `APP_URL`.

2. Dans Trigger.dev → projet **Gestion des demandes** → **API Keys** → copier la clé **PROD** (`tr_prod_…`).

3. Sur Vercel → Settings → Environment Variables (Production), définir au minimum les variables ci-dessous.  
   `TRIGGER_SECRET_KEY` doit être la clé **PROD**, pas la clé DEV.

Optionnel : activer l’intégration officielle Trigger.dev ↔ Vercel dans le dashboard Trigger (déploiements auto + sync de clés).

Variables **serveur uniquement** (voir `.env.example`) :

| Variable | Rôle |
|----------|------|
| `DATABASE_URL` | Neon PostgreSQL (requis) |
| `GD_DEMO_ISOLATED` | `true` (garde-fous démo) |
| `GEMINI_API_KEY` / `OPENROUTER_API_KEY` | IA (au moins un provider) |
| `APP_URL` | URL publique de la démo (ex. `https://…/gestion-demandes`) |
| `TRIGGER_SECRET_KEY` | Local : `tr_dev_…` · Vercel : `tr_prod_…` |
| `RESEND_AUTOMATION_API_KEY` | Emails workflow (distinct de Contact) |
| `AUTOMATION_FROM_EMAIL` | Expéditeur Resend automation |
| `RESEND_API_KEY` | Contact portfolio uniquement |

Sans `DATABASE_URL`, l’UI s’affiche mais les API données renvoient une erreur.
Sans clé Trigger **prod** + tâches déployées, l’analyse IA fonctionne mais l’automatisation Cloud ne tourne pas.

## Formulaire de contact (Resend)

Le destinataire des messages est fixé côté serveur à `Alexis.romney@hotmail.fr`.
L’e-mail du visiteur est utilisé uniquement en `Reply-To` et dans le corps du message.

Variables **serveur uniquement** (jamais `NEXT_PUBLIC_`) — voir `.env.example` :

| Variable | Rôle |
|----------|------|
| `RESEND_API_KEY` | Clé API Resend |
| `CONTACT_FROM_EMAIL` | Expéditeur (domaine vérifié Resend, ou `onboarding@resend.dev` en test) |
| `CONTACT_FROM_NAME` | Nom d’affichage de l’expéditeur |

Sur Vercel : Settings → Environment Variables (Production / Preview).

## Séparation public / privé

Seul ce repository (`AlexisRomney/Portfolio`) est public.

Ne pas y copier :

- le code source des autres projets
- fichiers `.env` / secrets
- configurations privées

Les projets présentés restent dans leurs repositories respectifs (privés).

## Déploiement

```bash
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
```
