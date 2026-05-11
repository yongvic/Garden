import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-black text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
          404
        </div>
        <h1 className="text-2xl font-bold text-white">Page introuvable</h1>
        <p className="text-slate-400">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all hover:scale-105"
          >
            Accueil
          </Link>
          <Link
            href="/search"
            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
          >
            Explorer
          </Link>
        </div>
      </div>
    </div>
  )
}
