"use client";

import { Tab } from "@headlessui/react";
import React, { FC, Fragment, useEffect, useState } from "react";
import visaPng from "@/images/vis.png";
import mastercardPng from "@/images/mastercard.svg";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import Textarea from "@/shared/Textarea";
import ButtonPrimary from "@/shared/ButtonPrimary";
import StartRating from "@/components/StartRating";
import NcModal from "@/shared/NcModal";
import ModalSelectDate from "@/components/ModalSelectDate";
import converSelectedDateToString from "@/utils/converSelectedDateToString";
import Image from "next/image";
import { createBooking, fetchLisingsDetails, fetchUserInfo } from "@/actions/server";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";


export interface CheckOutPagePageMainProps {
  className?: string;
  startDate?: Date;
  endDate?: Date;
  placePrice?: any;
  Listid?: any;
  nights?: any;
  guests?: any;
}

export type Place = {
            owner: any;
            title: any;
            address: any;
            photos: any;
            description: any;
            features: any;
            extrainfo: any;
            checkin: any;
            checkout: any;
            maxguest: any;
            price: any;
            firstName: any;
            lastName: any;
            hasImage: any;
            imageUrl: any;
}

type Info = {
        place: any;
       user: any;
       checkin: any;
       checkout: any;
       numberofguests: any;
       name: any;
       phone: any;
       price: any;
       email: any;
      }

