import React, { useContext, useRef } from 'react'
import { assets } from '../assets/assets/assets'
import { AppContext } from '../context/appContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'

const Upload = () => {
  const { removeBackground, isProcessing, error, setError } = useContext(AppContext)
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB')
      return
    }
    
    if (!isSignedIn) {
      setError('Please sign in to use this feature')
      return
    }
    
    // Process the image
    const success = await removeBackground(file)
    
    if (success) {
      navigate('/result')
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    if (!isSignedIn) {
      setError('Please sign in to upload images')
      return
    }
    fileInputRef.current?.click()
  }

  return (
    <div>
        <br/>
      <h1 className='text-center text-2xl md:text-3xl lg:text-4xl font-semibold'>See the Magic. Try Now!!</h1>
        <br/>
       <div className='text-center mb-24'>
            <input 
              type="file" 
              ref={fileInputRef}
              id="upload2" 
              hidden 
              accept="image/*"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <button 
              className={`inline-flex gap-3 px-8 py-3.5 rounded-full cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-500 m-auto hover:scale-105 transition-all duration-700 disabled:opacity-50 disabled:cursor-not-allowed ${isProcessing ? 'animate-pulse' : ''}`}
              onClick={handleUploadClick}
              disabled={isProcessing}
            >
                <img width={20} src={assets.upload_btn_icon} alt="" /> 
                <p className='text-white text-sm'>
                  {isProcessing ? 'Processing...' : 'Upload your image!!'}
                </p>
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-md mx-auto">
                {error}
              </div>
            )}
        </div>
    </div>
  )
}

export default Upload
