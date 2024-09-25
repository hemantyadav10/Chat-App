import React, { useState } from 'react'
import UserInfo from './UserInfo'
import ChatList from './ChatList'
import { useChatStore } from '../lib/chatStore'
import SideBar from './SideBar'

function List() {
  const { chatId } = useChatStore()
  const [openSideMenu, setOpenSideMenu] = useState(false)
  return (
    <div className={`col-span-12 sm:col-span-4 border-slate-700/80 border-r  ${chatId && 'hidden sm:block'} flex flex-col `}>
      {openSideMenu &&
        <div
          onClick={() => setOpenSideMenu(false)}
          className='absolute inset-0 z-50 hidden bg-black/60 sm:block'></div>
      }
      <SideBar
        openSideMenu={openSideMenu}
        setOpenSideMenu={setOpenSideMenu}
      />
      <UserInfo
        openSideMenu={openSideMenu}
        setOpenSideMenu={setOpenSideMenu}
      />
      <ChatList />
    </div>
  )
}


export default List
