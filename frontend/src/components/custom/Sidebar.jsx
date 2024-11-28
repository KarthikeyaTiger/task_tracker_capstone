import React from 'react'

// shadcn ui components
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

// Icons
import { Menu } from 'lucide-react'

const Sidebar = () => {
  return (
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
  )
}

export default Sidebar;