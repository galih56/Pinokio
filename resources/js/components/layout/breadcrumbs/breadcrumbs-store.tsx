import { create } from 'zustand';
import { matchPath, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {match} from 'path-to-regexp';

export type BreadcrumbItemType = {
  title: string;
  url: string;
};
export type BreadcrumbStore = {
    url: string;
    items: BreadcrumbItemType[];
    setBreadcrumbs: (breadcrumbs: BreadcrumbItemType[]) => void;
    addBreadcrumb: (breadcrumb: BreadcrumbItemType) => void;
    replaceBreadcrumb: (pattern : string, url: string, newTitle: string , pathname? : string) => void;
    removeBreadcrumb: (url : string) => void;
};

function getInitialBreadcrumbs(pathname? : string){
  const pathParts = (pathname ?? window.location.pathname).split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const url = `/${pathParts.slice(0, index + 1).join('/')}`;
    return {
      title: part.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()), // Convert to human-readable title
      url,
    };
  });

  const homeBreadcrumb = { title: "Home", url: "/" };
  return [homeBreadcrumb, ...breadcrumbs]
}

export const useBreadcrumbs = create<BreadcrumbStore>((set) => {
  return ({
    url: location.pathname,
    items: getInitialBreadcrumbs(),
    setBreadcrumbs: (items) => set({ items }),
    addBreadcrumb: (item) => set(state => ({ items : [ ...state.items, item] })),
    removeBreadcrumb: (url) => set(state => {
        const updatedBreadcrumbs = state.items.filter(breadcrumb => breadcrumb.url !== url);
        return { items: updatedBreadcrumbs };
    }),
    replaceBreadcrumb: (pattern : string, url : string, newTitle : string, pathname? : string) => set((state) => {
      const updatedBreadcrumbs = (pathname ? getInitialBreadcrumbs(pathname) : state.items).map((breadcrumb) => {
        // Check if the breadcrumb matches the exact URL or the given pattern
        if (breadcrumb.url === url || match(pattern)(breadcrumb.url)) {
          return { ...breadcrumb, title: newTitle }; // Update the title
        }
        return breadcrumb; // Keep breadcrumb unchanged if no match
      });
    
      return { items: updatedBreadcrumbs }; // Return the updated breadcrumbs
    }),
})});

export function adjustActiveBreadcrumbs(pattern? : string, url? : string, title? : string, dependencies : any[] = []){
  const location = useLocation();
  const {setBreadcrumbs , replaceBreadcrumb, removeBreadcrumb} = useBreadcrumbs();
    
  useEffect(()=> {
    if(pattern){
      if(pattern && url && title) replaceBreadcrumb(pattern, url, title, location.pathname)
      else if(url) removeBreadcrumb(url)
    } else setBreadcrumbs(getInitialBreadcrumbs(location.pathname))
  },[...dependencies, location.pathname, url, title])
}