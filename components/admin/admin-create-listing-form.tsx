'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageShell } from '@/components/page-shell'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import { useI18n } from '@/lib/i18n/context'
import { AlertTriangle, Plus, X } from 'lucide-react'

export function AdminCreateListingForm() {
  const router = useRouter()
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'SPACE',
    location: '',
    pricePerDay: '',
    images: [] as string[],
    amenities: [''],
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleArrayChange = (index: number, value: string) => {
    const newArray = [...formData.amenities]
    newArray[index] = value
    setFormData((prev) => ({ ...prev, amenities: newArray }))
  }

  const addAmenity = () => {
    setFormData((prev) => ({ ...prev, amenities: [...prev.amenities, ''] }))
  }

  const removeAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.images.length === 0) {
      setError(t.landlord.form.imageRequired)
      setIsLoading(false)
      return
    }

    try {
      const cleanedAmenities = formData.amenities.filter((am) => am.trim() !== '')

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricePerDay: parseFloat(formData.pricePerDay),
          amenities: cleanedAmenities,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t.auth.errors.generic)
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
    <PageShell>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          title={t.admin.createListing}
          description={t.landlord.createSubtitle}
          backHref="/admin/listings"
          backLabel={t.admin.listingsTitle}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <AlertTriangle className="size-5 shrink-0" />
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.landlord.form.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">{t.landlord.form.title}</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Belle salle de jardin"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">{t.landlord.form.type}</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="SPACE">{t.listing.types.SPACE}</option>
                    <option value="EQUIPMENT">{t.listing.types.EQUIPMENT}</option>
                    <option value="ROOM">{t.listing.types.ROOM}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerDay">{t.landlord.form.price}</Label>
                  <Input
                    id="pricePerDay"
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    placeholder="15000"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t.landlord.form.location}</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ex: Cocody, Abidjan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t.landlord.form.description}</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Décrivez l'espace ou le matériel en détail…"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.landlord.form.images}</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={formData.images}
                onChange={(urls) => setFormData((p) => ({ ...p, images: urls }))}
                maxImages={10}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.landlord.form.amenities}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.amenities.map((amenity, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={amenity}
                    onChange={(e) => handleArrayChange(idx, e.target.value)}
                    placeholder="Ex: Wifi, Climatisation…"
                  />
                  {formData.amenities.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeAmenity(idx)}
                      aria-label={t.common.delete}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addAmenity}>
                <Plus className="mr-2 size-4" />
                {t.landlord.form.amenities}
              </Button>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href="/admin/listings">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                {t.common.cancel}
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? t.landlord.form.submitting : t.landlord.form.submit}
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  )
}
