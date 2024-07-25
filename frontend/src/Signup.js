import React, { useState }from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Validation from './SignupValidation';
import axios from 'axios'
import backgroundImage from './image/homepage.jpeg';
import './Signup.css'
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

  const [showPassword, setShowPassword] = useState(false);

  const [serverError, setServerError] = useState('');

  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const err = Validation(values);
    setErrors(err);
    if(err.name ==="" && err.email ==="" && err.password ===""){
      axios.post('https://testnusbb-git-main-jurongs-projects.vercel.app/signup', values)
      .then(res => {
          if (res.data.error) {
              // Set the server error for the appropriate field
              setErrors(prevErrors => ({ ...prevErrors, [res.data.field]: res.data.error }));
          } else {
            console.log('Setting success message');
              setSuccessMessage('You have successfully created an account!');
          }
      })
      .catch(err => {
          if (err.response && err.response.data) {
              console.log('Caught an error', err);
              setErrors(prevErrors => ({ ...prevErrors, [err.response.data.field]: err.response.data.error }));
          } else {
              console.log(err);
          }
      });
    }
}

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className='d-flex justify-content-center align-items-center vh-100'>
      <img src={nusbbImage} alt="NUSBB" className="signup-logo" style={{ position: 'absolute', top: '10px', left: '10px', width: '70px', height: 'auto', objectFit: 'contain' }} />
        <div className='main-box left-align d-flex flex-column justify-content-between align-items-center'>
        <div>
        </div>
        <div className='d-flex flex-column justify-content-center align-items-center signup'>
            <h2 style={{ color: "White", fontFamily: 'Roboto, sans-serif' }}>Sign up</h2>
            <form action="" onSubmit={handleSubmit}>
            {successMessage && <div className='text-success'>{successMessage}</div>}
                <div className='mb-3'>
                    <label htmlFor="name" className='white-text'><strong>Name</strong></label>
                    <input type="name" placeholder='Enter Name' name='name'
                    onChange={handleInput} className='form-control rounded-0 signup-small-input'/>
                    {errors.name && <span className='text-danger'>{errors.name}</span>}
                    {serverError.includes('Username') && <span className='text-danger'>{serverError}</span>}
                </div>
                <div className='mb-3'>
                    <label htmlFor="email" className='white-text'><strong>Email</strong></label>
                    <input type="email" placeholder='Enter Email' name='email'
                    onChange={handleInput} className='form-control rounded-0 small-input'/>
                    {errors.email && <span className='text-danger'>{errors.email}</span>}
                    {serverError.includes('Email') && <span className='text-danger'>{serverError}</span>}
                </div>
                <div className='mb-3 position-relative'>
                  <label htmlFor="password" className='white-text'><strong>Password</strong></label>
                  <input type={showPassword ? "text" : "password"} placeholder='Enter Password' name='password'
                  onChange={handleInput} className='form-control rounded-0 small-input'/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} 
                    style={{ position: 'absolute', top: '70%', right: '10px', transform: 'translateY(-50%)' }}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
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