import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import InputMask from "react-input-mask"; 
import { Input } from "../input";
import clsx from "clsx";
import { Label } from "../label";
import { id } from "date-fns/locale";

interface DateRangePickerProps  {
  value: DateRange | undefined;
  onChange: (date: DateRange | undefined) => void;
  disabledDate?: (date: Date) => boolean;
  numberOfMonths?: number;
  withTime?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  disabledDate,
  numberOfMonths = 1,
  withTime = false,
}: DateRangePickerProps) {
  const [range, setRange] = React.useState<DateRange | undefined>(value);
  const [ inputMask, setInputMask] = React.useState({
    from : "",
    to : ""
  });
  const [startDateError, setStartDateError] = React.useState<string | undefined>("");
  const [endDateError, setEndDateError] = React.useState<string | undefined>("");

  // Handle changes to the start date input
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const parsedStart = parse(input, "dd/MM/yyyy", new Date());

    setInputMask((prevValue)=> {
      return {
        from : input,
        to : prevValue.to
      }
    })

    if (input.length === 10 && isValid(parsedStart)) {
      setStartDateError("");
      setRange((prevRange) => ({
        from: parsedStart,
        to: prevRange?.to || undefined,
      }));
    } else if (input === "") {
      setStartDateError("");
      setRange((prevRange) => ({
        from: undefined,
        to: prevRange?.to || undefined,
      }));
    } else {
      setStartDateError("Invalid start date");
    }
  };

  // Handle changes to the end date input
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const parsedEnd = parse(input, "dd/MM/yyyy", new Date());

    setInputMask((prevValue)=> {
      return {
        from : prevValue.from,
        to : input
      }
    })

    if (input.length === 10 && isValid(parsedEnd)) {
      setEndDateError("");
      setRange((prevRange) => ({
        from: prevRange?.from || undefined,
        to: parsedEnd,
      }));
    } else if (input === "") {
      setEndDateError("");
      setRange((prevRange) => ({
        from: prevRange?.from || undefined,
        to: undefined,
      }));
    } else {
      setEndDateError("Invalid end date");
    }
  };

  const calendarOnSelect = (range : DateRange | undefined) => setRange(range)
  const handleTimeChange = (type: "from" | "to", input: string) => {
    const [hours, minutes] = input.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      setRange((prevRange) => {
        const date = prevRange?.[type];
        if (!date) return prevRange; // Skip if no date is selected
        const updatedDate = new Date(date);
        updatedDate.setHours(hours, minutes);
        return { ...prevRange, [type]: updatedDate };
      });
    }
  };

  React.useEffect(() => {
    if (range && withTime) {
      let newFromDate = range.from ? new Date(range.from) : undefined;
      let newToDate = range.to ? new Date(range.to) : undefined;
  
      if (newFromDate && !newFromDate.getHours()) {
        newFromDate.setHours(0, 0); // Set default from time as 00:00
      }
  
      if (newToDate && !newToDate.getHours()) {
        newToDate.setHours(23, 59); // Set default to time as 23:59
      }
  
      setRange({
        from: newFromDate ?? range.from,  // Preserve previous value if undefined
        to: newToDate ?? range.to         // Preserve previous value if undefined
      });
    }
  },[])

  React.useEffect(() => {
    onChange(range);
    if(range){
      setInputMask({
        from : range.from ? format(range.from, "dd/MM/yyyy") : "",
        to : range.to ? format(range.to, "dd/MM/yyyy") : ""
      })
    }
  }, [range]);
  
  return (
    <div className={clsx("flex flex-col gap-4")}>
      {/* Date Range Picker Button */}
      <Popover>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="range"
            selected={range}
            onSelect={calendarOnSelect} // Handle the range passed from the calendar
            disabled={disabledDate}
            numberOfMonths={numberOfMonths}
          />
        </PopoverContent>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="pl-3 text-left font-normal"
          >
            {range?.from && range?.to ? (
              <>
                {withTime ? (
                  // Include time if withTime is true
                  `${format(range.from, "dd MMMM yyyy HH:mm", { locale: id })} - ${format(range.to, "dd MMMM yyyy HH:mm", { locale: id })}`
                ) : (
                  // Only date if withTime is false
                  `${format(range.from, "dd MMMM yyyy", { locale: id })} - ${format(range.to, "dd MMMM yyyy", { locale: id })}`
                )}
              </>
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          {/* Start Date Section */}
          <div className="flex flex-col md:flex-1 gap-2">
            <Label className="whitespace-nowrap">Start</Label>
            <div className="flex items-center gap-2">
              {/* Start Date Input */}
              <div className="flex flex-grow relative">
                <InputMask
                  mask="99/99/9999" // Mask for the date format DD/MM/YYYY
                  value={inputMask.from}
                  onChange={handleStartDateChange}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      placeholder="DD/MM/YYYY"
                      className={clsx("w-full", startDateError ? "border-red-500" : "")}
                    />
                  )}
                </InputMask>
                <div className="absolute right-0">
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="font-normal rounded-l-none">
                      <CalendarIcon className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                </div>
              </div>

              {/* Start Time Input */}
              {withTime && (
                <Input
                  type="time"
                  className="w-24"
                  value={range?.from ? format(range.from, "HH:mm") : ""}
                  onChange={(e) => handleTimeChange("from", e.target.value)}
                />
              )}
            </div>
            {startDateError && <p className="text-red-500 text-sm">{startDateError}</p>}
          </div>

          {/* End Date Section */}
          <div className="flex flex-col md:flex-1 gap-2">
            <Label className="whitespace-nowrap">End</Label>
            <div className="flex items-center gap-2">
              {/* End Date Input */}
              <div className="flex flex-grow relative">
                <InputMask
                  mask="99/99/9999" // Mask for the date format DD/MM/YYYY
                  value={inputMask.to}
                  onChange={handleEndDateChange}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      placeholder="DD/MM/YYYY"
                      className={clsx("w-full", endDateError ? "border-red-500" : "")}
                    />
                  )}
                </InputMask>
                <div className="absolute right-0">
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="font-normal rounded-l-none">
                      <CalendarIcon className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                </div>
              </div>

              {/* End Time Input */}
              {withTime && (
                <Input
                  type="time"
                  className="w-24"
                  value={range?.to ? format(range.to, "HH:mm") : ""}
                  onChange={(e) => handleTimeChange("to", e.target.value)}
                />
              )}
            </div>
            {endDateError && <p className="text-red-500 text-sm">{endDateError}</p>}
          </div>
        </div>
      </Popover>
    </div>
  );
}
