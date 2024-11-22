import { Check, ChevronsUpDown } from "lucide-react";

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

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
];

const CustomComboboxField = ({ name, control, label, form }) => {
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
                            ? languages.find(
                                (language) => language.value === field.value
                                )?.label
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
                        {languages.map((language) => (
                            <CommandItem
                            value={language.label}
                            key={language.value}
                            onSelect={() => {
                                form.setValue("employee_id", language.value);
                            }}
                            >
                            {language.label}
                            <Check
                                className={cn(
                                "ml-auto",
                                language.value === field.value
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