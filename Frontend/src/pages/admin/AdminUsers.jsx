import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'

export default function AdminUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ecom_users')) || []
      setUsers(stored)
    } catch (error) {
      console.error('Failed to load users from localStorage:', error)
      setUsers([])
    }
  }, [])

  return (
    <div className='border-t pt-16 pb-16'>
      <div className='text-2xl mb-6'>
        <Title text1={"MANAGE"} text2={"USERS"} />
      </div>
      <div className='flex flex-col'>
        {users.length === 0 && (
          <p className='text-gray-500'>No registered users yet.</p>
        )}
        {users.map((u) => (
          <div key={u.id} className='flex items-center justify-between border-b py-3 text-sm text-gray-700'>
            <div>
              <p className='font-medium'>{u.name}</p>
              <p className='text-gray-500'>{u.email}</p>
            </div>
            <span className={`px-3 py-0.5 rounded-full text-white text-xs ${u.role === "ADMIN" ? "bg-red-500" : "bg-green-600"}`}>
              {u.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
