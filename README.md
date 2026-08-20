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

## Formulaire de contact (Resend)

Variables **serveur uniquement** (jamais `NEXT_PUBLIC_`) — voir `.env.example` :

| Variable | Rôle |
|----------|------|
| `RESEND_API_KEY` | Clé API Resend |
| `CONTACT_TO_EMAIL` | Destinataire |
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
