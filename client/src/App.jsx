import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Result from './pages/Result'
import BuyCredit from './pages/BuyCredit'
import Success from './pages/Success'
import Cancel from './pages/Cancel'
import Navbar from './components/Navbar'
import Footer from './components/Footer'


const App = () => {
  return (
    <div className='min-h-screen bg-slate-50'>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>} />    
        <Route path='/result' element={<Result/>} />  
        <Route path='/buy' element={<BuyCredit/>} />  
        <Route path='/success' element={<Success/>} />
        <Route path='/cancel' element={<Cancel/>} />
      </Routes>
      <Footer/>
    </div>
  )
}

export default App
