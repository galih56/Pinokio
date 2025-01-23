
export const paths : Paths = {
  home: {
    path: '/issue-tracker',
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
} as const;
