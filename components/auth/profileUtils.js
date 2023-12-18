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
