import { PropsWithChildren, ReactNode } from "react";
import { Card } from "../ui/card";

export default function PublicFormLayout({
    children
}: PropsWithChildren<{
}>) {
    return (
        <main className="md:pt-0">
            <Card className="p-6 my-6 mx-12">
                {children}
            </Card>
        </main>
    );
}