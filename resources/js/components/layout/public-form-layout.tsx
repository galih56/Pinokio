import { PropsWithChildren, ReactNode } from "react";
import { Card } from "../ui/card";
import { Button, buttonVariants } from "../ui/button";
import { RotateCcwIcon, Undo2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import useGuestIssuerStore from "@/store/useGuestIssuer";

export const PublicFormTopBar = () => {
    const { loggedIn, setLoggedIn, setEmail, setName } = useGuestIssuerStore();
    const resetIdentity = () => {
        setLoggedIn(false);
        setEmail('');
        setName('');
    }

    return (
        <div className="flex justify-between mb-4">
            <a
                href={import.meta.env.VITE_BASE_URL + "/auth/login"}
                className={cn(buttonVariants({ variant: 'ghost' }))}
                >
                <Undo2Icon className="mr-2 h-4 w-4" />
                Back to Login Page
            </a>
            {loggedIn && 
                <Button variant={'info'} onClick={resetIdentity}>
                    <RotateCcwIcon className="mr-2 h-4 w-4" />
                    Reset User Info
                </Button>}
        </div>
    )
}

export default function PublicFormLayout({
    children
}: PropsWithChildren<{
}>) {

    return (
        <main className="md:pt-0">
            
            <Card className="p-6 my-6 mx-12">
                <div className="mt-4">
                    {children}
                </div>
            </Card>
        </main>
    );
}