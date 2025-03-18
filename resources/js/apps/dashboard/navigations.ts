import { 
  BugIcon, HomeIcon, IdCardIcon, 
  Network, 
  SettingsIcon, User2Icon, 
  UsersIcon , ListTodoIcon
} from 'lucide-react';
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
      title: 'Tasks',
      url : paths.tasks.getHref(),
      icon: ListTodoIcon,
      roles: ['ADMIN'], 
    },
    {
      title: 'Teams',
      url : paths.teams.getHref(),
      icon: UsersIcon,
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
          title: 'User Roles',
          url : paths.userRoles.getHref(),
          icon: User2Icon,
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