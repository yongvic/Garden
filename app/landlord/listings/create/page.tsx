'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageShell } from '@/components/page-shell'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ImageUpload } from '@/components/ui/image-upload'
import { useI18n } from '@/lib/i18n/context'
import { toast } from 'sonner'
import { Check, Plus, Loader2 } from 'lucide-react'

const PREDEFINED_AMENITIES = [
  'Wifi Rapide',
  'Climatisation',
  'TV Écran Plat',
  'Cuisine Équipée',
  'Parking Gratuit',
  'Piscine',
  'Espace de Travail',
  'Accès PMR',
  'Balcon/Terrasse',
  'Machine à café',
]

const listingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: z.enum(['SPACE', 'ROOM', 'EQUIPMENT']),
  location: z.string().min(2),
  pricePerDay: z.string().min(1),
  maxOccupants: z.string().optional(),
  images: z.array(z.string()).min(1),
  amenities: z.array(z.string()),
  rules: z.string().optional(),
  cancellationPolicy: z.string().optional(),
})

type ListingFormValues = z.infer<typeof listingSchema>

export default function LandlordCreateListingPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [customAmenity, setCustomAmenity] = useState('')

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'SPACE',
      location: '',
      pricePerDay: '',
      maxOccupants: '',
      images: [],
      amenities: [],
      rules: '',
      cancellationPolicy: '',
    },
  })

  const amenities = form.watch('amenities')
  const isSubmitting = form.formState.isSubmitting

  const toggleAmenity = (amenity: string) => {
    const current = form.getValues('amenities')
    form.setValue(
      'amenities',
      current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity],
      { shouldDirty: true }
    )
  }

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim()
    if (!trimmed || amenities.includes(trimmed)) return
    form.setValue('amenities', [...amenities, trimmed], { shouldDirty: true })
    setCustomAmenity('')
  }

  const onSubmit = async (values: ListingFormValues) => {
    if (values.images.length === 0) {
      toast.error(t.landlord.form.imageRequired)
      return
    }

    const price = parseFloat(values.pricePerDay)
    if (Number.isNaN(price) || price <= 0) {
      toast.error(t.common.error)
      return
    }

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          pricePerDay: price,
          maxOccupants: values.maxOccupants ? parseInt(values.maxOccupants, 10) : undefined,
        }),
      })

      if (!res.ok) {
        let errMessage: string = t.common.error
        try {
          const json = await res.json()
          errMessage = json.error || errMessage
        } catch {
          errMessage = `${t.common.error} (${res.status})`
        }
        throw new Error(errMessage)
      }

      toast.success(t.common.success)
      router.push('/landlord/listings')
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
        <PageHeader
          title={t.landlord.createTitle}
          description={t.landlord.createSubtitle}
          backHref="/landlord/listings"
          backLabel={t.nav.myListings}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="space-y-6 md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t.landlord.form.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.landlord.form.title} *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Superbe salle de réunion lumineuse"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.landlord.form.description} *</FormLabel>
                          <FormControl>
                            <textarea
                              rows={5}
                              placeholder="Décrivez votre espace, son atmosphère, et pourquoi les clients l'adorent…"
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.landlord.form.type} *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SPACE">{t.listing.types.SPACE}</SelectItem>
                                <SelectItem value="ROOM">{t.listing.types.ROOM}</SelectItem>
                                <SelectItem value="EQUIPMENT">{t.listing.types.EQUIPMENT}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.landlord.form.location} *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Cocody, Abidjan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="pricePerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.landlord.form.price} *</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" placeholder="15000" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxOccupants"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.landlord.form.maxGuests}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Ex: 50"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t.landlord.form.images} *
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUpload
                              value={field.value}
                              onChange={field.onChange}
                              maxImages={10}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t.landlord.form.amenities}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_AMENITIES.map((amenity) => {
                        const selected = amenities.includes(amenity)
                        return (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleAmenity(amenity)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Badge
                              variant={selected ? 'default' : 'outline'}
                              className="cursor-pointer gap-1 px-3 py-1.5 text-xs"
                            >
                              {selected && <Check className="size-3" />}
                              {amenity}
                            </Badge>
                          </button>
                        )
                      })}
                      {amenities
                        .filter((a) => !PREDEFINED_AMENITIES.includes(a))
                        .map((amenity) => (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleAmenity(amenity)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Badge variant="default" className="cursor-pointer gap-1 px-3 py-1.5 text-xs">
                              <Check className="size-3" />
                              {amenity}
                            </Badge>
                          </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={customAmenity}
                        onChange={(e) => setCustomAmenity(e.target.value)}
                        placeholder="Autre…"
                        className="h-10 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomAmenity()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addCustomAmenity}
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t.landlord.form.rules}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="rules"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-sm text-muted-foreground">
                            {t.landlord.form.rules}
                          </Label>
                          <FormControl>
                            <textarea
                              rows={3}
                              placeholder="Ex: Pas de soirée bruyante, non fumeur…"
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cancellationPolicy"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-sm text-muted-foreground">
                            {t.landlord.form.cancellation}
                          </Label>
                          <FormControl>
                            <textarea
                              rows={3}
                              placeholder="Ex: Remboursement intégral jusqu'à 48h avant…"
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/landlord/listings" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      {t.common.cancel}
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting} className="flex-[2]">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        {t.landlord.form.submitting}
                      </>
                    ) : (
                      t.landlord.form.submit
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </PageShell>
  )
}
