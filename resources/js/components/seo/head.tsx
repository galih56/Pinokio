import { Helmet, HelmetData } from 'react-helmet-async';

type HeadProps = {
  title?: string;
  description?: string;
};

const helmetData = new HelmetData({});

export const Head = ({ title = '', description = '' }: HeadProps = {}) => {
  return (
    <Helmet
      helmetData={helmetData}
      title={title ? `${title} | ${import.meta.env.VITE_APP_NAME}` : undefined}
      defaultTitle={`${import.meta.env.VITE_APP_NAME}`}
    >
      <meta name="description" content={description} />
    </Helmet>
  );
};
