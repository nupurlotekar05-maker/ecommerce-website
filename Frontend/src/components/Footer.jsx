import React from 'react'
import { assets } from '../assets/assets'

export default function Footer() {
    return (
        <div >
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

                <div >
                    <img src={assets.logo} className='mb-5 w-32' alt="" />
                    <p className='w-full md:w-2/3 text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat velit sint harum eaque quibusdam laborum accusantium illum amet dolorum a provident, error officiis consequatur, facere impedit molestiae fuga quaerat vel.</p>
                </div>

                <div>
                    <p className='text-xl font-medium mb-5'>Company</p>
                    <ul className='flex flex-col gap-1 text-gray-600'>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Delivery</li>
                        <li>Privacy Policy</li>
                    </ul>
                </div>

                <div>
                    <p className='text-xl mb-5 font-medium'>Get In Touch</p>
                    <ul className='flex flex-col gap-1 text-gray-600'>
                        <li>+91-9594203398</li>
                        <li>Contact@forever@gmail.com</li>
                    </ul>
                </div>

                <div>
                    <hr className='border-gray-300'/>
                    <p className='py-5 text-sm text-center'>Copyright 2026 @ Forever.com - All Rights Reserved.</p>
                </div>


            </div>
        </div>
    )
}
