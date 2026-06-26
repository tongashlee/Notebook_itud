-- ==========================================
-- SQL สำหรับสร้างตารางผู้ใช้งาน (Users)
-- เพื่อใช้งานร่วมกับหน้าระบบ Login
-- ==========================================

-- 1. สร้างตาราง users
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. เพิ่มข้อมูลผู้ใช้งานเริ่มต้น (Admin)
INSERT INTO public.users (username, password, role)
VALUES ('monza', 'monza2610', 'admin');

-- หมายเหตุ: รหัสผ่านในตัวอย่างนี้เป็น Plain Text สำหรับการทดสอบ 
-- ในระบบจริงควรใช้การเข้ารหัส (Hash) หรือใช้บริการ Supabase Auth โดยตรง
