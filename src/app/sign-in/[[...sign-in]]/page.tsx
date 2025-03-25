import { SignIn } from '@clerk/nextjs'
import React from 'react'

export default function page() {
  return (
    <div className='flex justify-center py-10'><SignIn/></div>
  )
}
