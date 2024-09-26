import React, { useState } from 'react'
import Login from './Login'
import Signup from './Signup'

function Auth() {
  const [isLoginPage, setIsLoginPage] = useState(true);

  return (
    <div className='relative flex items-start justify-center w-full col-span-12 p-4 py-16 bg-black bg-center bg-cover bg-authBgImage '>
      <div className="absolute inset-0 bg-black bg-opacity-50 "></div>
      <div className='z-10 flex flex-col items-center w-full max-w-md gap-8 p-6 rounded-lg shadow-lg bg-slate-800 shadow-black'>
        <h1 className='text-2xl font-bold text-center '>
          {
            isLoginPage ?
              'Welcome Back' :
              'Create an Account'
          }
        </h1>
        <div className='relative flex w-full '>
          <button
            className={` rounded-xl z-10 w-full ${isLoginPage ? '' : 'hover:bg-slate-800 active:bg-slate-700'}   `}
            onClick={() => setIsLoginPage(true)}
          >
            Login
          </button>
          <button
            className={` rounded-xl z-10 w-full py-2 ${!isLoginPage ? '' : 'hover:bg-slate-800 active:bg-slate-700'}  `}
            onClick={() => setIsLoginPage(false)}
          >
            Sign up
          </button>
          <div className={`absolute rounded-xl w-1/2 h-full bg-cyan-600 ${isLoginPage ? '' : 'translate-x-full'} duration-300`}></div>
        </div>
        <div className='w-full '>
          {isLoginPage ?
            <Login setIsLoginPage={setIsLoginPage} /> :
            <Signup setIsLoginPage={setIsLoginPage} />
          }
        </div>
      </div>
    </div>
  )
}

export default Auth
