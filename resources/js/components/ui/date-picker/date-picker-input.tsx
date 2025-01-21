import React, { useState, useEffect } from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Popover } from "@radix-ui/react-popover";
import { Input } from "../input";
import { PopoverContent, PopoverTrigger } from "../popover";
import { Button } from "../button";
import { Calendar } from "../calendar";
import { cn } from "@/lib/utils";
import clsx from "clsx";

interface DateTimePickerInputProps {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  defaultValue?: Date | undefined;
  onBlur?: () => void;
  disabledDate?: (date: Date) => boolean;
  withTime? : boolean;
}

const DateTimePickerInput: React.FC<DateTimePickerInputProps> = ({
  value,
  onChange,
  defaultValue,
  onBlur,
  disabledDate,
  withTime = false
}) => {
  const [stringDate, setStringDate] = useState<string>(
    value ? format(value, "dd/MM/yyyy") : defaultValue ? format(defaultValue, "dd/MM/yyyy") : ""
  );
  const [stringTime, setStringTime] = useState<string>(
    value ? format(value, "HH:mm") : defaultValue ? format(defaultValue, "HH:mm") : ""
  );
  const [dateError, setDateError] = useState<string>("");
  const [timeError, setTimeError] = useState<string>("");

  // Handle date input changes
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, "");

    if (inputValue.length > 2) {
      inputValue = inputValue.slice(0, 2) + "/" + inputValue.slice(2);
    }
    if (inputValue.length > 5) {
      inputValue = inputValue.slice(0, 5) + "/" + inputValue.slice(5);
    }

    setStringDate(inputValue);

    if (inputValue.length === 10) {
      const parsedDate = parse(inputValue, "dd/MM/yyyy", new Date());

      if (!isValid(parsedDate)) {
        setDateError("Invalid date format");
        onChange(undefined);
      } else {
        setDateError("");
        const combinedDate = new Date(parsedDate.setHours(0, 0, 0, 0));
        onChange(combinedDate);
      }
    } else {
      setDateError("Invalid date format");
      onChange(undefined);
    }
  };

  // Handle time input changes
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const isValidTime = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);

    if (value && !isValidTime) {
      setTimeError("Invalid time format");
      onChange(undefined);
    } else {
      setTimeError("");
      setStringTime(value);

      // Default to 00:00 if empty
      const [hours, minutes] = value.length ? value.split(":").map(Number) : [0, 0];
      const updatedDate = new Date(value ? value : '00:00').setHours(hours, minutes);
      const combinedDate = new Date(updatedDate);
      onChange(combinedDate);
    }
  };

  // Sync value (Date and Time) into the string inputs
  useEffect(() => {
    if (value && isValid(value)) {
      setStringDate(format(value, "dd/MM/yyyy"));
      setStringTime(format(value, "HH:mm"));
    } else {
      setStringDate("");
      setStringTime("");
    }
  }, [value]);

  return (
    <div className="flex items-center gap-2">
      {/* Date Picker */}
      <div className={clsx("relative flex-grow",dateError ? "mb-8" : "")}>
        <Input
          type="text"
          value={stringDate}
          onChange={handleDateInputChange}
          onBlur={onBlur} // Pass onBlur to the input
          placeholder="DD/MM/YYYY"
          maxLength={10}
          className={clsx("flex-grow", dateError ? "border-red-500" : "")}
        />
        {/* Popover Button */}
        <div className="absolute right-3 top-[50%] translate-y-[-50%]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="font-normal absolute -right-3 translate-y-[-50%] top-[50%] rounded-l-none"
              >
                <CalendarIcon className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-boxdark">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(selectedDate) => {
                  if (!selectedDate) return;
                  const combinedDate = new Date(selectedDate.setHours(0, 0, 0, 0));
                  onChange(combinedDate);
                  setStringDate(format(selectedDate, "dd/MM/yyyy"));
                  setDateError("");  // Clear error on valid date selection
                }}
                defaultMonth={value}
                disabled={disabledDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Error Message */}
        {dateError && (
          <div className="absolute text-red-500 text-sm mt-1 w-full">
            <span>{dateError}</span>
          </div>
        )}
      </div>

      {/* Time Picker */}
      {withTime && (
        <div className="relative">
          <Input
            type="time"
            value={stringTime}
            onChange={handleTimeChange}
            onBlur={onBlur} // Pass onBlur to the input
            placeholder="HH:mm"
            className={timeError ? "border-red-500" : ""}
          />
          {timeError && (
            <div className="absolute text-red-500 text-sm mt-1 w-full">
              <span>{timeError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimePickerInput;