const CheckOutPagePageMain: FC<CheckOutPagePageMainProps> = ({
  className = "", startDate, endDate, placePrice, Listid, nights, guests
}) => {

  const [place, setPlace] = useState< Place | null | undefined >()
  const [phone, setPhone] = useState< String >("")
  const [loading, setLoading] = useState< boolean | undefined >(false)

  const { user } = useUser()
  const router = useRouter()


  useEffect(()=>{
    async function fetchdata(){
      
        if(user){
          const listing: Place | undefined = await fetchLisingsDetails(Listid)
          setPlace(listing) 
        const { contactNumber } = await fetchUserInfo(user?.id)
        setPhone(contactNumber)
        }
    }
    fetchdata()
  },[user])


  const payPal = async (formdata: FormData) => {
    setLoading(true)
    const email = formdata.get('email')
    const password = formdata.get('password')
    if(!email || !password || !user){
      toast.error('Login to payPal', {position: "top-right"})
      setLoading(false)
      return
    }
    const bookInfo: Info = {
       place: Listid,
       user: user?.id,
       checkin: startDate,
       checkout: endDate,
       numberofguests: guests,
       name: user?.firstName && user?.lastName ? user?.firstName+" "+user?.lastName : user?.id,
       phone: phone? phone : "",
       price: placePrice*nights,
       email: user?.emailAddresses[0]?.emailAddress
    }
    const booking = await createBooking(bookInfo)
    if(booking._id){
      router.push(`/${Listid}/listing-stay-detail/pay-done?startDate=${startDate}&endDate=${endDate}&placePrice=${placePrice}&nights=${nights}&guests=${guests}&method=PayPal&bookingid=${booking._id}`);
    }else{
      toast.error('Failed payment', {position: "top-right"})
    }  
    setLoading(false)
  }

  const cardPayment = async (formdata: FormData) => {
    setLoading(true)
    const card = formdata.get('card')
    const cvc = formdata.get('cvc')
    const name = formdata.get('name')
    const expiary = formdata.get('expiary')
    if(!card || !name || !cvc || !expiary || !user){
      toast.error('Add Card details', {position: "top-right"})
      setLoading(false)
      return
    }
    const bookInfo: Info = {
      place: Listid,
      user: user?.id,
      checkin: startDate,
      checkout: endDate,
      numberofguests: guests,
      name: user?.firstName && user?.lastName ? user?.firstName+" "+user?.lastName : user?.id,
      phone: phone? phone : "",
      price: placePrice*nights,
      email: user?.emailAddresses[0]?.emailAddress ? user?.emailAddresses[0]?.emailAddress : ""
   }
   const booking = await createBooking(bookInfo)
   if(booking._id){
    router.push(`/${Listid}/listing-stay-detail/pay-done?startDate=${startDate}&endDate=${endDate}&placePrice=${placePrice}&nights=${nights}&guests=${guests}&method=PayPal&bookingid=${booking._id}`);
  }else{
    toast.error('Failed payment', {position: "top-right"})
  } 
   setLoading(false)
  }


  const renderSidebar = () => {
    return (
      <div className="w-full flex flex-col sm:rounded-2xl lg:border border-neutral-200 dark:border-neutral-700 space-y-6 sm:space-y-8 px-0 sm:p-6 xl:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="flex-shrink-0 w-full sm:w-40">
            <div className=" aspect-w-4 aspect-h-3 sm:aspect-h-4 rounded-2xl overflow-hidden">
              <Image
                alt=""
                fill
                sizes="200px"
                src={place?.photos[0] ? place?.photos[0] : "https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"}
              />
            </div>
          </div>
          <div className="py-5 sm:px-5 space-y-3">
            <div>
              <span className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">
                {place?.title}
              </span>
              <span className="text-base font-medium mt-1 block">
                {place?.address}
              </span>
            </div>
            <span className="block  text-sm text-neutral-500 dark:text-neutral-400">
              {place?.features && place.features.map((feature: any, index: Number)=>(
                <p key={feature}>{(feature).toUpperCase()+" "}</p>
              ))}
            </span>
            <div className="w-10 border-b border-neutral-200  dark:border-neutral-700"></div>
            <StartRating />
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <h3 className="text-2xl font-semibold">Price detail</h3>
          <div className="flex justify-between text-neutral-6000 dark:text-neutral-300">
            <span>${placePrice}x {nights} day</span>
            <span>${placePrice * nights}</span>
          </div>
          <div className="flex justify-between text-neutral-6000 dark:text-neutral-300">
            <span>Service charge</span>
            <span>$0</span>
          </div>

          <div className="border-b border-neutral-200 dark:border-neutral-700"></div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${placePrice * nights}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMain = () => {
    return (
      <div className="w-full flex flex-col sm:rounded-2xl sm:border border-neutral-200 dark:border-neutral-700 space-y-8 px-0 sm:p-6 xl:p-8">
        <h2 className="text-3xl lg:text-4xl font-semibold">
          Confirm and payment
        </h2>
        <div className="border-b border-neutral-200 dark:border-neutral-700"></div>
        <div>
          <div>
            <h3 className="text-2xl font-semibold">Your trip</h3>
            <NcModal
              renderTrigger={(openModal) => (
                <span
                  onClick={() => openModal()}
                  className="block lg:hidden underline  mt-1 cursor-pointer"
                >
                  View booking details
                </span>
              )}
              renderContent={renderSidebar}
              modalTitle="Booking details"
            />
          </div>
          <div className="mt-6 border border-neutral-200 dark:border-neutral-700 rounded-3xl flex flex-col sm:flex-row divide-y sm:divide-x sm:divide-y-0 divide-neutral-200 dark:divide-neutral-700 overflow-hidden z-10">
            <ModalSelectDate
              renderChildren={({ openModal }) => (
                <button
                  
                  className="text-left flex-1 p-5 flex justify-between space-x-5 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  type="button"
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-400">Date</span>
                    <span className="mt-1.5 text-lg font-semibold">
                      {converSelectedDateToString([startDate, endDate])}
                    </span>
                  </div>
                  
                </button>
              )}
            />

            
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold">Pay with</h3>
          <div className="w-14 border-b border-neutral-200 dark:border-neutral-700 my-5"></div>

          <div className="mt-6">
            <Tab.Group>
              <Tab.List className="flex my-5 gap-1">
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={`px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full focus:outline-none ${
                        selected
                          ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                          : "text-neutral-6000 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      Paypal
                    </button>
                  )}
                </Tab>
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={`px-4 py-1.5 sm:px-6 sm:py-2.5  rounded-full flex items-center justify-center focus:outline-none  ${
                        selected
                          ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                          : " text-neutral-6000 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <span className="mr-2.5">Credit card</span>
                      <Image className="w-8" src={visaPng} alt="visa" />
                      <Image
                        className="w-8"
                        src={mastercardPng}
                        alt="mastercard"
                      />
                    </button>
                  )}
                </Tab>
              </Tab.List>

              <Tab.Panels>
                <Tab.Panel className="space-y-5">
                  <form action={payPal}>
                  <div className="space-y-1">
                    <Label>Email </Label>
                    <Input type="email" placeholder="example@gmail.com" name="email" />
                  </div>
                  <div className="space-y-1">
                    <Label>Password </Label>
                    <Input type="password" placeholder="********" name="password" />
                  </div>
                  <div className="pt-8">
              <ButtonPrimary disabled={loading} type="submit">{loading ? <LoadingOutlined/> :'Confirm and pay'}</ButtonPrimary>
            </div>
                  </form>
                </Tab.Panel>
                <Tab.Panel className="space-y-5">
                 <form action={cardPayment}>
                 <div className="space-y-1">
                    <Label>Card number </Label>
                    <Input placeholder="111 112 222 999" name="card" />
                  </div>
                  <div className="space-y-1">
                    <Label>Card holder </Label>
                    <Input placeholder="JOHN DOE" name="name" />
                  </div>
                  <div className="flex space-x-5  ">
                    <div className="flex-1 space-y-1">
                      <Label>Expiration date </Label>
                      <Input type="date" placeholder="MM/YY" name="expiary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label>CVC </Label>
                      <Input type="password" name="cvc" onKeyPress={(event) => {
                        if (!/\d/.test(event.key)) {
                        event.preventDefault();
                        }
                      }} maxLength={3}/>
                    </div>
                  </div>
                  <div className="pt-8">
              <ButtonPrimary disabled={loading} type="submit">{loading ? <LoadingOutlined/> :'Confirm and pay'}</ButtonPrimary>
            </div>
                 </form>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
            
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`nc-CheckOutPagePageMain ${className}`}>
      <main className="container mt-11 mb-24 lg:mb-32 flex flex-col-reverse lg:flex-row">
        <div className="w-full lg:w-3/5 xl:w-2/3 lg:pr-10 ">{renderMain()}</div>
        <div className="hidden lg:block flex-grow">{renderSidebar()}</div>
      </main>
    </div>
  );
};

export default CheckOutPagePageMain;
