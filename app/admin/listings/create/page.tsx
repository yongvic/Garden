import { requireAdmin } from '@/lib/auth-utils'
import { AdminCreateListingForm } from '@/components/admin/admin-create-listing-form'

export default async function AdminCreateListingPage() {
  await requireAdmin()
  return <AdminCreateListingForm />
}
