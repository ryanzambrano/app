import "react-native-url-polyfill/auto";
import React, { useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Button,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { supabase } from "../auth/supabase.js";
import { startShakeAnimation } from "../auth/profileUtils.js";

export const Questionaire1 = ({ navigation, route }) => {
  const { session } = route.params;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  const shakeAnimationValue = useRef(new Animated.Value(0)).current;
  const [isError, setIsError] = useState("");

  const [isAgeModalVisible, setIsAgeModalVisible] = useState(false);
  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
  const [isWhoModalVisible, setIsWhoModalVisible] = useState(false);

  const [selectedAge, setSelectedAge] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedWho, setSelectedWho] = useState("");

  const gender = ["Male", "Female", "Other"];
  const race = ["White", "Black", "Brown", "Yellow"];
  const ages = Array.from(Array(31).keys()).map((age) => String(age + 1));

  const openAgeModal = () => {
    setIsAgeModalVisible(true);
  };
  const closeAgeModal = () => {
    setIsAgeModalVisible(false);
  };
  const openGenderModal = () => {
    setIsGenderModalVisible(true);
  };
  const closeGenderModal = () => {
    setIsGenderModalVisible(false);
  };
  const openWhoModal = () => {
    setIsWhoModalVisible(true);
  };
  const closeWhoModal = () => {
    setIsWhoModalVisible(false);
  };

  handleSaveAge = () => {
    if (!selectedAge) {
      setSelectedAge(1);
    }
    closeAgeModal();
  };
  handleSaveGender = () => {
    if (!selectedGender) {
      setSelectedGender("Male");
    }
    closeGenderModal();
  };
  handleSaveWho = () => {
    if (!selectedWho) {
      setSelectedWho("Male");
    }
    closeWhoModal();
  };

  const userData = {
    age: selectedAge,
    who: selectedWho,
    gender: selectedGender,
  };

  const handleUpdate = async (userData, session) => {
    setIsError(null);

    if (session?.user) {
      if (!!userData.age && !!userData.gender && !!userData.who) {
        const { data, error } = await supabase
          .from("profile")
          .update({
            age: userData.age,
            who: userData.who,
            gender: userData.gender,
          })
          .eq("user_id", session.user.id);

        if (error) {
          startShakeAnimation(shakeAnimationValue);
          setIsError(error.message);
        } else {
          navigation.navigate("Questionaire2");
        }
      } else {
        startShakeAnimation(shakeAnimationValue);
        setIsError("Enter all required fields");
      }
    }
  };

  const shakeAnimationStyle = {
    transform: [
      {
        translateX: shakeAnimationValue.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-5, 0, 5],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eBecf4" }}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titleText}>
              Answer some questions about yourself!
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={styles.inputHeader}>Select your age</Text>

              <TouchableOpacity
                onPress={() => {
                  openAgeModal();
                }}
              >
                <View style={styles.inputControl}>
                  <Text
                    style={styles.inputText}
                    placeholder="Select your Gender"
                    placeholderTextColor="#6b7280"
                    value={`${selectedAge}`}
                  >
                    {selectedAge}
                  </Text>
                </View>
              </TouchableOpacity>

              <Modal
                visible={isAgeModalVisible}
                animationType="slide"
                transparent
              >
                <View style={styles.modalContainerGender}>
                  <View style={styles.pickerContainerGender}>
                    <Picker
                      style={styles.picker}
                      selectedValue={selectedAge}
                      onValueChange={(itemValue) => setSelectedAge(itemValue)}
                    >
                      {ages.map((age) => (
                        <Picker.Item key={age} label={age} value={age} />
                      ))}
                    </Picker>
                  </View>
                  <View style={styles.bbuttons}>
                    <Button title="Save" onPress={handleSaveAge} />
                    <Button title="Cancel" onPress={closeAgeModal} />
                  </View>
                </View>
              </Modal>
            </View>

            <View style={styles.input}>
              <Text style={styles.inputHeader}>Select your Gender</Text>

              <TouchableOpacity
                onPress={() => {
                  openGenderModal();
                }}
              >
                <View style={styles.inputControl}>
                  <Text
                    style={styles.inputText}
                    placeholder="Select your Gender"
                    placeholderTextColor="#6b7280"
                    value={`${selectedGender}`}
                  >
                    {selectedGender}
                  </Text>
                </View>
              </TouchableOpacity>

              <Modal
                visible={isGenderModalVisible}
                animationType="slide"
                transparent
              >
                <View style={styles.modalContainerGender}>
                  <View style={styles.pickerContainerGender}>
                    <Picker
                      style={styles.picker}
                      selectedValue={selectedGender}
                      onValueChange={(itemValue) =>
                        setSelectedGender(itemValue)
                      }
                    >
                      {gender.map((Gender) => (
                        <Picker.Item
                          key={Gender}
                          label={Gender}
                          value={Gender}
                        />
                      ))}
                    </Picker>
                  </View>
                  <View style={styles.bbuttons}>
                    <Button title="Save" onPress={handleSaveGender} />
                    <Button title="Cancel" onPress={closeGenderModal} />
                  </View>
                </View>
              </Modal>
            </View>

            <View style={styles.input}>
              <Text style={styles.inputHeader}>
                Who do you want to room with?
              </Text>

              <TouchableOpacity
                onPress={() => {
                  openWhoModal();
                }}
              >
                <View style={styles.inputControl}>
                  <Text
                    style={styles.inputText}
                    placeholder="Select your Gender"
                    placeholderTextColor="#6b7280"
                    value={`${selectedGender}`}
                  >
                    {selectedWho}
                  </Text>
                </View>
              </TouchableOpacity>

              <Modal
                visible={isWhoModalVisible}
                animationType="slide"
                transparent
              >
                <View style={styles.modalContainerGender}>
                  <View style={styles.pickerContainerGender}>
                    <Picker
                      style={styles.picker}
                      selectedValue={selectedWho}
                      onValueChange={(itemValue) => setSelectedWho(itemValue)}
                    >
                      {gender.map((gender) => (
                        <Picker.Item
                          key={gender}
                          label={gender}
                          value={gender}
                        />
                      ))}
                    </Picker>
                  </View>

                  <View style={styles.bbuttons}>
                    <Button title="Save" onPress={handleSaveWho} />
                    <Button title="Cancel" onPress={closeWhoModal} />
                  </View>
                </View>
              </Modal>
            </View>

            {isError && (
              <Animated.Text
                style={[styles.errorText, shakeAnimationStyle]}
                value={isError}
              >
                {isError}
              </Animated.Text>
            )}

            <View style={styles.formAction}>
              <TouchableOpacity
                onPress={() => {
                  {
                    handleUpdate(userData, session);
                  }
                }}
              >
                <View style={styles.continue}>
                  <Text style={styles.continueText}>Next</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <StatusBar style="dark" />
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

  titleText: {
    fontFamily: "Verdana-Bold",
    fontSize: 27,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#1e1e1e",
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
    fontWeight: "500",
  },

  form: {
    marginBottom: 24,
    flex: 1,
  },

  formAction: {
    marginVertical: 24,
  },

  continue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: "#14999999",
    borderColor: "#14999999",
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
    marginTop: "100%",
    backgroundColor: "#fff",
    justifyContent: "space-around",
    gap: "50%",
  },

  modalContainerGender: {
    flex: 1,
    marginTop: "130%",
    backgroundColor: "#fff",
    justifyContent: "space-around",
    gap: "50%",
  },

  pickerContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: "7%",
  },

  pickerContainerGender: {
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

  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
});

export default Questionaire1;
