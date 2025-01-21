import { HomeIcon, IdCardIcon, Network, SettingsIcon, TimerIcon, Users2Icon } from 'lucide-react';
import { paths } from './paths';
import { NavigationItem } from '@/types/ui';

export const navigations : NavigationItem[] = [
    {
      title : 'Home',
      url : paths.home.getHref(),
      icon: HomeIcon,
      roles: ['ADMIN'],
    },
    {
      title: 'Setting',
      url : paths.setting.getHref(),
      icon: SettingsIcon,
      roles: ['ADMIN'], 
      items : [
        {
          title: 'Users',
          url : paths.users.getHref(),
          icon: IdCardIcon,
          roles: ['ADMIN'], 
        },
      ]
    }
]