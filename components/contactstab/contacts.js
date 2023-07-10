import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const ContactsUI = () => {
  const navigation = useNavigation();

  const contacts = [
    {
      id: "1",
      name: "Ryan Zambrano",
      image:
        "https://wompampsupport.azureedge.net/fetchimage?siteId=7575&v=2&jpgQuality=100&width=700&url=https%3A%2F%2Fi.kym-cdn.com%2Fentries%2Ficons%2Ffacebook%2F000%2F000%2F091%2FTrollFace.jpg",
    },
    {
      id: "2",
      name: "Dreamy Bull",
      image:
        "https://i.kym-cdn.com/entries/icons/original/000/042/513/dreamybull.jpg",
    },
    {
      id: "3",
      name: "Ye",
      image:
        "https://i1.sndcdn.com/artworks-vwxkENQyQSEJrwR9-BUcOdA-t500x500.jpg",
    },
    // Add more contacts as needed
  ];

  const handleContactPress = (contact) => {
    navigation.navigate("Message", {
      contactName: contact.name,
      contactImage: contact.image,
    });
  };

  const renderContact = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.profilePicture} />
      <Text style={styles.contactName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ContactsUI;
