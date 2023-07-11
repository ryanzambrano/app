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
        <Button title="logout" color="red" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  settingLabel: {
    fontSize: 18,
    marginLeft: 10,
  },
  button: { color: "red" },
});

export default SettingsScreen;
