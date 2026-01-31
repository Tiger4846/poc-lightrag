import { Suspense } from "react";
import { NavigationProvider } from "../contexts/NavigationContext";

export default function FilesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <NavigationProvider>
            <Suspense fallback={<div>Loading...</div>}>
                {children}
            </Suspense>
        </NavigationProvider>
    );
}