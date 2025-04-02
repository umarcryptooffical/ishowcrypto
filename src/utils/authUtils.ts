
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ProfileUser } from "@/types/auth";
import { toast } from "@/hooks/use-toast";

// Valid invite codes
export const VALID_INVITE_CODES = ["ishowcryptoairdrops", "Irfan@123#13"];

// Helper function to check if a user is the special admin user
export const isSpecialUser = (email: string, username: string): boolean => {
  return email === "malickirfan00@gmail.com" && username === "UmarCryptospace";
};

// Helper function to fetch user profile from Supabase
export const fetchUserProfile = async (userId: string): Promise<ProfileUser | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (data) {
      // Check if it's our special user
      const specialUser = isSpecialUser(data.email, data.username);

      // Update privileges for special user if needed
      if (specialUser && (!data.is_admin || !data.is_video_creator)) {
        await updateSpecialUserPrivileges(userId, data);
      }

      return {
        id: data.id,
        username: data.username,
        email: data.email,
        isAdmin: data.is_admin,
        canUploadVideos: data.is_video_creator,
        level: data.level || 1,
        achievements: [],
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Helper function to update special user privileges
export const updateSpecialUserPrivileges = async (userId: string, userData: any) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_admin: true,
        is_video_creator: true,
        level: Math.max(userData.level || 1, 10)
      })
      .eq('id', userId);

    if (error) {
      console.error("Error updating admin privileges:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error updating admin privileges:", error);
    return false;
  }
};

// Helper function for user registration
export const registerUser = async (
  username: string,
  email: string,
  password: string,
  inviteCode?: string
) => {
  try {
    // Check if invite code is valid or if it's the special admin user
    const specialUser = isSpecialUser(email, username) && inviteCode === "Irfan@123#13";

    // Validate invite code
    if (!specialUser && (!inviteCode || !VALID_INVITE_CODES.includes(inviteCode))) {
      toast({
        title: "Registration failed",
        description: "Invalid invite code. Please use a valid invite code.",
        variant: "destructive",
      });
      return false;
    }

    // Regular registration logic
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          // Set admin flag for the special user
          is_admin: specialUser,
          is_video_creator: specialUser,
        },
      },
    });

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    // If it's the special user, update the profile directly
    if (specialUser) {
      toast({
        title: "Admin Registration successful",
        description: "Welcome, Admin! You have full access to the platform.",
      });
    } else {
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
    }

    return true;
  } catch (error: any) {
    console.error("Registration error:", error);
    toast({
      title: "Registration failed",
      description: error.message || "An error occurred during registration",
      variant: "destructive",
    });
    return false;
  }
};
