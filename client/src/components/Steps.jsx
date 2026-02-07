import React from 'react'
import { assets } from '../assets/assets/assets'

const Steps = () => {
  return (
    <div className='mx-4 lg:mx-44 py-20 xl:py-44'>
    <h1 className='text-center text-2xl md:text-3xl lg:text-4xl font-semibold'>
        Steps to Remove background <br/> image in seconds
    </h1>
      <div className='flex items-start flex-warp gap-4 mt-16 x1:mt-24 justify-center'>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="flex flex-col items-start gap-4 bg-white border drop-shadow-md p-7 pb-10 rounded hover:scale-105 transition-all duration-500 h-full">
    <img className="w-9 h-9" src={assets.upload_icon} alt="" />
      <div>
        <p className="text-xl font-medium">Upload Image</p>
        <p className="text-sm text-neutral-500 mt-1">Step 1 - upload your image</p>
      </div>
    </div>

    <div className="flex flex-col items-start gap-4 bg-white border drop-shadow-md p-7 pb-10 rounded hover:scale-105 transition-all duration-500 h-full">
      <img className="w-9 h-9" src={assets.remove_bg_icon} alt="" />
        <div>
          <p className="text-xl font-medium">Remove Background</p>
          <p className="text-sm text-neutral-500 mt-1">Step 2 - remove the background</p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 bg-white border drop-shadow-md p-7 pb-10 rounded hover:scale-105 transition-all duration-500 h-full">
        <img className="w-9 h-9" src={assets.download_icon} alt="" />
          <div>
            <p className="text-xl font-medium">Download Image</p>
            <p className="text-sm text-neutral-500 mt-1">Step 3 - download the image</p>
          </div>
        </div>
      </div>



      </div>
    </div>
  )
}

export default Steps
