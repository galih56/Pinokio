import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CirclePicker } from "react-color";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import clsx from "clsx";

type ColorPickerPopoverProps = {
  value: string; // Current color value
  onChange: (color: string) => void; // Callback to update the color
  triggerLabel?: string; // Label for the Popover trigger
};

export const ColorPickerPopover = ({
  value,
  onChange,
  triggerLabel = "",
}: ColorPickerPopoverProps) => {

  const handleColorChange = (color: string) => {
    onChange(color); // Propagate the change to the parent component
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" style={{ backgroundColor: value }} className={clsx("rounded-xl border-gray-500 border-solid", (triggerLabel ?? ""))}>
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <CirclePicker
          color={value}
          onChangeComplete={(color) => handleColorChange(color.hex)} // Update state and propagate
        />
      </PopoverContent>
    </Popover>
  );
};
