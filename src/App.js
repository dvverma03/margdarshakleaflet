import React, { useRef, useState } from "react";
import "./App.css";
import Logo from "./images/logo.png";
import { PlusCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "./fix-leaflet-icons";

const center = [25.3176, 82.9739];

const Helper = (origin, destination, waypoints) => {
  return new Promise((resolve, reject) => {
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(origin[0], origin[1]),
        ...waypoints.map((wp) => L.latLng(wp[0], wp[1])),
        L.latLng(destination[0], destination[1]),
      ],
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: "#6FA1EC", weight: 4 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
    });

    routingControl.on("routesfound", function (e) {
      const selectedRoute = e.routes[0];
      const distanceInMeters = selectedRoute.summary.totalDistance;
      const distance = (distanceInMeters / 1000).toFixed(2) + " km";
      resolve({ route: selectedRoute, distance });
    });

    routingControl.on("routingerror", function () {
      reject("Error in routing");
    });

    routingControl.route();
  });
};

const SetViewOnRoute = ({ route }) => {
  if (route && route.coordinates.length > 0) {
    const routePolyline = route.coordinates.map((coord) => [
      coord.lat,
      coord.lng,
    ]);

    return (
      <Polyline
        pathOptions={{ color: "#6FA1EC", weight: 4 }}
        positions={routePolyline}
      />
    );
  }

  return null;
};

function App() {
  const [waypoints, setWaypoints] = useState([]);
  const [distance, setDistance] = useState("");
  const [directionResponse, setDirectionResponse] = useState(null);

  const originRef = useRef();
  const destinationRef = useRef();
  const stopRef = useRef();

  const handleAddStop = () => {
    if (stopRef.current.value) {
      const newPoint = stopRef.current.value.split(",").map(Number);
      const newWaypoints = [...waypoints, newPoint];
      setWaypoints(newWaypoints);
      stopRef.current.value = "";
    }
  };

  const calculateRoute = async () => {
    if (!originRef.current.value || !destinationRef.current.value) {
      return;
    }

    if (stopRef.current.value) {
      const newPoint = stopRef.current.value.split(",").map(Number);
      const newWaypoints = [...waypoints, newPoint];
      setWaypoints(newWaypoints);
      stopRef.current.value = "";
    }

    const origin = originRef.current.value.split(",").map(Number);
    const destination = destinationRef.current.value.split(",").map(Number);

    try {
      const result = await Helper(origin, destination, waypoints);
      setDirectionResponse(result.route);
      setDistance(result.distance);
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div>
        <img
          className="w-[160px] h-[70px] mt-[10px] mb-[5px] ml-[10px]"
          src={Logo}
          alt=""
        />
      </div>

      <div className="bg-[#F4F8FA] pb-16">
        <h1 className="text-[16px] text-[#1B31A8] py-4 text-center mb-4">
          Let's calculate <b>distance</b> from Google maps
        </h1>
        <div className="md:flex">
          <div className="md:w-1/2 md:px-[8%]">
            <div className="md:flex">
              <div className="py-6 px-4 w-full md:max-w-xl">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Origin
                  </label>
                  <div className="relative">
                    <EnvironmentOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      ref={originRef}
                      type="text"
                      placeholder="latitude,longitude"
                      className="w-full pl-10 mt-1 block md:w-[250px] h-[45px] border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>
                <div className="mb-4 mt-12">
                  <label className="block text-sm font-medium text-gray-700">
                    Stop
                  </label>
                  <div className="relative">
                    <EnvironmentOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      ref={stopRef}
                      type="text"
                      placeholder="latitude,longitude"
                      className="w-full pl-10 mt-1 block md:w-[250px] h-[45px] border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div
                    className="ml-20 mt-[2px] cursor-pointer"
                    onClick={handleAddStop}
                  >
                    <span className="mr-[4px]">
                      <PlusCircleOutlined />
                    </span>
                    Add another stop
                  </div>
                  <div>
                    {waypoints.length > 0 &&
                      waypoints.map((e, index) => (
                        <div
                          className="border border-gray-300 rounded-md shadow-sm bg-white my-1 py-2 pl-2"
                          key={index}
                        >
                          {e.join(",")}
                        </div>
                      ))}
                  </div>
                </div>
                <div className="mb-4 mt-12">
                  <label className="block text-sm font-medium text-gray-700">
                    Destination
                  </label>
                  <div className="relative">
                    <EnvironmentOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      ref={destinationRef}
                      type="text"
                      placeholder="latitude,longitude"
                      className="w-full pl-10 mt-1 block md:w-[250px] h-[45px] border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-4 md:mt-[160px] w-full flex">
                <div className="justify-center">
                  <button
                    onClick={calculateRoute}
                    className="w-[140px] h-[55px] ml-8 bg-[#1B31A8] rounded-[32px] text-white"
                  >
                    Calculate
                  </button>
                </div>
              </div>
            </div>
            <div className=" bg-white h-[80px] md:w-[100%] mb-8 flex justify-between mx-4 items-center border border-gray-300 rounded-md shadow-sm px-2">
              <div className="text-[22px]">Distance:</div>
              <div className="text-[30px] lh-[36px] font-bold text-[#0079FF]">
                {distance}
              </div>
            </div>
            {originRef.current?.value &&
              distance &&
              destinationRef.current?.value && (
                <div className="pl-4">
                  The distance between <b>{originRef.current.value}</b> and{" "}
                  <b>{destinationRef.current.value}</b> via the selected route
                  is <b>{distance}</b>.
                </div>
              )}
          </div>
          <div className="md:w-1/2 flex">
            {/* Leaflet map box  */}
            <div className="w-full mx-1 h-[300px] md:w-[80%] md:h-[600px] md:ml-20">
              <MapContainer className="w-full h-full" center={center} zoom={13}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center} />

                {directionResponse && (
                  <>
                    <SetViewOnRoute route={directionResponse} />
                    {/* Origin Marker */}
                    <Marker
                      position={originRef.current.value.split(",").map(Number)}
                    />

                    {/* Destination Marker */}
                    <Marker
                      position={destinationRef.current.value
                        .split(",")
                        .map(Number)}
                    />

                    {/* Stop Markers */}
                    {waypoints.map((waypoint, index) => (
                      <Marker key={index} position={waypoint} />
                    ))}
                  </>
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
