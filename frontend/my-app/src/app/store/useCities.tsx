import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  CitiesState,
  CityData,
  FeatureCollection,
  SearchParams,
} from "../types/types";
import { RootState } from "./store";
import { URL } from "../components/FormCity";

const initialState: CitiesState = {
  cities: {
    type: "FeatureCollection",
    features: [],
  },
  focus: null,
  status: "idle",
  error: null,
};

export const fetchCities = createAsyncThunk(
  "cities/fetchData",
  async (): Promise<FeatureCollection> => {
    const response = await axios.get(`${URL}:8000/cities/`);
    const cityData = response.data;
    const features = cityData.map((city: CityData) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [city.x_pos, city.y_pos],
      },
      properties: {
        countryCode: city.code,
        countryName: city.country_name,
        capitalName: city.capital_name,
        popUpMarkup: `<h3>${city.capital_name}</h3><p>${city.country_name}</p><a href="http://example.com">${city.comments}</a>`,
        comments: city.comments,
      },
    }));

    return {
      type: "FeatureCollection",
      features: features,
    };
  }
);

const useCities = createSlice({
  name: "cities",
  initialState,
  reducers: {
    setFocus: (state, action) => {
      state.focus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export default useCities.reducer;
export const { setFocus } = useCities.actions;

export const searchCity = (
  rootCities: RootState,
  { countryCode, countryName, capitalName }: SearchParams
) => {
  let matchedFeature = rootCities.cities.cities.features.find((feature) => {
    const properties = feature.properties;
    return properties.countryCode == countryCode;
  });

  if (!matchedFeature && countryName) {
    matchedFeature = rootCities.cities.cities.features.find((feature) => {
      const properties = feature.properties;
      return properties.countryName === countryName;
    });
  }

  if (!matchedFeature && capitalName) {
    matchedFeature = rootCities.cities.cities.features.find((feature) => {
      const properties = feature.properties;
      return properties.capitalName === capitalName;
    });
  }

  if (matchedFeature) {
    return {
      countryCode: matchedFeature.properties.countryCode,
      countryName: matchedFeature.properties.countryName,
      capitalName: matchedFeature.properties.capitalName,
      coordinates: matchedFeature.geometry.coordinates,
      comments: matchedFeature.properties.comments,
    };
  } else {
    return {
      countryCode: "",
      countryName: "",
      capitalName: "",
      comments: "",
      coordinates: [],
    };
  }
};
