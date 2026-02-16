#!/bin/bash

echo "🚀 Setting up Rental Platform Database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL environment variable is not set"
  echo "Please add your Neon database connection URL to your environment variables"
  exit 1
fi

# Install Prisma CLI globally if not already installed
if ! command -v prisma &> /dev/null; then
  echo "📦 Installing Prisma CLI..."
  npm install -g prisma
fi

echo "🔄 Running Prisma migrations..."
npx prisma migrate dev --name init

echo "✅ Database setup complete!"
echo ""
echo "Your database schema has been initialized with the following tables:"
echo "  - User (with Auth.js support)"
echo "  - Listing (rooms, equipment, spaces)"
echo "  - Booking (with conflict detection)"
echo "  - Review"
echo "  - DamageClaim"
echo "  - Notification"
echo "  - StripeCustomer"
echo ""
echo "Next steps:"
echo "1. Set up environment variables:"
echo "   - NEXTAUTH_URL=http://localhost:3000 (for development)"
echo "   - NEXTAUTH_SECRET=<generate a random secret>"
echo "   - GITHUB_ID and GITHUB_SECRET (optional for OAuth)"
echo "   - GOOGLE_ID and GOOGLE_SECRET (optional for OAuth)"
echo "   - STRIPE_SECRET_KEY (for payments)"
echo "   - STRIPE_PUBLISHABLE_KEY (for payments)"
echo ""
echo "2. Run 'npm run dev' to start the development server"
