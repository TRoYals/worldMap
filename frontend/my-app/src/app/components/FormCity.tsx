"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchCity } from "../store/useCities";
import { RootState } from "../store/store";
import axios from "axios";
import Modal from "./Modal";
import { fetchCities } from "../store/useCities";
import { setFocus } from "../store/useCities";

export const URL = process.env.NEXT_PUBLIC_URL || "http://127.0.0.1:8000";

export default function FormCity() {
  const [formData, setFormData] = useState({
    countryCode: "",
    countryName: "",
    capitalName: "",
    comments: "",
    x_pos: 0,
    y_pos: 0,
  });
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
  };

  const dispatch = useDispatch();
  const cities = useSelector((state: RootState) => state);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await axios.post(`${URL}/cities`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      dispatch(fetchCities() as any);
      console.log(response.data);
      setModalMessage("Data updated successfully!");
      setShowModal(true);
    } catch (error) {
      console.error("Error:", error);
      setModalMessage("Error updating data.");
      setShowModal(true);
    }
  };
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let data = searchCity(cities, { ...formData });
    console.log(data);
    const fixedCoordinates = data.coordinates; // 东京的坐标
    setFormData({
      ...data,
      comments: data.comments ? data.comments : "",
      x_pos: fixedCoordinates[0],
      y_pos: fixedCoordinates[1],
    });
    if (fixedCoordinates.length !== 0) dispatch(setFocus(fixedCoordinates));
  };
  const fields = [
    { id: "countryCode", label: "Code", type: "text" },
    { id: "countryName", label: "Country", type: "text" },
    { id: "capitalName", label: "Capital", type: "text" },
    { id: "comments", label: "Comments", type: "text" },
    { id: "x_pos", label: "X Coordinate", type: "number" },
    { id: "y_pos", label: "Y Coordinate", type: "number" },
  ];

  return (
    <div className="p-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap">
          {fields.map((field) => (
            <div key={field.id} className="flex items-center space-x-4 mb-4">
              <label
                htmlFor={field.id}
                className="w-24 text-right text-gray-700 font-medium"
              >
                {field.label}
              </label>
              <input
                type={field.type}
                id={field.id}
                name={field.id}
                value={formData[field.id as keyof typeof formData]}
                onChange={handleChange}
                className="flex-1 border border-gray-300 rounded-lg shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            登録/変更
          </button>
          <button
            type="button"
            onClick={(e: any) => handleSearch(e)}
            className="bg-gray-500 text-white py-2 px-4 rounded"
          >
            表示
          </button>
        </div>
      </form>
      {showModal && <Modal message={modalMessage} onClose={closeModal} />}
    </div>
  );
}
