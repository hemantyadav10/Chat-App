import React from 'react'

function Loader() {
  return (
<div className="flex flex-col items-center justify-center w-full gap-4">
  <div
    className="flex items-center justify-center w-20 h-20 text-4xl border-4 border-transparent rounded-full text-cyan-400 animate-spin border-t-cyan-400"
  >
    <div
      className="flex items-center justify-center w-16 h-16 text-2xl border-4 border-transparent rounded-full text-slate-400 animate-spin border-t-slate-400"
    ></div>
  </div>
</div>

  )
}

export default Loader
