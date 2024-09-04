import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "./Map.css";
import neighborhoodData from "./mahalle_geojson.json";

mapboxgl.accessToken =
  "pk.eyJ1IjoiY2Fyb250ZTQxIiwiYSI6ImNtMG1pNXR0azAyYmcyaXM3cWxldTRmc2EifQ.DSF5Ohz5XXaE5uXhmfLKAw";

const Map = () => {
  const mapContainerRef = useRef(null);
  const hoveredStateId = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [28.99, 40.99],
      zoom: 10,
    });

    map.on("load", () => {
      map.addSource("neighborhoods", {
        type: "geojson",
        data: neighborhoodData,
      });

      map.addLayer({
        id: "neighborhoods-layer",
        type: "fill",
        source: "neighborhoods",
        layout: {},
        paint: {
          "fill-color": "#888888",
          "fill-opacity": 0.4,
        },
      });

      map.addLayer({
        id: "neighborhoods-borders",
        type: "line",
        source: "neighborhoods",
        layout: {},
        paint: {
          "line-color": "#000000",
          "line-width": 2,
        },
      });

      // Add the hover layer with initial empty filter
      map.addLayer({
        id: "neighborhoods-hover",
        type: "fill",
        source: "neighborhoods",
        layout: {},
        paint: {
          "fill-color": "#f08d49",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.8,
            0.4,
          ],
        },
        filter: ["==", ["get", "place_id"], ""],
      });

      map.on("mouseenter", "neighborhoods-layer", (e) => {
        map.getCanvas().style.cursor = "pointer";
        debugger;
        if (hoveredStateId.current) {
          map.setFeatureState(
            { source: "neighborhoods", id: hoveredStateId.current },
            { hover: false }
          );
        }

        const feature = e.features[0];
        hoveredStateId.current = feature.properties.place_id;

        map.setFeatureState(
          { source: "neighborhoods", id: hoveredStateId.current },
          { hover: true }
        );

        // Update the hover layer filter to only show the hovered feature
        map.setFilter("neighborhoods-hover", [
          "==",
          ["get", "place_id"],
          hoveredStateId.current,
        ]);
      });

      map.on("mouseleave", "neighborhoods-layer", () => {
        map.getCanvas().style.cursor = "";
        debugger;
        if (hoveredStateId.current) {
          map.setFeatureState(
            { source: "neighborhoods", id: hoveredStateId.current },
            { hover: false }
          );
        }

        // Reset the hover state and filter
        hoveredStateId.current = null;
        map.setFilter("neighborhoods-hover", [
          "==",
          ["get", "place_id"],
          "", // This effectively hides the hover effect
        ]);
      });
    });

    return () => map.remove();
  }, []);

  return <div className="map-container" ref={mapContainerRef} />;
};

export default Map;
