"use client";

import { ClockIcon, MapPinIcon } from "@heroicons/react/24/outline";
import React, { useState, useRef, useEffect, FC, FormEvent } from "react";
import ClearDataButton from "./ClearDataButton";
import { getAllHotels, Search } from "@/actions/server";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { useRouter } from "next/navigation";

export interface LocationInputProps {
  placeHolder?: string;
  desc?: string;
  className?: string;
  divHideVerticalLineClass?: string;
  autoFocus?: boolean;

}

const LocationInput: FC<LocationInputProps> = ({
  autoFocus = false,
  placeHolder = "Location",
  desc = "Where are you going?",
  className = "nc-flex-1.5",
  divHideVerticalLineClass = "left-10 -right-0.5",

}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const  router = useRouter();

  const [value, setValue] = useState("");
  const [showPopover, setShowPopover] = useState(autoFocus);
  const [hotels, setHotels] = useState<string[]>([]);

  useEffect(()=>{
    async function FetchHotels(){
        const fetchedHotels = await getAllHotels();
        if (fetchedHotels && fetchedHotels.length > 0) {
          setHotels(prevHotels => [
            ...prevHotels,
            ...fetchedHotels.slice(0, 4).map((hotel: any) => hotel.title),
          ]);
        }
    }
    FetchHotels()
  },[])

  useEffect(() => {
    setShowPopover(autoFocus);
  }, [autoFocus]);

  useEffect(() => {
    if (eventClickOutsideDiv) {
      document.removeEventListener("click", eventClickOutsideDiv);
    }
    showPopover && document.addEventListener("click", eventClickOutsideDiv);
    return () => {
      document.removeEventListener("click", eventClickOutsideDiv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopover]);

  useEffect(() => {
    if (showPopover && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showPopover]);

  const eventClickOutsideDiv = (event: MouseEvent) => {
    if (!containerRef.current) return;
    // CLICK IN_SIDE
    if (!showPopover || containerRef.current.contains(event.target as Node)) {
      return;
    }
    // CLICK OUT_SIDE
    setShowPopover(false);
  };




  async function search(){
    try {
      console.log(value)
        router.push(`/listing-stay-map?location=${value}`)
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <div className={`relative flex ${className}`} ref={containerRef}>
      <div
       
        className={`flex z-10 flex-1 relative [ nc-hero-field-padding ] flex-shrink-0 items-center space-x-3 cursor-pointer focus:outline-none text-left  ${
          showPopover ? "nc-hero-field-focused" : ""
        }`}
      >
        <div className="text-neutral-300 dark:text-neutral-400">
          <MapPinIcon className="w-5 h-5 lg:w-7 lg:h-7" />
        </div>
        <div className="flex-grow relative">
  <div className="flex items-center">
    <input
      className={`block w-full bg-transparent border-none focus:ring-0 p-0 focus:outline-none focus:placeholder-neutral-300 xl:text-lg font-semibold placeholder-neutral-800 dark:placeholder-neutral-200 truncate`}
      placeholder={placeHolder}
      value={value}
      autoFocus={showPopover}
      onChange={(e) => {
        setValue(e.currentTarget.value);
      }}
      ref={inputRef}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && value) {
          search();
        }
      }}
    />
    <ButtonPrimary type="button" disabled={!value} onClick={search} className="ml-2 mt-3">Search</ButtonPrimary> {/* Add this button here */}
  </div>
  <span className="block mt-0.5 text-sm text-neutral-400 font-light">
    <span className="line-clamp-1">{!!value ? placeHolder : desc}</span>
  </span>
  {value && showPopover && (
    <ClearDataButton
      onClick={() => {
        setValue("");
      }}
    />
  )}
</div>
      </div>

      {showPopover && (
        <div
          className={`h-8 absolute self-center top-1/2 -translate-y-1/2 z-0 bg-white dark:bg-neutral-800 ${divHideVerticalLineClass}`}
        ></div>
      )}

      
    </div>
  );
};

export default LocationInput;
