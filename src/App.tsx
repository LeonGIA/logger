import { useState, useEffect } from 'react'
import { Location } from "./interfaces/location.ts";
import './App.css'

// Defines all the relevant locations in the Park
// latitude and longitude correspond to a central point in the real-world areas
// Radius (in meters) defines the area you must be within to be considered as "in" the area
const LOCATIONS_LIST: Location[] = [
  {
    name: "Maintenance",
    latitude: 39.56728,
    longitude: -75.731172,
    radius: 50,
    times_visited: []
  },
  {
    name: "Office",
    latitude: 39.568034,
    longitude: -75.730319,
    radius: 38,
    times_visited: []
  },
  {
    name: "Area 5",
    latitude: 39.563203,
    longitude: -75.72968,
    radius: 150,
    times_visited: []
  },
  {
    name: "Area 4",
    latitude: 39.56217,
    longitude: -75.726233,
    radius: 130,
    times_visited: []
  },
  {
    name: "Area 3",
    latitude: 39.565184,
    longitude: -75.720955,
    radius: 130,
    times_visited: []
  },
  {
    name: "Area 2",
    latitude: 39.562036,
    longitude: -75.720421,
    radius: 132,
    times_visited: []
  },
  {
    name: "Boat House",
    latitude: 39.559717,
    longitude: -75.719476,
    radius: 120,
    times_visited: []
  },
  {
    name: "Area 1",
    latitude: 39.559511,
    longitude: -75.714624,
    radius: 200,
    times_visited: []
  },
  {
    name: "Dog Park",
    latitude: 39.568739,
    longitude: -75.709028,
    radius: 130,
    times_visited: []
  },
  {
    name: "Primitive Campground",
    latitude: 39.56733,
    longitude: -75.7016888,
    radius: 200,
    times_visited: []
  },
  {
    name: "Summit North Marina",
    latitude: 39.551733,
    longitude: -75.701721,
    radius: 350,
    times_visited: []
  },
  {
    name: "The Grain",
    latitude: 39.548046,
    longitude: -75.706252,
    radius: 185,
    times_visited: []
  },
  {
    name: "Boat Ramp",
    latitude: 39.552843,
    longitude: -75.71181,
    radius: 180,
    times_visited: []
  },
  {
    name: "Campground",
    latitude: 39.551265,
    longitude: -75.718894,
    radius: 335,
    times_visited: []
  },
  {
    name: "RC Field",
    latitude: 39.553258,
    longitude: -75.730949,
    radius: 350,
    times_visited: []
  },
  {
    name: "Sunset Lake",
    latitude: 39.630806,
    longitude: -75.727045,
    radius: 100,
    times_visited: []
  }
  // Add more target areas as needed
];

function App() {
  const [locations, setLocations] = useState<Location[]>(() => {
    const savedLocations = localStorage.getItem("locationsLog");
    return savedLocations ? JSON.parse(savedLocations) : LOCATIONS_LIST;
  });

  const [showMain, setShowMain] = useState<boolean>(true);

  // Update localStorage whenever the locations change
  useEffect(() => {
    localStorage.setItem("locationsLog", JSON.stringify(locations));
  }, [locations]);

  // Gets and returns the current time in military hours
  function getCurrentTime(): number {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Convert the current time to a number in 24-hour format
    const timeNumber = hours * 100 + minutes;

    return timeNumber;
  }

  function updateTimesVisited(loc: Location | string) {
    const updatedLocations = locations.map((location) => {
      if (location.name === (typeof loc === "string" ? loc : loc.name)) {
        const timeExists = location.times_visited.find(
          (time) => time == getCurrentTime()
        );
        // Update the times_visited array with the current time
        if (timeExists) {
          window.alert("Time already exists!");
        } else {
          window.alert("Time added to " + (typeof loc == "string" ? loc : loc.name))
          location.times_visited.push(getCurrentTime());
        }
      }
      return location;
    });

    setLocations(updatedLocations);
  }

  // Removes the most recent time visited at a location. Click multiple times to clear all times.
  function removeTime(loc: Location) {
    const updatedLocations = locations.map((location) => {
      if (location.name === (typeof loc === "string" ? loc : loc.name)) {
        location.times_visited.pop();
      }
      return location;
    });

    setLocations(updatedLocations);
  }

  // Clears the user's saved data
  function clearLocalStorage() {
    localStorage.clear();
    window.location.reload();
  }

  // Handles getting the user's location. Passes off checking if the user is in a specific area
  // to another function
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          checkEnteredArea(userLocation);
        },
        (error) => {
          window.alert("Error getting location");
          console.error("Error getting location:", error.message);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    } else {
      window.alert("Geolocation not supported");
    }
  };

  // Handles checking if the user is in a specific area by comparing against the pre-determined radius
  // for each area.
  // Passess off the math to another function.
  const checkEnteredArea = (userLocation: {
    latitude: number;
    longitude: number;
  }) => {
    // Check if the user is within the radius of ANY target area
    const enteredArea = LOCATIONS_LIST.find((targetArea: Location) => {
        const areaLocation = {
          latitude: targetArea.latitude,
          longitude: targetArea.longitude
        }
        const distance = calculateDistance(userLocation, areaLocation);
        if(distance <= targetArea.radius) {
          return targetArea.name
        }
    });

    if (enteredArea) {
        updateTimesVisited(enteredArea);
    } else {
        window.alert("Not Valid Area");
    }
  };

  // Calculates distance from two points in meters
  const calculateDistance = (
      point1: { latitude: number; longitude: number },
      point2: { latitude: number; longitude: number }
  ) => {
      const radlat1 = (Math.PI * point1.latitude) / 180;
      const radlat2 = (Math.PI * point2.latitude) / 180;
      const theta = point1.longitude - point2.longitude;
      const radtheta = (Math.PI * theta) / 180;

      let dist =
          Math.sin(radlat1) * Math.sin(radlat2) +
          Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515 * 1.609344 * 1000; // Convert to meters

      return dist;
  };

  return (
    <>
      <div className="topFuncBar">
        <button onClick={() => clearLocalStorage()}>Clear</button>
        <button onClick={() => getLocation()}>Auto</button>
      </div>
      <h1>Location Logger</h1>
      <div className="locations">
        <li className="locations_list" id="main-side" hidden={showMain ? false : true}>
          {locations.slice(0, 8).map(
            (loc: Location): JSX.Element => (
              <ul key={loc.name}>
                <button onClick={() => updateTimesVisited(loc)}>
                  {loc.name}
                </button>
                <div className="timesContainer">
                  {loc.times_visited.map(
                    (time: number): JSX.Element => (
                      <p className="times" key={time}>{time}</p>
                    )
                  )}
                </div>
                <button onClick={() => removeTime(loc)} className="remove">Remove</button>
              </ul>
            )
          )}
        </li>
        <li className="locations_list" id="outside" hidden={showMain ? true : false}>
          {locations.slice(8).map(
            (loc: Location): JSX.Element => (
              <ul key={loc.name}>
                <button onClick={() => updateTimesVisited(loc)}>
                  {loc.name}
                </button>
                <div className="timesContainer">
                  {loc.times_visited.map(
                    (time: number): JSX.Element => (
                      <p className="times" key={time}>{time}</p>
                    )
                  )}
                </div>
                <button onClick={() => removeTime(loc)} className="remove">Remove</button>
              </ul>
            )
          )}
        </li>
      </div>
      <div className="bottomFuncBar">
        <button onClick={() => setShowMain(!showMain)}>{showMain ? "Outside" : "Main"}</button>
      </div>
    </>
  )
}

export default App
