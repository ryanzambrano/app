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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../auth/supabase";
import { decode } from "base64-arraybuffer";

const MAX_IMAGES = 6;

const ImagePickerScreen = ({ navigation, route }) => {
  const { session } = route.params;
  const [images, setImages] = useState([]);

  useEffect(() => {
    getProfilePictures();
  }, []);

  const getProfilePictures = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("user_pictures")
        .list("profile_pictures/");

      if (data) {
        const imageURIs = await Promise.all(
          data.map(async (file) => {
            const { publicURL } = await supabase.storage
              .from("user_pictures")
              .getPublicUrl(file.name);
            return publicURL;
          })
        );
        setImages(imageURIs);
        alert(images.length);
      }

      if (error) {
        alert(error.message);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleImageUpload = async () => {
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
        //forceJpg: true,
        base64: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!imagePickerResult.canceled) {
        //const response = await fetch(imagePickerResult.assets[0].uri);

        setImages([...images, imagePickerResult.assets[0].uri]);

        const { error: removeError } = await supabase.storage
          .from("user_pictures")
          .remove(
            `profile_pictures/profile_${session.user.id}-${images.length}`
          );

        if (removeError) {
          alert(removeError.message + `profile_${session.user.id}`);
        }

        const base64Data = imagePickerResult.assets[0].base64;
        //alert(base64Data);
        const buffer = decode(base64Data);
        //const buffer = Buffer.from(base64Data, "base64");

        const { data, error: uploadError } = await supabase.storage
          .from("user_pictures")
          .upload(
            `profile_pictures/profile_${session.user.id}-${images.length}`,
            buffer,
            {
              contentType: "image/jpeg", // Replace with the appropriate content type if necessary
            }
          );
        if (uploadError) {
          alert(uploadError.message);
        }
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      alert(`You can only add up to ${MAX_IMAGES} images`);
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImages([...images, result.uri]);
    }
  };

  const handleBackPress = () => {
    navigation.navigate("Tabs");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button title="back" onPress={handleBackPress} />
      <Button title="Save" onPress={handleBackPress} />

      <FlatList
        data={[...images, ...Array(MAX_IMAGES - images.length).fill(null)]}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.profilePictureContainer}
            onPress={handleImageUpload}
          >
            {item && <Image source={{ uri: item }} style={styles.image} />}
          </TouchableOpacity>
        )}
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
