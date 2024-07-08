import React from 'react';
import './ListItem.css';
import { Link } from 'react-router-dom';
import StarRatings from 'react-star-ratings';

function ListItem({ popUp, selected, description, averageRating, comments, onClick, ...props }) {
    console.log(comments); 
    console.log(popUp);
  return (
    <div 
    className="list-item" onClick={onClick} {...props}
    >
      <div className="venue-info-box">
        <h3>{popUp}</h3>
        <p>{description}</p>
        {averageRating ? (
        <p>Rating: <StarRatings className="star-ratings"
            rating={parseFloat(averageRating)}
            starRatedColor="#ffdb58"
            numberOfStars={5}
            name='rating'
            starDimension="20px"
            starSpacing="2px"
        /> {averageRating}</p>
        ) : (
        <p>No Ratings Yet</p>
        )}     
        <p>Comments: 
          {comments && comments.length > 0 ? (
            <div className="comment-box" style={{ maxHeight: "150px", overflowY: "auto" }}> 
            <ul style={{ listStyleType: "none", color: "black" }}>
            {comments.map((comment, index) => {
            const timestamp = comment.created_at; // 'YYYY-MM-DD HH:MM:SS'
            const date = new Date(Date.parse(timestamp.replace(' ', 'T')));
            return (
                <li key={index} style={{ borderBottom: "1px solid lightgrey",padding: "8px 0" }}>
                {comment.comments}
                <br />
                <small>Posted on: {date.toLocaleString()}</small>
                </li>
            );
            })}
            </ul>
            </div> 
          ) : (
            " No comments yet"
          )}
        </p>
        <Link to="/reviews" className="review-button"> Submit a Review</Link>
      </div>
    </div>
  );
}

export default ListItem;