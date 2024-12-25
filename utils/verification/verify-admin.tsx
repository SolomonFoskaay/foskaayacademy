// /utils/verification/verify-admin.tsx
import { createClient } from "@/utils/supabase/client";

interface AuthResult {
  isAdmin: boolean;
  error?: string;
}

export async function checkAuthAndRole(): Promise<AuthResult> {
  const supabase = createClient();
  
  try {
    // Check if user is logged in
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      window.location.href = "/auth/login";
      return { isAdmin: false };
    }

    // Check if the user is an admin
    const { data: roles, error: roleError } = await supabase
      .from("user_role_manager")
      .select("*")
      .eq("id", user.id)
      .in("user_role_level", ["admin", "moderator"]) // Allow both roles
      .single();

    if (roleError || !roles || !["admin", "moderator"].includes(roles.user_role_level)) {
      window.location.href = "/crypto-ath-price-prediction/access-denied";
      return { isAdmin: false };
    }

    return { isAdmin: true };
  } catch (err) {
    window.location.href = "/auth/login";
    return { isAdmin: false, error: 'Authentication check failed' };
  }
}