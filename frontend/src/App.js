import React, {useState} from 'react'
import Login from './Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './Signup'
import Home from './Home'
import Reports from './Reports'
import Reviews from './Reviews'
import UserContext from './UserContext';
import ViewReports from './ViewReports';
import Leaderboard from './Leaderboard';
import Profile from './Profile';


function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);

  return (
    <UserContext.Provider value={{ userId, setUserId, userEmail, setUserEmail }}>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/home' element={<Home />}></Route>
        <Route path='/reviews' element={<Reviews />}></Route>
        <Route path='/viewreports' element={<ViewReports />}></Route>
        <Route path='/leaderboard' element={<Leaderboard />}></Route>
        <Route path='/profile/:userId' element={<Profile />}></Route>
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
    </UserContext.Provider>
  )
}



export default App
