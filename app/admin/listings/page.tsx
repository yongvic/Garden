'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

interface Listing {
    id: string
    title: string
    type: string
    location: string
    pricePerDay: number
    isActive: boolean
    landlord: {
        name: string
    }
}

export default function AdminListingsPage() {
    const router = useRouter()
    const [listings, setListings] = useState<Listing[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchListings = async () => {
            try {
                // Fetch all listings (pagination could be added later if needed for admin view)
                const res = await fetch('/api/listings?limit=100')
                const data = await res.json()
                setListings(data.listings)
            } catch (err) {
                console.error('Failed to fetch listings:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchListings()
    }, [])

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 sm:pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Gestion des Annonces</h1>
                            <p className="text-blue-100/70">Gérez les espaces et équipements de la plateforme</p>
                        </div>
                        <Link href="/admin/listings/create">
                            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white gap-2">
                                <Plus className="w-4 h-4" />
                                Ajouter une Annonce
                            </Button>
                        </Link>
                    </div>

                    <Card className="backdrop-blur-md bg-white/10 border border-white/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Titre</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Localisation</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Prix/Jour</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Créateur</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-white/70">
                                                Chargement des annonces...
                                            </td>
                                        </tr>
                                    ) : listings.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-white/70">
                                                Aucune annonce trouvée.
                                            </td>
                                        </tr>
                                    ) : (
                                        listings.map((listing) => (
                                            <tr key={listing.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-white font-medium">{listing.title}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs px-2 py-1 rounded border ${listing.type === 'ROOM' ? 'border-blue-500/50 text-blue-300 bg-blue-500/10' :
                                                        listing.type === 'EQUIPMENT' ? 'border-purple-500/50 text-purple-300 bg-purple-500/10' :
                                                            'border-green-500/50 text-green-300 bg-green-500/10'
                                                        }`}>
                                                        {listing.type === 'ROOM' ? 'Chambre' : listing.type === 'EQUIPMENT' ? 'Équipement' : 'Espace'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-white/70">{listing.location}</td>
                                                <td className="px-6 py-4 text-white font-mono">{listing.pricePerDay} FCFA</td>
                                                <td className="px-6 py-4 text-white/70 text-sm">{listing.landlord.name}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/listings/${listing.id}`} target="_blank">
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        {/* Future actions: Edit, Delete */}
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10" disabled>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </main>
        </>
    )
}
