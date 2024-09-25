import React from 'react'

function LoadingIndicator({ className = 'size-5' }) {
  return (
    <div className={`border-2 border-transparent rounded-full ${className} border-t-cyan-500 border-r-cyan-500 animate-spin`} >
    </div>
  )
}

export default LoadingIndicator
