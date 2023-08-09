import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
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
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
import { createTimestamp } from "../auth/profileUtils.js";

const MAX_IMAGES = 6;

const ImagePickerScreen = ({ navigation, route }) => {
  const { session } = route.params;
  const [imageCount, setImageCount] = useState(0);
  const [image0, setImage0] = useState();
  const [image1, setImage1] = useState();
  const [image2, setImage2] = useState();
  const [image3, setImage3] = useState();
  const [image4, setImage4] = useState();
  const [image5, setImage5] = useState();

  useEffect(() => {
    getProfilePicturs();
  }, []);

  const getProfilePicturs = async () => {
    try {
      for (let i = 0; i < MAX_IMAGES; i++) {
        const profilePictureURL = `${picURL}/${session.user.id}/${
          session.user.id
        }-${i}?${new Date().getTime()}`;
        const response = await fetch(profilePictureURL, {
          cache: "no-cache",
        });
        if (response.ok) {
          const imageURI = profilePictureURL;
          switch (i) {
            case 0:
              setImage0(imageURI);
              break;
            case 1:
              setImage1(imageURI);
              break;
            case 2:
              setImage2(imageURI);
              break;
            case 3:
              setImage3(imageURI);
              break;
            case 4:
              setImage4(imageURI);
              break;
            case 5:
              setImage5(imageURI);
              break;
          }
        } else {
          switch (i) {
            case 0:
              setImage0(null);
              break;
            case 1:
              setImage1(null);
              break;
            case 2:
              setImage2(null);
              break;
            case 3:
              setImage3(null);
              break;
            case 4:
              setImage4(null);
              break;
            case 5:
              setImage5(null);
              break;
          }
        }
      }
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
        //alert(`Successfully deleted image ${index + 1}`);

        switch (index) {
          case 0:
            setImage0(null);
            break;
          case 1:
            setImage1(null);
            break;
          case 2:
            setImage2(null);
            break;
          case 3:
            setImage3(null);
            break;

          default:
            console.error("Invalid index for image deletion");
        }
      }

      if (removeError) {
        alert(error.message);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleImageUpload1 = async (index) => {
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
        const timestamp = new Date().toISOString();
        alert(timestamp);
        deletePictures(index);
        const filename = `${session.user.id}/${session.user.id}-${index}-${timestamp}`;

        const compressedImage = await manipulateAsync(
          imagePickerResult.assets[0].uri,
          [], // No transforms
          { compress: 0.2, format: "jpeg", base64: true }
        );
        //compressedUri = compressedImage.uri;
        const buffer = decode(compressedImage.base64);

        const { data, error: uploadError } = await supabase.storage
          .from("user_pictures")
          .upload(filename, buffer, {
            contentType: "image/jpeg",
          });

        createTimestamp(session.user.id, timestamp);

        if (uploadError) {
          alert(uploadError.message);
        } else {
          switch (index) {
            case 0:
              setImage0(imagePickerResult.assets[0].uri);
              break;
            case 1:
              setImage1(imagePickerResult.assets[0].uri);
              break;
            case 2:
              setImage2(imagePickerResult.assets[0].uri);
              break;
            case 3:
              setImage3(imagePickerResult.assets[0].uri);
              break;

            default:
              break;
          }
        }
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderItem = (index) => {
    const imagesArray = [image0, image1, image2, image3, image4, image5];
    if (!imagesArray[index]) {
      return <View style={styles.Vbutton}></View>;
    }

    return (
      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          await deletePictures(index);
          getProfilePicturs();
        }}
      >
        <Icon name="times" size={25} color="grey" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.left}>
          <Button title="back" onPress={handleBackPress} />
        </View>
        <View style={styles.center}>
          <Text style={styles.title}>Add Images</Text>
        </View>
        <View style={styles.right} />
      </View>

      <ScrollView>
        <View style={styles.vContainer}>
          <View style={styles.column}>
            {renderItem(0)}
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={() => handleImageUpload1(0)}
            >
              {image0 ? (
                <Image source={{ uri: image0 }} style={styles.image} />
              ) : null}
            </TouchableOpacity>
            {renderItem(2)}
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={() => handleImageUpload1(2)}
            >
              {image2 ? (
                <Image source={{ uri: image2 }} style={styles.image} />
              ) : null}
            </TouchableOpacity>
          </View>

          <View style={styles.column}>
            {renderItem(1)}
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={() => handleImageUpload1(1)}
            >
              {image1 ? (
                <Image source={{ uri: image1 }} style={styles.image} />
              ) : null}
            </TouchableOpacity>
            {renderItem(3)}
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={() => handleImageUpload1(3)}
            >
              {image3 ? (
                <Image source={{ uri: image3 }} style={styles.image} />
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignItems: "center",
    alignSelf: "center",
    alignContent: "center",

    padding: 10, // You can adjust this value
  },
  left: {
    flex: 1,
    alignItems: "flex-start",
  },
  center: {
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
    alignContent: "center",
  },
  right: {
    flex: 1,
    alignItems: "flex-end",
  },
  back: {
    //textAlign: "left",
    //marginLeft: 8,
  },

  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    alignItems: "center",
  },

  container: {
    flex: 1,
    padding: 10,
  },
  vContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },

  column: {
    flex: 1,
    flexDirection: "column",
  },
  button: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 15,
  },

  Vbutton: {
    //flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 15,
    margin: 12.5,
  },
  profilePictureContainer: {
    width: 171,
    height: 171,
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
    alignSelf: "center",
    margin: 10,
  },
});

export default ImagePickerScreen;
