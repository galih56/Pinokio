import { BugIcon, HomeIcon, IdCardIcon, Network, SettingsIcon, TimerIcon, Users2Icon } from 'lucide-react';
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
      title: 'Issues',
      url : paths.issues.getHref(),
      icon: BugIcon,
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
        {
          title: 'Tags',
          url : paths.tags.getHref(),
          icon: IdCardIcon,
          roles: ['ADMIN'], 
        },
      ]
    }
]