
export type VariantType = "default" | "destructive" | "success" | "warning" | "info";
export type AlertType = {
    title: string;
    message: string;
    variant: VariantType; 
};

import { LucideIcon } from 'lucide-react';

// Define the type for a single navigation item
export type NavigationItem = {
  title: string; // The label of the navigation item
  url: string;   // The URL for the navigation item
  icon?: LucideIcon; // Optional: Icon component for the navigation item
  roles?: string[];  // Optional: Roles that can access this navigation item
  items?: NavigationItem[]; // Optional: Nested items for dropdowns or submenus
};

// Define the type for the `navigations` array
export type Navigations = NavigationItem[];
