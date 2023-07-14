import { supabase } from "./supabase";
import { Animated, Easing } from "react-native";
import { picURL } from "./supabase";

export async function startShakeAnimation(shakeAnimationValue) {
  shakeAnimationValue.setValue(0);
  Animated.sequence([
    Animated.timing(shakeAnimationValue, {
      toValue: 1,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnimationValue, {
      toValue: -1,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.timing(shakeAnimationValue, {
      toValue: 0,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  ]).start();
}

export const fetchUsername = async (session) => {
  if (session?.user) {
    const { data, error } = await supabase
      .from("profile")
      .select("username")
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      // User does not have a profile, insert a new profile
      //alert("we in");
      if (error) {
        throw new Error(error.message);
      }

      return data.username;
    }
    // Set hasProfile based on the presence of username
  }
};

export const getProfilePicture = async (navigation) => {
  try {
    const profilePictureURL = `${picURL}/${session.user.id}/${session.user.id}-0`; // Replace '...' with the actual URL of the profile picture

    const response = await fetch(profilePictureURL, {
      cache: "no-store",
    });
    if (response.ok) {
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onload = () => {
        const decodedData = reader.result;
        return decodedData;
      };
      reader.readAsDataURL(blob);
    } else {
      // Handle response error
    }
  } catch (error) {
    // Handle fetch or other errors
  }
};
