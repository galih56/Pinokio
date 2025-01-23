
export const paths : Paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },
  dashboard: {
    path: '',
    getHref: () => '/',
  },
  issues: {
    path: 'issues',
    getHref: () => '/issues',
  },
  issue: {
    path: 'issues/:id',
    getHref: (id?: string) => `/issues/${id}`,
  },
  tags: {
    path: 'tags',
    getHref: () => '/tags',
  },
  tag: {
    path: 'tags/:id',
    getHref: (id?: string) => `/tags/${id}`,
  },
  users: {
    path: 'users',
    getHref: () => '/users',
  },
  user: {
    path: 'users/:id',
    getHref: (id?: string) => `/users/${id}`,
  },
  setting: {
    path: 'setting',
    getHref: () => '/setting',
  },
  profile: {
    path: 'profile',
    getHref: () => '/profile',
  },
} as const;
