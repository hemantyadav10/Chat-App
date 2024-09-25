import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { toast } from 'react-toastify';
import { auth, db } from '../lib/firebase'
import { doc, updateDoc } from 'firebase/firestore';
import EyeIcon from '../assets/EyeIcon';
import EyeOffIcon from '../assets/EyeOffIcon';
import { useForm } from 'react-hook-form';

function Login({ setIsLoginPage }) {
  const { register, formState: { errors }, handleSubmit, reset, clearErrors } = useForm()
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)

  const handleLogin = async (data) => {
    setLoading(true)
    try {
      const res = await signInWithEmailAndPassword(auth, data.email, data.password)
      const userRef = doc(db, 'users', res.user.uid);
      await updateDoc(userRef, {
        online: true,
      });
      reset()
      clearErrors()
    } catch (error) {
      console.log(error.message)
      toast.error('Invalid Credentials')
    } finally {
      setLoading(false)
    }
  }


  return (
    <form
      onSubmit={handleSubmit(handleLogin)}
      className='flex flex-col gap-6'
    >
      <div>
        <input
          aria-label='email'
          id='email'
          placeholder='Email'
          {...register('email', {
            required: 'Email is required.',
            pattern: {
              value: /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:\\[\x01-\x7F]|[^\x01-\x7F"])*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z0-9]{2,}$/i,
              message: 'Email is not valid.'
            }
          })}
          type="text"
          className={`w-full p-2 bg-transparent border-b-2 border-gray-500 outline-none  ${errors.email ? 'focus:border-red-400 border-red-400/80' : 'focus:border-cyan-500 border-gray-500'}`}
        />
        {errors.email && <div className='mt-2 text-xs text-red-400'>{errors.email.message}</div>}
      </div>
      <div >
        <div className='relative'>
          <input
            aria-label='password'
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
              title={showPassword ? 'Hide password' : 'Show password'}
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
        {loading ? "Loading..." : "Log in"}
      </button>
      <div className='flex items-center text-sm '>
        <p className='opacity-70'>Don't have an account?</p>
        <p onClick={() => setIsLoginPage(false)} className='mx-1 cursor-pointer text-cyan-500 hover:underline'>Sign up</p>
      </div>

    </form>
  )
}

export default Login
