"use client";
import dynamic from "next/dynamic";
import { useSelector, useDispatch, Provider } from "react-redux";
import store, { RootState } from "../store/store";
import { useEffect } from "react";
import MapComponent from "../components/MapComponent";
import { fetchCities } from "../store/useCities";
import FormCity from "../components/FormCity";

function HomeComponent() {
  const dispatch = useDispatch();
  const cities = useSelector((state: RootState) => state.cities.cities);
  const campgroundsStatus = useSelector(
    (state: RootState) => state.cities.status
  );

  useEffect(() => {
    if (campgroundsStatus === "idle") {
      dispatch(fetchCities() as any);
    }
  }, [dispatch]);

  const MapComponent = dynamic(() => import("../components/MapComponent"), {
    ssr: false, // 禁用服务器端渲染
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full">
        <MapComponent campgrounds={cities}></MapComponent>
      </div>
      <div>
        <FormCity></FormCity>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Provider store={store}>
      <HomeComponent />
    </Provider>
  );
}
