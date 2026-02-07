import React from 'react'
import { assets, testimonialsData } from '../assets/assets/assets'

const Testimonials = () => {
  return (
    <div>
      <h1 className='text-center text-2xl md:text-3xl lg:text-4xl font-semibold'>Customer Testimonials</h1> 

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto px-4 py-8">
        {testimonialsData.map((item, index) => (
        <div
        key={index}
        className="bg-white border rounded-lg p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
        <p className="text-5xl font-bold text-gray-300 leading-none mb-2">"</p>
        <p className="text-gray-700 mb-4">{item.text}</p>
        <div className="flex items-center gap-3">
            <img
            src={item.image}
            alt={item.author}
            className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
            <div>
                <p className="font-semibold">{item.author}</p>
                <p className="text-sm text-gray-500">{item.jobTitle}</p>
            </div>
            </div>
        </div>
        ))}
    </div>



    </div>
  )
}

export default Testimonials
