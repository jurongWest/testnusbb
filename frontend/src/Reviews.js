import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactStars from "react-rating-stars-component";
import AsyncSelect from 'react-select/async';
import UserContext from './UserContext';

function Review() {
  const { userEmail } = useContext(UserContext);

  const [values, setValues] = useState({
    toiletName: '',
    rating: 0,
    comments: ''
  })
  const [errors, setErrors] = useState({})

  const navigate = useNavigate();

  const [submitSuccess, setSubmitSuccess] = useState(false); // State variable to store success message

  const [formKey, setFormKey] = useState(0);

  const handleInput=(event)=>{
    setValues(prev=>({...prev, [event.target.name]: event.target.value}))
  }

  const loadOptions = (inputValue, callback) => {
    axios.get(`http://localhost:8081/toiletdata?search=${inputValue}`)
      .then(res => {
        const options = res.data
          .map(toilet => ({ value: toilet.toiletname, label: toilet.toiletname }))
          .sort((a, b) => a.label.localeCompare(b.label)); // sort options alphabetically
        callback(options);
      });
};

  const validate = () => {
    let newErrors = {};
  
    // Check if toiletName is not empty
    if (!values.toiletName.trim()) {
      newErrors.toiletName = "Toilet name is required";
    }
  
    // Check if rating is not 0
    if (!values.rating) {
      newErrors.rating = "Rating is required";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      axios.post('http://localhost:8081/reviews', { ...values, email: userEmail })
        .then(res => {
          
          navigate('/reviews');
          // Clear the form
          setValues({
            toiletName: '',
            rating: 0,
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
            <h2 style={{ fontFamily: 'Roboto, sans-serif' }}>Submit a Review</h2>
            {submitSuccess && <p className='text-success'>Review submitted successfully!</p>}
            <form action="" onSubmit={handleSubmit} key={formKey}>
                <div className='mb-3'>
                    <label><strong>Toilet Name</strong></label>
                    <AsyncSelect 
                      cacheOptions 
                      defaultOptions 
                      loadOptions={loadOptions} 
                      onChange={option => setValues({ ...values, toiletName: option.label })} 
                      className='form-control rounded-0'
                      isSearchable={true}
                    />
                    {errors.toiletName && <span className='text-danger'>{errors.toiletName}</span>}
                </div>
                <div className='mb-3'>
                    <label htmlFor="rating"><strong>Rating</strong></label>
                      <ReactStars
                        count={5}
                        value={values.rating}
                        onChange={newRating => {
                        setValues({ ...values, rating: newRating });
                      }}
                      size={24}
                      activeColor="#ffd700"
                    />
                    {errors.rating && <span className='text-danger'>{errors.rating}</span>}
                </div>
                <div className='mb-3'>
                    <label><strong>Comments</strong></label>
                    <textarea placeholder='Enter Comments' name='comments'
                    onChange={handleInput} className='form-control rounded-0'/>
                    {errors.comments && <span className='text-danger'>{errors.comments}</span>}
                </div>
                <button className='btn btn-primary w-100 rounded-0'>Submit</button>                
            </form>
        </div>
    </div>
  );
}

export default Review;