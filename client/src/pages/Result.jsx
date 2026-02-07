import React, { useContext, useEffect } from 'react'
import { assets } from '../assets/assets/assets'
import { AppContext } from '../context/appContext'
import { useNavigate } from 'react-router-dom'

const Result = () => {
  const { originalImage, processedImage, isProcessing, resetImages } = useContext(AppContext)
  const navigate = useNavigate()

  // Redirect if no images are available
  useEffect(() => {
    if (!originalImage && !isProcessing) {
      navigate('/')
    }
  }, [originalImage, isProcessing, navigate])

  const handleTryAnother = () => {
    resetImages()
    navigate('/')
  }

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a')
      link.href = processedImage
      link.download = 'bg_removed.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (!originalImage && !isProcessing) {
    return null
  }

  return (
<div className="mx-4 my-3 lg:mx-44 mt-14 min-h-[72vh]">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

    {/* Left Side */}
    <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md">
      <p className="font-semibold text-gray-600 mb-2">Original</p>
      <div className="w-full h-80 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
        {originalImage ? (
          <img
            className="rounded-md border max-w-full max-h-full object-contain"
            src={originalImage}
            alt="Original"
          />
        ) : (
          <div className="text-gray-400">Loading...</div>
        )}
      </div>
    </div>

    {/* Right Side */}
    <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-md relative">
      <p className="font-semibold text-gray-600 mb-2">Background Removed</p>
      <div className="w-full h-80 rounded-lg border border-gray-300 relative bg-gray-50 overflow-hidden flex items-center justify-center">
        {isProcessing ? (
          <div className="absolute right-1/2 bottom-1/2 transform translate-x-1/2 translate-y-1/2">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : processedImage ? (
          <img
            className="rounded-md max-w-full max-h-full object-contain"
            src={processedImage}
            alt="Background Removed"
          />
        ) : (
          <div className="text-gray-400">Processing...</div>
        )}
      </div>
    </div>
  </div>

  <div className="flex justify-center items-center gap-4 mt-6">
    {/* Try Another Image Button */}
    <button 
      onClick={handleTryAnother}
      className="px-5 py-2 bg-violet-600 text-white font-medium rounded-lg shadow-md hover:bg-violet-700 transition duration-300"
    >
      Try Another Image
    </button>

    {/* Download Image Button */}
    {processedImage && (
      <button
        onClick={handleDownload}
        className="px-5 py-2 border border-violet-600 text-violet-600 font-medium rounded-lg hover:bg-violet-600 hover:text-white transition duration-300"
      >
        Download Image
      </button>
    )}
  </div>

</div>

  )
}

export default Result
