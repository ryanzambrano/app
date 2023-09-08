import { React, useEffect, useState, useRef } from "react";
import {
  Alert,
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
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { picURL } from "../auth/supabase";
import { supabase } from "../auth/supabase.js";

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

const UserCard = ({ navigation, route }) => {
  const { session } = route.params;
  const {
    name,
    tags,
    bio,
    major,
    user_id,
    for_fun,
    class_year,
    hometown,
    bookmarked_profiles,
    lastModified,
  } = route.params.user;

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [living_preferences, setLivingPreference] = useState("");
  const [persons, setPersons] = useState([]);

  const [photos, setPhotos] = useState([
    `${picURL}/${user_id}/${user_id}-0-${lastModified}`,
  ]);
  const [isFriendAdded, setIsFriendAdded] = useState(false);
  const [isProfileBlocked, setIsProfileBlocked] = useState(false);
  const buttonColor = isFriendAdded ? "#14999999" : "#1D1D20";
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const promptQuestions = {
    greek_life: "Are you participating in Greek Life?",
    night_out: "A perfect night out for me looks like...",
    pet_peeves: "My biggest pet peeves are...",
    favorite_movies: "My favorite movies are...",
    favorite_artists: "My favorite artists / bands are...",
    living_considerations: "The dorms halls / apartment complexes I'm considering are...",
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

  const handleModalClose = () => {
    setSelectedPhotoIndex(null);
  };

  const handleOverlayPress = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(null);
    }
  };

  const handlePhotoPress = (index) => {
    setSelectedPhotoIndex(index);
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
    navigation.navigate("QuestionaireAnswers", { currentUser });
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
    const fetchGenderAndAge = async () => {
      const { data: genderData, error: genderError } = await supabase
        .from("profile")
        .select("gender, age, living_preferences")
        .eq("user_id", user_id);
      if (genderData) {
        setGender(genderData[0].gender);
        setAge(genderData[0].age);
        setLivingPreference(genderData[0].living_preferences);
        console.log(genderData.age);
      } else {
        console.log("Error fetching prompts: ");
      }
    };
    fetchGenderAndAge();
    fetchBookmarkedProfiles();
    fetchPrompts();
    //console.log(`${picURL}/${user_id}/${user_id}-0-${lastModified}`);
  }, []);

  const handleBlockUser = async (user_id) => {
    Alert.alert("Block User", "Are you sure you want to block this user?", [
      {
        text: "Exit",
        style: "cancel",
      },
      {
        text: "Block User",
        style: "cancel",
        onPress: async () => await actuallyBlockUser(user_id),
      },
    ]);
  };

  const actuallyBlockUser = async (user_id) => {
    console.log("blocking");
    const userId = session.user.id;
    try {
      const { data, error } = await supabase
        .from("UGC")
        .select("blocked_profiles")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching blocked_profiles:", error.message);
        return;
      }

      const { blocked_profiles } = data[0];;
      if (!blocked_profiles.includes(user_id)) {
        const updatedBlockedProfiles = [...blocked_profiles, user_id];
        const { data: updateData, error: updateError } = await supabase
          .from("UGC")
          .update({ blocked_profiles: updatedBlockedProfiles })
          .eq("user_id", userId);

        if (updateError) {
          console.error(
            "Error updating blocked_profiles:",
            updateError.message
          );
        } else {
          setIsProfileBlocked(true);
        }
      }
    } catch (error) {
      console.error("Error blocking profile:", error.message);
    }
    navigation.goBack();
  };

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
    console.log("Pressed");
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

  const handleUserCardPress = async () => {
    {
      //message navigation
      const { data, error: sessionError } = await supabase
        .from("UGC")
        .select("name")
        .eq("user_id", session.user.id)
        .single();

      if (sessionError) {
        console.error(sessionError);
        return;
      }
      const { data: Imagedata, error: ImageError } = await supabase
      .from("images")
      .select("*")
      .eq("user_id", user_id)
      .eq("image_index", 0);


      const sessionusername = data.name;
      const combinedArray = [sessionusername, name];
      const FinalString = combinedArray.slice().sort();
      const combinedString = FinalString.join(", ");

      const combinedIDs = [session.user.id, user_id];
      const Finalarray = combinedIDs.slice().sort();

      const { data: insertData, error: insertError } = await supabase
        .from("Group Chats")
        .insert([
          {
            User_ID: Finalarray,
            Group_Name: combinedString,
            Ammount_Users: Finalarray.length,
          },
        ])
        .select();

      if (insertError) {
        if (insertError.code === "23505") { // dupe error
          const { data: navigationdata, error: navigationError } =
            await supabase
              .from("Group Chats")
              .select("*")
              .contains("User_ID", Finalarray)
              .eq("Ammount_Users", Finalarray.length);
          if (navigationError) {
            console.log(navigationError);
            return;
          } else {
            //console.log(navigationdata);
            const  fetchedPersons = navigationdata.map((person) => ({
              ...person,
              images: Imagedata,
            }));
            
            setPersons(fetchedPersons);
            if (fetchedPersons.length > 0) {
              navigation.navigate("Message", { user: fetchedPersons[0] });
            }

            return;
          }
        } else {
          alert("Failed to insert.");
        }
        return;
      }
      const  fetchedPersons = navigationdata.map((person) => ({
        ...person,
        images: Imagedata,
      }));
      setPersons(fetchedPersons);
      if (fetchedPersons.length > 0) {
        navigation.navigate("Message", { user: fetchedPersons[0] });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.backButton}></View>
        <TouchableOpacity
          onPress={() => handleBlockUser(user_id)}
          style={styles.blockButton}
        >
          <AntDesign name="deleteuser" size={24} color="white" />
        </TouchableOpacity>
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
            <TouchableWithoutFeedback key={index}>
              <View key={index}>
                <Image source={{ uri: photo }} style={styles.photo} />
              </View>
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
                  
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalInfoScrollView}
          >
          {class_year && (
            <View style={styles.infoContainer}>
              <Entypo name="graduation-cap" size={22} color="white" />
              <Text style={styles.bio}>  {class_year}</Text>
              <View style={styles.verticalDivider}/>
            </View>
          )} 
          {major && (
            <View style={styles.infoContainer}>
              <Entypo name="open-book" size={22} color="white" />
              <Text style={styles.bio}>  {major}</Text>
              <View style={styles.verticalDivider}/>
            </View>
            
          )}
          {age && (
            <View style={styles.infoContainer}>
              <MaterialIcons name="cake" size={22} color="white" />
              <Text style={styles.bio}>  {age}</Text>
              <View style={styles.verticalDivider}/>
            </View>
          )}
          {gender && (
            <View style={styles.infoContainer}>
              <Ionicons name="md-person-sharp" size={22} color="white" />
              <Text style={styles.bio}>  {gender}</Text>
              <View style={styles.verticalDivider}/>
            </View>
          )}
          {hometown && (
            <View style={styles.infoContainer} paddingRight={30}>
              <MaterialIcons name="home-filled" size={26} color="white" />
              <Text style={styles.bio}>  {hometown}</Text>
            </View>
          )}
        </ScrollView>
          <View style={styles.bioContainer}>
            <View style={styles.roundedContainer}>
              <Text style={styles.bio}>{bio}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.questionaireButtonContainer}
            onPress={() => handleQuestionaireButtonPress()}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}>
              {" "}
              View Questionaire Responses
            </Text>
          </TouchableOpacity>
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
    zIndex: 300,
    padding: 16,
    marginHorizontal: 0,
    backgroundColor: "#1D1D20",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: -80,
    paddingTop: 80,
    backgroundColor: "#1D1D20",
    justifyContent: "space-between",
    paddingVertical: 10,
    zIndex: 3,
  },

  backButton: {
    marginRight: 15,
    paddingLeft: 15,
    paddingRight: 40,
  },
  blockButton: {
    paddingRight: 10,
  },
  name: {
    fontSize: 20,
    marginRight: -50,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  questionaireButtonContainer: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#14999999", //#2B2D2F
    paddingVertical: 10,
    borderRadius: 15,
    //marginBottom: 10,
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
    //zIndex: 1,
  },
  scrollViewContent: {
    paddingTop: 550,
    zIndex: 1,
  },

  backButtonText: {
    fontSize: 30,
    color: "#149999",
    zIndex: 1,
  },

  photoContainer: {
    height: 440,
    marginLeft: 6,
    width: Dimensions.get("window").width - 12,
    marginBottom: 5,
    marginTop: -5,
    marginHorizontal: 0,
    borderRadius: 15,
    borderWidth: 0.7,
    zIndex: 1,
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
    marginTop: -8,
    //shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.75,
    shadowRadius: 4.84,
    zIndex: 2,
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
    flexDirection: "row",
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
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  itemContainer: {
    marginHorizontal: 15,
    backgroundColor: "#1D1D20",
    borderWidth: 0.5,
    //borderColor: "lightgrey",
    borderRadius: 50,
    padding: 30,
    width: 300,
    marginVertical: 15,
    minWidth: 150,
    gap: 10,
  },
  itemPrompt: {
    fontSize: 15,
    color: "white",
    marginBottom: 5,
  },
  itemAnswer: {
    fontWeight: "bold",
    color: "white",
    fontSize: 20,
  },
  horizontalInfoScrollView: {
    marginBottom: 10,
    backgroundColor: "#1D1D20",
    borderRadius: 15,
    flexDirection: "row",
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 0.4,
    marginRight: 10,
    marginLeft: 10,
  },

  infoContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    flexDirection: "row",
  },

  verticalDivider: {
    width: 0.3,
    backgroundColor: "grey",
    height: "100%",
    alignSelf: "center",
    marginLeft: 15,
    marginRight: -5,
  },
  icon: {
    width: 30,
    height: 30,
  },
});

export default UserCard;
