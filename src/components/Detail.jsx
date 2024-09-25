import React, { useEffect, useState } from 'react'
import { useChatStore } from '../lib/chatStore'
import { useUserStore } from '../lib/userStore'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import CloseButton from '../assets/CloseButton'
import BlockIcon from '../assets/BlockIcon'
import LoadingIndicator from './LoadingIndicator'

function Detail({ setShowUserInfo }) {
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, chatMessages, loadingMessages, openImageInFullScreen } = useChatStore()
  const { currentUser } = useUserStore()
  const [images, setImages] = useState([])

  useEffect(() => {
    setImages([])
    if (chatMessages?.messages) {
      const newImages = chatMessages.messages
        .filter(message => Object.keys(message).includes('img'))
        .reverse()
        .map(message => ({ createdAt: message.createdAt.seconds, img: message.img }));
      setImages(newImages);
    }
  }, [chatMessages]);

  const handleBlockUser = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser.id)
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      })
      changeBlock();
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={`absolute bg-slate-950 top-0 bottom-0 w-full sm:right-0  sm:w-80 lg:col-span-3 lg:relative lg:w-full border-l border-slate-700/80 flex flex-col gap-3 h-screen overflow-y-auto center`}>
      <div className="flex flex-col items-center gap-4 p-4 pb-6 bg-slate-900">
        <p className='flex items-center w-full gap-4'>
          <button
            aria-label='close'
            className='flex items-center justify-center rounded-full hover:bg-slate-800 active:bg-slate-700 size-8'
            onClick={() => setShowUserInfo(false)}
          >
            <CloseButton />
          </button>
          Contact Info
        </p>
        <div
          onClick={() => openImageInFullScreen(user.avatar)}
          className='flex justify-center mt-12 transition-all rounded-full cursor-pointer w-max hover:brightness-75'
        >
          <img
            src={user.avatar || "/profileImage.webp"}
            alt="profile image"
            width={'240'}
            height={'240'}
            className='rounded-full size-[200px] aspect-square object-cover object-center  '
          />
        </div>
        <h2 className='text-xl text-center capitalize'>
          {user?.username}
        </h2>
      </div>
      <div className='p-6 space-y-2 bg-slate-900'>
        <p className='text-sm opacity-70'>
          About
        </p>
        <p className=''>
          Hey there! I am using Chatapp.
        </p>
      </div>
      <div className='p-6 space-y-4 bg-slate-900'>
        <p className='text-sm opacity-70'>
          Media
        </p>
        <div className='flex flex-wrap gap-2'>
          {loadingMessages &&
            <div className='flex justify-center w-full'>
              <LoadingIndicator />
            </div>
          }
          {!loadingMessages &&
            (images.length === 0 ?
              <p className='w-full text-xs text-center opacity-70'>
                No media available
              </p> :
              images.map((image) => (
                <span
                  onClick={() => {
                    openImageInFullScreen(image.img)
                  }}
                  key={image.createdAt}
                  className='p-1 transition-all rounded-md hover:brightness-50 bg-slate-600'
                >
                  <img
                    src={image.img}
                    alt="shared media"
                    className='size-[92px] object-cover object-center rounded-md cursor-pointer'
                  />
                </span>
              )))}
        </div>
      </div>
      <div className='px-0 py-2 mb-8 space-y-4 bg-slate-900'>
        <button
          aria-label='block user'
          onClick={handleBlockUser}
          className='flex items-center w-full gap-2 px-6 py-4 text-red-400 transition-colors hover:bg-slate-800 active:bg-slate-700 '
        >
          <BlockIcon />
          {isCurrentUserBlocked ? 'You are Blocked!' : isReceiverBlocked ? 'Unblock' : 'Block User'}
        </button>
      </div>
    </div>
  )
}

export default Detail
