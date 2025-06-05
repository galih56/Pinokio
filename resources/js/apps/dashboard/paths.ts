
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
  forms: {
    path: 'forms',
    getHref: () => '/forms',
  },
  form: {
    path: 'forms/:id',
    getHref: (id?: string) => `/forms/${id}`,
  },
  formBuilder: {
    path: 'forms/:id/template',
    getHref: (id?: string) => `/forms/${id}/template`,
  },
  tasks: {
    path: 'tasks',
    getHref: () => '/tasks',
  },
  task: {
    path: 'tasks/:id',
    getHref: (id?: string) => `/tasks/${id}`,
  },
  teams: {
    path: 'teams',
    getHref: () => '/teams',
  },
  team: {
    path: 'teams/:id',
    getHref: (id?: string) => `/teams/${id}`,
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
  userRoles: {
    path: 'user-roles',
    getHref: () => '/user-roles',
  },
  userRole: {
    path: 'useroles/:id',
    getHref: (id?: string) => `/user-roles/${id}`,
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
