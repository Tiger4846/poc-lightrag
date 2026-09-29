"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect } from "react";
import Swal from 'sweetalert2';
import AuthLayout from "../components/auth/AuthLayout";
import { useState } from "react";
import api from "@/lib/axios";
export default function LoginPage() {
  const router = useRouter();

  const [userdata, setUserdata] = useState({
    email: "",
    password: ""
  });
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/users/login', {
        email: userdata.email,
        password: userdata.password
      });

      if (response.status === 200 || response.data.status === 200) {
        // เก็บ token และ userId ใน localStorage
        if (response.data.token) {
            localStorage.setItem('lightragDirectoryToken', response.data.token);
          localStorage.setItem('userId', response.data.userId);
          localStorage.setItem('userName', response.data.name);
        }

        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          timer: 1500
        }).then(() => {
          router.push("/files");
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: error.response?.data?.error || 'กรุณาตรวจสอบข้อมูล',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserdata((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };



  const footerLink = (
    <>
      ยังไม่มีบัญชี?{" "}
      <Link
        href="/signup"
        className="font-semibold leading-6 text-gray-900 hover:text-gray-600"
      >
        สมัครสมาชิก
      </Link>
    </>
  );

  useEffect(() => {
    const token = localStorage.getItem("lightragDirectoryToken");

    if (token) {
      router.replace("/files");
    }
  }, [router]);

  return (
    <AuthLayout
      title="ยินดีต้อนรับกลับมา"
      subtitle="เข้าสู่ระบบบัญชีของคุณ"
      footerContent={footerLink}
    >
      <form className="mt-6 md:mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="email-address" className="sr-only">
              อีเมล
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full rounded-t-md border-0 p-2.5 md:p-3 text-sm md:text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-gray-900"
              placeholder="อีเมล"
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              รหัสผ่าน
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="relative block w-full rounded-b-md border-0 p-2.5 md:p-3 text-sm md:text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-gray-900"
              placeholder="รหัสผ่าน"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              onChange={handleInputChange}
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900"
            >
              จดจำฉันไว้
            </label>
          </div>

          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-gray-900 hover:text-gray-600"
            >
              ลืมรหัสผ่าน?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md bg-gray-900 px-3 py-2.5 md:py-3 text-sm font-semibold text-white hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
