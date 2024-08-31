'use client'

import React, { useEffect, useState} from "react";
import Label from "@/components/Label";
import Avatar from "@/shared/Avatar";
import Input from "@/shared/Input";
import Select from "@/shared/Select";
import Textarea from "@/shared/Textarea";
import { useUser } from "@clerk/nextjs";
import {CheckAccuntStats, createOrupdateUser, fetchUserInfo} from '@/actions/server'
import { LoadingOutlined } from '@ant-design/icons';
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


const AccountPage = () => {

  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfbirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(()=>{
     async function fetchUser(){
      if(user){
        const customer = await fetchUserInfo(user.id)
        if(customer){
          const {name, gender, dateOfBirth, address, bio, contactNumber} = customer
          setName(name);
          setGender(gender);
          setDateOfBirth(dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : '');
          setAddress(address);
          setBio(bio);
          setContactNumber(contactNumber);
        }
      }
    }
    fetchUser()
  },[user])

  const handleData = async (formdata) => {
    try {
      setLoading(true)
      if(user){
        const stats = await CheckAccuntStats(user?.id)
        if(stats == false){
          router.push('/suspended')
          return
        }
      }
      const name = formdata.get("name");
      const bio = formdata.get("bio");
      const address = formdata.get("address");
      const dateOfbirth = formdata.get("dateOfBirth");
      const contactNumber = formdata.get("contactNumber");
      const gender = formdata.get("gender");

      if (profile) {
        const reader = new FileReader();
        reader.onload = async () => {
          const blob = new Blob([reader.result], { type: profile.type });
          const updatedUser = await user.setProfileImage({ file: blob });
          console.log(updatedUser);
        };
        reader.readAsArrayBuffer(profile);
      }

      await createOrupdateUser(
        name,
        bio,
        address,
        dateOfbirth,
        contactNumber,
        gender,
        user?.primaryEmailAddress?.emailAddress,
        user.id
      );
      setLoading(false)
      toast.success('updated successfully', {position: "top-right"})
    } catch (error) {
      console.log(error);
      setLoading(false)
      toast.error('something went wrong', {position: "top-right"})
    }
  };

  const handleProfileChange = (event) => {
    setProfile(event.target.files[0]);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(event.target.files[0]);
  };

  return (
    <form action={handleData} className="space-y-6 sm:space-y-8">
      <h2 className="text-3xl font-semibold">Account information</h2>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
      <div className="flex flex-col md:flex-row">
        <div className="flex-shrink-0 flex items-start">
          <div className="relative rounded-full overflow-hidden flex">
          {preview ? (
              <img src={preview} alt="Profile preview" className="w-32 h-32" />
            ) : (
              <Avatar imgUrl={user?.imageUrl} sizeClass="w-32 h-32" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-neutral-50 cursor-pointer">
              <svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.5 5H7.5C6.83696 5 6.20107 5.26339 5.73223 5.73223C5.26339 6.20107 5 6.83696 5 7.5V20M5 20V22.5C5 23.163 5.26339 23.7989 5.73223 24.2678C6.20107 24.7366 6.83696 25 7.5 25H22.5C23.163 25 23.7989 24.7366 24.2678 24.2678C24.7366 23.7989 25 23.163 25 22.5V17.5M5 20L10.7325 14.2675C11.2013 13.7988 11.8371 13.5355 12.5 13.5355C13.1629 13.5355 13.7987 13.7988 14.2675 14.2675L17.5 17.5M25 12.5V17.5M25 17.5L23.0175 15.5175C22.5487 15.0488 21.9129 14.7855 21.25 14.7855C20.5871 14.7855 19.9513 15.0488 19.4825 15.5175L17.5 17.5M17.5 17.5L20 20M22.5 5H27.5M25 2.5V7.5M17.5 10H17.5125"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="mt-1 text-xs">Change Image</span>
            </div>
            <input
              name='profile'
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleProfileChange}
            />
          </div>
        </div>
        <div className="flex-grow mt-10 md:mt-0 md:pl-16 max-w-3xl space-y-6">
          <div>
            <Label>Name</Label>
            <Input
              name="name"
              className="mt-1.5"
              accept="image/jpeg, image/png"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>Gender</Label>
            <Select
              name="gender"
              className="mt-1.5"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div>
            <Label>UserId</Label>
            <Input
              name="userid"
              disabled={true}
              className="mt-1.5"
              value={user?.id ? user.id : 'something went wrong'}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              name="email"
              disabled={true}
              className="mt-1.5"
              value={user?.primaryEmailAddress?.emailAddress ? user?.primaryEmailAddress?.emailAddress : 'something went wrong'}
            />
          </div>
          <div className="max-w-lg">
            <Label>Date of birth</Label>
            <Input
              name="dateOfBirth"
              className="mt-1.5"
              type="date"
              value={dateOfbirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              name="address"
              className="mt-1.5"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <Label>Phone number</Label>
            <Input
              name="contactNumber"
              className="mt-1.5"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
          </div>
          <div>
            <Label>About you</Label>
            <Textarea
              name="bio"
              className="mt-1.5"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="pt-2">
            <button className="ttnc-ButtonPrimary px-4 py-3 sm:px-6 rounded-xl text-sm sm:text-base font-medium disabled:bg-opacity-70 bg-primary-6000 hover:bg-primary-700 text-neutral-50" disabled={loading} >{loading ? <LoadingOutlined />: 'update info'}</button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AccountPage;
