import { useLocation } from "react-router-dom";

export const useBaseName = () => {
    const location = useLocation();
    const fullPath = window.location.pathname;
    const baseName = fullPath.replace(location.pathname, '');
    return baseName;
};