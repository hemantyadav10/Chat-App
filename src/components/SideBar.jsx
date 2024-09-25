import React, { useEffect, useState } from 'react'
import CloseButton from '../assets/CloseButton'
import { useUserStore } from '../lib/userStore'
import EditIcon from '../assets/EditIcon'
import Tick from '../assets/Tick'
import { toast } from 'react-toastify'
import { auth, db, storage } from '../lib/firebase'

import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import LoadingIndicator from './LoadingIndicator'
import { updatePassword } from 'firebase/auth'
import { deleteObject, ref } from 'firebase/storage'
import upload from '../lib/upload'


function SideBar({ openSideMenu, setOpenSideMenu }) {
  const { currentUser } = useUserStore()
  const [editUsername, setEditUsername] = useState(false)
  const [editPassword, setEditPassword] = useState(false)
  const [username, setUsername] = useState(currentUser?.username)
  const [password, setPassword] = useState('********')
  const [updatingUsername, setUpdatingUsername] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [profileImage, setProfileImage] = useState(currentUser.avatar)
  const passwordRegex = /^(?!.*\s).{6,}$/;
  const [image, setImage] = useState({
    file: '',
    url: ''
  })
  const [updatingProfileImage, setUpdatingProfileImage] = useState(false)

  useEffect(() => {
    setEditUsername(false)
    setEditPassword(false)
    setUsername(currentUser?.username)
    setPassword('******')
    setImage({
      file: '',
      url: ''
    })
  }, [openSideMenu])


  const handleUpdateUsername = async () => {

    try {
      setUpdatingUsername(true)
      if (username.trim().toLowerCase() === currentUser?.username.toLowerCase()) return setEditUsername(false);
      console.log(username)
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return toast.warn("Username is already taken");
      }

      const userDocRef = doc(db, 'users', currentUser?.id);
      await updateDoc(userDocRef, {
        username,
      });
      currentUser.username = username
      console.log('username successfully updated!');
      toast.success('Username updated')
    } catch (error) {
      console.log(error)
      toast.error('Error updating username')
    } finally {
      setEditUsername(false)
      setUpdatingUsername(false)
    }
  }

  const handleUpdatePassword = async () => {
    try {
      setUpdatingPassword(true)
      const isValid = passwordRegex.test(password)
      if (!isValid) return toast.error('Password must be at least 6 characters and contain no spaces')
      const res = await updatePassword(auth.currentUser, password);
      console.log(res)
      toast.success('Password updated')

    } catch (error) {
      console.log(error)
      toast.error('Error updating password')
    } finally {
      setEditPassword(false)
      setUpdatingPassword(false)
    }
  }

  const handleInputChange = (e) => {
    console.log(e.target.files[0])
    setImage({ file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) })
  }

  const handleUpdateProfileImage = async () => {
    setUpdatingProfileImage(true)
    try {
      if (currentUser.avatar) {
        const oldImageRef = ref(storage, currentUser.avatar);
        await deleteObject(oldImageRef);
      }
      const newImageUrl = await upload(image.file);
      const userDocRef = doc(db, 'users', currentUser?.id);
      await updateDoc(userDocRef, { avatar: newImageUrl });
      setProfileImage(newImageUrl)
      currentUser.avatar = newImageUrl
      console.log('Profile picture updated successfully!');
      toast.success('Profile updated')
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error('Error updating profile image')
    } finally {
      setUpdatingProfileImage(false)
      setImage({
        file: '',
        url: ''
      })

    }
  }


  return (
    <div className={`absolute z-50 h-screen  bg-slate-900 ${openSideMenu ? "" : "-translate-x-full "}  w-full sm:w-96 sm:border-r border-slate-700/80 flex flex-col gap-6 py-4 px-6 duration-200 ease-in-out`}>
      <span className='absolute block right-4 top-4 sm:hidden'>
        <button
          aria-label='close'
          onClick={() => setOpenSideMenu(false)}
          className='opacity-80'
        >
          <CloseButton />
        </button>
      </span>
      <p className='text-2xl font-bold text-center'>
        Profile
      </p>
      <div className='relative flex justify-center mt-16 sm:mt-10'>
        <div className='rounded-full size-[200px] aspect-square relative group '>
          <img
            src={image.url || profileImage || "/profileImage.webp"}
            alt="profile image"
            width='240'
            height='240'
            className='rounded-full size-[200px] aspect-square object-cover object-center'
          />
          {!updatingProfileImage &&
            <label htmlFor='profile_image' className='absolute inset-0 flex items-center justify-center duration-200 rounded-full opacity-0 cursor-pointer bg-black/80 group-hover:opacity-100'>
              Update Profile Photo
            </label>
          }
          <input
            aria-label="profile image"
            id='profile_image'
            type="file"
            hidden
            onChange={(e) => handleInputChange(e)}
          />
        </div>
        {image.url &&
          <button
            aria-label={'save profile image'}
            disabled={updatingProfileImage}
            onClick={handleUpdateProfileImage}
            className='absolute bottom-0 z-50 flex items-center justify-center p-2 transition-colors translate-x-full rounded-full translate-y-1/4 bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-500'
          >
            {
              updatingProfileImage ?
                <LoadingIndicator className='size-8' /> :
                <Tick className='size-8' />
            }
          </button>
        }

      </div>
      <div className='flex flex-col space-y-4'>
        <span className='text-sm text-cyan-400'>
          Name
        </span>
        <div className='flex items-center justify-between gap-4'>
          <input
            aria-label="Username"
            disabled={!editUsername}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`border-b-2  bg-transparent outline-none w-full ${editUsername ? 'border-gray-500 focus:border-cyan-400' : 'border-transparent'} text-lg`}
          />
          {updatingUsername ?
            <LoadingIndicator /> :
            !editUsername ?
              <button
                aria-label='Edit username'
                title='Click to edit username'
                onClick={() => {
                  setEditUsername(!editUsername)
                }}
                className='text-sm opacity-80'
              >
                <EditIcon className='size-4' />
              </button> :
              <button
                aria-label='Save username'
                title='Click to save'
                onClick={handleUpdateUsername}
                className='opacity-80'
              >
                <Tick />
              </button>
          }
        </div>
      </div>
      <div className='flex flex-col mt-4 space-y-4'>
        <span className='text-sm text-cyan-400'>
          Email
        </span>
        <input
          aria-label="Email"
          value={currentUser?.email}
          type="text"
          disabled
          className='w-full text-lg bg-transparent'
        />
      </div>
      <div className='flex flex-col mt-4 space-y-4'>
        <span className='text-sm text-cyan-400'>
          Password
        </span>
        <div className='flex items-center justify-between gap-4 '>
          <input
            aria-label="Password"
            value={password}
            type="text"
            disabled={!editPassword}
            onChange={(e) => setPassword(e.target.value)}
            className={`border-b-2  bg-transparent outline-none w-full ${editPassword ? 'border-gray-500 focus:border-cyan-400' : 'border-transparent'} text-lg`}
          />
          {updatingPassword ?
            <LoadingIndicator /> : !editPassword ?
              <button
                aria-label='Update password'
                title='Click to update password'
                onClick={() => {
                  setEditPassword(!editPassword)
                  setPassword('')
                }}
                className='text-sm opacity-80'
              >
                <EditIcon className='size-4' />
              </button> :
              <button
                aria-label='Save password'
                title='Click to save '
                onClick={handleUpdatePassword}
                className='opacity-80'
              >
                <Tick />
              </button>
          }
        </div>
      </div>
    </div>
  )
}

export default SideBar
