import React, { useState }from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Validation from './SignupValidation';
import axios from 'axios'
import backgroundImage from './image/homepage.jpeg';
import './Login.css'
import nusbbImage from './image/NUSBB.png';

function Signup() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: ''
  })

  const navigate = useNavigate();

  const [errors, setErrors] = useState({})

  const handleInput=(event)=>{
    setValues(prev=>({...prev, [event.target.name]: event.target.value}))
  }

  const handleSubmit=(event)=>{
    event.preventDefault();
    const err = Validation(values);
    setErrors(err);
    if(errors.name ==="" && errors.email ==="" && errors.password ===""){
      axios.post('https://testnusbb-git-main-jurongs-projects.vercel.app/signup', values)
      .then(res => 
        navigate('/')
      )
      .catch(err => console.log(err));
    }
  }

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className='d-flex justify-content-center align-items-center vh-100'>
        <div className='main-box left-align d-flex flex-row justify-content-between align-items-center'>
        <div>
            <img src={nusbbImage} alt="NUSBB" className='move-left' />
        </div>
        <div className='d-flex flex-column justify-content-center align-items-center move-left'>
            <h2 style={{ color: "White", fontFamily: 'Roboto, sans-serif' }}>Sign up</h2>
            <form action="" onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor="name" className='white-text'><strong>Name</strong></label>
                    <input type="name" placeholder='Enter Name' name='name'
                    onChange={handleInput} className='form-control rounded-0 small-input'/>
                    {errors.name && <span className='text-danger'>{errors.name}</span>}
                </div>
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
                <button className='btn btn-primary w-100 rounded-0'>Sign up</button>
                <p className='white-text'>Discover NUS Computing toilets with us!</p>
                <Link to="/" className='btn btn-default border w-100 bg-light rounded-0 text-decoration-none'>Login</Link>
            </form>
            </div>
            
        </div>
    </div>
  )
}

export default Signup