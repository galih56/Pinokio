import { PropsWithChildren, ReactNode } from "react";
import { Card } from "../ui/card";

export default function PublicFormLayout({
    header,
    children
}: PropsWithChildren<{
    header?: ReactNode;
}>) {
    return (
        <Card className="p-6 my-6 mx-12">
            {header && header }
            <main className="md:pt-0">
                {children}
            </main>
        </Card>
    );
}