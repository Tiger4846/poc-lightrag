import { NavigationProvider } from "../contexts/NavigationContext";

export default function TrashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      {children}
    </NavigationProvider>
  );
}
