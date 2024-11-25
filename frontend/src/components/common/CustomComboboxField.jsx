import { useEffect, useState } from "react";
import axios from "axios";
import fetchData from '@/hooks/fetchData'

// Icons
import { Check, ChevronsUpDown, X } from "lucide-react";

// shadcn ui components
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CustomComboboxField = ( { name, control, label, form, placeholder, url } ) => {
    const [data, setData] = useState([]);
    const [dataLoading, setDataLoading] = useState([]);
    const [dataError, setDataError] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const fetchDataItems = async () => {
        try {
            const itemData = await fetchData(url);
            if (itemData) {
                setData(itemData);
            }
        } catch (error) {
            setDataError(error);
            console.error("Error fetching project data:", error);
        }
    }

    useEffect(() => {
        fetchDataItems();
    }, [])

    useEffect(() => {
        if (data) {
            setDataLoading(false);
        }
    }, [data])

    useEffect(() => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://127.0.0.1:8000/employee',
            headers: { }
        };

        axios.request(config)
        .then((response) => {
            setData(response.data);
        })
        .catch((error) => {
            console.log(error);
        });
    }, [])

    useEffect(() => {form.setValue("employee_id", selectedItems);}, [selectedItems])
    
    return (
        <>
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
                            {placeholder}
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
                        {data.map((datum) => (
                            <CommandItem
                                value={datum.id}
                                key={datum.id}
                                onSelect={() => {
                                    if (!selectedItems.includes(datum.id)) {
                                        setSelectedItems([...selectedItems, datum.id]);
                                    }
                                    console.log(selectedItems)
                                }}
                                className="justify-between"
                            >
                                <div>
                                    <p className="me-5 text-zinc-600">{datum.id}</p>
                                    <p>{datum.name}</p>
                                </div>
                                <Check
                                    className={cn(
                                    "ml-auto",
                                    selectedItems.includes(datum.id)
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
        {selectedItems.length === 0 ?
        <></>:
        <div>
            <p className="text-sm font-normal">Selected Employees</p>
            {selectedItems.map((item, index)=>(
                <Button
                    className="rounded-full text-xs p-1 px-3 m-1"
                    key={index} 
                    variant="outline"
                    onClick={()=> {setSelectedItems(selectedItems.filter(id => id !== item))}}
                    asChild
                >
                    <Badge variant="outline">{(data.find(i => i.id === item)).name}<X size={16} /></Badge>
                </Button>
            ))}
        </div>
        }
        </>
    );
};

export default CustomComboboxField;