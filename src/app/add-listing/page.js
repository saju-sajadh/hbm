'use client'

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WifiIcon from '@mui/icons-material/Wifi';
import TvIcon from '@mui/icons-material/Tv';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import PetsIcon from '@mui/icons-material/Pets';
import RoomPreferencesIcon from '@mui/icons-material/RoomPreferences';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import React, {useState} from 'react';
import axios from 'axios'
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from '../../../firebaseSdk'
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { addNewPlaceorUpdate } from '@/actions/server';
import toast from 'react-hot-toast';

export default function Addplace(){

    const [Validphoto,setValidphoto] = useState(true);
    const [addedPhotos,setAddedPhotos] = useState([]);
    const [imageCount,setImageCount] = useState(true);
    const [requiredData, setRequiredData] = useState(true);
    const [title,setTitle] = useState('');
    const [address,setAddress] = useState('');
    const [features,setFeatures] = useState([]);
    const [description,setDescription] = useState('');
    const [extraInfo,setExtraInfo] = useState('');
    const [checkin,setCheckin] = useState('');
    const [checkout,setCheckout] = useState('');
    const [maxguest,setMaxguest] = useState(1);
    const [price, setPrice] = useState('');
    const router = useRouter()
    const {user} = useUser()
    
    
    

    const HandleUpload = async (ev) => {
        const selectedFile = ev.target.files[0];
       if(selectedFile){
        const imageRef = ref(storage, `places/${selectedFile.name + Date.now()}`);
        await uploadBytes(imageRef, selectedFile)
        const latestImageUrl = await getDownloadURL(imageRef);
        if(latestImageUrl){
            setValidphoto(true);
            setAddedPhotos(prev => {
                return [...prev, latestImageUrl]
            })
        }
        }
         
        
      };
      const filteredArray = addedPhotos.filter((element) => element !== 'invalid' && element !== 'notfound');


      const addNewPlace = async (ev) => {
        ev.preventDefault();

        if(!user || title.length === 0 || address.length === 0 || description.length === 0 || extraInfo.length === 0 || checkin.length === 0 || checkout.length === 0 || maxguest.length === 0 || price.length === 0){   
                setRequiredData(false);
        }
        else if(filteredArray.length < 3){
                setImageCount(false);
        }
        else{
            try{setImageCount(true);
                const placeData = {
                    owner: user.id,
                    title,
                    address,
                    photos: filteredArray,
                    description,
                    features,
                    extrainfo: extraInfo,
                    checkin,
                    checkout,
                    maxguest,
                    price,
                };

                const formData = new FormData()
                formData.append('hotel_name', title)
                formData.append('address', address)
                formData.append('lat', (Math.random() * (80 - 40) + 40).toFixed(2))
                formData.append('lng', (Math.random() * (80 - 40) + 40).toFixed(2))
                
                // Call the server-side function
                const res = await fetch('/api/list_hotel', {
                    method: 'POST',
                    body: formData,
                })
                const result = await addNewPlaceorUpdate(placeData);
                if(result) {
                     toast.success('Place added successfully', {position: 'top-right'}) 
                     router.push(`/${result}/listing-stay-detail`)
                    }
                    else{
                        toast.success('something went wrong', {position: 'top-right'})
                    }
                
        }
            catch(error){
                console.log(error)
            }
        }   
    }

    const handleCheckbox = (ev)=>{
        const {checked,name} = ev.target;
        if(checked){
            setFeatures([...features,name])
        }else{
            setFeatures([...features.filter(selectedName => selectedName !== name)])
        }
    }

    const handleNumberKeyDown = (ev) => {
        
        const allowedKeyCodes = [
          8,46,48,49,50,51,52,53,54,55,56,57,96,97,98,99,100,101,102,103,104,105,  
        ];
    
        
        if (allowedKeyCodes.includes(ev.keyCode)) {
          return true; 
        } else {
          ev.preventDefault(); 
        }
      };


    return(
        <div className="container mx-auto lg:px-10 p-6">
                <div className="">
                    <div className="my-6 grid lg:grid-cols-2 lg:space-x-4">
                        <div className="">
                        <h2 className="font-semibold py-2 text-3xl">Title <span className="text-red-600"> *</span></h2>
                        <p className="italic text-base  lg:text-lg">Title should be catchy as in advertisement.</p>
                        <input spellCheck="false" value={title} onChange={ev => setTitle(ev.target.value)} className="rounded-full w-full  border-2 px-2 py-2 focus:outline-none border-gray-600" placeholder="Title should be catchy as in advertisement."></input>
                        </div>
                        <div className="">
                        <h2 className="font-semibold py-2 text-3xl">Address <span className="text-red-600"> *</span></h2>
                        <p className="italic text-base  lg:text-lg">Provide the Address of your destination.</p>
                        <input spellCheck="false" value={address} onChange={ev => setAddress(ev.target.value)} className="rounded-full w-full  border-2 px-2 py-2 focus:outline-none border-gray-600" placeholder="Address of your destination."></input>
                        </div>
                    </div>
                    <div className="my-6 grid lg:grid-cols-2 lg:space-x-4">
                        <div className="">
                            <h2 className="font-semibold py-2 text-3xl">Photos <span className="text-red-600"> *</span></h2>
                            <p className="italic text-base  lg:text-lg">More = Better</p>
                            
                            
                            
                        </div>
                        
                    </div>
                    <div className="my-6">
                         <div className="grid lg:grid-cols-4">
                         {filteredArray.map((link, index) => {
                                if (Validphoto || !link.endsWith('invalid') && !link.endsWith('notfound')) {
                                return (
                                    <div key={index.toString()} className="ms-2 mb-2">
                                        <img
                                            src={link}
                                            style={{borderRadius:"15px",cursor:"pointer"}}
                                            className="mt-3 px-1 w-[250px] h-[150px]"
                                        />
                                    </div>
                                );
                                }
                            })}
                            <input id="pic" type="file" multiple hidden className="" onChange={HandleUpload}/>
                            <div style={{borderRadius:"15px"}} className="border-2 border-gray-400  px-4 py-4 w-[250px] h-[150px] mt-3 font-semibold text-xl text-center"><label htmlFor='pic'><CloudUploadIcon className="" style={{width:'100px',height:'100px'}} /><br/>From computer</label></div>
                         </div> 
                         <p className="text-sm text-gray-500 italic">There is an issue with uploading from local devices and will be fixed soon.</p>   
                    </div>
                    <div className="my-6">
                        <h2 className="font-semibold py-2 text-3xl">Description <span className="text-red-600"> *</span></h2>
                        <p className="italic text-base  lg:text-lg">Provide a description of your place (maximum 300 characters).</p>
                        <textarea maxLength={300} spellCheck="false" value={description} onChange={ev => setDescription(ev.target.value)} rows={4} style={{resize:"none"}} className='px-2 w-3/4 lg:w-2/4 focus:outline-none border-2 border-gray-600 rounded' ></textarea>
                    </div>
                    <div className="my-6">
                        <h2 className="font-semibold py-2 text-3xl">Features</h2>
                        <p className="italic text-base  lg:text-lg">Select features of your place.</p>
                        <div className="w-3/4 lg:w-2/4 grid lg:grid-cols-2 lg:space-x-4">
                            <div className='grid grid-rows-3'>
                                <label className="border rounded px-2 py-6 border-gray-500">
                                    <input checked={features.includes('wifi')} type='checkbox' className="" name="wifi" onChange={handleCheckbox}></input>
                                    <span className="text-xl font-semibold ml-2"><WifiIcon/> Wifi</span>
                                </label>
                                <label className="border rounded px-2 py-6 border-gray-500">
                                    <input checked={features.includes('tv')} type='checkbox' className="" name="tv" onChange={handleCheckbox}></input>
                                    <span className="text-xl font-semibold ml-2"><TvIcon/> TV</span>
                                </label>
                                <label className="border rounded px-2 py-6 border-gray-500">
                                    <input checked={features.includes('entrance')} type='checkbox' className="" name="entrance" onChange={handleCheckbox}></input>
                                    <span className="text-xl font-semibold ml-2"><RoomPreferencesIcon/> Private Entrance</span>
                                </label>
                            </div>
                            <div className='grid grid-rows-3'>
                            <label className="border rounded px-2 py-6 border-gray-500">
                                <input checked={features.includes('parking')} type='checkbox' className="" name="parking" onChange={handleCheckbox}></input>
                                <span className="text-xl font-semibold ml-2"><TimeToLeaveIcon/> Free parking</span>
                            </label>
                            <label className="border rounded px-2 py-6 border-gray-500">
                                <input checked={features.includes('pets')} type='checkbox' className="" name="pets" onChange={handleCheckbox}></input>
                                <span className="text-xl font-semibold ml-2"><PetsIcon/> Pets</span>
                            </label>
                            <label className="border rounded px-2 py-6 border-gray-500">
                                <input checked={features.includes('taxi')} type='checkbox' className="" name="taxi" onChange={handleCheckbox}></input>
                                <span className="text-xl font-semibold ml-2"><LocalTaxiIcon/> Taxi service</span>
                            </label>                                  
                            </div>
                        </div>
                    </div>
                    <div className="my-6">
                        <h2 className="font-semibold py-2 text-3xl">Extra Info <span className="text-red-600"> *</span></h2>
                        <p className="italic text-base  lg:text-lg">House rules, etc (maximum 300 charecters).</p>
                        <textarea spellCheck="false" maxLength={300}  value={extraInfo} onChange={ev => setExtraInfo(ev.target.value)} rows={4} style={{resize:"none"}} className='px-2 w-3/4 lg:w-2/4 focus:outline-none border-2 border-gray-600 rounded' ></textarea>
                    </div>
                    <div className="my-6 w-3/4">
                        <h2 className="font-semibold py-2 text-3xl">Check in&out Times <span className="text-red-600"> *</span></h2>
                        <p className="italic text-base  lg:text-lg">Add check in&out times, remember to have some time window for cleaning the room between guests.</p>
                        <div className="grid lg:grid-cols-4 lg:mt-4">
                            <div className="">
                                <label className="font-semibold py-2 text-3xl">Check In Time</label>
                                <input spellCheck="false" value={checkin} onChange={ev => setCheckin(ev.target.value)} type="text" className="mt-4 px-2 border border-gray-500 rounded focus:outline-none" placeholder="14:00"/>
                            </div>
                            <div className="">
                                <label className="font-semibold py-2 text-3xl">Check Out Time</label>
                                <input spellCheck="false" value={checkout} onChange={ev => setCheckout(ev.target.value)} type="text" className="mt-4 px-2 border border-gray-500 rounded focus:outline-none" placeholder="23.00"/>
                            </div>
                            <div className="">
                                <label className="font-semibold py-2 text-3xl">Max Guests</label>
                                <input spellCheck="false" value={maxguest} onChange={ev => setMaxguest(ev.target.value)}  onKeyDown={handleNumberKeyDown} type="text" className="mt-4 px-2 border border-gray-500 rounded focus:outline-none" placeholder="100"/>
                            </div>
                            <div className="">
                                <label className="font-semibold py-2 text-3xl">Price ($) per day</label>
                                <input spellCheck="false" value={price} onChange={ev => setPrice(ev.target.value)} onKeyDown={handleNumberKeyDown} type="text" className="mt-4 px-2 border border-gray-500 rounded focus:outline-none" placeholder="200"/>
                            </div>
                        </div>
                    </div>
                    
                    {!imageCount && 
                        <div>
                             <p className="italic text-red-500">Please Add atleast 3 photos of the Infrastructure.</p>
                         </div>
                    }{!requiredData &&
                        <div>
                            <p className="italic text-red-500">PLEASE FILL ALL THE REQUIRED FIELDS.</p>
                        </div>
                    }
                    <div className="mt-6 flex justify-center">
                        <button onClick={addNewPlace} className="rounded px-8 py-2 text-white bg-blue-500">Save</button>
                    </div>
                </div>
                
        </div>
    )
}