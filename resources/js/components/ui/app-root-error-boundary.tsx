import { useRouteError } from "react-router-dom";

export const AppRootErrorBoundary = () => {
  const error = useRouteError();
  console.error(error);
  return <div>Something went wrong!</div>;
};