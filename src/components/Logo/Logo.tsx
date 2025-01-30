import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="KDCO Logo"
      width={150}
      height={73}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('max-w-[9.375rem] w-full h-[73px]', className)}
      src="/KDCO.png"
    />
  )
}
