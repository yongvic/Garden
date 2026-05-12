# 🌿 Garden - Plateforme B2B de Location Professionnelle

Garden est une place de marché B2B moderne et performante, conçue spécifiquement pour le marché togolais. Elle permet de mettre en relation des propriétaires (Landlords) de biens professionnels (Espaces de coworking, salles de conférence, chambres, équipements événementiels) avec des clients professionnels (Customers).

---

## 🚀 Vision du Projet
Transformer la gestion locative professionnelle au Togo en offrant une interface premium, fluide et sécurisée. Garden simplifie le cycle complet, de la découverte du bien à la réservation finale, en passant par la gestion des sinistres et des paiements.

---

## ✨ Fonctionnalités Clés

### 👤 Gestion des Utilisateurs & Rôles
- **Système Multi-Rôles** : Clients (CUSTOMER), Propriétaires (LANDLORD) et Administrateurs (ADMIN).
- **Authentification Sécurisée** : Intégration via **Auth.js (v5)** avec support pour comptes classiques et bientôt réseaux sociaux.
- **Profils Personnalisés** : Gestion des avatars et informations de contact (focus sur le numéro WhatsApp).

### 🏠 Gestion des Annonces (Listings)
- **Types de Biens** : Espaces (bureaux/coworking), Chambres et Équipements professionnels.
- **Création Intuitive** : Formulaire avancé avec sélection d'équipements par badges et gestion de métadonnées.
- **Média Center** : Système d'upload **Drag & Drop** moderne utilisant **Vercel Blob** pour un stockage ultra-rapide et fiable.
- **Localisation** : Intégration précise de la localisation géographique.

### 📅 Cycle de Réservation Complet
- **Flux d'approbation** : Système `PENDING` -> `CONFIRMED` -> `IN_PROGRESS` -> `COMPLETED`.
- **Gestion Landlord** : Les propriétaires peuvent accepter ou refuser les demandes en un clic depuis leur tableau de bord.
- **Notifications** : Alertes automatiques pour chaque étape cruciale de la réservation.

### 🛠️ Outils Professionnels
- **Tableau de Bord Propriétaire** : Vue d'ensemble sur les revenus, les annonces actives et le suivi des réservations reçues.
- **Gestion des Sinistres (Damage Claims)** : Interface dédiée pour rapporter et traiter les incidents pendant une location.
- **Système de Favoris & Avis** : Permet aux clients de sauvegarder leurs espaces préférés et de noter leurs expériences.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 16 (App Router)](https://nextjs.org/)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Base de Données** : [PostgreSQL](https://www.postgresql.org/) avec [Prisma ORM](https://www.prisma.io/)
- **Authentification** : [Auth.js v5 Beta](https://authjs.dev/)
- **Styling** : [Tailwind CSS 4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Gestion d'Images** : [Vercel Blob](https://vercel.com/storage/blob)
- **Validation** : [Zod](https://zod.dev/)
- **Icônes** : [Lucide React](https://lucide.dev/)

---

## 📁 Architecture du Projet

```text
├── app/                  # Routes Next.js (Landlord, Admin, Customer)
│   ├── api/              # Endpoints API (Listings, Bookings, Upload...)
│   ├── landlord/         # Dashboard et outils propriétaires
│   ├── admin/            # Interface d'administration globale
│   └── listings/         # Détails et recherche d'annonces
├── components/           # Composants UI réutilisables (shadcn/ui)
├── lib/                  # Utilitaires, instances Prisma et formatters
├── prisma/               # Schéma de base de données et migrations
└── styles/               # Configuration CSS globale et thèmes
```

---

## ⚙️ Installation & Configuration

### 1. Clonage et Dépendances
```bash
git clone https://github.com/yongvic/Garden.git
cd Garden
npm install
```

### 2. Variables d'Environnement
Créez un fichier `.env` à la racine :
```env
# Database
DATABASE_URL="votre_url_postgresql"

# Auth.js
AUTH_SECRET="votre_secret"
NEXTAUTH_URL="http://localhost:3000"

# Vercel Blob (Upload images)
BLOB_READ_WRITE_TOKEN="votre_token_vercel_blob"

# Stripe (Paiements)
STRIPE_API_KEY="votre_cle_stripe"
STRIPE_WEBHOOK_SECRET="votre_secret_webhook"
```

### 3. Base de Données
```bash
npx prisma generate
npx prisma db push
```

### 4. Lancement
```bash
npm run dev
```

---

## 🌍 Engagement Qualité (UI/UX)
L'interface de Garden suit les standards **SaaS Premium** :
- Dark mode natif et élégant.
- Micro-animations fluides.
- Responsive design total (Mobile-First).
- Messages d'erreurs et interactions localisés en français.

---

## 📄 Licence
Propriété de **Garden Togo**. Tous droits réservés.
