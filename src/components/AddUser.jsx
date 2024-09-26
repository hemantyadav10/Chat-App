import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { useUserStore } from '../lib/userStore'
import CloseButton from '../assets/CloseButton'
import SearchIcon from '../assets/SearchIcon'

function AddUser({ setShowAddContact }) {
  const [username, setUsername] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUserStore()
  const [addingUser, setAddingUser] = useState(false)
  const [searched, setSearched] = useState(false);


  const handleUserSearch = async (e) => {
    setLoading(true);
    setUser(null);
    setSearched(true);
    e.preventDefault();

    try {
      const userRef = collection(db, "users");
      const startText = username.toLowerCase();
      const endText = startText + '\uf8ff';
      const q = query(
        userRef,
        where("username", ">=", startText),
        where("username", "<=", endText),
        where('username', "!=", currentUser.username)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
        console.log(querySnapshot.docs[0].data());
      }

      console.log(querySnapshot);

    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };



  const handleAdd = async () => {
    setAddingUser(true)
    const chatRef = collection(db, "chats")
    const userChatsRef = collection(db, "userchats")
    try {
      const newChatRef = doc(chatRef)
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      })

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          receiverId: currentUser.id,
          lastMessage: "",
          updatedAt: Date.now(),
          isSeen: false,
        })
      })

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          receiverId: user.id,
          lastMessage: "",
          updatedAt: Date.now(),
          isSeen: false,
        })
      })

    } catch (error) {
      console.log(error)
    } finally {
      setAddingUser(false)
      setShowAddContact(false)
      setUser(null)
    }
  }


  return (
    <div className='absolute inset-0 z-50 flex items-start justify-center p-4 mx-auto my-auto text-white rounded-lg shadow-lg items bg-black/60 backdrop-blur-sm'>
      <div className='absolute top-0 right-0'>
        <button
          aria-label='Close Button'
          title='Close'
          onClick={() => setShowAddContact(false)}
          className='p-1 m-4 transition-colors rounded-full size-8 hover:bg-slate-700 active:bg-slate-600'
        >
          <CloseButton />
        </button>
      </div>
      <form
        onSubmit={handleUserSearch}
        className='p-3 mt-10 space-y-4 rounded-xl w-96 bg-slate-800'
      >
        <div className='relative flex'>
          <input
            autoFocus
            type="text"
            placeholder='Search with Username'
            name='username'
            value={username}
            onChange={e => setUsername(e.target.value)}
            className='flex-1 py-2 pl-10 pr-5 rounded-lg outline-none bg-slate-900 focus:ring-1 ring-cyan-600'
          />
          <span className='absolute -translate-y-1/2 pointer-events-none top-1/2 left-3 opacity-60'>
            <SearchIcon />
          </span>
        </div>
        {searched && (
          <div className='mt-4'>
            {loading ? (
              <div>Loading...</div>
            ) : user ? (
              <div className='flex items-center justify-between user'>
                <div className='flex items-center gap-2 details'>
                  <img
                    src={user.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ718nztPNJfCbDJjZG8fOkejBnBAeQw5eAUA&s'}
                    alt={user.username + 'profile image'}
                    className='object-cover object-center rounded-full size-10'
                  />
                  <span className='capitalize'>{user.username}</span>
                </div>
                <button
                  type='button'
                  onClick={handleAdd}
                  disabled={addingUser}
                  className='px-3 py-2 text-xs transition-colors rounded-md bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 disabled:opacity-50'
                >
                  Add User
                </button>
              </div>
            ) : (
              <div>No user found.</div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}

export default AddUser
