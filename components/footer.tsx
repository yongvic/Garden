import Link from 'next/link'

export default function Footer() {
    return (
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
    )
}
