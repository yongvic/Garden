import { requireAdmin } from '@/lib/auth-utils'
import { getAdminStats } from '@/lib/admin-stats'
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client'

export default async function AdminDashboardPage() {
  await requireAdmin()
  const stats = await getAdminStats()

  return <AdminDashboardClient stats={stats} />
}
