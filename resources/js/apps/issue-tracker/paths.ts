
export const paths : Paths = {
  home: {
    path: '/request-tracker',
    getHref: () => '/',
  },
  issue: {
    path: 'request-tracker/:id',
    getHref: (id?: string) => `/request-tracker/${id}`,
  },
} as const;
