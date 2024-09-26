import React, { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { useUserStore } from '../lib/userStore'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { useChatStore } from '../lib/chatStore'
import { formatMessageTimestamp } from '../utils/utils'
import SearchIcon from '../assets/SearchIcon'
import LoadingIndicator from './LoadingIndicator'
import PhotoIcon from '../assets/PhotoIcon'
import DoubleTickIcon from '../assets/DoubleTickIcon'

function ChatList() {
  const { currentUser } = useUserStore()
  const [chats, setChats] = useState([])
  const { changeChat, user } = useChatStore()
  const [searchText, setSearchText] = useState('')
  const [loadingChatList, setLoadingChatList] = useState(false);

  useEffect(() => {
    setLoadingChatList(true)
    const unsub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      console.log("Current data: ", res.data());
      const items = res.data().chats;
      console.log(items)


      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef)

        const user = userDocSnap.data();


        return { ...item, user }
      })

      const chatData = await Promise.all(promises)
      console.log(chatData)

      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt))
      console.log(chatData.sort((a, b) => b.updatedAt - a.updatedAt))
      setLoadingChatList(false)
    });

    return () => {
      unsub();
    }

  }, [currentUser.id])


  useEffect(() => {
    const unsubscribes = chats.map(chat => {
      const userStatusRef = doc(db, 'users', chat.user.id);
      return onSnapshot(userStatusRef, (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setChats((prevChats) =>
            prevChats.map((c) => c.chatId === chat.chatId ? { ...c, user: { ...c.user, online: userData.online } } : c)
          );
        }
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [chats, currentUser.id]);
  


  const handleOpenChat = async (chat) => {
    changeChat(chat.chatId, chat.user);

    if (chat.isSeen) return;

    const userChats = chats.map(item => item.chatId === chat.chatId ? { ...item, isSeen: true } : item);

    try {
      await updateDoc(doc(db, "userchats", currentUser.id), { chats: userChats });
    } catch (error) {
      console.error("Failed to update chat status:", error);
    }
  };

  const filteredChats = chats.filter(c => c.user.username.toLowerCase().includes(searchText.toLowerCase()))


  return (
    <>
      <div className={`relative flex items-center gap-2 px-4 py-3 `}>
        <input
          aria-label="Search"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          type="text"
          className='w-full py-2 pl-10 pr-5 rounded-lg outline-none bg-slate-800 focus:ring-1 ring-cyan-600'
          placeholder='Search '
        />
        <span className='absolute -translate-y-1/2 pointer-events-none opacity-60 top-1/2 left-7'>
          <SearchIcon />
        </span>
      </div>
      <div className='flex flex-col h-[calc(100vh-136px)] overflow-y-auto center'>
        {
          loadingChatList &&
          <div className='flex justify-center w-full'>
            <LoadingIndicator />
          </div>
        }

        {!loadingChatList && filteredChats.map((chat) => (
          <React.Fragment key={chat.chatId}>
            <div
              onClick={() => handleOpenChat(chat)}
              className={` ${chat.user.id === user?.id ? 'bg-cyan-800' : 'hover:bg-slate-800  active:bg-slate-700 '} cursor-pointer px-4 py-2   flex gap-4 items-center transition-colors`}
            >
              <div className='relative rounded-full aspect-square w-14 bg-slate-700 min-w-14'>
                <img
                  src={chat.user.avatar || "/profileImage.webp"}
                  alt={chat.user.username + "profile image"}
                  className='object-cover object-center w-full h-full rounded-full aspect-square '
                />
                {chat.user.online &&
                  <span className='absolute bottom-0 flex w-3 h-3 translate-x-full  rounded-full bg-[#14ff14] left-1/2'></span>
                }
              </div>
              <div className='flex flex-col flex-1 gap-1'>
                <div className='flex items-center justify-between gap-2'>
                  <p
                    title={chat.user.username}
                    className='font-semibold capitalize line-clamp-1'>
                    {chat.user.username}
                  </p>
                  {chat.lastMessage !== '' && (
                    <span
                      className={`text-xs whitespace-nowrap  ${chat.isSeen !== true ? 'font-semibold text-cyan-500' : 'text-gray-300'}`}>
                      {formatMessageTimestamp(chat.updatedAt)}
                    </span>
                  )}
                </div>
                {chat.lastMessage !== '' &&
                  <p
                    title={chat.messageType === 'image' ? 'Photo' : chat.lastMessage}
                    className={`text-sm   ${chat.isSeen !== true ? 'font-semibold text-cyan-400' : 'text-gray-300'} flex items-center `}
                  >
                    {chat.messageSenderId === currentUser.id ? <DoubleTickIcon /> : ''}
                    {chat.messageType === 'image' ?
                      <span className='flex items-center gap-1'>
                        <PhotoIcon /> Photo
                      </span> :
                      <p className='w-full line-clamp-1'>
                        {chat.lastMessage}
                      </p>
                    }
                  </p>}
              </div>
            </div>
            <hr className='border-r border-slate-700/80' />
          </React.Fragment>
        ))}

      </div>
    </>
  )
}

export default React.memo(ChatList)
