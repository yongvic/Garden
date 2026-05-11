'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Check, Plus, AlertTriangle } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'

const PREDEFINED_AMENITIES = [
  'Wifi Rapide', 'Climatisation', 'TV Écran Plat', 'Cuisine Équipée', 
  'Parking Gratuit', 'Piscine', 'Espace de Travail', 'Accès PMR', 'Balcon/Terrasse', 'Machine à café'
]

export default function LandlordCreateListingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'SPACE', location: '',
    pricePerDay: '', maxOccupants: '', images: [] as string[], amenities: [] as string[],
    rules: '', cancellationPolicy: '',
  })
  const [customAmenity, setCustomAmenity] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !formData.amenities.includes(customAmenity.trim())) {
      setFormData(prev => ({ ...prev, amenities: [...prev.amenities, customAmenity.trim()] }))
      setCustomAmenity('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.images.length === 0) {
      setError("Veuillez uploader au moins une image.")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricePerDay: parseFloat(formData.pricePerDay),
          maxOccupants: formData.maxOccupants ? parseInt(formData.maxOccupants) : undefined,
        }),
      })

      if (!res.ok) {
        let errMessage = 'Erreur lors de la création';
        try {
          const json = await res.json();
          errMessage = json.error || errMessage;
        } catch {
          errMessage = `Erreur serveur (${res.status})`;
        }
        throw new Error(errMessage);
      }
      router.push('/landlord/listings')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/landlord/listings" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-6 w-fit">
            <ArrowLeft className="w-4 h-4" /> Retour à mes annonces
          </Link>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Créer une annonce</h1>
          <p className="text-slate-400 mb-8">Remplissez les informations ci-dessous pour publier votre espace ou équipement.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Main info */}
              <div className="md:col-span-2 space-y-6">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <h2 className="text-xl text-white font-semibold flex items-center gap-2 border-b border-white/10 pb-4">
                    Informations de base
                  </h2>
                  
                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Titre de l'annonce *</label>
                    <Input 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      placeholder="Ex: Superbe salle de réunion lumineuse" 
                      required 
                      className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 h-12" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Description détaillée *</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      rows={5} 
                      required 
                      placeholder="Décrivez votre espace, son atmosphère, et pourquoi les clients l'adorent..." 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none transition-colors" 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2 font-medium">Type d'annonce *</label>
                      <div className="relative">
                        <select 
                          name="type" 
                          value={formData.type} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 text-white rounded-xl appearance-none focus:outline-none focus:border-blue-500 transition-colors"
                        >
                          <option value="SPACE" className="bg-slate-900 border-none">Espace/Événement</option>
                          <option value="ROOM" className="bg-slate-900 border-none">Chambre/Logement</option>
                          <option value="EQUIPMENT" className="bg-slate-900 border-none">Équipement</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                          ▼
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2 font-medium">Localisation *</label>
                      <Input 
                        name="location" 
                        value={formData.location} 
                        onChange={handleChange} 
                        placeholder="Ex: Cocody, Abidjan" 
                        required 
                        className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 h-12" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2 font-medium">Prix par jour (FCFA) *</label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          name="pricePerDay" 
                          value={formData.pricePerDay} 
                          onChange={handleChange} 
                          placeholder="15000" 
                          required 
                          min="0"
                          className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 pl-4 pr-16 h-12" 
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center text-slate-500 font-medium pointer-events-none">
                          FCFA
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2 font-medium">Capacité max. (Personnes)</label>
                      <Input 
                        type="number" 
                        name="maxOccupants" 
                        value={formData.maxOccupants} 
                        onChange={handleChange} 
                        placeholder="Ex: 50" 
                        min="1"
                        className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 h-12" 
                      />
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <h2 className="text-xl text-white font-semibold flex items-center gap-2 border-b border-white/10 pb-4">
                    Photos de l'annonce *
                  </h2>
                  <p className="text-sm text-slate-400">Des photos de haute qualité augmentent considérablement l'attractivité de votre annonce.</p>
                  
                  <ImageUpload 
                    value={formData.images} 
                    onChange={(urls) => setFormData(p => ({ ...p, images: urls }))} 
                    maxImages={10} 
                  />
                </div>
              </div>

              {/* Right Column - Secondary info */}
              <div className="space-y-6">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
                  <h2 className="text-lg text-white font-semibold border-b border-white/10 pb-4">
                    Équipements
                  </h2>
                  
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_AMENITIES.map(amenity => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1
                          ${formData.amenities.includes(amenity) 
                            ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                            : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                          }
                        `}
                      >
                        {formData.amenities.includes(amenity) && <Check className="w-3 h-3" />}
                        {amenity}
                      </button>
                    ))}
                    {formData.amenities.filter(a => !PREDEFINED_AMENITIES.includes(a)).map(amenity => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500 text-white flex items-center gap-1 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                      >
                        <Check className="w-3 h-3" /> {amenity}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input 
                      value={customAmenity}
                      onChange={e => setCustomAmenity(e.target.value)}
                      placeholder="Autre..."
                      className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 h-10 text-sm"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity(); } }}
                    />
                    <Button type="button" onClick={addCustomAmenity} variant="outline" className="border-white/10 text-slate-300 hover:text-white px-3 shrink-0 h-10">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
                  <h2 className="text-lg text-white font-semibold border-b border-white/10 pb-4">
                    Règles & Conditions
                  </h2>
                  
                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Règles de la maison</label>
                    <textarea 
                      name="rules" 
                      value={formData.rules} 
                      onChange={handleChange} 
                      rows={3} 
                      placeholder="Ex: Pas de soirée bruyante, non fumeur..." 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none text-sm transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Politique d'annulation</label>
                    <textarea 
                      name="cancellationPolicy" 
                      value={formData.cancellationPolicy} 
                      onChange={handleChange} 
                      rows={3} 
                      placeholder="Ex: Remboursement intégral jusqu'à 48h avant..." 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none text-sm transition-colors" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Link href="/landlord/listings" className="w-full sm:w-auto flex-1">
                    <Button type="button" variant="outline" className="w-full border-white/15 text-slate-300 hover:bg-white/10 h-12">
                      Annuler
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto flex-[2] bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white h-12 font-medium shadow-lg shadow-blue-500/25">
                    {isLoading ? 'Création en cours...' : 'Publier l\'annonce'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
