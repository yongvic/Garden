export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Chargement...</p>
      </div>
    </div>
  )
}
