import React, { useEffect, useRef, useState } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase'
import { useChatStore } from '../lib/chatStore';
import { useUserStore } from '../lib/userStore';
import upload from '../lib/upload';
import EmojiIcon from '../assets/EmojiIcon';
import AttachIcon from '../assets/AttachIcon';
import SendButton from '../assets/SendButton';
import BackArrowIcon from '../assets/BackArrowIcon';
import LoadingIndicator from './LoadingIndicator';
import FullScreenImageComponent from './FullScreenImageComponent';
import OpenIcon from '../assets/OpenIcon';
import InfoIcon from '../assets/InfoIcon';
import DoubleTickIcon from '../assets/DoubleTickIcon';
import { formatMessageTimestamp } from '../utils/utils';

function Chat({ setShowUserInfo, showUserInfo }) {

  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState('')
  const ref = useRef(null);
  const { user, chatId, isCurrentUserBlocked, isReceiverBlocked, resetChat, fetchChatMessages, chatMessages, loadingMessages, openImageInFullScreen, showfullImage } = useChatStore()
  const { currentUser } = useUserStore()
  const textInputRef = useRef(null)
  const [image, setImage] = useState('')
  const menuRef = useRef(null)
  const [uploadingImage, setUploadingImage] = useState(false)


  useEffect(() => {
    ref?.current?.scrollIntoView()
  }, [chatMessages?.messages, image?.file])

  useEffect(() => {
    setOpenEmoji(false)
    if (chatId) {
      const unSub = fetchChatMessages(chatId)
      return () => {
        unSub();
      };

    }

  }, [chatId]);

  const handleImageUpload = async (e) => {
    setUploadingImage(true)
    setImage({
      file: e.target.files[0],
      url: URL.createObjectURL(e.target.files[0])
    })
    console.log(e.target.files[0])
    let imageUrl = null;

    try {
      if (e.target.files[0]) {
        imageUrl = await upload(e.target.files[0])
        console.log('image uploaded successfully', imageUrl)
      }
      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          createdAt: new Date(),
          ...(imageUrl && { img: imageUrl })
        })
      })
      const userIDs = [currentUser.id, user.id]

      userIDs.forEach(async (id) => {
        const userChatRef = doc(db, "userchats", id)
        const userChatsSnapshot = await getDoc(userChatRef)

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data()

          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId)

          userChatsData.chats[chatIndex].lastMessage = imageUrl
          userChatsData.chats[chatIndex].messageType = 'image'
          userChatsData.chats[chatIndex].messageSenderId = currentUser.id
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false
          userChatsData.chats[chatIndex].updatedAt = Date.now()

          await updateDoc(userChatRef, {
            chats: userChatsData.chats,
          })
        }
      })

    } catch (error) {
      console.log('error uploading image.', error)
    } finally {
      setUploadingImage(false)
      setImage({
        file: null,
        url: ''
      })
    }
  }



  const handleEmoji = (e) => {
    setText(prev => prev + e.emoji)
    // setOpenEmoji(false)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (text === '') return;
    if (openEmoji) setOpenEmoji(false)
    setText('')
    textInputRef?.current?.focus()
    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });
      const userIDs = [currentUser.id, user.id]

      userIDs.forEach(async (id) => {
        const userChatRef = doc(db, "userchats", id)
        const userChatsSnapshot = await getDoc(userChatRef)

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data()

          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId)

          userChatsData.chats[chatIndex].lastMessage = text
          userChatsData.chats[chatIndex].messageType = 'text'
          userChatsData.chats[chatIndex].messageSenderId = currentUser.id
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false
          userChatsData.chats[chatIndex].updatedAt = Date.now()

          await updateDoc(userChatRef, {
            chats: userChatsData.chats,
          })
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={`${!chatId && 'hidden sm:block'} col-span-12 sm:col-span-8  h-screen bg-slate-950 ${showUserInfo ? 'lg:col-span-5' : 'lg:col-span-8'} `}>
      {showfullImage && <FullScreenImageComponent />}
      {!chatId ?
        <div className='grid w-full h-full place-content-center text-cyan-600'>
          <div className='flex flex-col items-center gap-2'>
            <img
              src="/startMessaging.svg"
              alt="start conversation image"
              className=''
              width='240'
              height='240'
            />
            <p>
              Please select a conversation to start messaging
            </p>
          </div>
        </div> :
        <div className='flex flex-col w-full h-screen bg-center bg-cover bg-backgroundImage'>
          <div className="flex items-center justify-between h-16 p-4 text-white top bg-slate-800">
            <div className='flex items-center gap-4 '>
              <div className='flex gap-1 '>
                <button
                  aria-label='Close chat'
                  title='Close chat'
                  onClick={() => {
                    resetChat()
                    if (showUserInfo) setShowUserInfo(false);
                  }}
                  className='flex items-center justify-center p-1 rounded-full hover:bg-slate-700 active:bg-slate-600 size-10 opacity-80'
                >
                  <BackArrowIcon />
                </button>
                <img
                  src={user?.avatar || "/profileImage.webp"}
                  width='40'
                  height='40'
                  alt={user?.username + 'profile image'} className='object-cover object-center rounded-full size-10'
                />
              </div>
              <div className=" text">
                <span className='capitalize'>
                  {user?.username}
                </span>
                {/* <div className='text-xs text-gray-400'> */}
                {/* {user?.online ?
                    <p className='flex items-center gap-1 text-white'>
                      <span className='font-bold text-green-500 size-[8px]  bg-green-500 rounded-full'></span>
                      <span>
                        Online
                      </span>
                    </p>
                    : 'offline'} */}
                {/* </div> */}
              </div>
            </div>
            <div
              ref={menuRef}
              className='relative'
            >
              <button
                aria-label='Profile info'
                title='Profile info'
                onClick={() => setShowUserInfo(true)}
                className={`opacity-80 flex items-center p-1 transition-colors rounded-full size-8 hover:bg-slate-700 active:bg-slate-600 ${showUserInfo && 'bg-slate-700'}`}
              >
                <InfoIcon />
              </button>
            </div>
          </div>

          {loadingMessages &&
            <div className='flex justify-center p-4'>
              <LoadingIndicator />
            </div>
          }
          <div className='relative flex flex-col flex-1 gap-4 px-4 pt-8 overflow-y-auto sm:px-6 center'>
            {!loadingMessages &&
              chatMessages?.messages?.map((message) => (
                <div
                  key={message.createdAt}
                  className='relative flex flex-col gap-4 '
                >
                  {message.img &&
                    <div className={` flex ${message.senderId === currentUser.id ? "justify-end" : ""} relative `}>
                      <div
                        onClick={() => {
                          openImageInFullScreen(message.img)
                        }}
                        className={`${message.senderId === currentUser.id ? "bg-cyan-700 rounded-br-none" : "bg-slate-800 rounded-bl-none"} p-1 rounded-lg relative group  cursor-pointer shadow-md shadow-black/50`}
                      >
                        <div
                          title='Click to open image'
                          className='absolute flex items-center justify-center h-64 duration-200 bg-black rounded-lg opacity-0 top-1 left-1 right-1 group-hover:opacity-80'
                        >
                          <OpenIcon />
                        </div>

                        <img
                          src={message.img}
                          alt='shared image'
                          height='256'
                          width='256'
                          className={`rounded-lg w-64 aspect-square object-cover object-center `}
                        />
                        <p className={`flex items-end justify-end flex-1 w-full text-xs text-gray-300 ${message.senderId !== currentUser.id && 'mt-1'} `}>
                          <span className='whitespace-nowrap'>
                            {message?.createdAt?.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            }
                          </span>
                          {message.senderId === currentUser.id &&
                            <span className='flex size-5'>
                              <DoubleTickIcon />
                            </span>
                          }
                        </p>
                      </div>
                      <span className={` bottom-0  w-0 h-0  border-b-[8px]  absolute ${message.senderId === currentUser.id ? "border-r-transparent rounded-r-md border-r-[6px]  border-b-cyan-700 left-full " : "border-l-transparent border-l-[8px] right-full  border-b-slate-800 rounded-l-md "}`}></span>
                    </div>
                  }
                  {message?.text &&
                    <div className={`flex items-end message ${message.senderId === currentUser.id ? "justify-end" : ""}  relative `} >
                      <div className={`texts w-max   shadow-md shadow-black/50 text-white rounded-2xl   p-2 ${message.senderId === currentUser.id ? 'bg-cyan-700 rounded-br-none' : 'bg-slate-800 rounded-bl-none'} flex gap-4 pb-1 flex-wrap gap-y-1 items-end max-w-[75%]`}>
                        <p>
                          {message.text}
                        </p>
                        <p className='flex items-end justify-end flex-1 text-xs text-gray-300 w-max'>
                          <span className='whitespace-nowrap'>
                            {message?.createdAt?.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            }
                          </span>
                          {message.senderId === currentUser.id &&
                            <span className='flex size-5'>
                              <DoubleTickIcon />
                            </span>
                          }
                        </p>

                      </div>
                      <span className={` bottom-0  w-0 h-0  border-b-[8px]  absolute ${message.senderId === currentUser.id ? "border-r-transparent rounded-r-md border-r-[6px]  border-b-cyan-700 left-full " : "border-l-transparent border-l-[8px] right-full  border-b-slate-800 rounded-l-md "}`}></span>
                    </div>
                  }
                </div>
              ))
            }
            {uploadingImage && image.url &&
              <div
                className={` flex justify-end  relative`}>
                <div
                  className={`bg-cyan-700 rounded-br-none p-1 rounded-lg relative group  cursor-pointer shadow-md shadow-black/50`}>
                  <img
                    src={image.url}
                    alt="attached image"
                    height='256'
                    width='256'
                    className={`rounded-lg w-64 aspect-square object-cover object-center `}
                  />
                  <p className={`flex items-center justify-end flex-1 w-full text-xs text-gray-300`}>
                    <span className='whitespace-nowrap'>
                      {formatMessageTimestamp(Date.now())}
                    </span>
                    <span className='flex items-center justify-center size-5'>
                      <LoadingIndicator className='size-3' />
                    </span>
                  </p>
                </div>
                <span className={` bottom-0  w-0 h-0  border-b-[8px]  absolute border-r-transparent rounded-r-md border-r-[6px]  border-b-cyan-700 left-full `}></span>
              </div>
            }
            <div ref={ref} >

            </div>
          </div>
          {openEmoji && <EmojiPicker
            theme='dark'
            onEmojiClick={handleEmoji}
            autoFocusSearch={false}
            style={{ backgroundColor: '#1e293b', width: '100%', height: '350px', borderRadius: '0', }}
            searchDisabled
          />
          }
          <form
            onSubmit={handleSendMessage}
            // px-4 m-4 
            className='relative flex items-center w-full p-3 bottom'
          >
            <div className='flex items-center w-full h-full p-2 px-4 bg-slate-800 rounded-xl'>
              <div
                title='Attach image'
                className='p-1 transition-colors rounded-full cursor-pointer hover:text-cyan-400 opacity-60 active:bg-slate-600'
              >
                <label
                  htmlFor="upload_Image"
                  className='cursor-pointer'
                >
                  <AttachIcon />
                </label>
                <input
                  disabled={isCurrentUserBlocked || isReceiverBlocked}
                  id='upload_Image'
                  type="file"
                  hidden
                  onChange={handleImageUpload}
                  accept='image/*'
                />
              </div>
              <input
                disabled={isCurrentUserBlocked || isReceiverBlocked}
                ref={textInputRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                }}
                type="text"
                className='w-full p-2 px-2 bg-transparent outline-none disabled:opacity-50'
                placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a message" : "Type a message..."}
              />
              <button
                aria-label='emojis'
                title='Send Emojis'
                // disabled={isCurrentUserBlocked || isReceiverBlocked}
                type='button'

                onClick={() => {
                  setOpenEmoji(!openEmoji)
                  console.log('hello')

                }}
                className={`p-1 transition-colors rounded-full hover:text-cyan-400 active:bg-slate-600 ${openEmoji && 'text-cyan-400'} opacity-60`}
              >
                <EmojiIcon />
              </button>


            </div>
            <button
              aria-label='send'
              disabled={isCurrentUserBlocked || isReceiverBlocked}
              type='submit'
              className='flex items-center justify-center p-4 ml-3 transition-colors rounded-full text-cyan-500 hover:text-white hover:bg-cyan-700 disabled:opacity-50 bg-slate-800 size-14 active:opacity-70 active:text-white'
            >
              <SendButton />
            </button>
          </form>
        </div>

      }
    </div >
  )
}

export default Chat
