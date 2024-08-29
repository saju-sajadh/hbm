'use client'

import React, { useEffect, useState } from "react";
import NavigationItem from "./NavigationItem";
import { NAVIGATION_DEMO } from "@/data/navigation";
import { useUser } from "@clerk/nextjs";
import { fetchUserInfo } from "@/actions/server";




function Navigation() {

  const { user } = useUser()
  const [session, setsession] = useState<any>()


  useEffect(()=>{
    async function fu(){
      if(user){
        const session = await fetchUserInfo(user.id)
        setsession(session)
      }
    }
    fu()
  },[])
  return (
    <ul className="nc-Navigation hidden lg:flex lg:flex-wrap lg:space-x-1 relative">
      {session?.role === 'owner' ? NAVIGATION_DEMO.map((item) => (
        <NavigationItem key={item.id} menuItem={item} /> 
      ))
      : session?.role === 'customer' ? NAVIGATION_DEMO.filter((item) => item.name !== 'Listing Page').map((item) => (
        <NavigationItem key={item.id} menuItem={item} />
      ))
      : !session ? 
        <></>
      :
        <></>}
      
    </ul>
  );
}

export default Navigation;
