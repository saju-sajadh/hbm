'use client'

import { useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'

const Recommendations = () => {

    const { user } = useUser()
    const [location, setLocation] = useState< any| null | undefined>()

    useEffect(() => {
        if('geolocation' in navigator) {
            // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                const { latitude, longitude } = coords;
                fetch(`https://openmensa.org/api/v2/canteens?near[lat]=${latitude}&near[lng]=${longitude}&near[dist]=50000`).then(async(res)=>{
                    const data = await res.json();

                        if (data.length > 0) {
                        // Extract the city name from the first object
                        let cityName = data[0].city;
                        // Remove text in parentheses and trim any extra spaces
                        cityName = cityName.split(' (')[0].trim();
                        console.log(cityName)
                        setLocation(cityName);
                        }
                })               
            })
        }
    }, []);

    useEffect(()=>{
        async function fetchFeaturedplaces(){
            if(location){
                const formData = new FormData()
                formData.append()
                const response = await fetch('/api/recommend', {
                    method: 'POST',
                    body: formData,
                })

                console.log(response)
            }
        }
        fetchFeaturedplaces()
    },[location])

  return (
    <div className="recommendations">
        <h2>Recommendations</h2>

    </div>
  )
}

export default Recommendations