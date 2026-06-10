# Garden — Plan d'implémentation features SaaS

## Principes (zéro régression)

1. **Champs optionnels avec defaults** — aucune migration destructive
2. **APIs nouvelles** — les routes existantes restent compatibles
3. **Feature flags implicites** — si `hourlyBookingEnabled=false`, comportement actuel inchangé
4. **Tests manuels par phase** — build + flux critique après chaque phase

## Phases

| Phase | Scope | Statut |
|-------|--------|--------|
| 1 | Schéma Prisma, libs pricing/invoices/loyalty/referral | En cours |
| 2 | APIs messagerie, calendrier, devis, modifications, factures | À faire |
| 3 | Recherche avancée, carte, comparaison, wishlist publique, SEO | À faire |
| 4 | Réservation instantanée, horaire, packages, check-in, rebook | À faire |
| 5 | Onboarding hôte, avis bilatéraux, UI complète | À faire |

## Modèles ajoutés

- `PricingRule`, `EventPackage`, `EventPackageOption`
- `Conversation`, `Message`
- `Invoice`, `InvoiceSequence`
- `SharedFavoriteList`, `SharedFavoriteItem`
- `QuoteRequest`, `BookingModificationRequest`
- `HostReview`, `LoyaltyAccount`, `ReferralCode`, `Referral`
- `LandlordOnboarding`

## Extensions Listing

`bookingMode`, `minNights`, `maxNights`, `advanceNoticeDays`, `checkInTime`, `checkOutTime`, `hourlyBookingEnabled`, `pricePerHour`, `citySlug`, `neighborhood`

## Extensions Booking

`pricingType`, `startTime`, `endTime`, `packageId`, `quoteId`, `checkInInstructions`, `accessCode`, `checkInQrToken`, `loyaltyDiscount`, `referralCredit`
