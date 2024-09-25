import React, { useEffect, useRef, useState } from 'react'
import { useUserStore } from '../lib/userStore'
import ContextMenubutton from '../assets/ContextMenubutton';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useChatStore } from '../lib/chatStore';
import LogoutIcon from '../assets/LogoutIcon';
import ProfileIcon from '../assets/ProfileIcon';
import AddIcon from '../assets/AddIcon';
import AddUser from './AddUser'


function UserInfo({ setOpenSideMenu }) {
  const { currentUser } = useUserStore();
  const { resetChat } = useChatStore()
  const menuRef = useRef(null)
  const [openMenu, setOpenMenu] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false)


  const handleAddUser = () => {
    setShowAddContact(!showAddContact)
  }

  const handleMenuClick = () => {
    setOpenMenu(!openMenu)
  }
  const closeMenu = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpenMenu(false)
    }
  }

  const handleSignout = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.id);

      await updateDoc(userRef, { online: false });

      await signOut(auth);
      resetChat()
      console.log('Sign out successful');
    } catch (error) {
      console.log('Error logging out:', error.message);
    } finally {
      setOpenMenu(false);
    }
  };



  useEffect(() => {
    window.addEventListener('click', closeMenu)

    return () => {
      window.removeEventListener('click', closeMenu)
    }
  }, [])

  return (
    <div className='flex items-center justify-between h-16 p-4 bg-slate-900' >
      {showAddContact && <AddUser setShowAddContact={setShowAddContact} />}
      <span className='flex items-center gap-2 text-2xl font-bold'>
        Chats
      </span>
      <div className='flex items-center gap-2'>
        <button
          title='Add User'
          className='flex items-center justify-center p-1 rounded-full size-10 hover:bg-slate-700 active:bg-slate-600 opacity-80'
          onClick={handleAddUser}
        >
          <AddIcon />
        </button>
        <div ref={menuRef} className='relative'>
          <button
            aria-label='Menu'
            title='Menu'
            onClick={handleMenuClick}
            className={`flex items-center p-1 transition-colors rounded-full size-8 hover:bg-slate-700 active:bg-slate-600 ${openMenu && 'bg-slate-700'} opacity-80`}
          >
            <ContextMenubutton />
          </button>
          {openMenu && <div className='absolute right-0 z-10 w-40 py-1 mt-2 rounded-md shadow-md top-full bg-slate-700 shadow-black/50'>
            <button
              onClick={() => {
                setOpenMenu(false)
                setOpenSideMenu(true)
              }}
              className='flex items-center w-full gap-2 p-2 px-3 text-sm transition-colors hover:bg-slate-800 active:bg-slate-700 opacity-90'>
              <ProfileIcon className=' size-5' />
              Profile
            </button>
            <button
              onClick={handleSignout}
              className='flex items-center w-full gap-2 p-2 px-4 text-sm transition-colors hover:bg-slate-800 active:bg-slate-700 opacity-90'>
              <LogoutIcon className='size-6' />
              Logout
            </button>
          </div>}
        </div>
      </div>

    </div>
  )
}

export default UserInfo
