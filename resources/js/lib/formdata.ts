import { format } from "date-fns";
import { camelize, decamelize, decamelizeKeys } from "humps";

export function blobToFile(blob : any, fileName : string) {
    // Create a new File object from the Blob
    const file = new File([blob], fileName, { type: blob.type });
    return file;
}
export const createFormData = (data: any, formData = new FormData(), parentKey = ''): FormData => {
    for (const property in data) {
        if (data.hasOwnProperty(property)) {
            const key = decamelize(parentKey ? `${parentKey}[${property}]` : property);
            const value = data[property];

            if (value === null || value === undefined) {
                continue; // Skip null or undefined values
            }

            switch (typeof value) {
                case 'object':
                    if (value instanceof FileList) {
                        // Append each file in FileList
                        for (let i = 0; i < value.length; i++) {
                            formData.append(`${key}[${i}]`, value[i]);
                        }
                    } else if (value instanceof File) {
                        // Append single File
                        formData.append(key, value);
                    } else if (value instanceof Date) {
                        // Format and append Date
                        formData.append(key, format(value, 'yyyy-MM-dd HH:mm:ss'));
                    } else {
                        // Recursively process nested objects
                        createFormData(value, formData, key);
                    }
                    break;

                case 'boolean':
                    // Append boolean as '1' or '0'
                    formData.append(key, value ? '1' : '0');
                    break;

                default:
                    // Append other primitive types
                    formData.append(key, value);
                    break;
            }
        }
    }
    return formData;
};


