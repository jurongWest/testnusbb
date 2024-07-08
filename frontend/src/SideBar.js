import React, { Children, Component } from 'react'
import VenueList from './VenueList'
import ListItem from './ListItem'
import './SideBar.css'

class SideBar extends Component {
    state = {
      venues: [],
      selectedMarker: null,  // If selectedMarker is a state in SideBar
    };
  
    componentDidMount() {
        fetch('/toilets')
          .then(response => response.json())
          .then(data => {
            const fetchCommentsPromises = data.map(toilet => {
              return fetch(`/comments/${toilet.popUp}`)
                .then(response => response.json())
                .then(comments => {
                  // Add the comments to the toilet
                  toilet.comments = comments;
                  return toilet;
                });
            });
      
            // Wait for all comments to be fetched
            Promise.all(fetchCommentsPromises)
              .then(venuesWithComments => {
                this.setState({ venues: venuesWithComments });
              });
          });
      }
  
    render() {
      const { selectedMarker, venues } = this.state;
      const selectedVenue = selectedMarker ? venues.find(venue => venue.popUp === selectedMarker.popUp) : null;
  
      return (
        <div className="SideBar">
          {selectedMarker && (
            <div className="selected-venue">
                <ListItem 
                popUp={selectedMarker.popUp} 
                description={selectedMarker.description} 
                averageRating={selectedMarker.average_rating}  // Changed rating to averageRating
                comments={selectedVenue.comments} 
                />
            </div>
            )}
          <VenueList className="venue-list" selectedMarker={selectedMarker} venues={venues} />
          {Children.toArray(this.props.children)}
        </div>
      );
    }
  }

export default SideBar