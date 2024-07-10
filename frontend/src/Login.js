import React, { useState, useContext } from 'react'
import { Link, useNavigate} from 'react-router-dom'
import Validation from './LoginValidation';
import axios from 'axios'
import UserContext from './UserContext';
import './Login.css'
import backgroundImage from './image/homepage.jpeg';
import nusbbImage from './image/NUSBB.png';

function Login() {
    const [values, setValues] = useState({
        email: '',
        password: ''
    })

    const navigate = useNavigate();

    const [errors, setErrors] = useState({})

    const { setUserEmail } = useContext(UserContext);

    const handleInput=(event)=>{
        setValues(prev=>({...prev, [event.target.name]: [event.target.value]}))
    }

    const handleSubmit=(event)=>{
        event.preventDefault();
        setErrors(Validation(values));
        if(errors.email === "" && errors.password ===""){
            axios.post('https://testnusbb-git-main-jurongs-projects.vercel.app/login', values)
            .then(res => {
                if(res.data.message === "Login Success") {
                    setUserEmail(values.email);
                    // Assuming the role is returned in the response data
                    if (res.data.role === 'admin') {
                        navigate('/viewreports');
                    } else {
                        navigate('/home');
                    }
                } else {
                    console.log(res.data)
                    alert("No record exists")
                }
            })
            .catch(err => console.log(err));
          }
    }

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className='d-flex justify-content-center align-items-center vh-100'>
        <div className='main-box left-align d-flex flex-row justify-content-center align-items-center' >
        <div className='d-flex flex-column justify-content-center align-items-center'>
            <h2 style={{ color: "White", fontFamily: 'Roboto, sans-serif' }}>Login</h2>
            <form action="" onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor="email" className='white-text'><strong>Email</strong></label>
                    <input type="email" placeholder='Enter Email' name='email'
                    onChange={handleInput} className='form-control rounded-0 small-input'/>
                    {errors.email && <span className='text-danger'>{errors.email}</span>}
                </div>
                <div className='mb-3'>
                    <label htmlFor="password" className='white-text'><strong>Password</strong></label>
                    <input type="password" placeholder='Enter Password' name='password'
                    onChange={handleInput} className='form-control rounded-0 small-input'/>
                    {errors.password && <span className='text-danger'>{errors.password}</span>}
                </div>
                <button type='submit' className='btn btn-primary w-100 rounded-0'>Login</button>
                <p className='white-text'>Time to check out the toilets of NUS Computing!</p>
                <Link to="/signup" className='btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>Create New Account</Link>
            </form>
            </div>
            <div>
            <img src={nusbbImage} alt="NUSBB" className='ml-auto move-right login-logo' style={{ height: 'auto', objectFit: 'contain' }} />
            </div>
        </div>
    </div>
  )
}

export default Login