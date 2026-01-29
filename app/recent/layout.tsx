import { NavigationProvider } from "../contexts/NavigationContext";

export default function RecentLayout({
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
