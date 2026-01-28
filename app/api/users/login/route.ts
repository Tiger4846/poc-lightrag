import { NextResponse,NextRequest } from "next/server";
import { prisma } from '@/lib/prisma/prisma'
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/auth/jwt';


// api ล็อกอินผู้ใช้
export async function POST(request: NextRequest) {
    try{
        const body = await request.json();
        const email = body.email;
        const password = body.password;
        const user = await prisma.dir_User.findFirst({
            where: {
                email: email || undefined,
            },
            select : {id: true, email: true, password: true, name: true}
        });
        
        if (!user) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }
        const isPasswordValid = await bcrypt.compare(password || '', user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // สร้าง JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email
        });

        return NextResponse.json({ 
            status: 201, 
            name: user.name,
            token: token,
            userId: user.id
        });

    } catch(error){
        console.error("Error during login:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}