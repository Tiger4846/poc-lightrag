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
    <div className="flex min-h-screen items-center justify-center p-3 md:p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-6 md:space-y-8 rounded-2xl border border-gray-200 bg-white p-6 md:p-10 shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-3 md:mb-4">
            <Image
              src="/lightrag-directory/project-logo.svg"
              alt="Document platform logo"
              width={120}
              height={120}
              className="h-auto w-20 md:w-[120px]"
              priority
            />
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-xs md:text-sm text-gray-600">
            {subtitle}
          </p>
        </div>
        
        {children}

        {footerContent && (
           <div className="border-t border-gray-100 pt-4 md:pt-6 text-center text-xs md:text-sm text-gray-500">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
}
