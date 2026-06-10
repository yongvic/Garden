'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n/context'
import { toast } from 'sonner'

type PricingRule = {
  id: string
  ruleType: 'WEEKEND' | 'SEASON' | 'LONG_STAY'
  multiplier?: number | null
  discountPercent?: number | null
  minNights?: number | null
  startDate?: string | null
  endDate?: string | null
  isActive: boolean
}

type PricingRulesFormProps = {
  listingId: string
}

const RULE_TYPES = ['WEEKEND', 'SEASON', 'LONG_STAY'] as const

export function PricingRulesForm({ listingId }: PricingRulesFormProps) {
  const { t, locale } = useI18n()
  const [rules, setRules] = useState<PricingRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const ruleLabels: Record<string, string> = {
    WEEKEND: locale === 'fr' ? 'Week-end' : 'Weekend',
    SEASON: locale === 'fr' ? 'Saison' : 'Season',
    LONG_STAY: locale === 'fr' ? 'Long séjour' : 'Long stay',
  }

  const fetchRules = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/listings/${listingId}/pricing-rules`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRules(data.rules ?? [])
    } catch {
      setRules([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [listingId])

  const addRule = () => {
    setRules((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        ruleType: 'WEEKEND',
        multiplier: 1.2,
        isActive: true,
      },
    ])
  }

  const updateRule = (id: string, patch: Partial<PricingRule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/listings/${listingId}/pricing-rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRules(data.rules ?? rules)
      toast.success(t.common.success)
    } catch {
      toast.error(t.common.error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">{t.onboarding.steps.pricing}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === 'fr'
              ? 'Week-end, saisons et réductions long séjour.'
              : 'Weekend, seasonal, and long-stay discounts.'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addRule}>
          <Plus className="mr-1 size-4" />
          {locale === 'fr' ? 'Ajouter' : 'Add rule'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t.packages.empty}</p>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-xl border border-border p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Select
                  value={rule.ruleType}
                  onValueChange={(v) =>
                    updateRule(rule.id, { ruleType: v as PricingRule['ruleType'] })
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RULE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {ruleLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(v) => updateRule(rule.id, { isActive: v })}
                    />
                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                      {rule.isActive ? t.packages.active : t.packages.inactive}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeRule(rule.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {rule.ruleType === 'WEEKEND' && (
                  <div className="space-y-2">
                    <Label>{locale === 'fr' ? 'Multiplicateur' : 'Multiplier'}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="1"
                      value={rule.multiplier ?? 1}
                      onChange={(e) =>
                        updateRule(rule.id, { multiplier: parseFloat(e.target.value) })
                      }
                    />
                  </div>
                )}
                {rule.ruleType === 'SEASON' && (
                  <>
                    <div className="space-y-2">
                      <Label>{locale === 'fr' ? 'Date début' : 'Start date'}</Label>
                      <Input
                        type="date"
                        value={rule.startDate?.slice(0, 10) ?? ''}
                        onChange={(e) => updateRule(rule.id, { startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{locale === 'fr' ? 'Date fin' : 'End date'}</Label>
                      <Input
                        type="date"
                        value={rule.endDate?.slice(0, 10) ?? ''}
                        onChange={(e) => updateRule(rule.id, { endDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{locale === 'fr' ? 'Multiplicateur' : 'Multiplier'}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={rule.multiplier ?? 1}
                        onChange={(e) =>
                          updateRule(rule.id, { multiplier: parseFloat(e.target.value) })
                        }
                      />
                    </div>
                  </>
                )}
                {rule.ruleType === 'LONG_STAY' && (
                  <>
                    <div className="space-y-2">
                      <Label>{locale === 'fr' ? 'Nuits minimum' : 'Min nights'}</Label>
                      <Input
                        type="number"
                        min="1"
                        value={rule.minNights ?? 7}
                        onChange={(e) =>
                          updateRule(rule.id, { minNights: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{locale === 'fr' ? 'Réduction (%)' : 'Discount (%)'}</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={rule.discountPercent ?? 0}
                        onChange={(e) =>
                          updateRule(rule.id, { discountPercent: parseFloat(e.target.value) })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}

        {rules.length > 0 && (
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t.common.save}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
