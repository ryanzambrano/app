import React from "react";
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

  const handleBackPress = () => {
    navigation.navigate("Tabs");
  };

  const sections = [
    {
      title: "Social",
      items: ["Report", "Block", "Allow Your account viewable"],
    },
    {
      title: "About",
      items: [
        "About Us",
        "User Agreement",
        "Privacy Policy",
        "Content Policy",
        "Help Center",
      ],
    },
    {
      title: "Reach Out",
      items: ["Report an Issue"],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Contacts")}
        >
          <AntDesign name="arrowleft" size={24} color="#159e9e" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {sections.map((section, index) => (
          <View key={index}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((text, index) => (
              <TouchableOpacity key={index} style={styles.settingRow}>
                <Text style={styles.text}>{text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.logoutRow}>
          <Button title="logout" color="red" onPress={signOut} />
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
