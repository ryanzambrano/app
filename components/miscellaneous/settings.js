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
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
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

<View style={styles.logoutSection}>
    <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
      <Text style={styles.logoutButtonText}>Logout</Text>
    </TouchableOpacity>
  </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111", //#1D1D20
    marginBottom: -30,
    
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    
  },

  sectionTitle: {
    color: "grey",
    fontSize: 20,
    marginLeft: 15,
    paddingVertical: 10,
    fontWeight: "500",
    //borderBottomWidth: 1,
    //borderBottomColor: "grey",
  },

  titleContainer: {
    paddingVertical: 10,
    borderBottomColor: "grey",
    //borderBottomWidth: 0.3,
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
    backgroundColor: "#1D1D20",
    
  },

  rowContainer: {
    marginHorizontal: 0,
    borderRadius: 20,
    backgroundColor: "#1D1D20", // Set background color as per your theme
    marginBottom: 10, // Add spacing between sections
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
    paddingRight: 10,
  },
  logoutSection: {
    marginTop: 20, 
    backgroundColor: "#111111",
    marginBottom: 20,
  },
  logoutRow: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    
    alignItems: 'center', 
  },
  logoutButton: {
    backgroundColor: "red", // Set button color
    padding: 10,
    marginBottom: 40,
    marginHorizontal: 100,
    borderRadius: 5, // Adjust as per your design
    alignItems: "center",
  },
  
  logoutButtonText: {
    color: "white",
    fontSize: 18, // Set your desired font size
    fontWeight: "bold",
    
  },
  
});

export default SettingsScreen;
