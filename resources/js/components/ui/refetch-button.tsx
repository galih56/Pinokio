import { useState } from "react";
import { Button } from "./button";
import { Loader2, RefreshCcw } from "lucide-react";

type RefetchButtonProps = {
    onClick : (event: any) => void
}

export const RefetchButton = ({ onClick } : RefetchButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
  
    return (
      <Button
        size={"lg"}
        type="button"
        variant={"secondary"}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)} 
      >
        {isLoading || isHovered ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
      </Button>
    );
  };
  