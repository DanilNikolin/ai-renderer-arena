
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ authenticated: false, is_admin: false });
    }

    // Чекаем роль админа в таблице accounts
    const { data: account } = await supabase
        .from("accounts")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    return NextResponse.json({
        authenticated: true,
        is_admin: account?.is_admin || false,
        user_id: user.id,
        email: user.email
    });
}
