import "react-native-url-polyfill/auto";
import React, { useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Button,
  Modal,
  Dimensions,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { supabase } from "../authentication/supabase.js";
//import { insertUser} from './server.js';

export const Questionaire2 = ({ navigation }) => {
  const windowHeight = Dimensions.get("window").height;
  const [isBirthdayModalVisible, setIsBirthdayModalVisible] = useState(false);
  const [isForFunModalVisible, setIsForFunModalVisible] = useState(false);
  const [isLivingPreferencesModalVisible, setIsLivingPreferencesModalVisible] =
    useState(false);

  const [selectedStudies, setSelectedStudies] = useState("");

  const [selectedForFun, setSelectedForFun] = useState("Stay in or Go out?");

  const [selectedLivingPreferences, setSelectedLivingPreferences] = useState(
    "Select your Living Preferences"
  );

  const livingPreferences = ["Apartment", "Dorm", "No Preferences", "Other"];

  const forFun = ["Stay in", "Go out"];

  const openStudiesModal = () => {
    setIsStudiesModalVisible(true);
  };

  const closeStudiesModal = () => {
    setIsStudiesModalVisible(false);
  };

  const openForFunModal = () => {
    setIsForFunModalVisible(true);
  };

  const closeForFunModal = () => {
    setIsForFunModalVisible(false);
  };

  const openLivingPreferencesModal = () => {
    setIsLivingPreferencesModalVisible(true);
  };

  const closeLivingPreferencesModal = () => {
    setIsLivingPreferencesModalVisible(false);
  };

  const userData = {
    living_preferences: selectedLivingPreferences,
    for_fun: selectedForFun,
    studies: selectedStudies,
  };

  const updateProfile = async () => {
    // Update the user profile in the 'profiles' table
    const { data, error } = await supabase
      .from("profiles")
      .update([
        {
          living_preferences: "dorm",
        },
      ])
      .eq("id", 1);

    if (error) {
      console.error("Error updating profile:", error.message);
    } else {
      console.log("Profile updated successfully:", data);
    }
  };

  async function refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    const { session, user } = data;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eBecf4" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Answer some lifestyle questions!</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={styles.inputHeader}>
              Do you have living preferences?
            </Text>

            <TouchableOpacity
              onPress={() => {
                openLivingPreferencesModal();
              }}
            >
              <View style={styles.inputControl}>
                <Text style={styles.inputText}>
                  {selectedLivingPreferences}
                </Text>
              </View>
            </TouchableOpacity>

            <Modal
              visible={isLivingPreferencesModalVisible}
              animationType="slide"
              transparent
            >
              <View style={styles.modalContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.picker}
                    selectedValue={selectedLivingPreferences}
                    onValueChange={(itemValue) =>
                      setSelectedLivingPreferences(itemValue)
                    }
                  >
                    {livingPreferences.map((livingPreferences) => (
                      <Picker.Item
                        key={livingPreferences}
                        label={livingPreferences}
                        value={livingPreferences}
                      />
                    ))}
                  </Picker>
                </View>

                <View style={styles.bbuttons}>
                  <Button title="Save" onPress={closeLivingPreferencesModal} />
                  <Button
                    title="Cancel"
                    onPress={closeLivingPreferencesModal}
                  />
                </View>
              </View>
            </Modal>
          </View>

          <View style={styles.input}>
            <Text style={styles.inputHeader}>
              For fun, would you rather stay in or go out?
            </Text>

            <TouchableOpacity
              onPress={() => {
                openForFunModal();
              }}
            >
              <View style={styles.inputControl}>
                <Text style={styles.inputText}>{selectedForFun}</Text>
              </View>
            </TouchableOpacity>

            <Modal
              visible={isForFunModalVisible}
              animationType="slide"
              transparent
            >
              <View style={styles.modalContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.picker}
                    selectedValue={selectedForFun}
                    onValueChange={(itemValue) => setSelectedForFun(itemValue)}
                  >
                    {forFun.map((Gender) => (
                      <Picker.Item key={Gender} label={Gender} value={Gender} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.bbuttons}>
                  <Button title="Save" onPress={closeForFunModal} />
                  <Button title="Cancel" onPress={closeForFunModal} />
                </View>
              </View>
            </Modal>
          </View>

          <View style={styles.input}>
            <Text style={styles.inputHeader}>Race</Text>

            <TouchableOpacity
              onPress={() => {
                openLivingPreferencesModal();
              }}
            >
              <View style={styles.inputControl}>
                <Text style={styles.inputText}>
                  {selectedLivingPreferences}
                </Text>
              </View>
            </TouchableOpacity>

            <Modal
              visible={isLivingPreferencesModalVisible}
              animationType="slide"
              transparent
            >
              <View style={styles.modalContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.picker}
                    selectedValue={selectedLivingPreferences}
                    onValueChange={(itemValue) =>
                      setSelectedLivingPreferences(itemValue)
                    }
                  >
                    {livingPreferences.map((livingPreferences) => (
                      <Picker.Item
                        key={livingPreferences}
                        label={livingPreferences}
                        value={livingPreferences}
                      />
                    ))}
                  </Picker>
                </View>

                <View style={styles.bbuttons}>
                  <Button title="Save" onPress={closeLivingPreferencesModal} />
                  <Button
                    title="Cancel"
                    onPress={closeLivingPreferencesModal}
                  />
                </View>
              </View>
            </Modal>
          </View>

          <View style={styles.formAction}>
            <TouchableOpacity
              onPress={() => {
                updateProfile();
                refreshSession();
              }}
            >
              <View style={styles.continue}>
                <Text style={styles.continueText}>Next</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },

  header: {
    marginVertical: 36,
  },

  headerImage: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 25,
  },

  titleText: {
    fontFamily: "Verdana-Bold",
    fontSize: 27,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#1e1e1e",
  },

  sloganText: {
    fontFamily: "Verdana",
    fontSize: 15,
    fontWeight: "500",
    color: "#929292",
    textAlign: "center",
  },

  input: {
    marginBottom: 16,
  },

  inputHeader: {
    fontSize: 17,
    fontWeight: "500",
    color: "#222",
    marginBottom: 10,
  },

  inputControl: {
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "500",
    height: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#6b7280",
    borderColor: "#fff",
  },

  inputText: {
    color: "#6b7280",
  },

  form: {
    marginBottom: 24,
    flex: 1,
  },

  formAction: {
    marginVertical: 24,
  },

  continue: {
    marginBottom: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: "#075eec",
    borderColor: "#075eec",
  },

  continueText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },

  center: {
    marginTop: "60%",
    marginBottom: "20%",
  },

  modalContainer: {
    flex: 1,
    marginTop: "130%",
    backgroundColor: "#fff",
    justifyContent: "space-around",
    gap: "50%",
  },

  pickerContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: "1%",
  },

  picker: {
    flex: 1,
  },

  pickerDate: {
    flex: 0,
    width: "28%",
  },

  pickerYear: {
    flex: 0,
    width: "28%",
  },

  bbuttons: {
    flex: 1,
    flexDirection: "column",
    gap: "20%",
  },
});

export default Questionaire2;
