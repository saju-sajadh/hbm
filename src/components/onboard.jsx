'use client';
import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { selectRole } from '../actions/server';
import toast from 'react-hot-toast';
import {  useRouter } from 'next/navigation';


function Onboard() {
  const { user } = useUser();
  const router = useRouter();
  const [role, setRole] = useState('');
  


  

  

  const chooseRole = async (e) => {
    e.preventDefault();
    if (role && user) {
      await selectRole(user.id, role);
      user.update({
        unsafeMetadata: {
          role: role
        }
      })
      router.push('/');
    } else {
      toast.error('select a purpose',{position: 'top-right'})
    }
  };

  return (
    <div className='min-h-[70vh] flex justify-center items-center'>
      <form onSubmit={chooseRole} className="grid relative justify-center items-center w-64">
        <select
          name='role'
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value=''>Purpose of visit?</option>
          <option value='owner'>Add properties to hbm</option>
          <option value="customer">Plan trips</option>
        </select>
        <button
          type='submit'
          className='ttnc-ButtonPrimary mt-3 px-4 py-2 sm:px-6 rounded-xl text-sm sm:text-base font-medium disabled:bg-opacity-70 bg-primary-6000 hover:bg-primary-700 text-neutral-50'
        >
          Select
        </button>
      </form>
    </div>
  );
}

export default Onboard;
