import axios from "axios";

// Icons
import { Check, ChevronsUpDown } from "lucide-react";

// shadcn ui components
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

const CustomComboboxField = ( { name, control, label, form } ) => {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://127.0.0.1:8000/employee',
            headers: { }
        };

        axios.request(config)
        .then((response) => {
            setEmployees(response.data);
        })
        .catch((error) => {
            console.log(error);
        });
    }, [])
    
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
            <FormItem className="flex flex-col">
                <FormLabel>{label}</FormLabel>
                <Popover>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                            )}
                        >
                            {field.value
                            ? employees.find(
                                (employee) => employee.id === field.value
                                )?.name
                            : "Select the Project Manager"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                    <CommandInput placeholder="Search employee..." />
                    <CommandList>
                        <CommandEmpty>No employee found.</CommandEmpty>
                        <CommandGroup>
                        {employees.map((employee) => (
                            <CommandItem
                            value={employee.id}
                            key={employee.id}
                            onSelect={() => {
                                form.setValue("employee_id", employee.id);
                            }}
                            className="justify-between"
                            >
                                <div>
                                    <p className="me-5 text-zinc-600">{employee.id}</p>
                                    <p>{employee.name}</p>
                                </div>
                                <Check
                                    className={cn(
                                    "ml-auto",
                                    employee.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                    </Command>
                </PopoverContent>
                </Popover>
                <FormMessage />
            </FormItem>
            )}
        />
    );
};

export default CustomComboboxField;