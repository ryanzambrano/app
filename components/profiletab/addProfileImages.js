import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../auth/supabase";
import { decode } from "base64-arraybuffer";
import { picURL } from "../auth/supabase";
import Icon from "react-native-vector-icons/FontAwesome";

const MAX_IMAGES = 6;

const ImagePickerScreen = ({ navigation, route }) => {
  const { session } = route.params;
  const [imageCount, setImageCount] = useState(0);
  // Separate state for each image
  const [images, setImages] = useState(Array(MAX_IMAGES).fill(null));

  useEffect(() => {
    getProfilePictures();
  }, []);

  // You should add image index in these functions
  const getProfilePictures = async () => {
    try {
      const imagePromises = Array(MAX_IMAGES)
        .fill(null)
        .map(async (_, i) => {
          const profilePictureURL = `${picURL}/${session.user.id}/${session.user.id}-${i}`;
          const response = await fetch(profilePictureURL, {
            cache: "no-store",
          });
          if (response.ok) {
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        });

      const newImages = await Promise.all(imagePromises);
      const nonNullImages = newImages.filter(Boolean);
      const nextIndex = nonNullImages.length;
      // filter out any null values
      setImages(nonNullImages);

      setImageCount(nonNullImages.length);
    } catch (error) {
      console.error(error);
    }
  };

  const deletePictures = async (index) => {
    try {
      const filename = `${session.user.id}/${session.user.id}-${index}`;
      const { data: removeData, error: removeError } = await supabase.storage
        .from("user_pictures")
        .remove(filename);

      if (removeData) {
        alert(`Successfully deleted image ${index + 1}`);
      }

      if (removeError) {
        alert(error.message);
      }
    } catch (error) {
      alert(error.message);
    }
    getProfilePictures();
  };

  const handleImageUpload = async (index) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    try {
      const imagePickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!imagePickerResult.canceled) {
        let newImages = [...images];
        newImages[index] = imagePickerResult.assets[0].uri;
        setImages(newImages);

        const filename = `${session.user.id}/${session.user.id}-${index}`;

        const base64Data = imagePickerResult.assets[0].base64;
        const buffer = decode(base64Data);

        const { data, error: uploadError } = await supabase.storage
          .from("user_pictures")
          .upload(filename, buffer, {
            contentType: "image/jpeg", // Replace with the appropriate content type if necessary
          });
        if (uploadError) {
          alert(uploadError.message);
        }

        getProfilePictures();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleClear = (index) => {
    deletePictures(index);
  };

  const renderItem = ({ item, index }) => (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleClear(index)}
      >
        <Icon name="minus" size={40} color="red" />
      </TouchableOpacity>
      <View
        style={styles.profilePictureContainer}
        //onPress={() => handleImageUpload(index)}
      >
        {item && <Image source={{ uri: item }} style={styles.image} />}
      </View>
    </View>
  );

  const renderAddButton = () => {
    // Find the next available index in the images array
    if (images) {
      //const nextIndex = images.findIndex((image) => image === null);
      // Check if we've reached the maximum number of images
    }

    return (
      imageCount < MAX_IMAGES && (
        /*<Button
          title="Add photo"
          onPress={() => handleImageUpload(imageCount)}
          //renderItem={renderAddButton}
        />*/
        <TouchableOpacity
          style={styles.gButton}
          onPress={() => handleImageUpload(imageCount)}
        >
          <Icon name="plus" size={40} color="green" />
        </TouchableOpacity>
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button title="back" onPress={handleBackPress} />

      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        ListFooterComponent={renderAddButton}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,

    alignItems: "center",
  },
  button: {
    marginBottom: 10,
    alignSelf: "center",
  },
  gButton: {
    marginTop: 30,
    alignSelf: "center",
  },
  profilePictureContainer: {
    width: 171,
    height: 311,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    margin: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});

export default ImagePickerScreen;
