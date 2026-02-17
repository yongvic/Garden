import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-white/10 py-12 px-4 backdrop-blur-sm bg-black/10">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-100">
                        <h4 className="text-white font-semibold mb-4 text-lg">Produit</h4>
                        <ul className="space-y-2 text-blue-100/70 text-sm">
                            <li><Link href="/search" className="hover:text-cyan-400 transition-colors duration-200">Explorer</Link></li>
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors duration-200">Comment ça marche</Link></li>
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors duration-200">Tarifs</Link></li>
                        </ul>
                    </div>
                    <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-200">
                        <h4 className="text-white font-semibold mb-4 text-lg">Entreprise</h4>
                        <ul className="space-y-2 text-blue-100/70 text-sm">
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors duration-200">À propos</Link></li>
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors duration-200">Blog</Link></li>
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors duration-200">Contact</Link></li>
                        </ul>
                    </div>
                    <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-300">
                        <h4 className="text-white font-semibold mb-4 text-lg">Support</h4>
                        <ul className="space-y-2 text-blue-100/70 text-sm">
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors duration-200">Centre d'aide</Link></li>
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors duration-200">Sécurité</Link></li>
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors duration-200">Communauté</Link></li>
                        </ul>
                    </div>
                    <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-400">
                        <h4 className="text-white font-semibold mb-4 text-lg">Légal</h4>
                        <ul className="space-y-2 text-blue-100/70 text-sm">
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors duration-200">Confidentialité</Link></li>
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors duration-200">Conditions d'utilisation</Link></li>
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors duration-200">Cookies</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10 pt-8 text-center text-blue-100/50 text-sm animate-in fade-in duration-700">
                    <p>&copy; 2026 SpaceShare. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    )
}
