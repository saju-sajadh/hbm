"use client";

import ButtonPrimary from "@/shared/ButtonPrimary";
import { MapPinIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { redirect, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, FC } from "react";

interface Props {
  onClick?: () => void;
  onChange?: (value: string) => void;
  className?: string;
  defaultValue?: string;
  headingText?: string;
}

const LocationInput: FC<Props> = ({
  onChange = () => {},
  className = "",
  defaultValue = "United States",
  headingText = "Where to?",
}) => {
  const [value, setValue] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter()

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSelectLocation = (item: string) => {
    // DO NOT REMOVE SETTIMEOUT FUNC
    setTimeout(() => {
      setValue(item);
      onChange && onChange(item);
    }, 0);
  };

  const renderSearchValues = ({
    heading,
    items,
  }: {
    heading: string;
    items: string[];
  }) => {
    return (
      <>
        <p className="block font-semibold text-base">
          {heading }
        </p>
        <div className="mt-3">
          {items.map((item) => {
            return (
              <div
                className="py-2 mb-1 flex items-center space-x-3 text-sm"
                onClick={() => handleSelectLocation(item)}
                key={item}
              >
                <MapPinIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                <span className="">{item}</span>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const search = async ( data: FormData) => {
    const query = data.get('search')
    console.log(query)
    if(query){
    router.push(`/listing-stay-map?location=${query}`)
    }
  }

  return (
    <div className={`${className}`} ref={containerRef}>
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        search(formData);
      }} className="p-5">
        <span className="block font-semibold text-xl sm:text-2xl">
          {headingText}
        </span>
        <div className="relative mt-5">
          <input
            className={`block w-full bg-transparent border px-4 py-3 pr-12 border-neutral-900 dark:border-neutral-200 rounded-xl focus:ring-0 focus:outline-none text-base leading-none placeholder-neutral-500 dark:placeholder-neutral-300 truncate font-bold placeholder:truncate`}
            placeholder={"Search destinations"}
            value={value}
            name="search"
            onChange={(e) => setValue(e.currentTarget.value)}
            ref={inputRef}
          />
          
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <MagnifyingGlassIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-400" />
          </span>
        </div>
        <div className="mt-2 flex w-full justify-center">
          <ButtonPrimary type="submit" className="rounded-md">Search</ButtonPrimary>
        </div>
        <div className="mt-7">
          {value
            ? renderSearchValues({
                heading: "",
                items: [
                 
                ],
              })
            : renderSearchValues({
                heading: "",
                items: [
                  
                ],
              })}
        </div>
      </form>
    </div>
  );
};

export default LocationInput;
