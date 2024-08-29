'use client'
import React from "react";
import CheckOutPagePageMain from "./PageMain";
import { useParams, useSearchParams } from "next/navigation";

const page = () => {
  
  const searchParams = useSearchParams();
  const params = useParams()
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');
  const placePriceParam = searchParams.get('placePrice');
  const nightParams = searchParams.get('nights')
  const guestsParams = searchParams.get('guests')

  const startDate = startDateParam ? new Date(startDateParam) : undefined;
  const endDate = endDateParam ? new Date(endDateParam) : undefined;
  const placePrice = placePriceParam ? parseInt(placePriceParam, 10) : undefined;
  const id = params.id ? params.id : undefined
  const nights = nightParams ? parseInt(nightParams) : undefined
  const guests = guestsParams ? parseInt(guestsParams) : undefined
  return <CheckOutPagePageMain startDate={startDate} endDate={endDate} placePrice={placePrice} Listid={id} nights={nights} guests={guests}/>;
};

export default page;
