import {z} from 'zod';


const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

const createFolderSchema = z.object({
    name: z.string().min(1, "Folder name is required").trim(),
    parentId: z.string().nullable().optional()
});


export { registerSchema, loginSchema, createFolderSchema };