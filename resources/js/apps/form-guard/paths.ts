
export const paths : Paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },
  forms: {
    path: '',
    getHref: () => '/',
  },
  form: {
    path: '/:id',
    getHref: (id?: string) => `/${id}`,
  },
  formResponse: {
    path: '/:id/response',
    getHref: (id?: string) => `/${id}/response`,
  },
} as const;
