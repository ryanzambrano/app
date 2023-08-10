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

export const createTimestamp = async (user_id, timestamp, index) => {
  try {
    // Create a timestamp in ISO format

    // Check if the record exists
    const { data, error: fetchError } = await supabase
      .from("images")
      .select()
      .eq("user_id", user_id)
      .eq("image_index", index);

    if (fetchError) {
      console.error(fetchError);
      return false;
    }

    if (data && data.length > 0) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("images")
        .update({ last_modified: timestamp, image_index: index })
        .eq("user_id", user_id)
        .eq("image_index", index);

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
          image_index: index,
        },
      ]);

      if (insertError) {
        console.error(insertError);
        return false;
      }
    }

    return timestamp;
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

export const availableTags = [
  "Adventures",
  "Baseball",
  "Basketball",
  "Boxing",
  "Camping",
  "Fishing",
  "Fitness",
  "Football",
  "Hiking",
  "Jiu-Jitsu",
  "Rollerblading",
  "Running",
  "Soccer",
  "Surfing",
  "Swimming",
  "Yoga",
  "Cycling",
  "Gymnastics",
  "Parkour",
  "Skating",

  "Art",
  "Board Games",
  "Design",
  "Drumming",
  "Guitar",
  "Karaoke",
  "Live Music",
  "Makeup/Beauty",
  "Piano",
  "Photography",
  "Singing",
  "Writing",
  "Dance",
  "Acting",
  "Pottery",
  "Sculpture",

  "Activism",
  "Animals",
  "Clubbing",
  "Greek Life",
  "Instagram",
  "Raves",
  "Road Trips",
  "Urban Exploration",
  "Volunteering",
  "Networking",
  "Public Speaking",
  "Social Media",
  "Partying",

  "Books",
  "Coding",
  "Education",
  "History",
  "Journalism",
  "Science",
  "Language Learning",
  "Chess",
  "Philosophy",
  "Psychology",
  "Astronomy",
  "Robotics",

  "Business",
  "Start Ups",
  "Entrepreneurship",
  "Finance",
  "Marketing",
  "Real Estate",

  "Movies",
  "Music",
  "Stand-Up Comedy",
  "TV Shows",
  "Theater",
  "Podcasts",
  "Video Games",
  "Anime",

  "Country Music",
  "DJ",
  "Rap/Hip Hop",
  "Rock",
  "Jazz",
  "Pop",
  "Classical",
  "R&B",
  "Electronic Music",

  "Beauty",
  "Craft Beer",
  "Cooking",
  "DIY",
  "Environmentalism",
  "Fashion",
  "Health",
  "Interior Design",
  "Mixology",
  "Sneakers",
  "Tattoos",
  "Technology",
  "Thrifting",
  "Travel",
  "Veganism",
  "Wellness",
  "Wine Tasting",

  "JROTC",
  "Medical/Nursing",
  "Engineering",
  "Law",
  "Teaching",
  "Software Development",
  "Data Science",
  "Graphic Design",

  "Multilingual",
  "Politics",
  "Nature",
  "Sports",
  "Gaming",
  "Spirituality",
  "Astrology",
  "Cryptocurrency",
  "Sustainability",
];
