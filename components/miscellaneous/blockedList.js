import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Switch,
  SafeAreaView,
  Button,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { supabase } from "../auth/supabase";
import { AntDesign } from "@expo/vector-icons";
import { picURL } from "../auth/supabase.js";
import { NavigationHelpersContext } from "@react-navigation/native";

const BlockedList = ({ navigation, route }) => {
  const { session } = route.params;
  const [sessionUser, setSessionuser] = useState(session.user);
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const { data: blockedData, error: blockedError } = await supabase
          .from("UGC")
          .select("blocked_profiles")
          .eq("user_id", session.user.id);

        if (blockedError) {
          console.error(
            "Error fetching blocked profiles:",
            blockedError.message
          );
          return;
        }
        const { blocked_profiles } = blockedData[0];
        const { data: userData, error: userError } = await supabase
          .from("UGC")
          .select("name, user_id")
          .in("user_id", blocked_profiles);

        if (userError) {
          console.error("Error fetching user details:", userError.message);
          return;
        }
        const { data: imageData, error: imageError } = await supabase
          .from("images")
          .select("*")
          .in("user_id", blocked_profiles)
          .eq("image_index", 0)
          .neq("last_modified", null);

        if (imageError) {
          console.error("Error fetching images:", imageError.message);
          return;
        }
        const combinedData = userData.map((user) => {
          const relatedImage = imageData.find(
            (img) => img.user_id === user.user_id
          );
          return {
            ...user,
            lastModified: relatedImage?.last_modified || null,
          };
        });

        setBlockedUsers(combinedData);
        console.log("Blocked Users Data: ", combinedData);
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      }
    };

    fetchBlockedUsers();
  }, []);

  const confirmUnblock = (userId) => {
    Alert.alert(
      "Do you want to unblock this user?",
      "",
      [
        {
          text: "Unblock User",
          onPress: () => unblockUser(userId),
        },
        {
          text: "Exit",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const unblockUser = async (user_id) => {
    const updatedBlockedProfiles = blockedUsers.filter(
      (user) => user.user_id !== user_id
    );

    const { data: updateData, error: updateError } = await supabase
      .from("UGC")
      .update({
        blocked_profiles: updatedBlockedProfiles.map((user) => user.user_id),
      })
      .eq("user_id", session.user.id);

    if (updateError) {
      console.error("Error updating blocked_profiles:", updateError.message);
    } else {
      setBlockedUsers(updatedBlockedProfiles);
    }
  };

  const renderItem = ({ item }) => {
    if (!item.lastModified) {
      return null;
    }
    return (
      <TouchableOpacity onPress={() => confirmUnblock(item.user_id)}>
        <View style={styles.listItem}>
          <Image
            style={styles.profileImage}
            source={{
              uri: `${picURL}/${item.user_id}/${item.user_id}-0-${item.lastModified}`,
            }}
          />
          <Text style={styles.text}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No users found</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.left}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#159e9e" />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.centerHeaderText}>Blocked Users</Text>
        </View>
        <View style={styles.right}></View>
      </View>
      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        borderTopColor={'#2B2D2F'}
    borderTopWidth={1}
        ListEmptyComponent={renderEmptyComponent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1D20", //#1D1D20
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginLeft: 15,
    
    marginRight: 39,
  },

  center: {
    alignContent: "center",
    textAlign: "center",
    alignItems: "center",
  },

  left: {
    alignContent: "left",
    textAlign: "left",
    alignItems: "left",
  },

  right: {
    alignContent: "right",
    textAlign: "right",
    alignItems: "right",
  },

  sectionTitle: {
    color: "grey",
    fontSize: 15,
    marginLeft: 15,
    paddingVertical: 10,
    fontWeight: "bold",
    //borderBottomWidth: 1,
    borderBottomColor: "grey",
  },

  titleContainer: {
    paddingVertical: 10,
    borderBottomColor: "grey",
    borderBottomWidth: 0.3,
    backgroundColor: "#111111",
  },

  button: {},
  settingRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  logoutRow: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  centerHeaderText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingVertical: 17,
    borderBottomColor: "grey",
    borderBottomWidth: 0.5,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 30,
    marginRight: 15,
  },
  text: {
    fontSize: 18,
    color: "#fff",
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

export default BlockedList;
