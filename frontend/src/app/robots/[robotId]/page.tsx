import type { Metadata } from 'next'

import { RobotDetail } from '@/components/pages/robot-detail'

interface IRobotDetailPageProps {
  params: Promise<{ robotId: string }>
}

export async function generateMetadata({
  params,
}: IRobotDetailPageProps): Promise<Metadata> {
  const { robotId } = await params
  return { title: `Robot ${robotId} · Robot Fleet Dashboard` }
}

export default async function RobotDetailPage({
  params,
}: IRobotDetailPageProps) {
  const { robotId } = await params
  return <RobotDetail robotId={robotId} />
}
