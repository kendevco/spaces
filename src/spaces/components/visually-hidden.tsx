import React, { ReactNode } from 'react'

interface VisuallyHiddenProps {
  children: ReactNode // Type for children prop
}

const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children }) => {
  return (
    <span
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        border: '0',
      }}
    >
      {children}
    </span>
  )
}

export default VisuallyHidden
