import { fetchUserInfo } from '@/actions/server';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React from 'react'
import Onboard from '../../components/onboard'


async function OnboardPage() {

  const user = await currentUser();
  

  const profileInfo = await fetchUserInfo(user?.id);

  if (profileInfo?._id) {
      redirect("/");
  } else return (
    <Onboard/>
  )
}

export default OnboardPage