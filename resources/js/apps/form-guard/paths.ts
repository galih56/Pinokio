
export const paths : Paths = {
  home: {
    path: '/forms',
    getHref: () => '/',
  },
  forms: {
    path: 'forms/:id',
    getHref: (id?: string) => `/forms/${id}`,
  },
} as const;
