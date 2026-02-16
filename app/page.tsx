import { Button } from '@/components/ui/button'
import Navbar from '@/components/navbar'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Find Your Perfect Space
                </h1>
                <p className="text-xl text-blue-100/70">
                  Discover, book, and experience rooms, equipment, and spaces available in your area. From short-term rentals to shared resources.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/search">
                    <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                      Start Searching
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-white/10 border border-white/20 text-white hover:bg-white/20">
                      Become a Host
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Featured spaces showcase */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 h-48 flex items-end">
                      <div>
                        <p className="text-white/70 text-sm">Modern Apartment</p>
                        <p className="text-white text-lg font-semibold">$120/night</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative group mt-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 h-48 flex items-end">
                      <div>
                        <p className="text-white/70 text-sm">Coworking Space</p>
                        <p className="text-white text-lg font-semibold">$25/day</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 h-48 flex items-end">
                      <div>
                        <p className="text-white/70 text-sm">Camera Equipment</p>
                        <p className="text-white text-lg font-semibold">$30/day</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative group mt-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 h-48 flex items-end">
                      <div>
                        <p className="text-white/70 text-sm">Storage Unit</p>
                        <p className="text-white text-lg font-semibold">$50/month</p>
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
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Why Choose SpaceShare?</h2>
              <p className="text-xl text-blue-100/70">Everything you need for seamless space sharing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Secure Bookings',
                  description: 'Verified hosts and secure payment processing with buyer protection',
                  icon: '🔒',
                },
                {
                  title: 'Flexible Scheduling',
                  description: 'Book hourly, daily, weekly, or monthly rentals on your terms',
                  icon: '📅',
                },
                {
                  title: 'Instant Confirmation',
                  description: 'Real-time availability updates and instant booking confirmations',
                  icon: '⚡',
                },
                {
                  title: 'Damage Protection',
                  description: 'Insurance coverage and damage claims management included',
                  icon: '🛡️',
                },
                {
                  title: '24/7 Support',
                  description: 'Round-the-clock customer support for peace of mind',
                  icon: '💬',
                },
                {
                  title: 'Community Reviews',
                  description: 'Read honest reviews from real users to make informed decisions',
                  icon: '⭐',
                },
              ].map((feature, index) => (
                <div key={index} className="group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl blur-xl group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all"></div>
                  <div className="relative backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8 h-full hover:border-white/20 transition-all">
                    <div className="text-4xl mb-4">{feature.icon}</div>
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
            <div className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-white/20 rounded-2xl p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-blue-100/70 mb-8">
                Join thousands of users already sharing spaces and earning income on SpaceShare
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register?role=CUSTOMER">
                  <Button className="px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    Browse Spaces
                  </Button>
                </Link>
                <Link href="/auth/register?role=LANDLORD">
                  <Button className="px-8 py-6 text-lg bg-white/10 border border-white/20 text-white hover:bg-white/20">
                    List Your Space
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-blue-100/70 text-sm">
                  <li><Link href="/search" className="hover:text-white transition">Browse</Link></li>
                  <li><Link href="/" className="hover:text-white transition">How it Works</Link></li>
                  <li><Link href="/" className="hover:text-white transition">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-blue-100/70 text-sm">
                  <li><Link href="/" className="hover:text-white transition">About</Link></li>
                  <li><Link href="/" className="hover:text-white transition">Blog</Link></li>
                  <li><Link href="/" className="hover:text-white transition">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-blue-100/70 text-sm">
                  <li><Link href="/" className="hover:text-white transition">Help Center</Link></li>
                  <li><Link href="/" className="hover:text-white transition">Safety</Link></li>
                  <li><Link href="/" className="hover:text-white transition">Community</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-blue-100/70 text-sm">
                  <li><Link href="/" className="hover:text-white transition">Privacy</Link></li>
                  <li><Link href="/" className="hover:text-white transition">Terms</Link></li>
                  <li><Link href="/" className="hover:text-white transition">Cookies</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-blue-100/50 text-sm">
              <p>&copy; 2024 SpaceShare. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
