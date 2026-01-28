"use client";

import Link from "next/link";
import AuthLayout from "../components/auth/AuthLayout";
import { useState } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';


export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ตรงกัน',
        text: 'กรุณากรอกรหัสผ่านให้ตรงกัน',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#DC2626',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: 'warning',
        title: 'อีเมลไม่ถูกต้อง',
        text: 'กรุณากรอกรูปแบบอีเมลให้ถูกต้อง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#DC2626',
      });
      return;
    }
    
    const duplicateCheck = await axios.get(`/api/users/register?email=${formData.email}`);
    if (duplicateCheck.data !== null) {
      Swal.fire({
        icon: 'warning',
        title: 'อีเมลนี้ถูกใช้งานแล้ว',
        text: 'กรุณาใช้อีเมลอื่นในการสมัคร',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#DC2626',
      });
      return;
    }

    try {
      const response = await axios.post('/api/users/register', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'สมัครสมาชิกสำเร็จ',
          text: 'กรุณาเข้าสู่ระบบเพื่อใช้งาน',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          window.location.href = "/login";
        });
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#DC2626',
        });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#DC2626',
      });
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
  }
  
  const footerLink = (
    <>
      มีบัญชีอยู่แล้ว?{" "}
      <Link
        href="/login"
        className="font-semibold leading-6 text-red-600 hover:text-red-500"
      >
        เข้าสู่ระบบ
      </Link>
    </>
  );

  return (
    <AuthLayout
      title="สร้างบัญชี"
      subtitle="สมัครสมาชิกและเริ่มต้นการใช้งาน"
      footerContent={footerLink}
    >
      <form className="mt-6 md:mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="full-name" className="sr-only">
              ชื่อ-นามสกุล
            </label>
            <input
              id="full-name"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              className="relative block w-full rounded-t-md border-0 p-2.5 md:p-3 text-sm md:text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-red-600"
              placeholder="ชื่อ-นามสกุล"
              onChange={handleChange}
            />
          </div>
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
              className="relative block w-full border-0 p-2.5 md:p-3 text-sm md:text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-red-600"
              placeholder="อีเมล"
              onChange={handleChange}
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
              autoComplete="new-password"
              required
              className="relative block w-full border-0 p-2.5 md:p-3 text-sm md:text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-red-600"
              placeholder="รหัสผ่าน"
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">
              ยืนยันรหัสผ่าน
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="relative block w-full rounded-b-md border-0 p-2.5 md:p-3 text-sm md:text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-red-600"
              placeholder="ยืนยันรหัสผ่าน"
              onChange={handleChange}
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
            onChange={handleChange}
          />
          <label
            htmlFor="terms"
            className="ml-2 block text-sm text-gray-900"
          >
            ฉันยอมรับ{" "}
            <a
              href="#"
              className="font-medium text-red-600 hover:text-red-500"
            >
              ข้อกำหนดและเงื่อนไข
            </a>
          </label>
        </div>

        <div>
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md bg-red-600 px-3 py-2.5 md:py-3 text-sm font-semibold text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            สมัครสมาชิก
          </button>
          
        </div>
      </form>
    </AuthLayout>
  );
}
