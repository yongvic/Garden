import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { PageTransition } from '@/components/page-transition'

type PageShellProps = {
  children: React.ReactNode
  className?: string
  withGrid?: boolean
}

export function PageShell({ children, className = '', withGrid = false }: PageShellProps) {
  return (
    <>
      <Navbar />
      <main
        className={`min-h-dvh garden-surface pt-16 ${withGrid ? 'garden-grid' : ''} ${className}`}
      >
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  )
}
