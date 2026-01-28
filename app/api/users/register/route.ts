import { NextResponse ,NextRequest} from "next/server";
import { prisma } from '@/lib/prisma/prisma'
import { registerSchema } from "@/lib/zod/schema";
import bcrypt from 'bcrypt';


// api ตรวจสอบอีเมลว่าซ้ำไหม
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const email = searchParams.get('email');
        const check =await prisma.dir_User.findFirst({
            where: {
                email: email || undefined,  
            },
        });
        return NextResponse.json(check);
    }
    catch(error){
        console.error("Error fetching users by email:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
// api ลงทะเบียนผู้ใช้
export async function POST(request : NextRequest) {
    try {
        const body = await request.json();

        const safedata = registerSchema.parse(body);
        const { name, email, password } = safedata;
        
        const hash = await bcrypt.hash(password, 10);
        
        const newUser = await prisma.dir_User.create({
            data: {
                name,
                email,
                password: hash
            },
        });
        
        return NextResponse.json(newUser, { status: 201 });
    }
    catch(error){
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}