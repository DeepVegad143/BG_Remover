import React, { useState, useContext } from 'react'
import { assets } from '../assets/assets/assets'
import { AppContext } from '../context/appContext'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const Header = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { removeBackground, credits, fetchCredits } = useContext(AppContext);
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  }

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;
    
    if (!isSignedIn) {
      alert('Please sign in to remove backgrounds.');
      return;
    }

    if (credits < 1) {
      alert('Insufficient credits. Please purchase more credits.');
      navigate('/buy');
      return;
    }

    setProcessing(true);
    
    try {
      const success = await removeBackground(selectedFile);
      if (success) {
        navigate('/result');
      }
    } catch (error) {
      console.error('Background removal failed:', error);
    } finally {
      setProcessing(false);
    }
  }

  const redirectToBuy = () => {
    navigate('/buy');
  }

  return (
    <div className='flex flex-col lg:flex-row items-center justify-between gap-y-10 px-4 mt-10 lg:px-44 sm:mt-20'>
      {/* Left side: text + buttons */}
      <div className='flex-1'>
        <h1 className='text-4xl xl:text-5xl 2xl:text-6xl font-bold text-neutral-700 leading-tight'>
          Remove the <br className='max-md:hidden'/> 
          <span className='bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent'>
            Background
          </span> 
          from <br className='max-md:hidden'/> images for free.
        </h1>
        <p className='my-6 text-[15px] text-gray-500'>
          Say goodbye to messy backgrounds. <br className='max-sm:hidden'/>
          One click and your image is ready to shine.
        </p>

        {/* First line: Large Upload button (LEFT aligned now) */}
        <div className='mb-6'>
          <input 
            type="file" 
            id="upload2" 
            hidden 
            onChange={handleFileChange} 
          />
          <label 
            className='inline-flex gap-3 px-8 py-3.5 rounded-full cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:scale-105 transition-all duration-700 items-center'
            htmlFor="upload2"
          >
            <img width={20} src={assets.upload_btn_icon} alt="" /> 
            <p className='text-white text-sm'>Upload your image!!</p>
          </label>
        </div>

        {/* Second line: Two smaller buttons */}
        <div className='flex gap-4 mt-4'>
          {/* Remove Background Button */}
          <button
            onClick={handleRemoveBackground}
            disabled={!selectedFile || processing}
            className={`inline-flex gap-2 px-4 py-2 rounded-full text-white transition-all duration-700 items-center justify-center ${
              selectedFile && !processing ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:scale-105 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <p className='text-white text-sm'>Processing...</p>
              </>
            ) : (
              <p className='text-white text-sm'>Remove Background</p>
            )}
          </button>

          {/* Add Credits Button */}
          <button
            onClick={redirectToBuy}
            className='inline-flex gap-2 px-4 py-2 rounded-full text-white bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:scale-105 transition-all duration-700 items-center justify-center'
          >
            <p className='text-white text-sm'>Add Credits</p>
          </button>
        </div>
      </div>

      {/* Right side: header image */}
      <div className='w-full max-w-md flex-shrink-0'>
        <img src={assets.header_img} alt="Header" />
      </div>
    </div>
  )
}

export default Header
