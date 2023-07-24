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
          case 4:
            setImage4(null);
            break;
          case 5:
            setImage5(null);
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
        quality: 0.7,
      });

      if (!imagePickerResult.canceled) {
        deletePictures(index);
        const filename = `${session.user.id}/${session.user.id}-${index}`;

        const base64Data = imagePickerResult.assets[0].base64;
        const buffer = decode(base64Data);

        const { data, error: uploadError } = await supabase.storage
          .from("user_pictures")
          .upload(filename, buffer, {
            contentType: "image/jpeg",
          });
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
            case 4:
              setImage4(imagePickerResult.assets[0].uri);
              break;
            case 5:
              setImage5(imagePickerResult.assets[0].uri);
              break;
            default:
              break;
          }
          //getProfilePicturs();
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
        <View style={styles.back}>
          <Button title="back" onPress={handleBackPress} />
        </View>
        <Text style={styles.title}>Edit Your Images</Text>
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
            {renderItem(4)}
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={() => handleImageUpload1(4)}
            >
              {image4 ? (
                <Image source={{ uri: image4 }} style={styles.image} />
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
            {renderItem(5)}
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={() => handleImageUpload1(5)}
            >
              {image5 ? (
                <Image source={{ uri: image5 }} style={styles.image} />
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  title: {
    fontFamily: "Helvetica Neue",
    fontSize: 20,
    textAlign: "center",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "flex-start",
    paddingVertical: 5,
  },
  back: {
    marginRight: -57,
    marginLeft: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#000",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
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
    //gap: 10,
  },
  button: {
    //flex: 1,
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
    alignSelf: "center",
    margin: 10,
  },
});

export default ImagePickerScreen;
