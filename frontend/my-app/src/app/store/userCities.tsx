import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { CitiesState, CityData, FeatureCollection } from "../types/types";

const initialState: CitiesState = {
  cities: {
    type: "FeatureCollection",
    features: [],
  },
  focus: [0, 0],
  status: "idle",
  error: null,
};

export const fetchCities = createAsyncThunk(
  "cities/fetchData",
  async (): Promise<FeatureCollection> => {
    const response = await axios.get("http://127.0.0.1:8000/cities/");
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

const userCities = createSlice({
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
      });
  },
});
