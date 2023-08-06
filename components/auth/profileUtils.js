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
// Assuming you have a Supabase client configured

export const createTimestamp = async (user_id) => {
  try {
    const timestamp = new Date().toISOString(); // Create a timestamp in ISO format

    // Check if the record exists
    const { data, error: fetchError } = await supabase
      .from("images")
      .select()
      .eq("user_id", user_id);

    if (fetchError) {
      console.error(fetchError);
      return false;
    }

    if (data && data.length > 0) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("images")
        .update({ last_modified: timestamp })
        .eq("user_id", user_id);

      if (updateError) {
        console.error(updateError);
        return false;
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase.from("images").insert([
        {
          user_id: user_id,

          last_modified: timestamp,
          // other fields as needed
        },
      ]);

      if (insertError) {
        console.error(insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
export const getLastModifiedFromSupabase = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from("images") // Assuming 'images' is the table name
      .select("last_modified") // Assuming 'last_modified' is the column name for the timestamp
      .eq("user_id", user_id); // Assuming 'user_id' is the column to filter by
    // Get a single record

    if (error) {
      alert(error.message);
      return null;
    }

    return data.last_modified; // Return the last modified timestamp
  } catch (error) {
    console.error(error);
    return null;
  }
};
