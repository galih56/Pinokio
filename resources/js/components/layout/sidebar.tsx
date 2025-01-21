import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"
import { Link } from 'react-router-dom';
import logo from '@/assets/logo-with-label.png';

import { 
  MoreHorizontal
} from "lucide-react";
import { paths } from "@/apps/dashboard/paths";
import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/use-media-query";
import { NavigationItem } from "@/types/ui";

const Logo = () => {
  return (
    <Link className="flex items-center text-white py-6" to={paths.home.getHref()}>
      <img className="h-14 w-auto" src={logo} alt="Workflow" />
    </Link>
  );
};

export type SidebarType = {
  navigationItems : Array<NavigationItem>
}

export function AppSidebar({ navigationItems } : SidebarType) {
  const isMobile = useMediaQuery("(max-width: 768px)"); 
  
  return (
    <Sidebar>
      <SidebarHeader className="items-center">
        <Logo/>
      </SidebarHeader>
      <SidebarContent>
          <SidebarMenu>
            {navigationItems.map((item) => {
              if(item.items){
                return (
                  <DropdownMenu key={item.title}>
                    <SidebarMenuItem>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                          {item.icon && <item.icon />}
                          {item.title} 
                          <MoreHorizontal className="ml-auto" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      {item.items?.length ? (
                        <DropdownMenuContent
                          side={isMobile ? "bottom" : "right"}
                          align={isMobile ? "end" : "start"}
                          className="min-w-56 rounded-lg"
                        >
                          {item.items.map((subitem) => (
                            <DropdownMenuItem asChild key={subitem.title}>
                              <Link to={subitem.url}>
                                {subitem.title}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      ) : null}
                    </SidebarMenuItem>
                  </DropdownMenu>
                )  
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
      </SidebarContent>
      <SidebarFooter/>
    </Sidebar>
  )
}
  