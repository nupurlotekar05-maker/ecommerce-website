import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Title from '../components/Title'

export default function Profile() {
  const { user } = useContext(AuthContext)

  return (
    <div className='border-t pt-16 pb-16'>
      <div className='text-2xl mb-6'>
        <Title text1={"MY"} text2={"PROFILE"} />
      </div>
      <div className='max-w-md flex flex-col gap-4 text-gray-700'>
        <div className='flex justify-between border-b pb-2'>
          <span className='text-gray-500'>Name</span>
          <span className='font-medium'>{user?.name}</span>
        </div>
        <div className='flex justify-between border-b pb-2'>
          <span className='text-gray-500'>Email</span>
          <span className='font-medium'>{user?.email}</span>
        </div>
        <div className='flex justify-between items-center border-b pb-2'>
          <span className='text-gray-500'>Role</span>
          <span className='px-3 py-0.5 rounded-full text-white text-xs bg-green-600'>
            {user?.role}
          </span>
        </div>
      </div>
    </div>
  )
}
