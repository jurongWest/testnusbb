import React, {useState} from 'react'
import Login from './Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './Signup'
import Home from './Home'
import Reports from './Reports'
import Reviews from './Reviews'
import UserContext from './UserContext';
import ViewReports from './ViewReports'


function App() {
  const [userEmail, setUserEmail] = useState(null);
  return (
    <UserContext.Provider value={{ userEmail, setUserEmail }}>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/home' element={<Home />}></Route>
        <Route path='/reviews' element={<Reviews />}></Route>
        <Route path='/viewreports' element={<ViewReports />}></Route>
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
    </UserContext.Provider>
  )
}



export default App
