import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useContext } from 'react';
import UserContext from './UserContext';
import L, { Icon } from "leaflet"
import SideBar from './SideBar'
import VenueList from './VenueList'
import logo from './image/NUSBB.png';
import logotext from './image/NUSBathroomBuddyText.png';
import report from './image/report.png';
import leaderboard from './image/leaderboard.png';
import home from './image/home.png';
import pin from './image/user.png';
import axios from 'axios';
import StarRatings from 'react-star-ratings';

function Home() {
  const { userId } = useContext(UserContext);
  console.log('User ID:', userId);
  const mapRef = useRef();
  const [selectedMarker, setSelectedMarker] = useState(null); 
  const [filter, setFilter] = useState('');
  const [markers, setMarkers] = useState([]); 
  const [venues, setVenues] = useState([]);
  const [leafletMarkers, setLeafletMarkers] = useState([]);
  const [wheelchair, setWheelchair] = useState(false);
  const [bidet, setBidet] = useState(false);
  const [shower, setShower] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    axios.get('https://testnusbb-git-main-jurongs-projects.vercel.app/toiletdata')
      .then(response => {
        let fetchedMarkers = response.data.map(toilet => ({
          geocode: [toilet.latitude, toilet.longitude],
          popUp: toilet.popup,
          average_rating: toilet.rating,
          comment: toilet.comment,
          wheelchair: toilet.wheelchair,
          bidet: toilet.bidet,
          shower: toilet.shower,
          comments: [] // Add this line to initialize the comments array
        }));

        // Filter the markers based on the checkboxes
      fetchedMarkers = fetchedMarkers.filter(marker => {
        return (!wheelchair || marker.wheelchair) && (!bidet || marker.bidet) && (!shower || marker.shower);
      });
  
        // Fetch comments for each toilet
        const fetchCommentsPromises = fetchedMarkers.map((marker, index) => {
          return axios.get(`https://testnusbb-git-main-jurongs-projects.vercel.app/comments/${marker.popUp}`)
            .then(response => {
              // Add the comments to the marker
              fetchedMarkers[index].comments = response.data;
            });
        });
  
        // Wait for all comments to be fetched
        Promise.all(fetchCommentsPromises)
          .then(() => {
            fetchedMarkers.sort((a, b) => a.popUp.localeCompare(b.popUp));
            setMarkers(fetchedMarkers);
          });
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
  }, [wheelchair, bidet, shower]);



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
    axios.get('https://testnusbb-git-main-jurongs-projects.vercel.app/updateRatings')
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error updating ratings: ', error);
      });
  }, []);

  const handleWheelchairChange = (event) => {
    setWheelchair(event.target.checked);
  };

  const handleBidetChange = (event) => {
    setBidet(event.target.checked);
  };

  const handleShowerChange = (event) => {
    setShower(event.target.checked);
  };


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
          <Link to={`/profile/${userId}`} className="bookmark-button custom-link">
            <img src={pin} alt="Bookmarks" />
            <p>Profile</p>
          </Link>
        {/* Other navigation items go here */}
      </div>
      <div className="map-wrapper">
      <input className="search-bar" type="text" placeholder="Type the name of the building" value={filter} onChange={(e) => setFilter(e.target.value)} />
              <div className="checkbox-container">
            <label>Filter By: </label>
            <label>
              <input type="checkbox" checked={wheelchair} onChange={handleWheelchairChange} />
              Wheelchair Accessible
            </label>
            <label>
              <input type="checkbox" checked={bidet} onChange={handleBidetChange} />
              Has Bidet
            </label>
            <label>
              <input type="checkbox" checked={shower} onChange={handleShowerChange} />
              Has Shower
            </label>
          </div>
          <div className="map-container">
            <MapContainer
              center={[1.2966528735372962, 103.77628683989606]} // Set center to NUS
              zoom={16}
              style={{ height: "90%", width: "90%" }}
              whenCreated={mapInstance => {
                mapRef.current = mapInstance;
                mapInstance.locate({setView: true, maxZoom: 16});
            
                mapInstance.on('locationfound', function(e) {
                  setUserLocation(e.latlng);
                });
              }}
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