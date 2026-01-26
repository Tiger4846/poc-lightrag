import Image from "next/image";
import { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerContent?: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footerContent,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-200 bg-white p-10 shadow-xl dark:border-gray-800 dark:bg-black">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/swu_logo.png"
              alt="SWU Logo"
              width={120}
              height={120}
              className="h-auto w-auto"
              priority
            />
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        
        {children}

        {footerContent && (
           <div className="border-t border-gray-100 pt-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
}
