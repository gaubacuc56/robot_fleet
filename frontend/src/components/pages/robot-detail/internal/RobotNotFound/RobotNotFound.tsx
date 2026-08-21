import { Button, Result } from 'antd'
import Link from 'next/link'

import { ROUTES } from '@/constants/routes'

export interface IRobotNotFoundProps {
  robotId: string
}

export function RobotNotFound({ robotId }: IRobotNotFoundProps) {
  return (
    <Result
      status="404"
      title="Unknown robot"
      subTitle={`No robot with id "${robotId}" has ever reported.`}
      extra={
        <Link href={ROUTES.dashboard}>
          <Button type="primary">Back to dashboard</Button>
        </Link>
      }
    />
  )
}
