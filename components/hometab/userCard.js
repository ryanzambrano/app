import { React, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { createClient } from "@supabase/supabase-js";
import { useIsFocused } from "@react-navigation/native";
import { picURL } from "../auth/supabase";
import { getLastModifiedFromSupabase } from "../auth/profileUtils.js";

import Swiper from "react-native-swiper";
// npm install react-native-swiper

const MAX_IMAGES = 4;
const supabaseUrl = "https://jaupbyhwvfulpvkfxmgm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDYwMzgzNSwiZXhwIjoyMDAwMTc5ODM1fQ.Jr5Q7WBvMDpFgZ9FOJ1vw71P8gEeVqNaN2S8AfqTRrM";
const supabase = createClient(supabaseUrl, supabaseKey);

const scrollY = new Animated.Value(0);

/*scrollY.addListener(({ value }) => {
  setIsProfileVisible(value < DISABLE_TOUCHABLE_SCROLL_POINT);
});*/

const profileOpacity = scrollY.interpolate({
  inputRange: [0, 100],
  outputRange: [1, 0],
  extrapolate: "clamp",
});

const profileZIndex = scrollY.interpolate({
  inputRange: [0, 100],
  outputRange: [1, -1],
  extrapolate: "clamp",
});

const DISABLE_TOUCHABLE_SCROLL_POINT = 100;

const UserCard = ({ navigation, route }) => {
  const { session } = route.params;
  const {
    name,
    tags,
    bio,
    major,
    user_id,
    age,
    gender,
    living_preferences,
    for_fun,
    class_year,
    hometown,
    bookmarked_profiles,
  } = route.params.user;

  // current user is session.user.id
  // other user is user_id

  const [photos, setPhotos] = useState([]);
  const [isFriendAdded, setIsFriendAdded] = useState(false);
  const buttonColor = isFriendAdded ? "green" : "dodgerblue";
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lastModified, setLastModified] = useState(null);

  const promptQuestions = {
    greek_life: "Are you participating in Greek Life?",
    night_out: "What is your idea of a perfect night out?",
    pet_peeves: "What are your biggest pet peeves?",
    favorite_movies: "What are your favorite movies?",
  };

  const handlePhotoPress = (index) => {
    setSelectedPhotoIndex(index);
  };

  const handleModalClose = () => {
    setSelectedPhotoIndex(null);
  };

  const handleOverlayPress = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(null);
    }
  };

  useEffect(() => {
    const fetchBookmarkedProfiles = async () => {
      const userId = session.user.id;
      try {
        const { data, error } = await supabase
          .from("UGC")
          .select("bookmarked_profiles")
          .eq("user_id", userId);
        if (error) {
          console.error("Error fetching bookmarked_profiles:", error.message);
          return;
        }
        const { bookmarked_profiles } = data[0];
        if (bookmarked_profiles.includes(user_id)) {
          setIsFriendAdded(true);
        } else {
          setIsFriendAdded(false);
        }
      } catch (error) {
        console.error("Error fetching bookmarked_profiles:", error.message);
      }
    };
    const fetchPrompts = async () => {
      const { data: promptsData, error: promptsError } = await supabase
        .from("prompts")
        .select("*")
        .eq("user_id", session.user.id);
      if (promptsData) {
        const answeredPrompts = Object.entries(promptsData[0])
          .filter(
            ([prompt, answer]) =>
              answer !== null && prompt !== "id" && prompt !== "user_id"
          )
          .map(([prompt, answer]) => ({ prompt, answer }));

        setPrompts(answeredPrompts);
        //console.log(answeredPrompts);
      } else {
        console.log("Error fetching prompts: ", promptsError);
      }
    };
    fetchBookmarkedProfiles();
    fetchPrompts();
  }, []);

  const handleAddFriend = async (user_id) => {
    const userId = session.user.id;
    try {
      const { data, error } = await supabase
        .from("UGC")
        .select("bookmarked_profiles")
        .eq("user_id", userId);
      if (error) {
        console.error("Error fetching bookmarked_profiles:", error.message);
        return;
      }
      const { bookmarked_profiles } = data[0];
      if (!bookmarked_profiles.includes(user_id)) {
        const updatedBookmarkedProfiles = [...bookmarked_profiles, user_id];
        const { data: updateData, error: updateError } = await supabase
          .from("UGC")
          .update({ bookmarked_profiles: updatedBookmarkedProfiles })
          .eq("user_id", userId);
        if (updateError) {
          console.error(
            "Error updating bookmarked_profiles:",
            updateError.message
          );
        } else {
          console.log("Bookmark added successfully!");
          setIsFriendAdded(true);
        }
      } else {
        const updatedBookmarkedProfiles = bookmarked_profiles.filter(
          (id) => id !== user_id
        );
        const { data: updateData, error: updateError } = await supabase
          .from("UGC")
          .update({ bookmarked_profiles: updatedBookmarkedProfiles })
          .eq("user_id", userId);

        if (updateError) {
          console.error(
            "Error updating bookmarked_profiles:",
            updateError.message
          );
        } else {
          console.log("Bookmark removed successfully!");
          setIsFriendAdded(false);
        }
      }
    } catch (error) {
      console.error("Error adding/removing bookmark:", error.message);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    getProfilePictures();
  }, [user_id, picURL]);

  const getLastModifiedFromSupabase = async (user_id) => {
    try {
      const { data, error } = await supabase
        .from("images") // Assuming 'images' is the table name
        .select("last_modified") // Assuming 'last_modified' is the column name for the timestamp
        .eq("user_id", user_id) // Assuming 'user_id' is the column to filter by
        .single(); // Get a single record

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

  const getProfilePictures = async () => {
    try {
      for (let i = 0; i < MAX_IMAGES; i++) {
        const profilePictureURL = `${picURL}/${user_id}/${user_id}-${i}?${new Date().getTime()}`;

        const imageResponse = await fetch(profilePictureURL);

        if (imageResponse.ok) {
          setPhotos((prevPhotos) => [...prevPhotos, profilePictureURL]);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserCardPress = () => {
    navigation.navigate("Message", { user: route.params.user });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"< Back"}</Text>
        </TouchableOpacity>
        <Text style={styles.name}>{name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          style={styles.photoContainer}
          pagingEnabled={true}
        >
          {photos.map((photo, index) => (
            <TouchableWithoutFeedback
              key={index}
              onPress={() => handlePhotoPress(index)}
            >
              <Image source={{ uri: photo }} style={styles.photo} />
            </TouchableWithoutFeedback>
          ))}
        </ScrollView>

        <Modal
          visible={selectedPhotoIndex !== null}
          transparent={true}
          onRequestClose={handleModalClose}
        >
          <TouchableWithoutFeedback onPress={handleOverlayPress}>
            <View style={styles.modalContainer}>
              <Image
                source={{ uri: photos[selectedPhotoIndex] }}
                style={styles.fullPhoto}
              />
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.friendButton, { backgroundColor: buttonColor }]}
            onPress={() => handleAddFriend(user_id)}
          >
            <Text style={styles.friendButtonText}>
              {isFriendAdded ? "Bookmarked! ✓" : "+ Bookmark"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleUserCardPress}
          >
            <Text style={styles.chatButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.bio}>Graduating Class: {class_year}</Text>
        </View>
        <View style={styles.bioContainer}>
          <View style={styles.roundedContainer}>
            <Text style={styles.bio}>{bio}</Text>
          </View>
        </View>
        <View style={styles.ageMajorGradeContainer}>
          <Text style={styles.bio}>Major: {major}</Text>
          <View style={styles.divider} />
          <Text style={styles.bio}>Age: {age}</Text>
          <View style={styles.divider} />
          <Text style={styles.bio}>Gender: {gender}</Text>
          <View style={styles.divider} />
          <Text style={styles.bio}>Hometown: {hometown}</Text>
        </View>

        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.ageMajorGradeContainer}>
          <Text style={styles.bio}>
            Do you plan on living in an apartment or dorm?: {"\n"}
            {living_preferences}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.bio}>
            Would you rather stay in or go out for fun?: {"\n"}
            {for_fun}
          </Text>
        </View>
        <ScrollView
          horizontal
          style={styles.horizontalScrollView}
          showsHorizontalScrollIndicator={false}
          bounces={false}
        >
          {prompts.map((item, index) =>
            item.answer ? (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemPrompt}>
                  {promptQuestions[item.prompt]}
                </Text>
                <Text style={styles.itemAnswer}>{item.answer}</Text>
              </View>
            ) : null
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginHorizontal: 6,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "flex-start",
    paddingVertical: 5,
  },
  backButton: {
    marginRight: -57,
    marginLeft: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#000",
  },
  name: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  photoContainer: {
    height: 440,
    marginBottom: 10,
    marginHorizontal: 0,
    borderRadius: 15,
    borderWidth: 0.7,
    borderColor: "grey",
  },
  photo: {
    width: Dimensions.get("window").width - 12,
    height: 440,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  fullPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  friendButton: {
    backgroundColor: "dodgerblue",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
    marginBottom: 10,
    width: Dimensions.get("window").width * 0.6,
    marginRight: 3,
    borderWidth: 0.4,
    borderColor: "grey",
  },
  friendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  chatButton: {
    backgroundColor: "dodgerblue",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
    marginBottom: 10,
    width: Dimensions.get("window").width * 0.36,
    borderWidth: 0.4,
    borderColor: "grey",
  },
  chatButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  bioContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 0.4,
    borderColor: "grey",
  },
  roundedContainer: {
    backgroundColor: "white",
    borderRadius: 50,
    padding: 1,
  },
  bio: {
    color: "black",
    fontSize: 16,
    textAlign: "justify",
  },
  ageMajorGradeContainer: {
    paddingHorizontal: 20,
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 10,
    paddingVertical: 15,
    borderWidth: 0.4,

    borderColor: "grey",
  },
  divider: {
    height: 1,
    backgroundColor: "lightgrey",
    marginVertical: 8,
    marginHorizontal: -10,
  },
  tagsContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 10,
    marginBottom: 10,
    borderRadius: 15,
    justifyContent: "center",
    borderWidth: 0.4,
    borderColor: "grey",
  },
  tag: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5,
    borderWidth: 1,
    borderColor: "grey",
  },
  tagText: {
    fontSize: 14,
    color: "grey",
    fontWeight: "bold",
  },
  horizontalScrollView: {
    paddingTop: 20,
    marginBottom: 5,
    borderBottomColor: "lightgrey",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  itemContainer: {
    marginHorizontal: 15,
    borderWidth: 0.5,
    borderColor: "lightgrey",
    borderRadius: 50,
    padding: 30,
    width: 300,
    marginRight: 10,
    minWidth: 150,
    gap: 10,
  },
  itemPrompt: {
    fontSize: 15,
    marginBottom: 5,
  },
  itemAnswer: {
    fontWeight: "bold",
    fontSize: 20,
  },
});

export default UserCard;
