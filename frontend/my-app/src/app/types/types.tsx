// userCities Types
export interface FeatureCollection {
  type: "FeatureCollection";
  features: Feature[];
}
export interface Feature {
  type: "Feature";
  geometry: Geometry;
  properties: Properties;
}
export interface Geometry {
  type: "Point";
  coordinates: [number, number];
}
export interface Properties {
  countryCode: string;
  countryName: string;
  capitalName: string;
  comments: string;
  popUpMarkup: string;
}
export interface CitiesState {
  cities: FeatureCollection;
  focus: [number, number];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Backend income types
export interface CityData {
  code: string;
  country_name: string;
  capital_name: string;
  x_pos: number;
  y_pos: number;
  comments: string;
}

//Search Paras for City Search
export interface SearchParams {
  countryCode?: string;
  countryName?: string;
  capitalName?: string;
}
