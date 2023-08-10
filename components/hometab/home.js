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
  Alert,
} from "react-native";

import FiltersUI from "./filters.js";

import { supabase } from "../auth/supabase.js"; // we have our client here!!! no need to worry about creating it again
import { picURL } from "../auth/supabase.js"; // This is the base url of the photos bucket that is in our Supabase project. It makes referencing user pictures easier
import { useNavigation } from "@react-navigation/native";
import { createClient } from "@supabase/supabase-js"; // Create client is responsible for drawing profile data from each user in the database

const isBookmarkedURI =
  "https://th.bing.com/th/id/OIP.Pzc03rRYlwOdKsolfgcwogHaJQ?pid=ImgDet&rs=1";
const notBookmarkedURI = "https://i.pngimg.me/thumb/f/720/m2H7m2K9Z5i8Z5d3.jpg";

const Home = ({ route }) => {
  const { session, housingPreference } = route.params;
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [sessionUser, setSessionuser] = useState(session.user);
  const [sortMethod, setSortMethod] = useState("Most Compatible");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState([]);

  const handleFiltersPress = () => {
    navigation.navigate("Filters");
  };

  const toggleBookmarkButton = () => {
    setIsBookmarked((prevIsBookmarked) => !prevIsBookmarked);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const showSortMenu = () => {
    Alert.alert(
      "Sort Options",
      "Choose a sorting method:",
      [
        {
          text: "Alphabetical Order",
          onPress: () => setSortMethod("Alphabetical Order"),
        },
        {
          text: "Shared Interests",
          onPress: () => setSortMethod("Shared Interests"),
        },
        {
          text: "Most Compatible",
          onPress: () => setSortMethod("Most Compatible"),
        },
      ],
      { cancelable: true }
    );
  };

  const calculateCompatibility = (sessionUser, otherUser) => {
    let score = 0;
    console.log(sessionUser.for_fun, otherUser.for_fun);
    if (Array.isArray(sessionUser.tags) && Array.isArray(otherUser.tags)) {
      sessionUser.tags.forEach((tag) => {
        if (otherUser.tags.includes(tag)) score += 12;
      });
    }
    if (sessionUser.for_fun === otherUser.for_fun) score += 15;
    if (sessionUser.living_preferences === otherUser.living_preferences)
      score += 15;
    if (sessionUser.gender === otherUser.gender) score += 1;
    if (Math.abs(sessionUser.age - otherUser.age) <= 5) score += 1;
    if (sessionUser.class_year === otherUser.class_year) score += 2;

    return score;
  };

  const sortedUsers = users.sort((a, b) => {
    console.log(a, b);
    switch (sortMethod) {
      case "Alphabetical Order":
        return a.name.localeCompare(b.name);
      case "Shared Interests":
        const aTagsCount = a.tags.filter((tag) =>
          sessionUser.tags.includes(tag)
        ).length;
        const bTagsCount = b.tags.filter((tag) =>
          sessionUser.tags.includes(tag)
        ).length;
        return bTagsCount - aTagsCount;
      case "Most Compatible":
      default:
        const aScore = calculateCompatibility(sessionUser, a);
        const bScore = calculateCompatibility(sessionUser, b);
        return bScore - aScore;
    }
  });

  const filteredUsers = sortedUsers.filter((user) => {
    const isSessionUser = user.user_id === session.user.id;
    const nameMatch = user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const tagMatch = user.tags.some((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (isSessionUser) {
      return false;
    }

    if (isBookmarked) {
      return (
        bookmarkedProfiles.includes(user.user_id) && (nameMatch || tagMatch)
      );
    }
    return nameMatch || tagMatch;
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: ugcData, error: ugcError } = await supabase
          .from("UGC")
          .select("*");

        const { data: profileData, error: profileError } = await supabase
          .from("profile")
          .select("*");

        const { data: imageData, error: imageError } = await supabase
          .from("images")
          .select("*");

        if (ugcError || profileError || imageError) {
          console.error(ugcError || profileError || imageError);
        } else {
          const mergedData = ugcData.map((ugcUser) => {
            const relatedProfileData = profileData.find(
              (profileUser) => profileUser.user_id === ugcUser.user_id
            );

            const relatedImageData = imageData.find(
              (img) => img.user_id === ugcUser.user_id
            );
            return {
              ...ugcUser,
              profiles: relatedProfileData,
              lastModified: relatedImageData?.last_modified || null,
            };
          });
          const userId = session.user.id;

          const { data, error } = await supabase
            .from("UGC")
            .select("name, bio, tags, major, class_year, hometown")
            .eq("user_id", userId)
            .single();

          if (error) {
            console.error(error.message);
          } else {
            setSessionuser(data);
          }

          const { data: bookmarkedData, error: bookmarkedError } =
            await supabase
              .from("UGC")
              .select("bookmarked_profiles")
              .eq("user_id", userId);

          if (bookmarkedError) {
            console.error(
              "Error fetching bookmarked profiles:",
              bookmarkedError.message
            );
          } else {
            const { bookmarked_profiles } = bookmarkedData[0];
            setBookmarkedProfiles(bookmarked_profiles);
          }
          setUsers(mergedData);
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      }
    };

    fetchUsers();

    const channel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "UGC" },
        (payload) => {
          fetchUsers();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUserCardPress = (user) => {
    setSelectedUser(user);
    navigation.navigate("userCard", { user });
  };

  const renderUserCard = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleUserCardPress(item)}>
        <View style={styles.card}>
          <Image
            style={styles.profileImage}
            source={{
              uri: `${picURL}/${item.user_id}/${item.user_id}-0-${item.lastModified}`,
            }}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>
              {" "}
              {item.name}, {item.age}{" "}
            </Text>
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

        <TouchableOpacity onPress={handleFiltersPress}>
          <Image
            style={{
              marginLeft: 167,
              marginTop: -14,
              marginBottom: -7,
              height: 40,
              width: 40,
            }}
            source={{
              uri: "https://icon-library.com/images/filter-icon-png/filter-icon-png-17.jpg",
            }}
          ></Image>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleBookmarkButton}>
          <Image
            style={{
              marginLeft: isBookmarked ? 4 : 5,
              marginTop: -10,
              height: isBookmarked ? 26 : 28,
              width: isBookmarked ? 22.5 : 21,
            }}
            source={{ uri: isBookmarked ? isBookmarkedURI : notBookmarkedURI }}
          ></Image>
        </TouchableOpacity>
      </View>

      <View style={styles.viewContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔎 Search by name or tag"
            onChangeText={handleSearch}
            value={searchQuery}
          />
        </View>
        <View style={styles.sortContainer}>
          <Text style={styles.sortText}>Sort by:</Text>
          <TouchableOpacity onPress={() => showSortMenu()}>
            <Text
              style={{ color: "#0061db", fontWeight: "bold", fontSize: "15" }}
            >
              {sortMethod}
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredUsers}
          extraData={{ searchQuery, isBookmarked, bookmarkedProfiles }}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.user_id.toString()}
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
    backgroundColor: "white",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    //alignContent: "center",
    justifyContent: "space-between",
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

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 5,
    marginBottom: 1,
    elevation: 3,
    marginHorizontal: 5,
    borderWidth: 0.3,
    borderColor: "grey",
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },

  userInfo: {
    flex: 1,
  },

  userContainer: {
    flex: 1,
    alignItems: "center",
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
    marginVertical: 1,
    marginHorizontal: 7,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 3,
    borderWidth: 0.3,
    borderColor: "grey",
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 3,
    marginRight: 12,
    borderRadius: 40,
    borderWidth: 0.6,
    borderColor: "grey",
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
    backgroundColor: "white",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 10,
    borderRadius: 15,
    justifyContent: "left",
  },
  tag: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 6,
    margin: 2,
    borderWidth: 1,
    borderColor: "grey",
  },
  tagText: {
    fontSize: 12,
    color: "grey",
    fontWeight: "bold",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  sortText: {
    marginHorizontal: 5,
    fontSize: 15,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default Home;
