"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type ComboBoxOption = {
  value: string;
  label: string;
  [key: string]: any; // Allow additional properties for custom rendering
};

interface ComboBoxProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  options: ComboBoxOption[];
  label: string;
  onSelect: (selectedOption: ComboBoxOption | null) => void;
  selectedOption: ComboBoxOption | null;
  isLoading?: boolean;
  isError?: boolean;
  renderOption?: (option: ComboBoxOption, isSelected: boolean) => React.ReactNode; // Custom render prop
}

export function ComboBox({
  inputValue,
  onInputChange,
  options,
  label,
  selectedOption,
  onSelect,
  isLoading,
  isError,
  renderOption,
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSelect = (value: string) => {
    const selected = options.find((option) => option.value === value) || null;
    onSelect(selected);
    setOpen(false);
  };

  const buttonContent = selectedOption
    ? renderOption
      ? renderOption(selectedOption, true) // Render custom selected item
      : selectedOption.label
    : label;

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="w-full">
          <Button variant="outline" className="justify-start">
            {buttonContent}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
          <OptionList
            inputValue={inputValue}
            onInputChange={onInputChange}
            options={options}
            onSelect={handleSelect}
            isLoading={isLoading}
            isError={isError}
            renderOption={renderOption}
            selectedValue={selectedOption?.value}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="justify-start">{buttonContent}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <OptionList
            inputValue={inputValue}
            onInputChange={onInputChange}
            options={options}
            onSelect={handleSelect}
            isLoading={isLoading}
            isError={isError}
            renderOption={renderOption}
            selectedValue={selectedOption?.value}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

interface OptionListProps {
  isLoading?: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  options: ComboBoxOption[];
  onSelect: (value: string) => void;
  isError?: boolean;
  selectedValue?: string;
  renderOption?: (option: ComboBoxOption, isSelected: boolean) => React.ReactNode;
}

function OptionList({ inputValue, onInputChange, options, onSelect, isLoading, isError, selectedValue, renderOption }: OptionListProps) {
  return (
    <Command shouldFilter={false}>
      <CommandInput placeholder="Filter options..." value={inputValue} onValueChange={onInputChange} />
      <CommandList>
        {isLoading && <CommandEmpty>Loading...</CommandEmpty>}
        {isError && <CommandEmpty>Error loading options.</CommandEmpty>}
        {!isLoading && options.length === 0 && <CommandEmpty>No options found.</CommandEmpty>}
        {!isLoading && options.length > 0 && (
          <CommandGroup>
            {options.map((option) => (
              <CommandItem key={option.value} value={option.value || ""} onSelect={() => onSelect(option.value)}>
                {renderOption ? renderOption(option, option.value === selectedValue) : option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
