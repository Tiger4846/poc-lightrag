# Document Platform

ระบบจัดการเอกสารและไฟล์ พร้อม OCR และการเชื่อมต่อกับระบบฐานความรู้

1. npm i 

2. docker-compose up -d ผมใช้ PostgreSQL ผ่าน Docker 

3. สร้างไฟล์ .env โดยดูจาก .env.example แล้วก็ตั้งค่าต่างๆ ให้เรียบร้อย

4. npx prisma generate

5. npx prisma db push

6. npm run dev

เปิดเว็บที่ `http://localhost:3000/lightrag-directory`

7. ใช้คำสั่ง npm run studio เพื่อสามารถดูฐานข้อมูลผ่าน Prisma Studio ได้
