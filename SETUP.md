# Room & Equipment Rental Platform - Setup Guide

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Neon, Supabase, or local)
- Stripe account for payments
- OAuth credentials (optional: GitHub, Google)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Database
```
DATABASE_URL="postgresql://user:password@host:port/database"
```

### Authentication
```
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key"  # Generate with: openssl rand -base64 32

# OAuth (Optional - for Google and GitHub login)
GITHUB_ID="your-github-app-id"
GITHUB_SECRET="your-github-app-secret"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Stripe Payments
```
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Email (Optional - for notifications)
```
RESEND_API_KEY="your-resend-api-key"  # For transactional emails
```

## Installation & Setup Steps

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Database
The Prisma schema is already configured. Run the migration:

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init
```

This will:
- Create all necessary database tables
- Setup relationships between models
- Create indexes for performance

### 3. Create Admin User (Optional)
You can seed an admin user by creating a script:

```bash
# Create a seed script at prisma/seed.ts
pnpm prisma db seed
```

### 4. Setup Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Listen to events: `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy the webhook secret and add to `.env.local`

### 5. Run Development Server
```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser.

## Database Schema Overview

### Core Models
- **User**: Customers, Landlords, and Admins
- **Listing**: Properties/spaces available for rent
- **Booking**: Reservations made by customers
- **Review**: Customer reviews for listings
- **DamageClaim**: Reported damage during bookings
- **Notification**: In-app notifications
- **StripeCustomer**: Mapping for Stripe payment processing

### Key Features Implemented

1. **Conflict Detection**
   - Unique constraint on (listingId, checkInDate, checkOutDate)
   - Real-time availability checking via API
   - Prevents double-booking at database level

2. **Payment Processing**
   - Stripe Checkout integration
   - Webhook handlers for payment events
   - Automatic booking confirmation on successful payment

3. **Multi-Role Access**
   - Customer: Browse, book, review
   - Landlord: Manage listings, handle bookings, track damage
   - Admin: Platform management, user moderation

4. **Notifications**
   - Booking confirmations
   - Payment updates
   - Damage claim reports
   - Review notifications

## API Endpoints

### Listings
- `GET /api/listings` - Browse with filters
- `GET /api/listings/[id]` - Get details
- `POST /api/listings` - Create new
- `PATCH /api/listings/[id]` - Update
- `DELETE /api/listings/[id]` - Delete

### Bookings
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]/availability` - Check availability
- `PATCH /api/bookings/[id]/status` - Update status

### Payments
- `POST /api/payments/checkout` - Create checkout session
- `POST /api/payments/webhook` - Stripe webhook handler

### Reviews
- `POST /api/reviews` - Post review
- `GET /api/reviews` - Get reviews for listing

### Damage Claims
- `POST /api/damage-claims` - Report damage
- `GET /api/damage-claims` - List claims

## Role-Based Routes

### Customer Routes
- `/` - Home page
- `/search` - Browse listings
- `/listings/[id]` - Listing details & booking
- `/bookings` - My bookings
- `/bookings/[id]` - Booking details & payment
- `/dashboard` - Customer dashboard

### Landlord Routes
- `/landlord/dashboard` - Dashboard
- `/landlord/listings` - Manage listings
- `/landlord/listings/new` - Create listing
- `/landlord/listings/[id]` - Edit listing
- `/landlord/bookings` - Handle bookings
- `/landlord/claims` - Manage damage claims

### Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/listings` - All listings
- `/admin/claims` - Damage claims
- `/admin/reports` - Analytics

## Development Tips

### Database Queries
Use Prisma for all database operations:
```typescript
import { prisma } from '@/lib/prisma'

const listings = await prisma.listing.findMany({
  where: { isActive: true },
  include: { landlord: true, reviews: true }
})
```

### Authentication
Check user role and auth status:
```typescript
import { auth } from '@/auth'

const session = await auth()
if (session?.user?.id) {
  // User is authenticated
}
```

### Error Handling
All API routes include comprehensive error handling:
- Input validation with Zod
- Authorization checks
- Database transaction safety
- Webhook signature verification

## Testing Stripe Locally

Use Stripe test credentials:
- Card: `4242 4242 4242 4242`
- Date: Any future date
- CVC: Any 3 digits

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically on push

### Docker
A Dockerfile can be created for containerized deployment.

### Manual Server
Ensure PostgreSQL is running and environment variables are set:
```bash
pnpm build
pnpm start
```

## Troubleshooting

### "DATABASE_URL is not set"
Check your `.env.local` file has the correct database URL.

### Prisma Client errors
Regenerate the Prisma client:
```bash
pnpm prisma generate
```

### Stripe webhook failing
1. Verify webhook secret in `.env.local`
2. Check Stripe dashboard for event logs
3. Ensure endpoint URL is publicly accessible

### Port already in use
Change the port:
```bash
pnpm dev -- -p 3001
```

## Performance Optimizations

- Database indexes on frequently queried fields
- Pagination on listing/booking lists
- Atomic transactions for booking creation
- Webhook deduplication for idempotency
- Image optimization in CDN (configure separately)

## Security Considerations

- Passwords hashed with bcrypt (for custom auth)
- Row-level security via authorization checks
- SQL injection prevention through parameterized queries
- CSRF protection via next-auth
- Rate limiting (implement separately)
- Input validation on all endpoints

## Next Steps

1. Configure email notifications with Resend or SendGrid
2. Add image upload/storage (Vercel Blob, AWS S3)
3. Implement real-time notifications (WebSockets)
4. Add admin moderation features
5. Setup monitoring and logging
6. Add comprehensive test suite

## Support

For issues or questions:
1. Check the API route implementations
2. Review error logs in browser console
3. Verify database connection
4. Check Stripe webhook events
5. Review middleware authentication

Happy building!
