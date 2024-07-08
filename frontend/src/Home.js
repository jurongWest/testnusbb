import React, {useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Home.css' // Import the CSS file
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L, { Icon } from "leaflet"
import SideBar from './SideBar'
import VenueList from './VenueList'
import logo from './image/NUSBB.png';
import logotext from './image/NUSBathroomBuddyText.png';
import report from './image/report.png';
import leaderboard from './image/leaderboard.png';
import home from './image/home.png';
import pin from './image/bookmark.png';
import axios from 'axios';
import StarRatings from 'react-star-ratings';

// const setmarkers = [
//   {
//     geocode: [1.294914042356082, 103.77377980267396],
//     popUp: "COM1 Toilet (Beside Career Consulting Room)",
//     image: toilet1,
//   },
//   {
//     geocode: [1.2942827296388428, 103.77411065078523],
//     popUp: "COM2 Toilet (Beside Furnace)",
//     image: toilet2
//   },
//   {
//     geocode: [1.2973577459082666, 103.77053415333361],
//     popUp: "SDE3 Toilet (Level 1)",
//     image: toilet3
//   },
//   {
//     geocode: [1.2963114108763067, 103.7803565548167],
//     popUp: "S17 Toilet (Level 2)",
//     image: toilet3
//   },
//   {
//     geocode: [1.2952132040063862, 103.78164162557187],
//     popUp: "MD6 Toilet (Level 3)",
//     image: toilet3
//   }
//   // Add more markers as needed
// ]

function Home() {
  const mapRef = useRef();
  const [selectedMarker, setSelectedMarker] = useState(null); // Add this line
  const [filter, setFilter] = useState('');
  const [markers, setMarkers] = useState([]); // Add this line
  const [venues, setVenues] = useState([]);
  const [leafletMarkers, setLeafletMarkers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8081/toiletdata')
      .then(response => {
        const fetchedMarkers = response.data.map(toilet => ({
          geocode: [toilet.latitude, toilet.longitude],
          popUp: toilet.popup,
          average_rating: toilet.rating,
          comment: toilet.comment,
          comments: [] // Add this line to initialize the comments array
        }));
  
        // Fetch comments for each toilet
        const fetchCommentsPromises = fetchedMarkers.map((marker, index) => {
          return axios.get(`http://localhost:8081/comments/${marker.popUp}`)
            .then(response => {
              // Add the comments to the marker
              fetchedMarkers[index].comments = response.data;
            });
        });
  
        // Wait for all comments to be fetched
        Promise.all(fetchCommentsPromises)
          .then(() => {
            setMarkers(fetchedMarkers);
          });
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
  }, []);

  useEffect(() => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;

    if (map) setTimeout(() => map.invalidateSize(), 100);
  }, []);

  useEffect(() => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;
  
    if (map) {
      const leafletMarkers = venues.reduce((acc, venue) => {
        const marker = L.marker(venue.geocode).addTo(map);
        const popupContent = `
          <div>
            <h2>${venue.popUp}</h2>
          </div>
        `;
        marker.bindPopup(popupContent);
        acc[venue.popUp] = marker; // Use venue.popUp as the key
        return acc;
      }, {});
  
      setLeafletMarkers(leafletMarkers);
    }
  }, [venues, mapRef]);

  useEffect(() => {
    if (selectedMarker) {
      const marker = leafletMarkers[selectedMarker.popUp];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedMarker, leafletMarkers]);

  useEffect(() => {
    setVenues(markers);
  }, [markers]);

  const customIcon = new Icon({
    iconUrl: require("./image/markericon.png"),
    iconSize: [25, 25],
  })

  useEffect(() => {
    // Call the API endpoint to update the ratings
    axios.get('http://localhost:8081/updateRatings')
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error updating ratings: ', error);
      });
  }, []);


  function handleMarkerClick(marker, idx) {
    setSelectedMarker(marker);
    const leafletMarker = leafletMarkers[marker.popUp];
    if (leafletMarker) {
      leafletMarker.openPopup();
    }
  }

  return (
    <div className="home-container">
      <img src={logo} alt="Logo" className="logo" />
      <img src={logotext} alt="Logo Text" className="logo-text" />
        <div className="button-container">
        </div>
      <div className="main-content">
        <div className="content">
        <div className="navigation-panel">
        <Link to="/home" className="navi-button custom-link">
            <img src={home} alt="Home" />
            <p>Home</p>
          </Link>
        <Link to="/leaderboard" className="leader-button custom-link">
            <img src={leaderboard} alt="Leaderboard" />
            <p>Leaderboard</p>
          </Link>
        <Link to="/reports" className="navi-button custom-link">
            <img src={report} alt="Report" />
            <p>Reports</p>
          </Link>
          <Link to="/bookmarks" className="bookmark-button custom-link">
            <img src={pin} alt="Bookmarks" />
            <p>Bookmarks</p>
          </Link>
        {/* Other navigation items go here */}
      </div>
      <div className="map-wrapper">
      <input className="search-bar" type="text" placeholder="Type the name of the building" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <div className="map-container">
            <MapContainer
              center={[1.2966528735372962, 103.77628683989606]} // Set center to NUS
              zoom={16}
              style={{ height: "90%", width: "90%" }}
              whenCreated={mapInstance => { mapRef.current = mapInstance; }}
            >
              
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {markers.map((marker, idx) => (
                <Marker 
                  key={idx} 
                  position={marker.geocode} 
                  icon={customIcon} 
                  eventHandlers={{
                    click: () => {
                      handleMarkerClick(marker, idx);
                    },
                    add: (e) => {
                      setLeafletMarkers(oldMarkers => {
                        const newMarkers = [...oldMarkers];
                        newMarkers[idx] = e.target;
                        return newMarkers;
                      });
                    },
                  }}
              >
                  <Popup open={selectedMarker === marker}>
                  <div>
                    <h4>{marker.popUp}</h4>
                    {marker.average_rating ? (
                      <>
                        <p>Rating:
                        <StarRatings
                          rating={parseFloat(marker.average_rating)}
                          starRatedColor="#ffdb58"
                          numberOfStars={5}
                          name='rating'
                          starDimension="20px"
                          starSpacing="2px"
                        /> {marker.average_rating}</p>
                      </>
                    ) : (
                      <p>No Ratings Yet</p>
                    )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            </div>
          </div>
      <SideBar selectedMarker={selectedMarker} >
      
      <VenueList venues={venues} filter={filter} selectedMarker={selectedMarker} setSelectedMarker={setSelectedMarker} markers={markers} leafletMarkers={leafletMarkers}/>
      </SideBar>
        </div>
      </div>
    </div>
  )
}

export default Home