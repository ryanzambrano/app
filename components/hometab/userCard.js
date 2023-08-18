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

import { useIsFocused } from "@react-navigation/native";
import { picURL } from "../auth/supabase";
import { getLastModifiedFromSupabase } from "../auth/profileUtils.js";
import { supabase } from "../auth/supabase.js";

import Swiper from "react-native-swiper";
// npm install react-native-swiper

const MAX_IMAGES = 4;

const scrollY = new Animated.Value(0);

const profileOpacity = scrollY.interpolate({
  inputRange: [0, 550],
  outputRange: [1, 0],
  extrapolate: "clamp",
});

const profileZIndex = scrollY.interpolate({
  inputRange: [0, 550],
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
    lastModified,
  } = route.params.user;

  // current user is session.user.id
  // other user is user_id

  const [photos, setPhotos] = useState([
    `${picURL}/${user_id}/${user_id}-0-${lastModified}`,
  ]);
  const [isFriendAdded, setIsFriendAdded] = useState(false);
  const buttonColor = isFriendAdded ? "#14999999" : "#1D1D20";
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

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
  
  const handleQuestionaireButtonPress = () => {
    const currentUser = {
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
        lastModified,
    };
    navigation.navigate('QuestionaireAnswers', { currentUser });
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
        .eq("user_id", user_id);
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
          //console.log("Bookmark added successfully!");
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

  const getProfilePictures = async () => {
    try {
      let lastModifiedList = [];

      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("user_id", user_id);

      if (error) {
        alert(error.message);
      }

      if (data) {
        // alert(`Image data fetched: ${JSON.stringify(data)}`);
        data.forEach((item) => {
          // Use the image_index as the position for the last_modified value
          lastModifiedList[item.image_index] = item.last_modified;
        });
      }
      let newPhotos = [];
      for (let i = 1; i < MAX_IMAGES; i++) {
        const profilePictureURL = `${picURL}/${user_id}/${user_id}-${i}-${lastModifiedList[i]}`;
        const response = await fetch(profilePictureURL);
        if (response.ok) {
          newPhotos.push(profilePictureURL);
        }
      }
      setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
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

      <Animated.View
        style={{
          ...styles.profileContainer,
          opacity: profileOpacity,
          zIndex: profileZIndex,
        }}
      >
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
      </Animated.View>

      <ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tab}>
          <TouchableOpacity style={styles.questionaireButtonContainer} onPress={() => handleQuestionaireButtonPress()}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 17, }}> View Questionaire Responses</Text>
          </TouchableOpacity>

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
          <View style={styles.ageMajorGradeContainer}>
            <Text style={styles.bio}>
              Do you plan on living in an apartment or dorm?: {"\n\n"}
              {living_preferences}
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
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginHorizontal: 0,
    backgroundColor: "#1D1D20",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#1D1D20",
    justifyContent: "flex-start",
    paddingVertical: 5,
  },
  questionaireButtonContainer: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#14999999",
    paddingVertical: 10,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 0.4,
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollViewContent: {
    paddingTop: 537,
  },
  backButton: {
    marginRight: -57,
    marginLeft: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "white",
  },
  name: {
    flex: 1,
    fontSize: 20,
    fontWeight: 600,
    color: 'white',
    textAlign: "center",
  },
  photoContainer: {
    height: 440,
    marginLeft: 6,
    width: Dimensions.get("window").width - 12,
    marginBottom: 10,
    marginHorizontal: 0,
    borderRadius: 15,
    borderWidth: 0.7,
   // borderColor: "grey",
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
  tab: {
    backgroundColor: "#111111",
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    //shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.75,
    shadowRadius: 4.84,
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
    width: Dimensions.get("window").width * 0.55,
    marginRight: 3,
    borderWidth: 0.4,
    marginLeft: 10,
   // borderColor: "grey",
  },
  friendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  chatButton: {
    backgroundColor: "#1D1D20",
    borderRadius: 10,
    marginRight: 10,
    padding: 13,
    alignItems: "center",
    marginBottom: 10,
    width: Dimensions.get("window").width * 0.36,
    borderWidth: 0.4,
    //borderColor: "grey",
  },
  chatButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  bioContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#1D1D20",
    borderRadius: 15,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
    borderWidth: 0.4,
    //borderColor: "grey",
  },
  roundedContainer: {
    backgroundColor: "#1D1D20",
    borderRadius: 50,
    padding: 1,
  },
  bio: {
    color: "white",
    fontSize: 16,
    textAlign: "justify",
  },
  ageMajorGradeContainer: {
    paddingHorizontal: 20,
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "center",
    backgroundColor: "#1D1D20",
    borderRadius: 15,
    marginBottom: 10,
    paddingVertical: 15,
    borderWidth: 0.4,
    marginRight: 10,
    marginLeft: 10,
    //borderColor: "grey",
  },
  divider: {
    height: 0.3,
    backgroundColor: "grey",
    marginVertical: 12,
    marginHorizontal: -10,
  },
  tagsContainer: {
    backgroundColor: "#111111",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 10,
    marginBottom: 40,
    borderRadius: 15,
    justifyContent: "center",
   // borderWidth: 0.4,
    //borderColor: "grey",
    marginRight: 10,
    marginLeft: 10,
  },
  tag: {
    backgroundColor: "#14999999",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 5,
    //borderWidth: 1,
    borderColor: "white",
  },
  tagText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
  horizontalScrollView: {
    paddingTop: 20,
    marginBottom: 5,
   // borderBottomColor: "lightgrey",
    paddingBottom: 20,
    //borderBottomWidth: 1,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  itemContainer: {
    marginHorizontal: 15,
    backgroundColor: '#1D1D20',
    borderWidth: 0.5,
    //borderColor: "lightgrey",
    borderRadius: 50,
    padding: 30,
    width: 300,
    marginRight: 10,
    minWidth: 150,
    gap: 10,
  },
  itemPrompt: {
    fontSize: 15,
    color: 'white',
    marginBottom: 5,
  },
  itemAnswer: {
    fontWeight: "bold",
    color: 'white',
    fontSize: 20,
  },
});

export default UserCard;
