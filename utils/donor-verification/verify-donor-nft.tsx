// /utils/donor-verification/verify-door-nft.tsx
import { createClient } from "@/utils/supabase/client";

interface AuthCheckResult {
  isAuthenticated: boolean;
  isAuthorized: boolean;
  error?: string;
}

export async function checkAuthAndRole(requiredRole: 'admin' | 'moderator' | 'donor' | 'user' = 'user'): Promise<AuthCheckResult> {
  const supabase = createClient();

  try {
    // Check if user is logged in
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        isAuthenticated: false,
        isAuthorized: false,
        error: 'User not authenticated'
      };
    }

    // If only basic authentication is needed
    if (requiredRole === 'user') {
      return {
        isAuthenticated: true,
        isAuthorized: true
      };
    }

    // Check user's role
    const { data: roles, error: roleError } = await supabase
      .from("user_role_manager")
      .select("user_role_level")
      .eq("user_id", user.id)
      .single();

    if (roleError || !roles) {
      return {
        isAuthenticated: true,
        isAuthorized: false,
        error: 'Role verification failed'
      };
    }

    // Check if user has required role
    const isAuthorized = roles.user_role_level === requiredRole;

    return {
      isAuthenticated: true,
      isAuthorized,
      error: isAuthorized ? undefined : 'Insufficient permissions'
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      isAuthorized: false,
      error: 'Authentication check failed'
    };
  }
}

// Helper function to handle redirects
export function handleAuthRedirect(authResult: AuthCheckResult) {
  if (!authResult.isAuthenticated) {
    window.location.href = '/auth/login';
    return true;
  }
  
  if (!authResult.isAuthorized) {
    window.location.href = '/crypto-ath-price-prediction/access-denied';
    return true;
  }

  return false;
}