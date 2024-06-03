"use client";
import React, { useState } from "react";
export default function Scorll() {
  let [isShow, setIsShow] = useState(true);
  const handlceOnclick = function () {
    isShow ? setIsShow(false) : setIsShow(true);
  };
  return (
    <>
      <div className="flex ">
        <div
          className={`${
            isShow ? "w-20" : "w-0"
          } h-[75vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[75vh] overflow-hidden transition-all duration-200`}
        >
          <button
            className={`${isShow ? "relative" : "absolute"} m-5`}
            onClick={handlceOnclick}
          >
            click
          </button>
        </div>
        <div className="flex flex-1 flex-col justify-center items-center text-blue-800 bg-zinc-300  border border-purple-200">
          <div className="text-blue-400">just a test</div>
          <div>Hello wolrd</div>
        </div>
        <div
          className={`${
            isShow ? "w-20" : "w-0"
          } h-[75vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[75vh] overflow-hidden transition-all duration-200`}
        >
          <button
            className={`${isShow ? "relative" : "absolute"} m-5`}
            onClick={handlceOnclick}
          >
            click
          </button>
        </div>
      </div>
      <div className="triangle-up"></div>
    </>
  );
}
