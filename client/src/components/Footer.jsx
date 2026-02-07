import React from 'react'
import { assets } from '../assets/assets/assets'

const Footer = () => {
  return (
<div className="flex flex-col">
  <footer >
    <div className="flex items-center justify-between mx-4 py-3 lg:mx-44">
      <img src={assets.logo} alt="Logo" className="h-8" />

      <p className="text-sm text-gray-600 text-center flex-1">
        Copyright © deepVegad.ssjb | All rights reserved.
      </p>

      <div className="flex items-center gap-4">
        <img
          width={28}
          src={assets.facebook_icon}
          alt="Facebook"
          className="cursor-pointer hover:scale-110 hover:opacity-80 transition duration-300"
        />
        <img
          width={28}
          src={assets.twitter_icon}
          alt="Twitter"
          className="cursor-pointer hover:scale-110 hover:opacity-80 transition duration-300"
        />
        <img
          width={28}
          src={assets.google_plus_icon}
          alt="Google+"
          className="cursor-pointer hover:scale-110 hover:opacity-80 transition duration-300"
        />
      </div>
    </div>
  </footer>
</div>


  )
}

export default Footer
