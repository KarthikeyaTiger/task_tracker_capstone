import { useEffect, useState } from "react";
import { useGlobalContext } from "../../context/GlobalContext";
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

const CustomComboboxField = ( { name, label, placeholder, control, form, url, selected } ) => {
    const { token } = useGlobalContext();
    const [data, setData] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataError, setDataError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedItemsLoading, setSelectedItemsLoading] = useState(true);
    const [selectedItemsError, setSelectedItemsError] = useState(null);

    const fetchDataItems = async () => {
        try {
            const response = await fetchData(url, token);
            if (response.data) {
                setData(response.data);
            }
        } catch (error) {
            setDataError(error.response.data.detail);
        } finally {
            setDataLoading(false);
        }
    }
    
    const fetchSelectedData = async () => {
        try {
            const response = await fetchData(selected, token);
            if (response.data) {
                setSelectedItems(response.data);
            }
        } catch (error) {
            setSelectedItemsError(error.response.data.detail);
        } finally {
            setSelectedItemsLoading(false);
        }
    }

    useEffect(() => {
        fetchDataItems();
        if (selected) {
            fetchSelectedData();
        } else {
            setSelectedItemsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (data) {
            setDataLoading(false);
        }
    }, [data])

    useEffect(() => {
        form.setValue(name, selectedItems);
    }, [selectedItems])
    
    return (
        dataLoading
        ? <>Loading employees...</>
        : dataError
        ? <>Error {console.error(dataError)}</>
        : <>
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>{label}</FormLabel>
                    <Popover>
                        <PopoverTrigger className="p-0 max-h-60 overflow-y-auto" asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                    "justify-between",
                                    "px-3",
                                    !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {placeholder}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                            <Command>
                            <CommandInput placeholder="Search employee..." />
                            <CommandList>
                                <CommandEmpty>No employee found.</CommandEmpty>
                                <CommandGroup>
                                    {data.map((datum) => (
                                        <CommandItem
                                            value={datum.email_id}
                                            key={datum.employee_id}
                                            onSelect={() => {
                                                if (!selectedItems.includes(datum.employee_id)) {
                                                    setSelectedItems([...selectedItems, datum.employee_id]);
                                                }
                                            }}
                                            className="justify-between"
                                        >
                                            <div>
                                                <p>{datum.name}</p>
                                                <p className="me-5 text-zinc-600">{datum.email_id}</p>
                                            </div>
                                            <Check
                                                className={cn(
                                                "ml-auto",
                                                selectedItems.includes(datum.employee_id)
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
            
            {
                selectedItemsLoading
                ? <>Loading...</>
                : selectedItemsError
                ? <>Error</>
                : selectedItems.length === 0
                ? <></>
                : <div>
                    <p className="text-sm font-normal">Selected Employees</p>
                    <div className="max-w-[100%]">
                        {selectedItems.map((item, index) => {
                            const selectedItem = data.find(i => i.employee_id === item);

                            return selectedItem ? (
                                <Button
                                    className="rounded-full text-xs p-2 px-5 m-1"
                                    key={index}
                                    variant="outline"
                                    onClick={() => setSelectedItems(selectedItems.filter(id => id !== item))}
                                    asChild
                                >
                                    <Badge variant="outline" className="space-x-3">
                                        <div className="text-left">
                                            <p>{selectedItem.name}</p>
                                            <p className="text-zinc-700 font-normal">{selectedItem.email_id}</p>
                                        </div>
                                        <X size={16} />
                                    </Badge>
                                </Button>
                            ) : null;
                        })}
                    </div>
                </div>
            }
        </>
    );
};

export default CustomComboboxField;