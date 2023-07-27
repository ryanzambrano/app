import { React, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { createClient } from "../auth/supabase.js";
import { picURL } from "../auth/supabase";


const MAX_IMAGES = 6;
const supabaseUrl = "https://jaupbyhwvfulpvkfxmgm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDYwMzgzNSwiZXhwIjoyMDAwMTc5ODM1fQ.Jr5Q7WBvMDpFgZ9FOJ1vw71P8gEeVqNaN2S8AfqTRrM";
const supabase = createClient(supabaseUrl, supabaseKey);

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
    bookmarked_profiles,
  } = route.params.user;
  const [photos, setPhotos] = useState([]);
  const [isFriendAdded, setIsFriendAdded] = useState(false);
  const buttonColor = isFriendAdded ? "green" : "dodgerblue";
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

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

  const handleAddFriend = () => {
    setIsFriendAdded(!isFriendAdded);
  };

  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    getProfilePictures();
  }, [user_id, picURL]);

  const getProfilePictures = async () => {
    try {
      const imagePromises = Array(MAX_IMAGES)
        .fill(null)
        .map(async (_, i) => {
          const profilePictureURL = `${picURL}/${user_id}/${user_id}-${i}`;
          const response = await fetch(profilePictureURL, {
            cache: "no-store",
          });
          if (response.ok) {
            return profilePictureURL;
          }
        });

      const newImages = await Promise.all(imagePromises);
      const nonNullImages = newImages.filter(Boolean);
      setPhotos(nonNullImages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserCardPress = () => {

    navigation.navigate("Message", {
      contactName: name,
      contactId: user_id,
      myId: session.user.id,
      contactImage: `${picURL}/${user_id}/${
        user_id
      }-0?${new Date().getTime()}`,
    });
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
            onPress={handleAddFriend}
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
        </View>

        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
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
});

export default UserCard;
