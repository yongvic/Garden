import { Button } from '@/components/ui/button'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Shield, Calendar, Zap, Umbrella, MessageCircle, Star, Search, CreditCard, Key } from 'lucide-react'

async function getHomeStats() {
  const [usersCount, listingsCount, bookingsCount, featuredListings, latestReviews] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count({ where: { isActive: true } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.listing.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, type: true, pricePerDay: true, images: true }
    }),
    prisma.review.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, image: true } },
        listing: { select: { title: true } }
      }
    })
  ])
  return { usersCount, listingsCount, bookingsCount, featuredListings, latestReviews }
}

export default async function Home() {
  const stats = await getHomeStats()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse duration-[4000ms]"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse duration-[5000ms]"></div>
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
                <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium">
                  Le #1 du B2B au Togo 🇹🇬
                </span>
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Le Partenaire de vos Événements Pro
                </h1>
                <p className="text-xl text-blue-100/70">
                  Découvrez, réservez et louez des espaces événementiels, salles de conférence et équipements professionnels pour propulser vos affaires.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/search">
                    <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all duration-300">
                      Explorer les offres
                    </Button>
                  </Link>
                  <Link href="/auth/register?role=LANDLORD">
                    <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                      Devenir Hôte
                    </Button>
                  </Link>
                </div>

                {/* Dynamic Stats */}
                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 mt-8">
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.listingsCount}+</p>
                    <p className="text-slate-400 text-sm">Annonces actives</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.usersCount}+</p>
                    <p className="text-slate-400 text-sm">Utilisateurs</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.bookingsCount}+</p>
                    <p className="text-slate-400 text-sm">Séjours terminés</p>
                  </div>
                </div>
              </div>

              {/* Featured spaces showcase */}
              <div className="relative animate-in fade-in slide-in-from-right duration-1000">
                <div className="grid grid-cols-2 gap-4">
                  {stats.featuredListings.map((listing: { id: string, title: string, type: string, pricePerDay: number, images: string[] }, index: number) => {
                    const isOffset = index % 2 !== 0;
                    
                    const formatPrice = (price: number, type: string) => {
                      const amount = (price / 1).toLocaleString('fr-FR');
                      return `${amount} FCFA/${type === 'ROOM' ? 'nuit' : 'jour'}`;
                    };

                    const getTypeLabel = (type: string) => {
                      switch(type) {
                        case 'ROOM': return 'Logement';
                        case 'SPACE': return 'Espace';
                        case 'EQUIPMENT': return 'Équipement';
                        default: return type;
                      }
                    };

                    // Different color glows based on index
                    const glowColors = [
                      'bg-blue-500/20',
                      'bg-violet-500/20',
                      'bg-emerald-500/20',
                      'bg-amber-500/20'
                    ];
                    
                    return (
                      <Link href={`/search?type=${listing.type}`} key={listing.id} className={`relative group block ${isOffset ? 'mt-8' : ''} hover:-translate-y-2 transition-transform duration-300`}>
                        <div className={`absolute inset-0 ${glowColors[index % 4]} rounded-xl blur-xl group-hover:blur-2xl transition-all`}></div>
                        <div className="relative rounded-xl p-6 h-48 flex items-end shadow-2xl overflow-hidden group-hover:border-white/40 border border-white/10 transition-colors">
                          <img src={listing.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"} alt={listing.title} className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-110 transition-transform duration-700" />
                          <div className="relative z-10 w-full">
                            <p className="text-white/80 text-xs uppercase tracking-wider font-semibold truncate">{getTypeLabel(listing.type)}</p>
                            <p className="text-white text-lg font-bold truncate">{formatPrice(listing.pricePerDay, listing.type)}</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="relative py-24 px-4 bg-black/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Comment fonctionne Garden ?</h2>
              <p className="text-blue-100/70 max-w-2xl mx-auto">Un processus simple et sécurisé pour louer l'espace dont vous avez besoin.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connection line for desktop */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-cyan-500/0"></div>
              
              {[
                {
                  step: "1",
                  title: "Recherchez",
                  desc: "Parcourez nos annonces vérifiées. Filtrez par type, localisation et budget.",
                  icon: <Search className="w-8 h-8 text-blue-400" />
                },
                {
                  step: "2",
                  title: "Réservez",
                  desc: "Sélectionnez vos dates et réservez en toute sécurité directement sur la plateforme.",
                  icon: <CreditCard className="w-8 h-8 text-cyan-400" />
                },
                {
                  step: "3",
                  title: "Profitez",
                  desc: "Entrez en contact avec l'hôte, récupérez vos accès et profitez de votre espace.",
                  icon: <Key className="w-8 h-8 text-emerald-400" />
                }
              ].map((s, i) => (
                <div key={i} className="relative text-center group">
                  <div className="w-24 h-24 mx-auto bg-slate-900 border border-white/10 rounded-full flex items-center justify-center relative z-10 group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-500 shadow-xl">
                    {s.icon}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {s.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-6 mb-2">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="relative py-24 px-4 bg-black/10 border-t border-white/5">
          {/* subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16 px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ce que nos clients disent</h2>
              <p className="text-blue-100/70 max-w-2xl mx-auto">Les professionnels du Togo font confiance à notre plateforme.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.latestReviews.map((review: any, index: number) => (
                <div key={review.id} className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:-translate-y-1 hover:bg-white/10 hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 truncate">{review.title}</h3>
                  <p className="text-blue-100/70 mb-6 italic line-clamp-3 leading-relaxed">"{review.comment}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20">
                      <img src={review.user.image || "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=100&q=80"} alt={review.user.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">{review.user.name}</p>
                      <p className="text-xs text-blue-100/50 truncate mt-1">Sur: {review.listing.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 px-4 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-in fade-in zoom-in duration-700">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pourquoi Choisir Garden ?</h2>
              <p className="text-xl text-blue-100/70">Tout ce dont vous avez besoin pour un partage d'espace fluide</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Réservations Sécurisées',
                  description: 'Hôtes vérifiés et processus de réservation transparent.',
                  icon: <Shield className="w-8 h-8 text-cyan-400" />,
                },
                {
                  title: 'Planning Flexible',
                  description: 'Réservez à l\'heure, à la journée ou au mois selon vos besoins.',
                  icon: <Calendar className="w-8 h-8 text-blue-400" />,
                },
                {
                  title: 'Variété d\'Offres',
                  description: 'Des chambres confortables aux équipements spécialisés.',
                  icon: <Zap className="w-8 h-8 text-yellow-400" />,
                },
                {
                  title: 'Protection Tranquillité',
                  description: 'Support actif en cas de litige entre locataire et propriétaire.',
                  icon: <Umbrella className="w-8 h-8 text-purple-400" />,
                },
                {
                  title: 'Support Actif',
                  description: 'Une équipe à votre écoute pour vous accompagner.',
                  icon: <MessageCircle className="w-8 h-8 text-green-400" />,
                },
                {
                  title: 'Avis Communautaires',
                  description: 'Lisez les expériences d\'utilisateurs réels pour choisir sereinement.',
                  icon: <Star className="w-8 h-8 text-orange-400" />,
                },
              ].map((feature, index) => (
                <div key={index} className="group">
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 h-full hover:bg-white/10 transition-all hover:-translate-y-1">
                    <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-blue-100/70 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-600/30 to-cyan-600/20 border border-blue-500/30 rounded-3xl p-12 lg:p-16 text-center shadow-2xl relative overflow-hidden">
              {/* Glow overlay */}
              <div className="absolute inset-0 bg-blue-500/10 blur-2xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-6">Prêt à Explorer ?</h2>
                <p className="text-xl text-blue-100/80 mb-8 max-w-2xl mx-auto">
                  Rejoignez des milliers d'utilisateurs qui partagent déjà des espaces et génèrent des revenus sur Garden.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/search">
                    <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300">
                      Explorer les Espaces
                    </Button>
                  </Link>
                  <Link href="/auth/register?role=LANDLORD">
                    <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-slate-900/50 border border-white/20 text-white hover:bg-slate-800 transition-all duration-300 backdrop-blur-md">
                      Mettre en location
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </>
  )
}
