'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Plus, X } from 'lucide-react'
import Link from 'next/link'

export default function AdminCreateListingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'SPACE', // Default to SPACE as per requirement
        location: '',
        pricePerDay: '',
        images: [''], // Start with one empty image field
        amenities: [''], // Start with one empty amenity field
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleArrayChange = (index: number, value: string, field: 'images' | 'amenities') => {
        const newArray = [...formData[field]]
        newArray[index] = value
        setFormData(prev => ({ ...prev, [field]: newArray }))
    }

    const addArrayItem = (field: 'images' | 'amenities') => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }))
    }

    const removeArrayItem = (index: number, field: 'images' | 'amenities') => {
        const newArray = formData[field].filter((_, i) => i !== index)
        setFormData(prev => ({ ...prev, [field]: newArray }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            // Filter out empty strings from arrays
            const cleanedImages = formData.images.filter(img => img.trim() !== '')
            const cleanedAmenities = formData.amenities.filter(am => am.trim() !== '')

            const payload = {
                ...formData,
                pricePerDay: parseFloat(formData.pricePerDay),
                images: cleanedImages,
                amenities: cleanedAmenities,
            }

            const res = await fetch('/api/listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Erreur lors de la création de l\'annonce')
            }

            router.push('/admin/listings')
            router.refresh()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
                <div className="max-w-4xl mx-auto px-4 py-12">

                    <div className="mb-8">
                        <Link href="/admin/listings" className="text-blue-300 hover:text-white flex items-center gap-2 mb-4 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Retour à la liste
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Ajouter une Nouvelle Annonce</h1>
                        <p className="text-blue-100/70">Créez un nouvel espace ou matériel</p>
                    </div>

                    <Card className="backdrop-blur-md bg-white/10 border border-white/20 p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 rounded p-4 text-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-white/70 text-sm mb-2">Titre de l'annonce</label>
                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Ex: Belle salle de jardin"
                                        className="bg-white/10 border-white/20 text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="SPACE" className="bg-slate-800">Espace</option>
                                        <option value="EQUIPMENT" className="bg-slate-800">Équipement (Matériel)</option>
                                        <option value="ROOM" className="bg-slate-800">Chambre</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Prix par jour (FCFA)</label>
                                    <Input
                                        type="number"
                                        name="pricePerDay"
                                        value={formData.pricePerDay}
                                        onChange={handleChange}
                                        placeholder="Ex: 15000"
                                        className="bg-white/10 border-white/20 text-white"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-white/70 text-sm mb-2">Localisation</label>
                                    <Input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Ex: Cocody, Abidjan"
                                        className="bg-white/10 border-white/20 text-white"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-white/70 text-sm mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Décrivez l'espace ou le matériel en détail..."
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-white/50"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Images Section */}
                            <div className="space-y-4">
                                <label className="block text-white/70 text-sm">Images (URLs)</label>
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            value={img}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, 'images')}
                                            placeholder="https://example.com/image.jpg"
                                            className="bg-white/10 border-white/20 text-white"
                                        />
                                        {formData.images.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => removeArrayItem(idx, 'images')}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" onClick={() => addArrayItem('images')} variant="outline" className="text-blue-300 border-blue-500/30 hover:bg-blue-500/10">
                                    <Plus className="w-4 h-4 mr-2" /> Ajouter une image
                                </Button>
                            </div>

                            {/* Amenities Section */}
                            <div className="space-y-4">
                                <label className="block text-white/70 text-sm">Équipements (Caractéristiques)</label>
                                {formData.amenities.map((amenity, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            value={amenity}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, 'amenities')}
                                            placeholder="Ex: Wifi, Climatisation, Tondeuse incluse..."
                                            className="bg-white/10 border-white/20 text-white"
                                        />
                                        {formData.amenities.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => removeArrayItem(idx, 'amenities')}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" onClick={() => addArrayItem('amenities')} variant="outline" className="text-blue-300 border-blue-500/30 hover:bg-blue-500/10">
                                    <Plus className="w-4 h-4 mr-2" /> Ajouter un équipement
                                </Button>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-2"
                                >
                                    {isLoading ? 'Création...' : 'Créer l\'Annonce'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </main>
        </>
    )
}
