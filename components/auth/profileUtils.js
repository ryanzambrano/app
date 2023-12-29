import { supabase } from "./supabase";
import { Animated, Easing } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export const calculateCompatibility = (sessionUser, otherUser) => {
  //console.log(otherUser.profiles.sleep_time);
  //console.log(sessionUser.profiles.sleep_time);
  const tidinessLevels = [
    "Very tidy",
    "Somewhat tidy",
    "Neutral",
    "Somewhat messy",
    "Very messy",
  ];
  const sleepTimes = ["Morning Person", "Night Owl", "In Between"];
  const noisePreferences = ["Yes", "Somewhat Yes", "Somewhat No", "No"];

  let score = 0;
  sessionUser.tags.forEach((tag) => {
    if (otherUser.tags.includes(tag)) {
      score += 4;
    } else {
      let foundCategory = null;
      for (const [category, tags] of Object.entries(categories)) {
        if (tags.includes(tag)) {
          foundCategory = tags;
          break;
        }
      }
      if (
        foundCategory &&
        otherUser.tags.some((otherTag) => foundCategory.includes(otherTag))
      ) {
        score += 2;
      }
    }
  });

  if (sessionUser.profiles.for_fun === otherUser.profiles.for_fun) score += 5;
  if (
    sessionUser.profiles.living_preferences ===
    otherUser.profiles.living_preferences
  )
    score += 5;
  if (sessionUser.profiles.studies === otherUser.profiles.studies) score += 3;
  if (Math.abs(sessionUser.age - otherUser.age) <= 5) score += 2;
  if (sessionUser.class_year === otherUser.class_year) score += 6;
  if (sessionUser.profiles.gender === otherUser.profiles.gender) score += 1;

  const tidinessDiff = Math.abs(
    tidinessLevels.indexOf(sessionUser.profiles.tidiness) -
      tidinessLevels.indexOf(otherUser.profiles.tidiness)
  );
  score += 5 - tidinessDiff;

  const sleepTimeDiff = Math.abs(
    sleepTimes.indexOf(sessionUser.profiles.sleep_time) -
      sleepTimes.indexOf(otherUser.profiles.sleep_time)
  );
  score += 3 - sleepTimeDiff > 0 ? 3 - sleepTimeDiff : 0;

  const noisePrefDiff = Math.abs(
    noisePreferences.indexOf(sessionUser.profiles.noise_preference) -
      noisePreferences.indexOf(otherUser.profiles.noise_preference)
  );
  score += 5 - noisePrefDiff * 1.5;

  //console.log(otherUser.name, score);

  return score;
};

export const categories = {
  sports: [
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
  ],
  arts: [
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
  ],
  socialActivities: [
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
  ],
  intellectual: [
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
  ],
  business: [
    "Business",
    "Start Ups",
    "Entrepreneurship",
    "Finance",
    "Marketing",
    "Real Estate",
  ],
  entertainment: [
    "Movies",
    "Music",
    "Stand-Up Comedy",
    "TV Shows",
    "Theater",
    "Podcasts",
    "Video Games",
    "Anime",
  ],
  musicGenres: [
    "Country Music",
    "DJ",
    "Rap/Hip Hop",
    "Rock",
    "Jazz",
    "Pop",
    "Classical",
    "R&B",
    "Electronic Music",
  ],
  lifestyle: [
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
  ],
  professions: [
    "JROTC",
    "Medical/Nursing",
    "Engineering",
    "Law",
    "Teaching",
    "Software Development",
    "Data Science",
    "Graphic Design",
  ],
  misc: [
    "Multilingual",
    "Politics",
    "Nature",
    "Sports",
    "Gaming",
    "Spirituality",
    "Astrology",
    "Cryptocurrency",
    "Sustainability",
  ],
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

export const promptQuestions = {
  greek_life: "Are you participating in Greek Life?",
  budget: "My budget restrictions for housing are...",
  night_out: "A perfect night out for me looks like...",
  pet_peeves: "My biggest pet peeves are...",
  favorite_movies: "My favorite movies are...",
  favorite_artists: "My favorite artists / bands are...",
  living_considerations:
    "The dorms halls / apartment complexes I'm considering are...",
  sharing: "When it comes to sharing my amenities and personal property...",
  cooking: "When it comes to sharing food and cooking...",
  burnt_out: "When I'm burnt out, I relax by...",
  involvement: "The organizations I'm involved in on campus are...",
  smoking: "My opinion toward smoking in the dorm / apartment are...",
  other_people: "My thoughts on having guests over are...",
  temperature: "I like the temperature of the room to be...",
  pets: "My thoughts on having pets are...",
  parties: "My thoughts on throwing parties are...",
  decorations: "My ideas for decorating the home involve...",
  conflict: "When it comes to handling conflict, I am...",
};

export const stock_photo =
  "data:image/png;base64,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";
