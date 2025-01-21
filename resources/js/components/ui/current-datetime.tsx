import { format } from 'date-fns'; // You'll need to install date-fns using `npm install date-fns`
import { useInterval } from '@/hooks/use-intervals'; // Custom hook for handling intervals
import { formatDate, formatTime } from '@/lib/datetime';
import { useEffect } from "react";
import { useState } from "react";
import { useController, Control } from "react-hook-form";
import { format as formatDateFns } from "date-fns"; // Import formatting functions

type CurrentDateTimeProps = {
  control: Control<any>;
  name: string; // Name for the hidden input
};

export const CurrentDateTime = ({ control, name }: CurrentDateTimeProps) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Hook into react-hook-form's state using useController
  const {
    field: { onChange, value },
  } = useController({
    name,
    control,
    defaultValue: currentDateTime.toISOString(),
  });

  // Update the hidden input's value and the displayed date/time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now);
      onChange(now.toISOString()); // Update the form value
    }, 1000);

    return () => clearInterval(interval);
  }, [onChange]);

  return (
    <div className="flex flex-col items-center text-gray-700">
      {/* Display formatted date */}
      <div className="font-semibold text-md">
        {formatDateFns(currentDateTime, "yyyy-MM-dd")}
      </div>
      {/* Display formatted time */}
      <div className="font-medium text-lg">
        {formatDateFns(currentDateTime, "HH:mm:ss")}
      </div>
      {/* Hidden input to sync with the form */}
      <input type="hidden" value={value} />
    </div>
  );
};
