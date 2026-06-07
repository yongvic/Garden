import type { Locale } from '@/lib/i18n/translations'

type ContentSection = {
  title: string
  paragraphs: string[]
}

type PageContent = {
  title: string
  subtitle: string
  sections: ContentSection[]
}

export const marketingPages: Record<
  'about' | 'contact' | 'privacy' | 'terms' | 'help',
  Record<Locale, PageContent>
> = {
  about: {
    fr: {
      title: 'À propos de Garden',
      subtitle:
        "La plateforme de référence pour la location d'espaces professionnels en Afrique de l'Ouest.",
      sections: [
        {
          title: 'Notre mission',
          paragraphs: [
            "Garden connecte les professionnels qui ont besoin d'espaces — salles de réunion, studios, bureaux temporaires — avec des hôtes qui proposent des lieux de qualité, vérifiés et prêts à accueillir des missions.",
            "Nous croyons que trouver le bon espace ne devrait pas prendre des semaines de négociations. Notre objectif : réduire le délai entre le besoin et l'accès à quelques minutes.",
          ],
        },
        {
          title: 'Ce qui nous distingue',
          paragraphs: [
            "Chaque annonce est revue avant publication. Les paiements sont séquestrés jusqu'à la fin de la mission. Notre équipe intervient en cas de litige, avec une médiation humaine — pas un bot.",
            'Garden sert des agences, startups, directions événementielles et équipes terrain à Lomé, Accra, Abidjan, Dakar et au-delà.',
          ],
        },
      ],
    },
    en: {
      title: 'About Garden',
      subtitle: 'The reference platform for professional space rentals in West Africa.',
      sections: [
        {
          title: 'Our mission',
          paragraphs: [
            'Garden connects professionals who need spaces — meeting rooms, studios, temporary offices — with hosts offering quality, verified venues ready for business use.',
            'We believe finding the right space should not take weeks of negotiation. Our goal: reduce the time between need and access to just minutes.',
          ],
        },
        {
          title: 'What sets us apart',
          paragraphs: [
            'Every listing is reviewed before publication. Payments are held until mission completion. Our team handles disputes with human mediation — not a bot.',
            'Garden serves agencies, startups, event teams, and field crews in Lomé, Accra, Abidjan, Dakar, and beyond.',
          ],
        },
      ],
    },
  },
  contact: {
    fr: {
      title: 'Contact',
      subtitle:
        'Une question, un partenariat ou un signalement ? Notre équipe vous répond sous 24 h ouvrées.',
      sections: [
        {
          title: 'Support client & hôtes',
          paragraphs: [
            'Email : support@garden.africa',
            'WhatsApp : +228 90 00 00 00 (lun–ven, 8 h–18 h GMT)',
          ],
        },
        {
          title: 'Presse & partenariats',
          paragraphs: [
            'Email : hello@garden.africa',
            'Pour les demandes médias, intégrations B2B ou programmes hôtes entreprise.',
          ],
        },
      ],
    },
    en: {
      title: 'Contact',
      subtitle: 'Questions, partnerships, or reports? We reply within one business day.',
      sections: [
        {
          title: 'Guest & host support',
          paragraphs: [
            'Email: support@garden.africa',
            'WhatsApp: +228 90 00 00 00 (Mon–Fri, 8am–6pm GMT)',
          ],
        },
        {
          title: 'Press & partnerships',
          paragraphs: [
            'Email: hello@garden.africa',
            'For media requests, B2B integrations, or enterprise host programs.',
          ],
        },
      ],
    },
  },
  privacy: {
    fr: {
      title: 'Politique de confidentialité',
      subtitle: 'Dernière mise à jour : juin 2026',
      sections: [
        {
          title: 'Données collectées',
          paragraphs: [
            "Nous collectons les informations que vous fournissez lors de l'inscription (nom, email, rôle), les données de réservation et de paiement, ainsi que les métadonnées techniques nécessaires au fonctionnement du service.",
          ],
        },
        {
          title: 'Utilisation & partage',
          paragraphs: [
            'Vos données servent à traiter les réservations, sécuriser les paiements et améliorer la plateforme. Nous ne vendons pas vos informations. Les hôtes reçoivent uniquement les données nécessaires à une réservation confirmée.',
          ],
        },
        {
          title: 'Vos droits',
          paragraphs: [
            "Vous pouvez demander l'accès, la rectification ou la suppression de vos données en contactant support@garden.africa. Nous répondons sous 30 jours.",
          ],
        },
      ],
    },
    en: {
      title: 'Privacy policy',
      subtitle: 'Last updated: June 2026',
      sections: [
        {
          title: 'Data we collect',
          paragraphs: [
            'We collect information you provide at registration (name, email, role), booking and payment data, and technical metadata required to operate the service.',
          ],
        },
        {
          title: 'Use & sharing',
          paragraphs: [
            'Your data is used to process bookings, secure payments, and improve the platform. We do not sell your information. Hosts receive only the data needed for a confirmed booking.',
          ],
        },
        {
          title: 'Your rights',
          paragraphs: [
            'You may request access, correction, or deletion of your data by contacting support@garden.africa. We respond within 30 days.',
          ],
        },
      ],
    },
  },
  terms: {
    fr: {
      title: "Conditions d'utilisation",
      subtitle: 'En utilisant Garden, vous acceptez les conditions ci-dessous.',
      sections: [
        {
          title: 'Comptes & rôles',
          paragraphs: [
            "Les clients réservent des espaces ; les hôtes publient et gèrent des annonces. Chaque utilisateur est responsable de l'exactitude des informations fournies.",
          ],
        },
        {
          title: 'Réservations & paiements',
          paragraphs: [
            "Une réservation confirmée engage les deux parties selon la politique d'annulation de l'annonce. Garden prélève 3 % de frais de service côté client et 8 % de commission côté hôte sur les montants confirmés.",
          ],
        },
        {
          title: 'Contenu & litiges',
          paragraphs: [
            'Les annonces doivent respecter la loi et ne pas induire en erreur. Garden se réserve le droit de suspendre un compte en cas de fraude ou de violation répétée. Les litiges sont traités via notre processus de médiation.',
          ],
        },
      ],
    },
    en: {
      title: 'Terms of service',
      subtitle: 'By using Garden, you agree to the terms below.',
      sections: [
        {
          title: 'Accounts & roles',
          paragraphs: [
            'Guests book spaces; hosts publish and manage listings. Each user is responsible for the accuracy of information provided.',
          ],
        },
        {
          title: 'Bookings & payments',
          paragraphs: [
            'A confirmed booking binds both parties per the listing cancellation policy. Garden charges a 3% guest service fee and an 8% host commission on confirmed amounts.',
          ],
        },
        {
          title: 'Content & disputes',
          paragraphs: [
            'Listings must comply with the law and not be misleading. Garden may suspend accounts for fraud or repeated violations. Disputes are handled through our mediation process.',
          ],
        },
      ],
    },
  },
  help: {
    fr: {
      title: "Centre d'aide",
      subtitle: 'Réponses aux questions les plus fréquentes.',
      sections: [
        {
          title: 'Comment réserver un espace ?',
          paragraphs: [
            "Parcourez les annonces, sélectionnez vos dates et soumettez une demande de réservation. Une fois confirmée par l'hôte, vous pouvez procéder au paiement sécurisé.",
          ],
        },
        {
          title: 'Comment devenir hôte ?',
          paragraphs: [
            'Créez un compte hôte, publiez votre première annonce avec photos et description, puis attendez la validation de notre équipe. La publication est gratuite.',
          ],
        },
        {
          title: 'Annulation & remboursement',
          paragraphs: [
            'Les conditions dépendent de la politique indiquée sur chaque annonce. En cas de litige, contactez support@garden.africa avec votre numéro de réservation.',
          ],
        },
      ],
    },
    en: {
      title: 'Help center',
      subtitle: 'Answers to the most common questions.',
      sections: [
        {
          title: 'How do I book a space?',
          paragraphs: [
            'Browse listings, select your dates, and submit a booking request. Once confirmed by the host, proceed with secure payment.',
          ],
        },
        {
          title: 'How do I become a host?',
          paragraphs: [
            'Create a host account, publish your first listing with photos and description, then wait for our team review. Listing is free.',
          ],
        },
        {
          title: 'Cancellation & refunds',
          paragraphs: [
            'Terms depend on the policy shown on each listing. For disputes, contact support@garden.africa with your booking number.',
          ],
        },
      ],
    },
  },
}

export const adminTableLabels: Record<
  Locale,
  {
    title: string
    type: string
    pricePerDay: string
    status: string
    actions: string
    previous: string
    next: string
    page: string
    of: string
    noResults: string
    active: string
    view: string
  }
> = {
  fr: {
    title: 'Titre',
    type: 'Type',
    pricePerDay: 'Prix/jour',
    status: 'Statut',
    actions: 'Actions',
    previous: 'Précédent',
    next: 'Suivant',
    page: 'Page',
    of: 'sur',
    noResults: 'Aucune annonce trouvée.',
    active: 'Active',
    view: 'Voir',
  },
  en: {
    title: 'Title',
    type: 'Type',
    pricePerDay: 'Price/day',
    status: 'Status',
    actions: 'Actions',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    noResults: 'No listings found.',
    active: 'Active',
    view: 'View',
  },
}
