import { PrismaClient, ListingType } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import 'dotenv/config';
import { resolveGeoFromLocation } from "../lib/geo";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
// @ts-ignore - Prisma 7 constructor typing workaround
const prisma = new PrismaClient({ adapter: adapter as any });

const BCRYPT_SALT_ROUNDS = 10;

async function main() {
  console.log("Starting database seeding for Togo B2B...");

  try {
    const passwordHash = await bcrypt.hash("Password123!", BCRYPT_SALT_ROUNDS);

    // Create a Landlord User
    const landlord1 = await prisma.user.upsert({
      where: { email: "kouadjo.pro@example.com" },
      update: {},
      create: {
        name: "Kouadjo",
        email: "kouadjo.pro@example.com",
        password: passwordHash,
        image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&q=80",
        role: "LANDLORD",
      },
    });

    const landlord2 = await prisma.user.upsert({
      where: { email: "afi.events@example.com" },
      update: {},
      create: {
        name: "Afi",
        email: "afi.events@example.com",
        password: passwordHash,
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1bfcc4?w=400&q=80",
        role: "LANDLORD",
      },
    });
    
    const customer1 = await prisma.user.upsert({
      where: { email: "kossi.dev@example.com" },
      update: {},
      create: {
        name: "Kossi",
        email: "kossi.dev@example.com",
        image: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&q=80",
        password: passwordHash,
        role: "CUSTOMER",
      },
    });

    const customer2 = await prisma.user.upsert({
      where: { email: "akouvi.marketing@example.com" },
      update: {},
      create: {
        name: "Akouvi",
        email: "akouvi.marketing@example.com",
        image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&q=80",
        password: passwordHash,
        role: "CUSTOMER",
      },
    });

    const customer3 = await prisma.user.upsert({
      where: { email: "komlan.agency@example.com" },
      update: {},
      create: {
        name: "Komlan",
        email: "komlan.agency@example.com",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        password: passwordHash,
        role: "CUSTOMER",
      },
    });

    console.log("Created users:", { 
      landlords: [landlord1.name, landlord2.name], 
      customers: [customer1.name, customer2.name, customer3.name] 
    });

    // Clean existing listings & reviews
    await prisma.review.deleteMany({});
    await prisma.listing.deleteMany({});
    
    // Professionnal Spaces & Equipment Data in Togo
    const listingsData = [
      // ---------------- SPACES ---------------- 
      {
        title: "Grand Amphithéâtre pour Conférences",
        description: "Un amphithéâtre moderne pouvant accueillir jusqu'à 200 personnes. Parfait pour les grandes conférences, les séminaires d'entreprise ou les lancements de produits.",
        type: ListingType.SPACE,
        location: "Lomé, Nyékonakpoè",
        pricePerDay: 500000,
        maxOccupants: 200,
        amenities: ["Vidéoprojecteur HD", "Sonorisation intégrée", "Pupitre", "Climatisation", "WiFi", "Parking VIP"],
        images: [
          "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
        ],
        rules: "Nettoyage inclus. Événements professionnels uniquement.",
        landlordId: landlord1.id,
      },
      {
        title: "Espace Coworking Tech 228",
        description: "Open space lumineux et inspirant pour travailleurs indépendants et petites équipes. Fibre optique, zone silencieuse, cabines téléphoniques, et cuisine partagée.",
        type: ListingType.SPACE,
        location: "Lomé, Tokoin",
        pricePerDay: 15000,
        maxOccupants: 1,
        amenities: ["Fibre optique", "Café illimité", "Cabine insonorisée", "Casiers fermés"],
        images: [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80"
        ],
        rules: "Respect du silence dans l'open space. Les appels se font dans les cabines.",
        landlordId: landlord2.id,
      },
      {
        title: "Salle de Réunion Exécutive Kpalimé",
        description: "Salle de réunion luxueuse conçue pour les rencontres VIP au vert. Vaste table en chêne, fauteuils en cuir et vue sur les collines.",
        type: ListingType.SPACE,
        location: "Kpalimé, Kpodzi",
        pricePerDay: 80000,
        maxOccupants: 15,
        amenities: ["Écran plat 85\"", "Machine à espresso", "Vue nature", "Service traiteur"],
        images: [
          "https://images.unsplash.com/photo-1497215888134-3d9c122ed274?w=800&q=80",
          "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?w=800&q=80"
        ],
        rules: "Disponibilité de 8h à 20h.",
        landlordId: landlord1.id,
      },
      {
        title: "Loft Événementiel Industriel",
        description: "Superbe loft climatisé, parfait pour des réceptions ou afterworks corporatifs, expositions d'art et tournages commerciaux.",
        type: ListingType.SPACE,
        location: "Lomé, Bè-Klikamé",
        pricePerDay: 200000,
        maxOccupants: 50,
        amenities: ["Éclairage modulable", "Système de son", "Petite scène", "Cuisine traiteur"],
        images: [
          "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
          "https://images.unsplash.com/photo-1527357422941-01b34ea68733?w=800&q=80"
        ],
        rules: "Pas de nuisances sonores extrêmes après 23h.",
        landlordId: landlord2.id,
      },
      {
        title: "Studio Photo & Vidéo",
        description: "Studio spacieux avec cyclorama fond vert et blanc. Éclairage au plafond réglable, parfait pour shootings mode, produits ou interviews d'entreprise.",
        type: ListingType.SPACE,
        location: "Tsévié, Centre",
        pricePerDay: 100000,
        maxOccupants: 15,
        amenities: ["Cyclorama fixe", "Salle de maquillage", "Climatisation", "Vestiaires"],
        images: [
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
          "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=800&q=80"
        ],
        rules: "Chaussures propres exigées sur le cyclorama.",
        landlordId: landlord1.id,
      },
      {
        title: "Rooftop 360° pour Soirées Networking",
        description: "Terrasse aménagée avec vue plongeante sur la plage. Idéal pour les cocktails d'entreprise et soirées B2B de prestige.",
        type: ListingType.SPACE,
        location: "Lomé, Baguida",
        pricePerDay: 350000,
        maxOccupants: 100,
        amenities: ["Bar couvert", "Mobilier d'extérieur VIP", "Éclairage d'ambiance", "Sécurité privée"],
        images: [
          "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&q=80",
          "https://images.unsplash.com/photo-1533104816-cdd210667b93?w=800&q=80"
        ],
        rules: "Prestations traiteur accréditées uniquement.",
        landlordId: landlord2.id,
      },
      {
        title: "Salles de Formation Kara",
        description: "Espace idéal dans le nord du pays pour organiser des formations ou ateliers. Tables équipées de prises PC et internet ultra-rapide.",
        type: ListingType.SPACE,
        location: "Kara, Chaminade",
        pricePerDay: 60000,
        maxOccupants: 30,
        amenities: ["Tableau blanc", "Vidéoprojecteur", "Connexion THD", "Paperboard"],
        images: [
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
          "https://images.unsplash.com/photo-1580828369002-cd12fcdbdacf?w=800&q=80"
        ],
        rules: "Journées entières privilégiées.",
        landlordId: landlord1.id,
      },
      
      // ---------------- EQUIPMENTS ---------------- 
      {
        title: "Lot de 50 Chaises Empilables Design",
        description: "Chaises légères et élégantes (modèle Chiavari blanc) parfaites pour vos conférences, galas et banquets d'entreprise.",
        type: ListingType.EQUIPMENT,
        location: "Lomé, Agoè",
        pricePerDay: 25000,
        maxOccupants: null,
        amenities: ["Livrable", "Robuste", "Coussin blanc inclus"],
        images: [
          "https://images.unsplash.com/photo-1506804886640-30dbfa6bd348?w=800&q=80",
          "https://images.unsplash.com/photo-1580584126903-c17d41830450?w=800&q=80"
        ],
        rules: "Doivent être ré-empilées proprement.",
        landlordId: landlord2.id,
      },
      {
        title: "Écran Géant Interactif Diagonale 85\"",
        description: "Écran tactile 4K sur roulettes. Indispensable pour des présentations dynamiques, workshops et réunions hybrides.",
        type: ListingType.EQUIPMENT,
        location: "Lomé, Bè",
        pricePerDay: 70000,
        maxOccupants: null,
        amenities: ["Écran tactile 4K", "Support à roulettes", "Stylets digital", "Connexion sans fil"],
        images: [
          "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80"
        ],
        rules: "Transport assuré par nos soins uniquement.",
        landlordId: landlord1.id,
      },
      {
        title: "Système de Sonorisation Bose Haut de Gamme",
        description: "Système complet avec caissons de basses, idéal pour couvrir l'ambiance sonore d'une salle de conférence majeure ou d'un banquet de lancement.",
        type: ListingType.EQUIPMENT,
        location: "Sokodé, Centre",
        pricePerDay: 85000,
        maxOccupants: null,
        amenities: ["Subwoofer intégré", "Câblage Pro", "Console de mixage", "Technicien en option"],
        images: [
          "https://images.unsplash.com/photo-1520110120835-c96534a4c984?w=800&q=80",
          "https://images.unsplash.com/photo-1615555437895-36ce87b1c1d9?w=800&q=80"
        ],
        rules: "Caution demandée. Location technicien suggérée.",
        landlordId: landlord2.id,
      },
      {
        title: "Pack 4 Microphones Sans Fil Shure",
        description: "Système HF de microphones d'excellente qualité pour l'animation de panels ou sommets économiques.",
        type: ListingType.EQUIPMENT,
        location: "Lomé, Tokoin",
        pricePerDay: 35000,
        maxOccupants: null,
        amenities: ["4 Micros sans fil", "Base réceptrice", "Protection mousse", "Valise de transport sécurisée"],
        images: [
          "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80",
          "https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?w=800&q=80"
        ],
        rules: "Ne pas approcher des enceintes (risque de larsen).",
        landlordId: landlord1.id,
      },
      {
        title: "Projecteur Laser 10 000 Lumens",
        description: "Projecteur ultra-lumineux conçu pour les grandes salles. Votre présentation reste pure et visible, même en plein jour.",
        type: ListingType.EQUIPMENT,
        location: "Kpalimé",
        pricePerDay: 120000,
        maxOccupants: null,
        amenities: ["Laser 10000 Lumens", "4K UHD Ready", "Télécommande longue distance"],
        images: [
          "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80"
        ],
        rules: "Protocole d'allumage et d'extinction à respecter impérativement.",
        landlordId: landlord2.id,
      },
      {
        title: "Kit Complet Vidéo: Caméra FX6 + Optiques Cine",
        description: "Matériel aux normes de télévision ou de production haut de gamme pour des interviews d'entreprise ou documentaires corporate.",
        type: ListingType.EQUIPMENT,
        location: "Lomé, Kegué",
        pricePerDay: 200000,
        maxOccupants: null,
        amenities: ["Sony FX6", "Optiques Cinéma", "Trépied Lourd Sachtler", "Batteries"],
        images: [
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
          "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80"
        ],
        rules: "Garantie avec pièce d'identité requise.",
        landlordId: landlord1.id,
      },
      {
        title: "Mallette de Raccordement Universelle Event",
        description: "Solution de secours essentielle. Contient des bobines de rallonges 50m, convertisseurs de signaux vidéo et blocs multiprises parafoudres sécurisés.",
        type: ListingType.EQUIPMENT,
        location: "Atakpamé, Rocade",
        pricePerDay: 20000,
        maxOccupants: null,
        amenities: ["Rallonge 50m pro", "Adapteurs Mac/PC", "Multiprises certifiées"],
        images: [
          "https://images.unsplash.com/photo-1520698188090-ffb45a0e0f80?w=800&q=80",
          "https://images.unsplash.com/photo-1585800041285-d72545d17961?w=800&q=80"
        ],
        rules: "Vérification des inventaires à l'aller et au retour.",
        landlordId: landlord2.id,
      },
      {
        title: "10 Mange-Debout Housses Noires",
        description: "Tables hautes essentielles pour l'accueil de vos partenaires B2B et l'organisation d'un cocktail dînatoire très pro.",
        type: ListingType.EQUIPMENT,
        location: "Lomé, Kodjoviakopé",
        pricePerDay: 40000,
        maxOccupants: null,
        amenities: ["Hauteur 110cm", "Grand confort", "Housses Lycra noir incluses"],
        images: [
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
          "https://images.unsplash.com/photo-1549488344-c1555d81b37f?w=800&q=80"
        ],
        rules: "Nettoyer avant restitution s'il y a eu un événement salissant.",
        landlordId: landlord1.id,
      }
    ];

    const createdListings = [];
    for (const listing of listingsData) {
      const geo = resolveGeoFromLocation(listing.location);
      const created = await prisma.listing.create({
        data: {
          ...listing,
          latitude: geo?.latitude,
          longitude: geo?.longitude,
          citySlug: geo?.citySlug,
          neighborhood: geo?.neighborhood,
        },
      });
      createdListings.push(created);
    }

    console.log(`Successfully created ${createdListings.length} B2B listings in Togo!`);

    // Creates generic robust Reviews for those listings
    const reviewsToCreate = [
      {
        userId: customer1.id,
        rating: 5,
        title: "Superbe organisation",
        comment: "Matériel impeccable, livré et installé à l'heure ! Grâce à cet équipement professionnel, notre séminaire s'est déroulé de façon fantastique.",
      },
      {
        userId: customer2.id,
        rating: 4,
        title: "Espace lumineux et bien situé",
        comment: "Excellent endroit pour une équipe. Le WiFi était fluide toute la journée et l'hôte très chaleureux. Petit bémol sur le stationnement.",
      },
      {
        userId: customer3.id,
        rating: 5,
        title: "Prestation haut de gamme",
        comment: "Je recommande vivement. Vrai matériel B2B soigné, et communication fluide avec le propriétaire.",
      },
      {
        userId: customer1.id,
        rating: 5,
        title: "Réception B2B réussie",
        comment: "Tout l'endroit était configuré exactement comme demandé, très professionnel du début à la fin pour notre lancement produit à Lomé.",
      }
    ];

    let rIdx = 0;
    // Disperse reviews sporadically on some items
    for (const listing of createdListings.slice(0, 4)) {
      await prisma.review.create({
        data: {
          listingId: listing.id,
          ...reviewsToCreate[rIdx]
        }
      });
      rIdx++;
    }

    console.log("Successfully created User Reviews!");

  } catch (error) {
    console.error("Database seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
