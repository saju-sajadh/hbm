'use client'

import React, { FC, ReactNode, useEffect, useState } from "react";
import { DEMO_STAY_LISTINGS } from "@/data/listings";
import { StayDataType } from "@/data/types";
import ButtonPrimary from "@/shared/ButtonPrimary";
import HeaderFilter from "./HeaderFilter";
import StayCard from "./StayCard";
import StayCard2 from "./StayCard2";
import { Search } from "@/actions/server";


// OTHER DEMO WILL PASS PROPS
const DEMO_DATA = DEMO_STAY_LISTINGS.filter((_, i) => i < 8);


const SectionGridFeaturePlaces =  ({
  stayListings = DEMO_DATA,
  gridClass = "",
  heading = "Featured places to stay",
  subHeading = "Popular places to stay that Chisfis recommends for you",
  headingIsCenter,
  tabs ,
  cardType = "card2",
}) => {
  const renderCard = (stay) => {
   
    return <StayCard2 key={stay._id} data={stay} />;
  };
  const [tab, setTab] = useState('Kerala')
  const [places, setPlaces] = useState([])

  useEffect(()=>{
    async function fetchPlace(){
      const places = await Search(tab)
        setPlaces(places)
    }
    fetchPlace()
  },[tab])

  return (
    <div id="search" className="nc-SectionGridFeaturePlaces relative">
      <HeaderFilter
        tabActive={"Kerala"}
        subHeading={subHeading}
        tabs={tabs}
        heading={heading}
        setTab={setTab}
      />
      <div
        className={`grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gridClass}`}
      >
        {places.map((stay) => renderCard(stay))}
      </div>
     
    </div>
  );
};

export default SectionGridFeaturePlaces;
