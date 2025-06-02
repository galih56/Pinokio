import { useRouteError, isRouteErrorResponse, useNavigate, useNavigationType, useLocation } from "react-router-dom";
import { AxiosError } from "axios";
import { AlertTriangle, Home, MoveLeft, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { getBaseRoute } from "@/lib/utils";

export const AppRootErrorBoundary = () => {
  const error = useRouteError();

  const navigate = useNavigate();
  const location = useLocation();

  const baseRoute = getBaseRoute(location.pathname);

  const handleGoBack = () => {
    navigate(baseRoute, { replace: true });
  };

  let title = "An unexpected error occurred.";
  let message = "This component failed to render properly.";

  if (isRouteErrorResponse(error)) {
    title = `Error ${error.status}`;
    message = error.statusText || (error.data as any)?.message || message;
  } else if (error instanceof AxiosError) {
    title = `Error ${error.response?.status ?? "Unknown"}`;
    message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred during the request.";
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "object" && error !== null) {
    message = (error as any).message ?? JSON.stringify(error);
  }

  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <div className="flex items-center space-x-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <h3 className="text-sm font-medium text-red-800">{title}</h3>
      </div>
      <p className="text-sm text-red-700 mb-3">{message}</p>
      <div className="flex space-x-2 mt-4" >
        <Button 
          variant="outline"
          onClick={handleGoBack} className="w-full">
          <MoveLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
};
