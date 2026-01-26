"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import AuthLayout from "../components/auth/AuthLayout";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // For this prototype, we just redirect to the files page.
    router.push("/files");
  };

  const footerLink = (
    <>
      Not a member?{" "}
      <Link
        href="/signup"
        className="font-semibold leading-6 text-red-600 hover:text-red-500 dark:text-red-400"
      >
        Sign up now
      </Link>
    </>
  );

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account"
      footerContent={footerLink}
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full rounded-t-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-white dark:ring-gray-700 dark:focus:ring-red-500"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="relative block w-full rounded-b-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-white dark:ring-gray-700 dark:focus:ring-red-500"
              placeholder="Password"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-red-600 hover:text-red-500 dark:text-red-400"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md bg-red-600 px-3 py-3 text-sm font-semibold text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Sign in
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
