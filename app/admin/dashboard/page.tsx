import { requireAdmin } from "@/lib/auth-utils"
import { AdminStats } from "@/types"
import {
  Users, Home, Calendar, TrendingUp, ArrowUpRight,
  ArrowDownRight, CheckCircle, Clock, XCircle, Activity
} from "lucide-react"
import { formatCurrency, formatDateShort, formatListingType } from "@/lib/format"
import Link from "next/link"

async function getAdminStats(): Promise<AdminStats & { recentBookings: any[] }> {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/admin/stats`,
    { cache: "no-store" }
  )
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

export default async function AdminDashboardPage() {
  await requireAdmin()
  const stats = await getAdminStats()

  const revenueGrowth =
    stats.revenue.lastMonth > 0
      ? Math.round(
          ((stats.revenue.thisMonth - stats.revenue.lastMonth) /
            stats.revenue.lastMonth) *
            100
        )
      : 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Tableau de bord Admin</h1>
            <p className="text-slate-400 mt-1">Vue d'ensemble de la plateforme Garden</p>
          </div>
          <Link
            href="/admin/listings"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-sm hover:bg-emerald-500/30 transition-all"
          >
            <Home className="w-4 h-4" />
            Gérer les annonces
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Users */}
          <div className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-violet-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-xl bg-violet-500/20">
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                {stats.users.landlords} hôtes
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.users.total}</p>
            <p className="text-slate-400 text-sm">Utilisateurs</p>
            <p className="text-slate-500 text-xs mt-2">{stats.users.customers} clients · {stats.users.admins} admins</p>
          </div>

          {/* Listings */}
          <div className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-xl bg-blue-500/20">
                <Home className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                {stats.listings.active} actives
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.listings.total}</p>
            <p className="text-slate-400 text-sm">Annonces</p>
            <p className="text-slate-500 text-xs mt-2">
              {stats.listings.rooms}🛏 · {stats.listings.equipment}🔧 · {stats.listings.spaces}📐
            </p>
          </div>

          {/* Bookings */}
          <div className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                {stats.bookings.pending} en attente
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.bookings.total}</p>
            <p className="text-slate-400 text-sm">Réservations</p>
            <p className="text-slate-500 text-xs mt-2">
              {stats.bookings.completed} terminées · {stats.bookings.cancelled} annulées
            </p>
          </div>

          {/* Revenue */}
          <div className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${revenueGrowth >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                {revenueGrowth >= 0
                  ? <ArrowUpRight className="w-3 h-3" />
                  : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(revenueGrowth)}%
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {formatCurrency(stats.revenue.total)}
            </p>
            <p className="text-slate-400 text-sm">Revenus totaux</p>
            <p className="text-slate-500 text-xs mt-2">Ce mois : {formatCurrency(stats.revenue.thisMonth)}</p>
          </div>
        </div>

        {/* Booking Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Status pills */}
          <div className="lg:col-span-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" /> Statuts des réservations
            </h2>
            <div className="space-y-3">
              {[
                { label: "En attente", count: stats.bookings.pending, color: "bg-amber-500", text: "text-amber-300" },
                { label: "Confirmées", count: stats.bookings.confirmed, color: "bg-emerald-500", text: "text-emerald-300" },
                { label: "En cours", count: stats.bookings.inProgress, color: "bg-blue-500", text: "text-blue-300" },
                { label: "Terminées", count: stats.bookings.completed, color: "bg-cyan-500", text: "text-cyan-300" },
                { label: "Annulées", count: stats.bookings.cancelled, color: "bg-red-500", text: "text-red-300" },
              ].map((item) => {
                const pct = stats.bookings.total > 0
                  ? Math.round((item.count / stats.bookings.total) * 100)
                  : 0
                return (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${item.text}`}>{item.label}</span>
                      <span className="text-white text-sm font-medium">{item.count} <span className="text-slate-500 text-xs">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent bookings */}
          <div className="lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Dernières réservations
              </h2>
            </div>
            <div className="space-y-3">
              {stats.recentBookings.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Aucune réservation</p>
              ) : (
                stats.recentBookings.slice(0, 6).map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{booking.listing?.title}</p>
                      <p className="text-slate-500 text-xs">{booking.customer?.name ?? "—"}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-white text-sm font-mono">{formatCurrency(booking.totalPrice)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        booking.status === "PENDING" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                        booking.status === "CONFIRMED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" :
                        booking.status === "COMPLETED" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" :
                        "bg-red-500/20 text-red-300 border-red-500/40"
                      }`}>
                        {booking.status === "PENDING" ? "Attente" :
                         booking.status === "CONFIRMED" ? "Confirmée" :
                         booking.status === "COMPLETED" ? "Terminée" :
                         booking.status === "CANCELLED" ? "Annulée" : booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Gestion des annonces", href: "/admin/listings", icon: "🏠", desc: "Créer, modifier, supprimer des annonces" },
            { label: "Voir les réservations", href: "/bookings", icon: "📅", desc: "Toutes les réservations de la plateforme" },
            { label: "Mon profil", href: "/profile", icon: "👤", desc: "Paramètres administrateur" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:-translate-y-1 transition-all"
            >
              <span className="text-3xl mb-3 block">{action.icon}</span>
              <p className="text-white font-medium mb-1">{action.label}</p>
              <p className="text-slate-500 text-sm">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
