import React, { useState } from "react";
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
    // Here you can add logic to update this setting in your backend or local storage
  };

  const handleBackPress = () => {
    navigation.navigate("Tabs");
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
        { name: "FAQ" },
      ],
    },
    {
      title: "Reach Out",
      items: [{ name: "Report an Issue" }],
    },
  ];

  const screenMap = {
    "Manage Blocked Users": "BlockedList",
    "Allow Your Account Discoverable": "AccountDiscoverability",
    "About Us": "AboutUs",
    "User Agreement": "UserAgreement",
    "Privacy Policy": "PrivacyPolicy",
    "Content Policy": "ContentPolicy",
    FAQ: "FAQ",
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
      </View>
      <ScrollView>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex}>
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

        <View style={styles.logoutRow}>
          <Button title="Logout" color="red" onPress={signOut} />
        </View>
      </ScrollView>
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

  button: {
    marginLeft: 15,
  },
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
  text: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 10,
    paddingVertical: 10,
  },
});

export default SettingsScreen;
