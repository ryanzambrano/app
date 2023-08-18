import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  Button,
} from "react-native";
import { supabase } from "../auth/supabase";

const SettingsScreen = ({ navigation, route }) => {
  const { session } = route.params;
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
  };

  const handleBackPress = () => {
    navigation.navigate("Tabs");
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.settingRow}>
        <Button title="Back" onPress={handleBackPress} />
      </View>
      <View style={styles.settingRow}>
        <Text style={styles.text}>About Us</Text>
      </View>
      <View style={styles.settingRow}>
        <Text style={styles.text}>User Agreement</Text>
      </View>
      <View style={styles.settingRow}>
        <Text style={styles.text}>Privacy Policy</Text>
      </View>
      <View style={styles.settingRow}>
        <Text style={styles.text}>Content Policy</Text>
      </View>
      <View style={styles.settingRow}>
        <Text style={styles.text}>Help Center</Text>
      </View>
      <View style={styles.settingRow}>
        <Text style={styles.text}>Report an Issue</Text>
      </View>
      <View style={styles.settingRow}>
        <Button title="logout" color="red" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
    padding: 10,
  },
  settingRow: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 0.3,
    borderBottomColor: "#ccc",
  },
  settingLabel: {
    fontSize: 18,
    marginLeft: 10,
  },
  button: { color: "red" },
  text: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 10,
  },
});

export default SettingsScreen;
