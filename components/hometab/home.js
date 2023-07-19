import React, { useEffect, useState } from "react";
import {
  Image,
  TextInput,
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";

import { picURL } from "../auth/supabase.js"; // This is the base url of the photos bucket that is in our Supabase project. It makes referencing user pictures easier
import { useNavigation } from "@react-navigation/native";
import { createClient } from "@supabase/supabase-js"; // Create client is responsible for drawing profile data from each user in the database

// Supabase API information that allows us to connect to our server and pull/send information between the app and the server
const supabaseUrl = "https://jaupbyhwvfulpvkfxmgm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDYwMzgzNSwiZXhwIjoyMDAwMTc5ODM1fQ.Jr5Q7WBvMDpFgZ9FOJ1vw71P8gEeVqNaN2S8AfqTRrM";
const supabase = createClient(supabaseUrl, supabaseKey); // Command used to connect supabase

const Home = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: ugcData, error: ugcError } = await supabase.from("UGC").select("*");
      const { data: profileData, error: profileError } = await supabase.from("profile").select("*");

      if (ugcError || profileError) {
        console.error(ugcError || profileError);
      } else {
        const mergedData = ugcData.map((ugcUser) => {
          const relatedProfileData = profileData.filter((profileUser) => profileUser.user_id === ugcUser.user_id);
          return {
            ...ugcUser,
            profiles: relatedProfileData,
          };
        });

        setUsers(mergedData);
      }
    };

    fetchUsers();
  }, []);

  const handleUserCardPress = (user) => {
    setSelectedUser(user);
    navigation.navigate("userCard", { user }); // Navigate to UserProfile component with selected user data
  };

  const renderUserCard = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleUserCardPress(item)}>
        <View style={styles.card}>
          <Image
            style={styles.profileImage}
            source={{
              uri: `${picURL}/${item.user_id}/${item.user_id}-0?${new Date().getTime()}`
            }}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}> {item.name}, {item.age} </Text>
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={{
            uri: "https://static.vecteezy.com/system/resources/previews/002/927/317/large_2x/tourist-hammock-for-recreation-portable-hammock-isolated-on-a-white-background-illustration-in-doodle-style-hammock-for-outdoor-recreation-free-vector.jpg",
          }}
        />
        <Text style={styles.headerText}> Cabana </Text>
      </View>
      <View style={styles.viewContainer}>
        <FlatList
          data={users}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  viewContainer: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    //borderBottomWidth: 1,
    borderColor: "gray",
    paddingTop: 13,
    paddingBottom: 6,
    paddingLeft: 15,
    paddingRight: 15,
    //marginBottom: 8,
  },

  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: -10,
  },

  logo: {
    width: 30,
    height: 30,
    marginRight: 0,
    marginTop: -10,
  },

  userInfo: {
    flex: 1,
  },

  userContainer: {
    flex: 1,
    //alignItems: "center",
    padding: 16,
    //marginBottom: 30,
    backgroundColor: "#F4F4F4",
    borderRadius: 8,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "white",
    marginVertical: 5,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginTop: 7,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 3,
    marginRight: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 0,
    textAlign: "justify",
  },

  bio: {
    fontSize: 14,
    color: "gray",
    paddingHorizontal: 3,
  },
  tagsContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 10,
    borderRadius: 15,
    justifyContent: 'left',
  },
  tag: {
    backgroundColor: '#f3a034',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 6,
    margin: 2,
  },
  tagText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Home;
