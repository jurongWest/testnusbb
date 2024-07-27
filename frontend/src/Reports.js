import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AsyncSelect from 'react-select/async';
import UserContext from './UserContext';

function Reports() {
  const { userEmail } = useContext(UserContext);

  const [values, setValues] = useState({
    toiletName: '',
    comments: ''
  })
  const [errors, setErrors] = useState({})

  const navigate = useNavigate();

  const [submitSuccess, setSubmitSuccess] = useState(false); // State variable to store success message

  const [formKey, setFormKey] = useState(0);

  const handleInput=(event)=>{
    if (event.target.name === 'comments' && event.target.value.length === 500) {
      alert('You have reached the maximum character limit of 500.');
    } else {
      setValues(prev=>({...prev, [event.target.name]: event.target.value}))
    }
  }

  const loadOptions = (inputValue, callback) => {
    axios.get(`https://testnusbb-git-main-jurongs-projects.vercel.app/toiletdata`)
      .then(res => {
        const options = res.data.map(toilet => ({ value: toilet.toiletname, label: toilet.toiletname }));
        options.sort((a, b) => a.label.localeCompare(b.label));
        callback(options);
      });
  };

  const validate = () => {
    let newErrors = {};
  
    // Check if toiletName is not empty
    if (!values.toiletName.trim()) {
      newErrors.toiletName = "Toilet name is required";
    }
  
    // Check if comments is not empty
    if (!values.comments.trim()) {
      newErrors.comments = "Comments are required";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(userEmail);
    if (validate()) {
      axios.post('https://testnusbb-git-main-jurongs-projects.vercel.app/reports', { ...values, useremail: userEmail[0] })
        .then(res => {
          
          navigate('/reports');
          // Clear the form
          setValues({
            toiletName: '',
            comments: ''
          });
          // Set submitSuccess to true
          setSubmitSuccess(true);
          // Change the form key to force a re-render
          setFormKey(prevKey => prevKey + 1);
        })
        .catch(err => {
          console.log(err);
          // Set submitSuccess to false
          setSubmitSuccess(false);
        });
    }
  };

  return (
    <div style={{ backgroundColor: 'white' }} className='d-flex justify-content-center align-items-center vh-100'>
        <div className='bg-white p-3 rounded' style={{ width: '500px' }}>
            <h2 style={{ fontFamily: 'Roboto, sans-serif' }}>Submit a Report</h2>
            {submitSuccess && <p className='text-success'>Report submitted successfully!<br />
            We will email you when your report has been attended to.</p>}
            <form action="" onSubmit={handleSubmit} key={formKey}>
                <div className='mb-3'>
                    <label><strong>Toilet Name</strong></label>
                    <AsyncSelect 
            cacheOptions 
            defaultOptions 
            loadOptions={loadOptions} 
            onChange={option => setValues({ ...values, toiletName: option.label })} 
            className='form-control rounded-0'
          />
                    {errors.toiletName && <span className='text-danger'>{errors.toiletName}</span>}
                </div>
                <div className='mb-3'>
                    <label><strong>Report Details (500 Character Limit) </strong></label>
                    <textarea placeholder='Enter Comments' name='comments'
                    onChange={handleInput} className='form-control rounded-0' maxLength={500}/>
                    {errors.comments && <span className='text-danger'>{errors.comments}</span>}
                </div>
                <button className='btn btn-primary w-100 rounded-0'>Submit</button>  
                <Link to="/home" className="btn btn-secondary w-100 rounded-0 mt-2">Return to Home</Link>              
            </form>
        </div>
    </div>
  );
}

export default Reports;