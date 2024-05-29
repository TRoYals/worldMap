"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl, { GeoJSONSource, MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { FeatureCollection } from "../types/types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOXTOKEN || "";

interface MapProps {
  campgrounds: FeatureCollection;
}
interface CustomGeoJsonProperties {
  cluster_id?: number;
  popUpMarkup?: string;
}

interface CustomGeoJsonFeature extends GeoJSON.Feature<GeoJSON.Geometry> {
  properties: CustomGeoJsonProperties;
}

const MapComponent: React.FC<MapProps> = ({ campgrounds }) => {
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

      map.current.addSource("campgrounds", {
        type: "geojson",
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      });

      map.current.addLayer({
        id: "clusters",
        type: "circle",
        source: "campgrounds",
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
        source: "campgrounds",
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
        source: "campgrounds",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#11b4da",
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      map.current.on("click", "clusters", (e: MapMouseEvent) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        }) as CustomGeoJsonFeature[];

        if (!features || features.length === 0 || !features[0].properties) {
          return;
        }

        const clusterId = features[0].properties.cluster_id;
        if (clusterId === undefined) {
          return;
        }

        const source = map.current!.getSource("campgrounds") as GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current) return;

          const geometry = features[0].geometry;
          if (geometry.type === "Point") {
            map.current!.easeTo({
              center: geometry.coordinates as [number, number],
              zoom: zoom,
            });
          }
        });
      });

      map.current.on("click", "unclustered-point", (e) => {
        const features = e.features as CustomGeoJsonFeature[];
        if (
          !features ||
          features.length === 0 ||
          !features[0].properties ||
          !features[0].properties.popUpMarkup
        ) {
          return;
        }

        const { popUpMarkup } = features[0].properties;
        const geometry = features[0].geometry;
        if (geometry.type !== "Point") {
          return;
        }

        const coordinates = geometry.coordinates.slice() as [number, number];

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(popUpMarkup)
          .addTo(map.current!);
      });

      map.current.on("mouseenter", "clusters", () => {
        map.current!.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "clusters", () => {
        map.current!.getCanvas().style.cursor = "";
      });
    });
  }, [campgrounds]);

  useEffect(() => {
    if (map.current && focus) {
      map.current.flyTo({
        center: focus,
        zoom: 10,
        essential: true,
      });
    }
  }, [focus]);

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />;
};

export default MapComponent;
