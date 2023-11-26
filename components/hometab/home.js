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
  RefreshControl,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { supabase } from "../auth/supabase.js"; // we have our client here!!! no need to worry about creating it again
import { picURL } from "../auth/supabase.js"; // This is the base url of the photos bucket that is in our Supabase project. It makes referencing user pictures easier
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator } from "react-native";
import { availableTags } from "../auth/profileUtils.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculateCompatibility } from "../auth/profileUtils.js";

const logo = require("../../assets/logo4.png");

const isBookmarkedColor = "#14999999";
const notBookmarkedColor = "#fff";

const Home = ({ route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { session } = route.params;
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [sessionUser, setSessionuser] = useState(session.user);
  const [sortMethod, setSortMethod] = useState("Most Compatible");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkedProfiles, setBookmarkedProfiles] = useState([]);
  const [blockedProfiles, setBlockedProfiles] = useState([]);
  const [usersBlockingMe, setUsersBlockingMe] = useState([]);
  const [gendaPreference, setGendaPreference] = useState("Any");
  const [housinPreference, setHousinPreference] = useState("Any");
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUsers().then(() => setRefreshing(false));
  }, []);

  const onHomePageVisit = async () => {
    try {
      await AsyncStorage.setItem("homepageVisited", "true");
    } catch (e) {
      console.error(e);
    }
  };

  const {
    housingPreference = housinPreference,
    genderPreference = gendaPreference,
    youngestAgePreference = "Any",
    oldestAgePreference = "Any",
    studyPreference = "Any",
  } = route.params || {};

  const handleFiltersPress = () => {
    navigation.navigate("Filters", {
      currentHousingPreference: housingPreference,

      currentGenderPreference: genderPreference,
      currentYoungestAgePreference: youngestAgePreference,
      currentOldestAgePreference: oldestAgePreference,
      currentStudyPreference: studyPreference,
      originalGenderPreference: sessionUser.profiles.who,
      originalHousingPreference: sessionUser.profiles.living_preferences,
    });
  };

  const toggleBookmarkButton = () => {
    setIsBookmarked((prevIsBookmarked) => !prevIsBookmarked);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No users found</Text>
    </View>
  );

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

  const sortedUsers = users.sort((a, b) => {
    //console.log(a, b);
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
    const isBlocked = blockedProfiles.includes(user.user_id);
    const isBlockingMe = usersBlockingMe.includes(user.user_id);
    //console.log(usersBlockingMe);
    const nameMatch = user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const tagMatch = user.tags.some((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isHousingMatch =
      housingPreference === "Any" ||
      user.profiles.living_preferences === housingPreference ||
      user.profiles.living_preferences === "No Preferences" ||
      housingPreference === "No Preferences";

    //console.log(isHousingMatch);
    const isGenderMatch =
      genderPreference === "Any" || user.profiles.gender === genderPreference;

    const isAgeMatch =
      (youngestAgePreference === "Any" ||
        user.profiles.age >= youngestAgePreference) &&
      (oldestAgePreference === "Any" ||
        user.profiles.age <= oldestAgePreference);
    const isStudyMatch =
      studyPreference === "Any" || user.profiles.studies === studyPreference;

    if (isSessionUser || isBlocked || isBlockingMe) {
      return false;
    }

    if (isBookmarked) {
      return (
        bookmarkedProfiles.includes(user.user_id) &&
        (nameMatch || tagMatch) &&
        (isHousingMatch || housingPreference === "Any") &&
        (isGenderMatch || genderPreference === "Any") &&
        (isAgeMatch ||
          (youngestAgePreference === "Any" && oldestAgePreference === "Any")) &&
        (isStudyMatch || studyPreference === "Any")
      );
    }

    return (
      (nameMatch || tagMatch) &&
      (isHousingMatch || housingPreference === "Any") &&
      (isGenderMatch || genderPreference === "Any") &&
      (isAgeMatch ||
        (youngestAgePreference === "Any" && oldestAgePreference === "Any")) &&
      (isStudyMatch || studyPreference === "Any")
    );
  });

  const fetchUsers = async () => {
    try {
      const { data: ugcData, error: ugcError } = await supabase
        .from("UGC")
        .select("*")
        .neq("has_ugc", false)
        .neq("profile_viewable", false);
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .neq("profile_complete", false);
      const { data: imageData, error: imageError } = await supabase
        .from("images")
        .select("*")
        .eq("image_index", 0)
        .neq("last_modified", null);

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
          if (
            ugcUser.has_ugc &&
            relatedProfileData?.profile_complete &&
            relatedImageData?.last_modified
          ) {
            return {
              ...ugcUser,
              profiles: relatedProfileData,
              lastModified: relatedImageData?.last_modified || null,
            };
          } else {
            return null;
          }
        });
        const filteredData = mergedData.filter((user) => user !== null);

        const userId = session.user.id;
        const ugcResponse = await supabase
          .from("UGC")
          .select("name, bio, tags, major, class_year, hometown")
          .eq("user_id", userId)
          .single();
        const profileResponse = await supabase
          .from("profile")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (ugcResponse.error || profileResponse.error) {
          console.error(
            ugcResponse.error?.message || profileResponse.error?.message
          );
        } else {
          const mergedSessionUser = {
            ...ugcResponse.data,
            profiles: profileResponse.data,
          };
          setSessionuser(mergedSessionUser);
          setGendaPreference(mergedSessionUser.profiles.who);
          setHousinPreference(mergedSessionUser.profiles.living_preferences);
        }

        const { data: allBlockedProfilesData, error: allBlockedProfilesError } =
          await supabase.from("UGC").select("user_id, blocked_profiles");
        if (allBlockedProfilesError) {
          console.error(
            "Error fetching all blocked profiles:",
            allBlockedProfilesError.message
          );
        } else {
          const usersWhoBlockedMe = allBlockedProfilesData
            .filter(
              (user) =>
                Array.isArray(user.blocked_profiles) &&
                user.blocked_profiles.includes(session.user.id)
            )
            .map((user) => user.user_id);
          //console.log(usersWhoBlockedMe);
          setUsersBlockingMe(usersWhoBlockedMe);
        }

        const { data: bookmarkedData, error: bookmarkedError } = await supabase
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

        const { data: blockedData, error: blockedError } = await supabase
          .from("UGC")
          .select("blocked_profiles")
          .eq("user_id", userId);
        if (blockedError) {
          console.error(
            "Error fetching blocked profiles:",
            blockedError.message
          );
        } else {
          const { blocked_profiles } = blockedData[0];
          setBlockedProfiles(blocked_profiles);
        }

        setUsers(filteredData);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
    setIsLoading(false);
    onHomePageVisit();
  };

  useEffect(() => {
    fetchUsers();
    if (isFocused) {
      fetchUsers();
    }
    if (isBookmarked) {
      fetchUsers();
    }
  }, [isFocused]);

  const handleUserCardPress = (user) => {
    setSelectedUser(user);
    navigation.navigate("userCard", { user });
  };

  const renderLoading = () => {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  };

  const renderUserCard = ({ item }) => {
    if (!item.lastModified) {
      //console.log(item);
      return null;
    }
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
            <Text style={styles.name}> {item.name} </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.major}>
              {" "}
              {item.major || "Undecided"}
            </Text>
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 8).map((tag, index) => (
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
        <View style={styles.logoTitleContainer}>
          <Image style={styles.logo} source={logo} />
          <Text style={styles.headerText}> Cabana </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleFiltersPress}>
            <Icon name="sliders" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleBookmarkButton}>
            <Icon
              name="bookmark"
              size={30}
              color={isBookmarked ? isBookmarkedColor : notBookmarkedColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.viewContainer}>
        <View style={styles.searchContainer}>
          <AntDesign
            name="search1"
            size={15}
            paddingRight={5}
            color="#575D61"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or tag"
            placeholderTextColor={"#575D61"}
            onChangeText={handleSearch}
            value={searchQuery}
            keyboardAppearance="dark"
            returnKeyType="done"
          />
        </View>
        <View style={styles.sortContainer}>
          <Text style={styles.sortText}>Sort by:</Text>
          <TouchableOpacity onPress={() => showSortMenu()}>
            <Text
              style={{
                color: "#159e9e",
                fontWeight: "bold",
                fontSize: 15,
              }}
            >
              {sortMethod}
            </Text>
          </TouchableOpacity>
        </View>
        {isLoading ? ( // Step 3
          renderLoading()
        ) : (
          <FlatList
            data={filteredUsers}
            extraData={{ searchQuery, isBookmarked, bookmarkedProfiles }}
            renderItem={renderUserCard}
            keyExtractor={(item) => item.user_id.toString()}
            ListEmptyComponent={renderEmptyComponent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1D20",
  },

  viewContainer: {
    flex: 1,
    backgroundColor: "#1D1D20",
  },
  titleContainer: {
    alignItems: "right",
    textAlign: "right",
    //marginRight: -20,
  },

  logoContainer: {
    alignItems: "flex-start",
  },

  thing: {
    gap: 10,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 13,
    paddingBottom: 0,
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 8,
  },

  logoTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerText: {
    fontSize: 29,
    color: "white",
    fontWeight: "600",
  },

  logo: {
    width: 30,
    height: 30,
  },

  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B2D2F",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 5,
    marginBottom: 5,
    elevation: 3,
    marginHorizontal: 10,
    // borderWidth: 0.20,
    // borderTopWidth: 0.20,
    //borderBottomWidth: 0.2,
    borderColor: "grey",
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "white",
  },

  userInfo: {
    flex: 1,
  },

  userContainer: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    //marginBottom: 30,
    backgroundColor: "#1D1D20",
    borderRadius: 8,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#111111",
    marginVertical: 1,
    justifyContent: "center",
    position: "relative",
    marginHorizontal: 7,
    paddingLeft: 10,
    // paddingVertical: 10,
    height: 185,
    marginTop: 6,
    marginBottom: 2,
    borderWidth: 0.2,
    //borderColor: "grey",
  },

  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 3,
    marginRight: 18,
    borderRadius: 60,
    //borderWidth: 0.6,
    borderColor: "grey",
  },

  major: {
    fontSize: 16,
    fontWeight: 500,
    paddingTop: 5,
    paddingRight: 20,
    color: "grey",
    //textAlign: "justify",
  },

  name: {
    fontSize: 18,
    fontWeight: 600,
    paddingTop: 10,
    color: "white",
    zIndex: 1,
    //top: 60,
    //marginTop: 30,
    //textAlign: "justify",
  },

  bio: {
    fontSize: 14,
    color: "gray",
    paddingHorizontal: 3,
  },
  tagsContainer: {
    backgroundColor: "#111111",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingVertical: 5,
    borderRadius: 15,
    maxHeight: 90,
    paddingRight: 5,
    //position: "absolute",
    //padding: 20,
    overflow: "hidden",
    marginBottom: 10,
    justifyContent: "left",
  },
  tag: {
    backgroundColor: "#14999999",
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 7,
    padding: 4,
    margin: 2,
  },
  tagText: {
    fontSize: 12,
    color: "white",
    fontWeight: 600,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 6,
    paddingTop: 5,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#2B2D2F",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  sortText: {
    marginHorizontal: 5,
    fontSize: 15,
    color: "lightgrey",
    fontWeight: "500",
    // textDecorationLine: "underline",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 140,
  },
  emptyText: {
    fontSize: 20,
    color: "grey",
  },
});

export default Home;
