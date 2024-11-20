import React from 'react'

// shadcn ui components
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const CustomTextField = ({ control, name, label, placeholder, textarea }) => {
    return (
        <FormField
            name={name}
            control={control}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{ label }</FormLabel>
                    <FormControl>
                        { textarea ? 
                            <Textarea placeholder={ placeholder } className="resize-none" {...field} />:
                            <Input placeholder={ placeholder } {...field} />
                        }
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export default CustomTextField
