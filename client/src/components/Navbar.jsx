import React, { useContext, useEffect } from 'react'
import { assets } from '../assets/assets/assets'
import {Link} from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { AppContext } from '../context/appContext'


const Navbar = () => {

    const { openSignIn } = useClerk()
    const { isSignedIn, user } = useUser()
    const { credits, fetchCredits } = useContext(AppContext)

    useEffect(() => {
        if (isSignedIn) {
            fetchCredits()
        }
    }, [isSignedIn, fetchCredits])

  return (
    <div className='flex items-center justify-between mx-4 py-3 lg:mx-44'>
    <Link to='/'><img className='w-32 sm:w-44'src= {assets.logo} alt="" /></Link>
    {
      isSignedIn
      ? <div className='flex items-center gap-4'>
        <Link to='/buy' className='flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition'>
            <img className='w-4' src={assets.credit_icon} alt="" />
            <span className='text-sm font-medium'>Credits: {credits}</span>
        </Link>
        <UserButton/>
      </div>
      :<button onClick={() => openSignIn({})} className='flex items-center gap-2 px-5 py-2 bg-black text-white text-sm rounded-full hover:bg-zinc-800 transition'> 
        Get Started! 
        <img className='w-3 sm:w-4' src={assets.arrow_icon} alt="" />
      </button>
    }
    </div>
  )
}

export default Navbar
