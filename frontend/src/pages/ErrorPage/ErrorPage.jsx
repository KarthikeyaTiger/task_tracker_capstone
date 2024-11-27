import React from 'react'
import { Link } from 'react-router-dom'

const ErrorPage = () => {
  return (
    <div className='h-[100vh] grid grid-cols-2 gap-12'>
        <img className='h-[100%]' src="https://cdn.dribbble.com/userupload/11640996/file/original-9851586197d0ff34afbfae210251e812.jpg?resize=1200x1200&vertical=center" alt="Error Page Image" />
        <div className='my-auto'>
            <p className="text-xl text-red-900 font-medium mb-5">Error 404</p>
            <p className="text-6xl font-bold mb-10">there is <br />light in here too.</p>
            <p className="text-lg text-red-900 font-medium mb-10">But the page is missing or you assembled the link incorrectly.</p>
            <Link className='flex underline text-md pb-2 w-[100%]' to="/">Go home</Link>
        </div>
    </div>
  )
}

export default ErrorPage
