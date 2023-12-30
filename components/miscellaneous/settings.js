import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  Button,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../auth/supabase";
import { AntDesign } from "@expo/vector-icons";

const SettingsScreen = ({ navigation, route }) => {
  const { session } = route.params;

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
  };
  const [isDiscoverable, setIsDiscoverable] = useState(false);

  const toggleDiscoverable = async () => {
    const newDiscoverableState = !isDiscoverable;
    setIsDiscoverable(newDiscoverableState);
    updateViewable(newDiscoverableState);
    // Here you can add logic to update this setting in your backend or local storage
  };

  const deleteUser = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .delete()
        .eq("user_id", session.user.id);
      const { data: promptsData, error: promptsError } = await supabase
        .from("prompts")
        .delete()
        .eq("user_id", session.user.id);
      const { error: groupChatsError } = await supabase
        .from("Group_Chat_Messages")
        .delete()
        .eq("Sent_From", session.user.id);

      const { error: groupsError } = await supabase
        .from("Group_Chats")
        .delete()
        .contains("User_Id", [session.user.id])
        .eq("Is_College", false);
      const { data: ugcData, error: ugcError } = await supabase
        .from("UGC")
        .delete()
        .eq("user_id", session.user.id);
    } finally {
      const { data: betaData, error: betaError } = await supabase
        .from("beta")
        .insert({ imp1: session.user.id });
      const { error } = await supabase.auth.signOut();
    }
  };

  const handleBackPress = () => {
    navigation.navigate("Tabs");
  };

  useEffect(() => {
    fetchViewable();
  }, []);

  const fetchViewable = async () => {
    const { data, error } = await supabase
      .from("UGC")
      .select("profile_viewable")
      .eq("user_id", session.user.id)
      .single();

    setIsDiscoverable(data.profile_viewable);
  };

  const updateViewable = async (viewable) => {
    const { data, error } = await supabase
      .from("UGC")
      .update({
        profile_viewable: viewable,
      })
      .eq("user_id", session.user.id);
  };

  const sections = [
    {
      title: "Social",
      items: [
        { name: "Manage Blocked Users" },
        { name: "Allow Your Account Discoverable", type: "switch" },
      ],
    },
    {
      title: "About",
      items: [
        { name: "About Us" },
        { name: "User Agreement" },
        { name: "Privacy Policy" },
        { name: "Content Policy" },
      ],
    },
    {
      title: "Reach Out",
      items: [{ name: "Report an Issue" }],
    },
    {
    title: "Manage Your Account", // New section for Logout and Delete Profile
    items: [
      { name: "Logout", type: "button", action: signOut },
      { name: "Delete Profile", type: "button", action: deleteUser },
    ],
  },
  ];

  const screenMap = {
    "Manage Blocked Users": "BlockedList",
    "Allow Your Account Discoverable": "AccountDiscoverability",
    "About Us": "AboutUs",
    "User Agreement": "UserAgreement",
    "Privacy Policy": "PrivacyPolicy",
    "Content Policy": "ContentPolicy",
    "Beta Test Survey": "FAQ",
    "Report an Issue": "ReportIssue",
  };

  const navigateToScreen = (screenName) => {
    if (screenMap[screenName]) {
      navigation.navigate(screenMap[screenName]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Profile")}
        >
          <AntDesign name="arrowleft" size={24} color="#159e9e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} styles={{ paddingBottom: 100}}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.rowContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, itemIndex) => {
              if (item.type === "switch") {
                return (
                  <View key={itemIndex} style={styles.settingRow}>
                    <Text style={styles.text}>
                      {item.name}
                      {"   "}
                    </Text>
                    <Switch
                      trackColor={{ false: "#767577", true: "#149999" }}
                      thumbColor={isDiscoverable ? "#fff" : "#fff"}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={toggleDiscoverable}
                      value={isDiscoverable}
                    />
                  </View>
                );
              } else if (item.type === "button") {
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.settingRow}
                    onPress={item.action}
                  >
                    <Text style={styles.text2}>{item.name}</Text>
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.settingRow}
                    onPress={() => navigateToScreen(item.name)}
                  >
                    <Text style={styles.text}>{item.name}</Text>
                  </TouchableOpacity>
                );
              }
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1D20", //#1D1D20
    marginBottom: -30,
    
  },
  header: {
    flexDirection: "row",
    justifyContent: "center", // Center the title
    alignItems: "center",
    paddingVertical: 10,
    paddingBottom: 20,
    marginBottom: 0,
    borderBottomColor:'#2B2D2F',
    borderBottomWidth: 1,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    
  },

  button: {
    position: 'absolute', // Position the back button absolutely
    left: 15,
    top: 10,
  },

  sectionTitle: {
    color: "lightgrey",
    fontSize: 18,
    marginLeft: 15,
    paddingTop: 10,
    fontWeight: "500",
    
  },

  titleContainer: {
    paddingTop: 20,
    marginTop: 5,
    paddingBottom: 10,
    borderBottomColor: "#2B2D2F",
    //borderBottomWidth: 0.3,
    backgroundColor: "#1D1D20",
    borderBottomWidth: 1.3,
  },

 
  settingRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomColor: "#2B2D2F",
    borderBottomWidth: 1,
    borderBottomLeftRadius: 20,
    backgroundColor: "#1D1D20",
  },

  rowContainer: {
    marginHorizontal: 0,
    borderRadius: 20,
    backgroundColor: "#1D1D20", // Set background color as per your theme
    marginBottom: 0, // Add spacing between sections
  },

  logoutRow: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 10,
    paddingRight: 10,
  },
  text2: {
    color: "red",
    fontWeight: '400',
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 10,
    paddingRight: 10,
  },
  logoutSection: {
    marginTop: 20,
    backgroundColor: "#141B1F",
    marginBottom: 0,
  },
  logoutRow: {
    paddingVertical: 15,
    paddingHorizontal: 15,

    alignItems: "center",
  },
  logoutButton: {
   // backgroundColor: "red", // Set button color
    padding: 10,
    marginBottom: 0,
    marginHorizontal: 5,
    borderRadius: 5, // Adjust as per your design
    alignItems: "left",
  },

  logoutButtonText: {
    color: "orange",
    fontSize: 17, // Set your desired font size
    fontWeight: "400",
  },
});

export default SettingsScreen;
