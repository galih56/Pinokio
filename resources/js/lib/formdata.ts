import { format } from "date-fns";
import { decamelize } from "humps";

export function blobToFile(blob: Blob, fileName: string): File {
    const file = new File([blob], fileName, { type: blob.type });
    return file;
}

interface CreateFormDataOptions {
    dateFormat?: string;
    maxDepth?: number;
    booleanFormat?: 'string' | 'number';
}

export const createFormData = (
    data: Record<string, any>, 
    formData = new FormData(), 
    parentKey = '',
    options: CreateFormDataOptions = {},
    visited = new WeakSet(),
    currentDepth = 0
): FormData => {
    const { 
        dateFormat = 'yyyy-MM-dd HH:mm:ss', 
        maxDepth = 10,
        booleanFormat = 'number'
    } = options;

    // Prevent infinite recursion with depth limit
    if (currentDepth > maxDepth) {
        console.warn(`Maximum depth (${maxDepth}) reached, skipping further nesting`);
        return formData;
    }

    // Prevent circular references
    if (visited.has(data)) {
        console.warn('Circular reference detected, skipping object');
        return formData;
    }

    if (typeof data === 'object' && data !== null) {
        visited.add(data);
    }

    try {
        for (const property in data) {
            if (!Object.prototype.hasOwnProperty.call(data, property)) {
                continue;
            }

            const key = decamelize(parentKey ? `${parentKey}[${property}]` : property);
            const value = data[property];

            if (value === null || value === undefined) {
                continue;
            }

            try {
                if (Array.isArray(value)) {
                    // Handle regular arrays
                    value.forEach((item, index) => {
                        const arrayKey = `${key}[${index}]`;
                        if (item === null || item === undefined) {
                            return;
                        }
                        
                        if (typeof item === 'object' && !(item instanceof File) && !(item instanceof Date)) {
                            createFormData(
                                { [index]: item }, 
                                formData, 
                                key, 
                                options, 
                                visited, 
                                currentDepth + 1
                            );
                        } else {
                            appendValue(formData, arrayKey, item, dateFormat, booleanFormat);
                        }
                    });
                } else if (value instanceof FileList) {
                    // Handle FileList
                    for (let i = 0; i < value.length; i++) {
                        formData.append(`${key}[${i}]`, value[i]);
                    }
                } else if (value instanceof File) {
                    // Handle File and Blob
                    formData.append(key, value);
                } 
                else if (value instanceof Blob && !(value instanceof File)) {
                    const fileExtension = value.type.split('/')[1] || 'blob';
                    const file = blobToFile(value, key.split('[').join('_').replace(/\]+$/g, '') + '.' + fileExtension);
                    formData.append(key, file);
                }
                else if (value instanceof Date) {
                    // Handle Date
                    formData.append(key, format(value, dateFormat));
                } else if (typeof value === 'object') {
                    // Handle nested objects
                    createFormData(
                        value, 
                        formData, 
                        key, 
                        options, 
                        visited, 
                        currentDepth + 1
                    );
                } else {
                    // Handle primitives
                    appendValue(formData, key, value, dateFormat, booleanFormat);
                }
            } catch (error) {
                console.warn(`Error processing property "${property}":`, error);
                continue;
            }
        }
    } catch (error) {
        console.error('Error in createFormData:', error);
    } finally {
        // Clean up visited set for this object
        if (typeof data === 'object' && data !== null) {
            visited.delete(data);
        }
    }

    return formData;
};

function appendValue(
    formData: FormData, 
    key: string, 
    value: any, 
    dateFormat: string, 
    booleanFormat: 'string' | 'number'
): void {
    switch (typeof value) {
        case 'boolean':
            if (booleanFormat === 'number') {
                formData.append(key, value ? '1' : '0');
            } else {
                formData.append(key, value.toString());
            }
            break;
        case 'number':
        case 'string':
            formData.append(key, value.toString());
            break;
        default:
            if (value instanceof Date) {
                formData.append(key, format(value, dateFormat));
            } else {
                formData.append(key, String(value));
            }
            break;
    }
}