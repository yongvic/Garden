'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, X } from 'lucide-react'

export default function LandlordCreateListingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'SPACE', location: '',
    pricePerDay: '', images: [''], amenities: [''],
    rules: '', cancellationPolicy: '',
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

  const addItem = (field: 'images' | 'amenities') =>
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }))

  const removeItem = (index: number, field: 'images' | 'amenities') =>
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setError('')
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricePerDay: parseFloat(formData.pricePerDay),
          images: formData.images.filter(s => s.trim()),
          amenities: formData.amenities.filter(s => s.trim()),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur')
      router.push('/landlord/listings')
      router.refresh()
    } catch (e) { setError((e as Error).message) }
    finally { setIsLoading(false) }
  }

  return (
    <><Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/landlord/listings" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Mes annonces
          </Link>
          <h1 className="text-3xl font-bold text-white mb-8">Créer une annonce</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">{error}</div>}

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
              <h2 className="text-white font-semibold">Informations de base</h2>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Titre *</label>
                <Input name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Belle salle de jardin à Cocody" required className="bg-white/5 border-white/15 text-white placeholder-slate-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 bg-white/5 border border-white/15 text-white rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30">
                    <option value="SPACE" className="bg-slate-800">Espace</option>
                    <option value="ROOM" className="bg-slate-800">Chambre</option>
                    <option value="EQUIPMENT" className="bg-slate-800">Équipement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Prix par jour (FCFA) *</label>
                  <Input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} placeholder="15000" required className="bg-white/5 border-white/15 text-white placeholder-slate-600" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Localisation *</label>
                <Input name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Cocody, Abidjan" required className="bg-white/5 border-white/15 text-white placeholder-slate-600" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} required placeholder="Décrivez votre espace en détail..." className="w-full px-3 py-2 bg-white/5 border border-white/15 text-white rounded-xl placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none" />
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-semibold">Images de l'annonce (Upload ou URL)</h2>
              
              <div className="mb-4">
                <label className="block text-slate-400 text-sm mb-2">Ajouter des photos depuis votre PC</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    setIsLoading(true);
                    try {
                      for (const file of files) {
                        const data = new FormData();
                        data.append('file', file);
                        const res = await fetch('/api/upload', { method: 'POST', body: data });
                        const json = await res.json();
                        if (json.success) {
                          setFormData(prev => ({
                            ...prev,
                            // Replace if only one empty string, otherwise append
                            images: prev.images.length === 1 && prev.images[0] === '' 
                                      ? [json.url] 
                                      : [...prev.images, json.url]
                          }));
                        }
                      }
                    } catch (err) {
                      setError("Erreur d'upload de l'image");
                    } finally {
                      setIsLoading(false);
                      e.target.value = ''; // Reset file input
                    }
                  }}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 transition-all cursor-pointer bg-white/5 border border-white/15 rounded-xl p-2"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-slate-400 text-sm mb-2">Les liens de vos images ajoutées :</label>
                {formData.images.map((img, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={img} onChange={e => handleArrayChange(i, e.target.value, 'images')} placeholder="Lien URL auto-généré ou collez un lien..." className="bg-white/5 border-white/15 text-white placeholder-slate-600" />
                    {formData.images.length > 1 && <Button type="button" variant="ghost" onClick={() => removeItem(i, 'images')} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3"><X className="w-4 h-4" /></Button>}
                  </div>
                ))}
              </div>
              
              <Button type="button" onClick={() => addItem('images')} variant="outline" className="gap-1 border-white/15 text-slate-400 hover:text-white hover:bg-white/10 text-sm mt-3">
                <Plus className="w-4 h-4" /> Ajouter une ligne d'URL
              </Button>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-semibold">Équipements & caractéristiques</h2>
              {formData.amenities.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={a} onChange={e => handleArrayChange(i, e.target.value, 'amenities')} placeholder="Ex: Wifi, Climatisation..." className="bg-white/5 border-white/15 text-white placeholder-slate-600" />
                  {formData.amenities.length > 1 && <Button type="button" variant="ghost" onClick={() => removeItem(i, 'amenities')} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3"><X className="w-4 h-4" /></Button>}
                </div>
              ))}
              <Button type="button" onClick={() => addItem('amenities')} variant="outline" className="gap-1 border-white/15 text-slate-400 hover:text-white hover:bg-white/10 text-sm">
                <Plus className="w-4 h-4" /> Ajouter un équipement
              </Button>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-semibold">Règles & politique</h2>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Règles de la maison</label>
                <textarea name="rules" value={formData.rules} onChange={handleChange} rows={3} placeholder="Ex: Pas de fumée, pas d'animaux..." className="w-full px-3 py-2 bg-white/5 border border-white/15 text-white rounded-xl placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Politique d'annulation</label>
                <textarea name="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleChange} rows={3} placeholder="Ex: Remboursement intégral jusqu'à 48h avant..." className="w-full px-3 py-2 bg-white/5 border border-white/15 text-white rounded-xl placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/landlord/listings">
                <Button type="button" variant="outline" className="border-white/15 text-slate-300 hover:bg-white/10">Annuler</Button>
              </Link>
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8">
                {isLoading ? 'Création...' : 'Créer l\'annonce'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
