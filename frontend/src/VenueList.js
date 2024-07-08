import React from 'react';
import ListItem from './ListItem';

function VenueList({ venues, selectedMarker, filter, setSelectedMarker, onClick, leafletMarkers, ...props }) {
    const filteredVenues = venues ? venues.filter(venue => 
      (filter ? venue.popUp.toUpperCase().includes(filter.toUpperCase()) : true)) : [];

    const handleListItemClick = (venue, idx) => {
    setSelectedMarker(venue);
    console.log(selectedMarker)
    const originalIndex = venues.indexOf(venue);
    const leafletMarker = leafletMarkers[originalIndex];
    console.log(leafletMarker)
    if (leafletMarker) {
      leafletMarker.openPopup();
    }   
    };

    const sortedVenues = [...filteredVenues].sort((a, b) => 
        (selectedMarker && a === selectedMarker) ? -1 : 
        (selectedMarker && b === selectedMarker) ? 1 : 0
      );
    
    return (
        <div className="venue-list">
          {sortedVenues.map((venue, idx) => {
            console.log(venue);  // Add this line
            return (
                <ListItem 
                key={idx} 
                {...venue} 
                onClick={() => handleListItemClick(venue, idx)}
                selected={selectedMarker && venue === selectedMarker}
                averageRating={venue.average_rating}
                comments={venue.comments}
                >
                </ListItem>
            );
            })}
          
        </div>
      );
  }

export default VenueList;