import { Button } from '@/components/ui/button'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Link from 'next/link'
import { Shield, Calendar, Zap, Umbrella, MessageCircle, Star } from 'lucide-react'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Trouvez Votre Espace Idéal
                </h1>
                <p className="text-xl text-blue-100/70">
                  Découvrez, réservez et profitez de chambres, d'équipements et d'espaces disponibles près de chez vous. De la location courte durée aux ressources partagées.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/search">
                    <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all duration-300">
                      Commencer la Recherche
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                      Devenir Hôte
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Featured spaces showcase */}
              <div className="relative animate-in fade-in slide-in-from-right duration-1000">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 h-48 flex items-end">
                      <div>
                        <p className="text-white/70 text-sm">Appartement Moderne</p>
                        <p className="text-white text-lg font-semibold">120€/nuit</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative group mt-8 hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 h-48 flex items-end">
                      <div>
                        <p className="text-white/70 text-sm">Espace Coworking</p>
                        <p className="text-white text-lg font-semibold">25€/jour</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative group hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 h-48 flex items-end">
                      <div>
                        <p className="text-white/70 text-sm">Équipement Caméra</p>
                        <p className="text-white text-lg font-semibold">30€/jour</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative group mt-8 hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 h-48 flex items-end">
                      <div>
                        <p className="text-white/70 text-sm">Box de Stockage</p>
                        <p className="text-white text-lg font-semibold">50€/mois</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-in fade-in zoom-in duration-700 view-timeline-name:--reveal">
              <h2 className="text-4xl font-bold text-white mb-4">Pourquoi Choisir SpaceShare ?</h2>
              <p className="text-xl text-blue-100/70">Tout ce dont vous avez besoin pour un partage d'espace fluide</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Réservations Sécurisées',
                  description: 'Hôtes vérifiés et traitement des paiements sécurisé avec protection des acheteurs',
                  icon: <Shield className="w-10 h-10 text-cyan-400" />,
                },
                {
                  title: 'Planning Flexible',
                  description: 'Réservez à l\'heure, à la journée, à la semaine ou au mois selon vos besoins',
                  icon: <Calendar className="w-10 h-10 text-blue-400" />,
                },
                {
                  title: 'Confirmation Instantanée',
                  description: 'Mises à jour des disponibilités en temps réel et confirmations immédiates',
                  icon: <Zap className="w-10 h-10 text-yellow-400" />,
                },
                {
                  title: 'Protection Dommages',
                  description: 'Couverture d\'assurance et gestion des réclamations incluses',
                  icon: <Umbrella className="w-10 h-10 text-purple-400" />,
                },
                {
                  title: 'Support 24/7',
                  description: 'Service client disponible 24h/24 pour votre tranquillité d\'esprit',
                  icon: <MessageCircle className="w-10 h-10 text-green-400" />,
                },
                {
                  title: 'Avis Communautaires',
                  description: 'Lisez des avis honnêtes d\'utilisateurs réels pour prendre les bonnes décisions',
                  icon: <Star className="w-10 h-10 text-orange-400" />,
                },
              ].map((feature, index) => (
                <div key={index} className="group animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl blur-xl group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all"></div>
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-8 h-full hover:border-white/20 transition-all hover:-translate-y-1">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-blue-100/70">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-white/20 rounded-2xl p-12 text-center shadow-2xl animate-in fade-in zoom-in duration-700">
              <h2 className="text-4xl font-bold text-white mb-6">Prêt à Commencer ?</h2>
              <p className="text-xl text-blue-100/70 mb-8">
                Rejoignez des milliers d'utilisateurs qui partagent déjà des espaces et génèrent des revenus sur SpaceShare
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register?role=CUSTOMER">
                  <Button className="px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all duration-300">
                    Explorer les Espaces
                  </Button>
                </Link>
                <Link href="/auth/register?role=LANDLORD">
                  <Button className="px-8 py-6 text-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                    Lister Votre Espace
                  </Button>
                </Link>
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
