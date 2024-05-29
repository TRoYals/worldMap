"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { FeatureCollection } from "../types/types";

mapboxgl.accessToken = process.env.MAPBOXTOKEN || "";

interface MapProps {
  citiesData: FeatureCollection;
}

const Map: React.FC<MapProps> = ({ citiesData }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const focus = useSelector((state: RootState) => state.cities.focus);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/light-v10",
      center: [103.854, 1.37],
      zoom: 1,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    map.current.on("load", () => {
      if (!map.current) return; // Ensure map.current is not null

      map.current.addSource("citiesData", {
        type: "geojson",
        data: citiesData,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      });

      map.current.addLayer({
        id: "clusters",
        type: "circle",
        source: "citiesData",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#00BCD4",
            10,
            "#2196F3",
            30,
            "#3F51B5",
          ],
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
        },
      });

      map.current.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "citiesData",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      map.current.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "citiesData",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#11b4da",
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      map.current.on("click", "clusters", (e) => {
        if (!map.current) return;
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features || features.length === 0) return;

        const clusterId = features[0]?.properties?.cluster_id;
        map.current
          .getSource("citiesData")
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || !map.current) return;

            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });

      map.current.on("click", "unclustered-point", (e) => {
        if (!map.current) return;
        const { popUpMarkup } = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(popUpMarkup)
          .addTo(map.current);
      });

      map.current.on("mouseenter", "clusters", () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "clusters", () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = "";
      });
    });
  }, [citiesData]);

  useEffect(() => {
    if (map.current && focus) {
      map.current.flyTo({
        center: focus,
        zoom: 10,
        essential: true, // This animation is considered essential with respect to prefers-reduced-motion
      });
    }
  }, [focus]);

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />;
};

export default Map;
