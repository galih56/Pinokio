import { PropsWithChildren, ReactNode } from "react";

export default function PublicFormLayout({
    children
}: PropsWithChildren<{
}>) {
    return (
        <main className="md:pt-0">
            {children}
        </main>
    );
}