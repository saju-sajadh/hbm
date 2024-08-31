'use client'

import React, { FC } from "react";
import GallerySlider from "@/components/GallerySlider";
import { DEMO_STAY_LISTINGS } from "@/data/listings";
import BtnLikeIcon from "@/components/BtnLikeIcon";
import Link from "next/link";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { cancelBooking } from "@/actions/server";
import toast from "react-hot-toast";



const DEMO_DATA = DEMO_STAY_LISTINGS[0];

const BookCard = ({
  size = "default",
  className = "",
  data,
  bookings,
  session
}) => {
  console.log(data, bookings)
  const {
    photos,
    address,
    title,
    price,
    _id,
  } = data;



  const renderSliderGallery = () => {
    return (
      <div className="relative w-full">
        <GallerySlider
          uniqueID={`StayCard2_${_id}`}
          ratioClass="aspect-w-12 aspect-h-11"
          galleryImgs={photos}
          imageClass="rounded-lg"
          href={`/${_id}/listing-stay-detail`}
        />
        <BtnLikeIcon  className="absolute right-3 top-3 z-[1]" />
        
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className={size === "default" ? "mt-3 space-y-3" : "mt-2 space-y-2"}>
        <div className="space-y-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {session?.role === "owner" 
          ? 
          <span>{title}</span>
           : 
           <>
          <span className="line-clamp-1">Checkin: {new Date(bookings.checkin).toLocaleString()}</span>
          <span className="line-clamp-1">Checkout: {new Date(bookings.checkout).toLocaleString()}</span>
          </>
          }
            
          </span>
          <div className="flex items-center space-x-2">
           
            <h2
              className={`font-semibold capitalize text-neutral-900 dark:text-white ${
                size === "default" ? "text-base" : "text-base"
              }`}
            >
              {title}
            </h2>
          </div>
          <div className="flex items-center text-neutral-500 dark:text-neutral-400 text-sm space-x-1.5">
            {size === "default" && (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
            {session?.role === 'owner' ? <span className="text-xs">{address}</span> :  <span className="">no of guests: {bookings.numberofguests}</span>}
          </div>
        </div>
        <div className="w-14 border-b border-neutral-100 dark:border-neutral-800"></div>
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold">
            {session?.role === 'owner' ? '100' : bookings?.price} $
            {` `}
            {size === "default" && (
              <span className="text-sm text-neutral-500 dark:text-neutral-400 font-normal">
                {session?.role === 'owner' ? '/night' : 'paid'}
              </span>
            )}
          </span>
          {session?.role !== 'owner' &&
          <ButtonPrimary onClick={async()=>{
            await cancelBooking(bookings._id)
            toast.success('cancelled booking', {position: 'top-right'})
          }} className="bg-red-600 hover:bg-red-500">Cancel Booking</ButtonPrimary>}
        </div>
      </div>
    );
  };

  return (
    <div className={`nc-StayCard2 group relative ${className}`}>
      {renderSliderGallery()}
      <Link href={`/${_id}/listing-stay-detail`}>{renderContent()}</Link>
    </div>
  );
};

export default BookCard;
