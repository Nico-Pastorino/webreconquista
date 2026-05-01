import CanjePage from '../canje/page'

export const revalidate = 120

export const metadata = {
  title: 'Plan Canje iPhone | Valorá tu usado',
  description: 'Entregá tu iPhone usado y conseguí el nuevo pagando solo la diferencia.',
}

export default async function PlanCanjePage() {
  return <CanjePage />
}
