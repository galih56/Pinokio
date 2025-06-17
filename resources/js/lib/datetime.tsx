import {parse, format, parseISO, isValid, isDate } from 'date-fns';
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export function parseWithTimeZone(date : string, format : string, referenceDate : any, timeZone : string) {
    const zonedDate = toZonedTime(referenceDate, timeZone);
    const parsedDate = parse(date, format, zonedDate);
    return fromZonedTime(parsedDate, timeZone);
}
export const validateDateFormat = (date : string, format: string) => {
    if(date && format.length == date.length){
        const value = parse(date, format, new Date());
        if(isValid(value)){
            return value
        }
    }
    return null;
}

export const formatDate = (date: number | Date | string) => {
    if(date){
        if(typeof date === "string"){
            date = parseISO(date);
        }
        date = format(date, 'd MMM yyyy');
        return date
    }
    return "";
}

export const formatTime = (date: number | Date | string, resultFormat : string = 'HH:mm') => {
    try {
        if (date) {
            if (typeof date === 'string') {
                if (date.match(/^\d{2}:\d{2}:\d{2}$/)) {
                    // Parse time-only string into a Date object
                    date = parse(date, 'HH:mm:ss', new Date());
                } else if (date.match(/^\d{2}:\d{2}$/)) {
                    // Parse time-only string without seconds into a Date object
                    date = parse(date, 'HH:mm', new Date());
                } else {
                    // Parse ISO or other valid date strings
                    date = new Date(date);
                }
            }
    

            if (!isDate(date) || isNaN(date.getTime())) {
                throw new Error("Invalid date format");
            }
    
            return format(date, resultFormat);
        }
        return '';
    } catch (error) {
        console.error(error,{date,resultFormat})
        return '';
    }
};

export const formatDateTime = (date: number | Date | string) => {
    if(date){
        if(typeof date === "string"){
            date = parseISO(date);
        }
        date = format(date, 'd MMM yyyy hh:mm:ss');
        return date
    }
    return "";
};

export function createDateTimeObject(datetimeString: string, formats = [
    'dd/MM/yyyy',
    'dd/MM/yyyy HH:mm:ss',
    'dd.MM.yyyy',
    'dd/MM/yyyy HH:mm:ss',
    'dd/MM/yyyy HH.mm.ss',
    'dd-MM-yyyy HH:mm:ss',
    'yyyy-MM-dd HH:mm:ss',
    'yyyy-MM-dd HH.mm.ss',
    'MM/dd/yyyy hh:mm:ss a XXX',
    'yyyy-MM-dd',
    'dd-MMM-yyyy'
]) {
    // Ensure datetimeString is not an obviously invalid format
    if (typeof datetimeString !== 'string' || datetimeString.trim() === '') {
        return false; // Invalid input
    }

    // Check for ISO 8601 format
    const isoDate = new Date(datetimeString);
    if (!isNaN(isoDate.getTime()) && /^\d{4}-\d{2}-\d{2}T/.test(datetimeString)) {
        return isoDate; // Valid ISO date
    }

    // Check custom formats
    for (const format of formats) {
        const dateTime = parse(datetimeString, format, new Date());
        if (isValid(dateTime)) {
            return dateTime; // Valid custom format
        }
    }

    return false; // No valid formats found
}


export const convertDates = (data: any, depth: number = 0, maxDepth: number = 10): any => {
if (depth > maxDepth) return data; // Stop recursion if maxDepth is reached

if (Array.isArray(data)) {
    return data.map((item) => convertDates(item, depth + 1));
} else if (typeof data === "object" && data !== null) {
    const newData = { ...data };
    let flag = null;
    try {
    for (const key in newData) {
        flag = {
            key: key,
            current_data: newData[key],
            data: newData
        };

        if (!!newData[key] && typeof newData[key] === "object" && !(newData[key] instanceof Date)) {
            newData[key] = convertDates(newData[key], depth + 1); // Recursive call with increased depth
        } else if (typeof newData[key] === 'string') {
            const dateString = newData[key];

            // Check for the specific "0000-00-00 00:00:00" string
            if (dateString === '0000-00-00 00:00:00') {
                newData[key] = null; // or handle it as you prefer
            } else {
                const date = createDateTimeObject(dateString); // It checks and parses multiple formats
                if (date) {
                    newData[key] = date;
                }
            }
        }
    }
    } catch (error) {
    console.warn({
        error,
        data: flag
    });
    }
    return newData;
}
return data;
};

export function formatSecondsToDuration(secs : number) {
  if (!secs || secs <= 0) return "-";
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;

  let parts = [];
  if (hours > 0) parts.push(`${hours} hr`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (hours === 0 && minutes === 0) parts.push(`${seconds} sec`);
  return parts.join(" ");
}