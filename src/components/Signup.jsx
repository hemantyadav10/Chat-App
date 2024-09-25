import { createUserWithEmailAndPassword } from 'firebase/auth'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { auth, db } from '../lib/firebase'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import upload from '../lib/upload'
import { useForm } from 'react-hook-form'
import EyeIcon from '../assets/EyeIcon';
import EyeOffIcon from '../assets/EyeOffIcon';
import { useUserStore } from '../lib/userStore'


function Signup({ setIsLoginPage }) {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  })
  const [loading, setLoading] = useState(false);

  const { register, formState: { errors }, handleSubmit, reset, clearErrors } = useForm()
  const [showPassword, setShowPassword] = useState(false);
  const { fetchUserInfo } = useUserStore()


  const handleAvatar = (e) => {
    setAvatar({
      file: e.target.files[0],
      url: URL.createObjectURL(e.target.files[0])
    })
  }

  const handleSignup = async (data) => {
    if (!avatar.file) return toast.error('Profile image is required.');
    console.log('hello')
    try {
      setLoading(true)

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", data.username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return toast.warn("Username is already taken.");
      }

      const response = await createUserWithEmailAndPassword(auth, data.email, data.password);

      const imageUrl = await upload(avatar.file)

      await setDoc(doc(db, "users", response.user.uid), {
        username: data.username,
        email: data.email,
        id: response.user.uid,
        blocked: [],
        avatar: imageUrl,
        online: false
      })

      await setDoc(doc(db, "userchats", response.user.uid), {
        chats: [],
      })

      toast.success('Account created.')
      fetchUserInfo(response.user.uid)
      reset();
      clearErrors();


    } catch (error) {
      console.error(error)
      toast.error('Email already in use.')
    } finally {
      setLoading(false)
      // setIsLoginPage(true)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleSignup)}
      className='flex flex-col gap-6'
    >
      <label
        htmlFor="file"
        className='relative flex items-center justify-center gap-8 transition-opacity hover:opacity-70'
      >
        <img
          src={avatar.url || '/profileImage2.webp'}
          alt="avatar"
          className='object-cover object-center rounded-full cursor-pointer size-16 '
        />
      </label>
      <input
        type="file"
        id="file"
        onChange={handleAvatar}
        accept="image/*"
        hidden
      />
      <div>
        <input
          {...register('username', {
            required: 'Username is required.',
            minLength: {
              value: 2,
              message: 'Username must be atleast 2 characters long.'
            }
          })}
          id='username'
          placeholder='Username'
          type="text"
          className={`w-full p-2 bg-transparent border-b-2 border-gray-500 outline-none  ${errors.username ? 'focus:border-red-400 border-red-400/80' : 'focus:border-cyan-500 border-gray-500'}`}

        />
        {errors.username && <div className='mt-2 text-xs text-red-400'>{errors.username.message}</div>}

      </div>
      <div>
        <input
          {...register('email', {
            required: 'Email is required.',
            pattern: {
              value: /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:\\[\x01-\x7F]|[^\x01-\x7F"])*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z0-9]{2,}$/i,
              message: 'Email is not valid.'
            }
          })}
          id='email'
          placeholder='Email'
          type="text"
          className={`w-full p-2 bg-transparent border-b-2 border-gray-500 outline-none  ${errors.email ? 'focus:border-red-400 border-red-400/80' : 'focus:border-cyan-500 border-gray-500'}`}

        />
        {errors.email && <div className='mt-2 text-xs text-red-400'>{errors.email.message}</div>}

      </div>
      <div >
        <div className='relative'>
          <input
            id='password'
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password should be atleast 6 characters long.'
              }
            })}
            placeholder='Password'
            type={showPassword ? 'text' : 'password'}
            className={`w-full p-2 bg-transparent border-b-2 border-gray-500 outline-none  ${errors.password ? 'focus:border-red-400 border-red-400/80' : 'focus:border-cyan-500 border-gray-500'}`}
          />
          <span className='absolute right-0 flex items-center justify-center -translate-y-1/2 rounded-full top-1/2'>
            <button
              aria-label='toggle password visibility'
              type='button'
              className='p-2 text-gray-400'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          </span>

        </div>
        {errors.password && <div className='mt-2 text-xs text-red-400'>{errors.password.message}</div>}
      </div>

      <button
        type='submit'
        disabled={loading}
        className={`w-full p-2 transition-colors  rounded-xl bg-cyan-600  ${loading ? 'bg-cyan-700/50 cursor-default' : ' hover:bg-cyan-700 active:bg-cyan-800'}`}
      >
        {loading ? "Loading..." : "Sign up"}
      </button>
      <div className='flex items-center text-sm '>
        <p className='opacity-70'>Already have an account?</p>
        <p onClick={() => setIsLoginPage(true)} className='mx-1 cursor-pointer text-cyan-500 hover:underline'>Login here</p>
      </div>
    </form>
  )

}

export default Signup
