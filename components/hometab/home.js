import React, { useEffect, useState, useRef, useMemo, memo } from "react";
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
  Linking,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import ActionSheet from "react-native-action-sheet";
import { supabase } from "../auth/supabase.js"; // we have our client here!!! no need to worry about creating it again
import { picURL } from "../auth/supabase.js"; // This is the base url of the photos bucket that is in our Supabase project. It makes referencing user pictures easier
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator } from "react-native";
import { availableTags } from "../auth/profileUtils.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculateCompatibility } from "../auth/profileUtils.js";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

const logo = require("../../assets/logo4.png");

const isBookmarkedColor = "#14999999";
const notBookmarkedColor = "#fff";

const Home = ({ route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { session } = route.params;
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [sessionUser, setSessionuser] = useState(session.user);
  const [sortMethod, setSortMethod] = useState("Recommended");
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
  const [renderLimit, setRenderLimit] = useState(5);
  const flatListRef = useRef(null);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [ads, setAds] = useState([]);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRenderLimit(5);
    fetchUsers().then(() => setRefreshing(false));
  }, []);

  const onHomePageVisit = async () => {
    try {
      await AsyncStorage.setItem("homepageVisited", "true");
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };
  async function registerForPushNotificationsAsync() {
    let token;

    const storedToken = await AsyncStorage.getItem("expoPushToken");
    if (storedToken !== null) {
      //alert(storedToken);
      return storedToken;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        //alert("Failed to get push token for push notification!");
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "ad275287-fa4a-4f70-8397-8df453abd9a8",
        })
      ).data;

      await AsyncStorage.setItem("expoPushToken", token);
    } else {
      //   //alert("Must use physical device for Push Notifications");
    }

    const { data: istoken, error } = await supabase
      .from("UGC")
      .select("notification_token")
      .eq("user_id", session.user.id);

    if (istoken.notification_token == null) {
      //console.log(token)
      const { data: tokendata, error } = await supabase
        .from("UGC")
        .update({ notification_token: token })
        .eq("user_id", session.user.id);
    }

    return token;
  }

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
  const [imageStyle, setImageStyle] = useState({});

  const toggleBookmarkButton = () => {
    setIsBookmarked((prevIsBookmarked) => !prevIsBookmarked);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No one yet - Be the first at your school.
      </Text>
    </View>
  );

  const truncateString = (str, maxLength) => {
    if (str.length > maxLength) {
      return str.substring(0, maxLength - 3) + "...";
    }
    return str;
  };

  const showSortMenu = () => {
    const options = [
      "Alphabetical Order",
      "Shared Interests",
      "Recommended",
      "Class Year",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;

    ActionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex !== cancelButtonIndex) {
          const selectedSortMethod = options[buttonIndex];
          setSortMethod(selectedSortMethod);
        }
      }
    );
  };

  const sortedUsers = useMemo(() => {
    return users.sort((a, b) => {
      //console.log(a, b);
      switch (sortMethod) {
        case "Alphabetical Order":
          return a.name.localeCompare(b.name);

        case "Class Year":
          return a.class_year - b.class_year;

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
  }, [users, sortMethod]);

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
      genderPreference === "No Preferences" ||
      user.profiles.gender === genderPreference;

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

  const renderedUsers = filteredUsers.slice(0, renderLimit);

  const fetchCollege = async () => {
    const { data: collegeData, error: collegeError } = await supabase
      .from("profile")
      .select("college")
      .eq("user_id", session.user.id)
      .single();

    if (collegeError || !collegeData) {
      console.error(sessionProfileError || "Session user's profile not found");
      return;
    } else {
      return collegeData.college;
    }
  };

  const fetchAds = async (college) => {
    const currentDate = new Date();

    const { data: collegeData, error: adError } = await supabase
      .from("advertisements")
      .select("*")
      .eq("payment", true)
      .eq("college", college)
      .gte("end_date", currentDate.toISOString().substring(0, 10))
      .order("tier", { ascending: false });

    if (adError) {
      alert(error.message);
      return;
    }
    const randomnessFactor = 1; // Adjust this to increase or decrease randomness
    const randomizedAds = collegeData
      .map((ad) => ({
        ...ad,
        weight: ad.tier + Math.random() * randomnessFactor,
      }))
      .sort((a, b) => b.weight - a.weight) // Sort ads by weight in descending order
      .map(({ weight, ...ad }) => ad); // Optionally remove the weight property from the result

    setAds(randomizedAds);
  };

  const fetchUsers = async (college) => {
    try {
      const [ugcResponse, profileResponse, imageResponse] = await Promise.all([
        supabase
          .from("UGC")
          .select("*")
          .neq("has_ugc", false)
          .neq("profile_viewable", false),
        supabase
          .from("profile")
          .select("*")
          .eq("college", college)
          .neq("profile_complete", false),
        supabase
          .from("images")
          .select("*")
          .eq("image_index", 0)
          .neq("last_modified", null),
      ]);

      const { data: ugcData, error: ugcError } = ugcResponse;
      const { data: profileData, error: profileError } = profileResponse;
      const { data: imageData, error: imageError } = imageResponse;

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

        const ugcResponse = await supabase
          .from("UGC")
          .select("name, bio, tags, major, class_year, hometown")
          .eq("user_id", session.user.id)
          .single();
        const profileResponse = await supabase
          .from("profile")
          .select("*")
          .eq("user_id", session.user.id)
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

          setUsersBlockingMe(usersWhoBlockedMe);
        }

        const { data: bookmarkedData, error: bookmarkedError } = await supabase
          .from("UGC")
          .select("bookmarked_profiles")
          .eq("user_id", session.user.id);
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
          .eq("user_id", session.user.id);
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
      alert("An unexpected error occurred, please try again later.");
    }
    onHomePageVisit();
  };

  const fetchData = async () => {
    try {
      const college = await fetchCollege();
      //alert("check" + college.collegeData);
      await Promise.all([
        fetchUsers(college), // These are now executed in parallel
        fetchAds(college),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );
    if (isBookmarked) {
      fetchUsers();
    }
  }, [isFocused]);

  const handleUserCardPress = (user) => {
    setSelectedUser(user);
    navigation.navigate("userCard", { user });
  };

  const handleAdPress = async (item) => {
    const url = item.ad_link;

    if (url) {
      // Open the URL in the default browser
      Linking.openURL(url).catch((err) => console.log("An error occurred:"));
    } else {
      //console.warn("No URL provided for the ad item");
    }
    const { data: clickData, error: clickError } = await supabase.rpc(
      "increment",
      { x: 1, row_id: item.id }
    );

    if (clickError) {
    }
  };
  const renderLoading = () => {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  };

  const renderAdComponent = ({ item, onPress }) => {
    if (!item.url) {
      return null;
    }

    return (
      <TouchableOpacity onPress={() => handleAdPress(item)}>
        <View style={styles.card}>
          <Image
            style={styles.adImage}
            source={{
              uri: `${item.url}`,
            }}
          />
          <View style={styles.userInfo}>
            <View style={styles.vClass}>
              <Text style={styles.class}>Ad</Text>
            </View>
            <View style={styles.adStuff}>
              <Text style={styles.adHeader}>{item.ad_header}</Text>
              <Text style={styles.adContent}>{item.ad_content}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUserItem = (item, index) => {
    if (!item.lastModified) return null;

    const truncatedName = truncateString(item.name, 25);
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
            <View style={styles.vClass}>
              <Text style={styles.class}>{item.class_year}</Text>
            </View>
            <View style={styles.userStuff}>
              <Text style={styles.name}>{truncatedName}</Text>
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
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index, onPress }) => {
    if (!item.lastModified) {
      //console.log(item);
      return null;
    }

    const adPosition = Math.floor((index + 1) / 4) - 1; // Calculate ad position
    const shouldRenderAd = (index + 1) % 4 === 0 && ads[adPosition]; // Check both timing and availability

    // Determine if it's time to render an ad
    if (shouldRenderAd) {
      return (
        <View>
          {renderAdComponent({ item: ads[adPosition] })}
          {renderUserItem(item, index)}
        </View>
      );
    } else {
      return renderUserItem(item, index);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.logoTitleContainer}
          onPress={() => scrollToTop()}
        >
          <Image style={styles.logo} source={logo} />
          <Text style={styles.headerText}> Cabana </Text>
        </TouchableOpacity>
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
            ref={flatListRef}
            data={renderedUsers}
            extraData={{ searchQuery, isBookmarked, bookmarkedProfiles }}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.user_id.toString()}
            ListEmptyComponent={renderEmptyComponent}
            onEndReached={() => setRenderLimit((prevLimit) => prevLimit + 5)}
            onEndReachedThreshold={0.2}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            windowSize={5}
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
    backgroundColor: "#252d36",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 5,
    marginBottom: 5,
    elevation: 3,
    marginHorizontal: 10,
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

  userStuff: {
    flex: 1,
    marginTop: -19,
    justifyContent: "center",
  },

  adStuff: {
    flex: 1,
    //marginTop: 10,
    justifyContent: "flex-start",
    alignSelf: "center",
  },

  userContainer: {
    flex: 1,
    alignItems: "center",
    padding: 16,
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
    height: 185,
    marginTop: 6,
    marginBottom: 2,
    borderWidth: 0.2,
  },

  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 3,
    marginRight: 18,
    borderRadius: 60,
    borderColor: "grey",
    marginTop: -10,
  },

  adImage: {
    width: 130, // Take up all available width in the card
    height: 130,
    maxHeight: 150,
    borderRadius: 10,
    marginRight: 18,
    //xaspectRatio: 1,
    borderColor: "grey",
    marginTop: -10,
  },

  adHeader: {
    fontSize: 23,
    fontWeight: 500,
    color: "white",
    marginRight: 10,
    textAlign: "center",
  },

  adContent: {
    fontSize: 17,
    color: "grey",
    fontWeight: 500,
    marginTop: 3,
    marginRight: 10,
    textAlign: "center",
  },

  major: {
    fontSize: 16,
    fontWeight: 500,
    paddingTop: 5,
    paddingRight: 20,
    color: "grey",
  },

  name: {
    fontSize: 18,
    fontWeight: 600,
    paddingLeft: 3,
    color: "white",
    zIndex: 1,
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 140,
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    color: "grey",
    textAlign: "center",
  },
  class: {
    color: "grey",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "right",

    flex: 1,
  },
  vClass: {
    flexDirection: "row",
    marginTop: 7,
    marginRight: 15,
  },
});

export default Home;
