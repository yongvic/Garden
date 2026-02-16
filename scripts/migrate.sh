#!/bin/bash

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

echo "Database initialized successfully!"
