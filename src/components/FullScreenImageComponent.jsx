import React from 'react'
import BackArrowIcon from '../assets/BackArrowIcon'
import DownloadIcon from '../assets/DownloadIcon'
import { useChatStore } from '../lib/chatStore'

function FullScreenImageComponent() {
  const { closeFullScreenImage, imageUrl } = useChatStore()
  return (
    <div className='absolute inset-0 z-50 flex items-center justify-center w-full h-full bg-black/80 backdrop-blur-md'>
      <button
        aria-label='close'
        title='Close'
        className='absolute flex items-center justify-center p-1 rounded-full hover:bg-slate-900 active:bg-slate-800 size-10 top-4 left-4'
        onClick={closeFullScreenImage}
      >
        <BackArrowIcon />
      </button>
      <a
        aria-label='download image'
        title='Download'
        href={imageUrl}
        download={`downloaded_image_${Date.now()}.jpg`}
        onClick={(e) => e.stopPropagation()}
        className='absolute flex items-center justify-center p-1 rounded-full hover:bg-slate-900 active:bg-slate-800 size-10 top-4 right-4'
      >
        <DownloadIcon />
      </a>
      <div className='md:w-3/4 md:h-3/4 w-[90%] h-[80%]  '>
        <img
          src={imageUrl}
          alt={imageUrl}
          className='object-contain object-center w-full h-full '
        />
      </div>
    </div>
  )
}

export default FullScreenImageComponent
