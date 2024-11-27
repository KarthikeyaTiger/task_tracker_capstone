import React from 'react'
import { Navigate } from 'react-router-dom'
import { useGlobalContext } from '../../context/GlobalContext'

// shadcn ui components
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Custom components
import Logout from '@/components/common/Logout'

// Icons
import { Menu } from 'lucide-react'

const Navbar = () => {

  const { isAuthenticated, user } = useGlobalContext();
  const userData = JSON.parse(user)

  return (
    isAuthenticated ? (
      <div className="py-4 px-6 sm:px-16 flex border-b justify-between">
        <Sheet>
          <SheetTrigger><Menu /></SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Are you absolutely sure?</SheetTitle>
              <SheetDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Popover>
          <PopoverTrigger>
            <div className='flex justify-end'>
              <div className="text-right px-3 my-auto">
                <p className='text-sm font-medium'>{userData.name}</p>
                <p className='text-xs'>{userData .email_id}</p>
              </div>
              <Avatar>
                <AvatarImage src={userData.picture} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[100%]"><Logout /></PopoverContent>
        </Popover>
    </div>
    )
    : (<Navigate to="/login" />)
  )
}

export default Navbar
