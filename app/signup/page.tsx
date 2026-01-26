"use client";

import Link from "next/link";
import AuthLayout from "../components/auth/AuthLayout";

export default function SignupPage() {
  const footerLink = (
    <>
      Already have an account?{" "}
      <Link
        href="/login"
        className="font-semibold leading-6 text-red-600 hover:text-red-500 dark:text-red-400"
      >
        Sign in
      </Link>
    </>
  );

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join us today and start your journey"
      footerContent={footerLink}
    >
      <form className="mt-8 space-y-6" action="#" method="POST">
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="full-name" className="sr-only">
              Full Name
            </label>
            <input
              id="full-name"
              name="full-name"
              type="text"
              autoComplete="name"
              required
              className="relative block w-full rounded-t-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-white dark:ring-gray-700 dark:focus:ring-red-500"
              placeholder="Full Name"
            />
          </div>
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
              className="relative block w-full border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-white dark:ring-gray-700 dark:focus:ring-red-500"
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
              autoComplete="new-password"
              required
              className="relative block w-full border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-white dark:ring-gray-700 dark:focus:ring-red-500"
              placeholder="Password"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="relative block w-full rounded-b-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-red-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-white dark:ring-gray-700 dark:focus:ring-red-500"
              placeholder="Confirm Password"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
            required
          />
          <label
            htmlFor="terms"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
          >
            I agree to the{" "}
            <a
              href="#"
              className="font-medium text-red-600 hover:text-red-500 dark:text-red-400"
            >
              Terms and Conditions
            </a>
          </label>
        </div>

        <div>
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md bg-red-600 px-3 py-3 text-sm font-semibold text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Sign up
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
