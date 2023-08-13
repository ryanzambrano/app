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

export const MatchingData = ({ navigation, route }) => {
  const { session } = route.params;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const shakeAnimationValue = useRef(new Animated.Value(0)).current;
  const [isError, setIsError] = useState("");

  const [tidinessModalVisible, setTidinessModalVisible] = useState(false);
  const [sleepTimeModalVisible, setSleepTimeModalVisible] = useState(false);
  const [noiseModalVisible, setNoiseModalVisible] = useState(false);

  const [selectedTidiness, setSelectedTidiness] = useState("");
  const [selectedSleepTime, setSelectedSleepTime] = useState("");
  const [selectedNoise, setSelectedNoise] = useState("");

  const tidinessLevels = [
    "Very tidy",
    "Somewhat tidy",
    "Neutral",
    "Somewhat messy",
    "Very messy",
  ];
  const sleepTimes = ["8 PM", "10 PM", "12 PM", "2 AM"];
  const noisePreferences = ["Yes", "Somewhat Yes", "Somewhat No", "No"];

  // ... [rest of the modal handling functions
  const closeTidinessModal = () => setTidinessModalVisible(false);
  const closeSleepTimeModal = () => setSleepTimeModalVisible(false);
  const closeNoiseModal = () => setNoiseModalVisible(false);

  // Handle save choices
  handleSaveTidiness = () => {
    if (!selectedTidiness) setSelectedTidiness("Very tidy");
    closeTidinessModal();
  };

  handleSaveSleepTime = () => {
    if (!selectedSleepTime) setSelectedSleepTime("8 PM");
    closeSleepTimeModal();
  };

  handleSaveNoise = () => {
    if (!selectedNoise) setSelectedNoise("Yes");
    closeNoiseModal();
  };

  const userData = {
    tidiness: selectedTidiness,
    sleepTime: selectedSleepTime,
    noisePreference: selectedNoise,
  };

  // ... [rest of the functions and the component rendering]

  const handleUpdate = async (userData, session) => {
    setIsError(null);

    if (session?.user) {
      if (
        !!userData.tidiness &&
        !!userData.sleepTime &&
        !!userData.noisePreference
      ) {
        const { data, error } = await supabase
          .from("profile")
          .update({
            tidiness: userData.tidiness,
            sleep_time: userData.sleepTime,
            noise_preference: userData.noisePreference,
          })
          .eq("user_id", session.user.id);

        if (error) {
          startShakeAnimation(shakeAnimationValue);
          setIsError(error.message);
        } else {
          navigation.navigate("TagSelectionScreen");
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

          {/* Tidiness Question */}
          <View style={styles.input}>
            <Text style={styles.inputHeader}>
              How tidy would you rate yourself?
            </Text>
            <TouchableOpacity onPress={() => setTidinessModalVisible(true)}>
              <View style={styles.inputControl}>
                <Text style={styles.inputText}>{selectedTidiness}</Text>
              </View>
            </TouchableOpacity>
            <Modal
              visible={tidinessModalVisible}
              animationType="slide"
              transparent
            >
              <View style={styles.modalContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.picker}
                    selectedValue={selectedTidiness}
                    onValueChange={(itemValue) =>
                      setSelectedTidiness(itemValue)
                    }
                  >
                    {tidinessLevels.map((level) => (
                      <Picker.Item key={level} label={level} value={level} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.bbuttons}>
                  <Button
                    title="Save"
                    onPress={() => {
                      handleSaveTidiness();
                    }}
                  />
                  <Button
                    title="Cancel"
                    onPress={() => setTidinessModalVisible(false)}
                  />
                </View>
              </View>
            </Modal>
          </View>

          {/* Sleep Time Question */}
          <View style={styles.input}>
            <Text style={styles.inputHeader}>
              What time do you go to sleep?
            </Text>
            <TouchableOpacity onPress={() => setSleepTimeModalVisible(true)}>
              <View style={styles.inputControl}>
                <Text style={styles.inputText}>{selectedSleepTime}</Text>
              </View>
            </TouchableOpacity>
            <Modal
              visible={sleepTimeModalVisible}
              animationType="slide"
              transparent
            >
              <View style={styles.modalContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.picker}
                    selectedValue={selectedSleepTime}
                    onValueChange={(itemValue) =>
                      setSelectedSleepTime(itemValue)
                    }
                  >
                    {sleepTimes.map((time) => (
                      <Picker.Item key={time} label={time} value={time} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.bbuttons}>
                  <Button
                    title="Save"
                    onPress={() => {
                      handleSaveSleepTime();
                    }}
                  />
                  <Button
                    title="Cancel"
                    onPress={() => setSleepTimeModalVisible(false)}
                  />
                </View>
              </View>
            </Modal>
          </View>

          {/* Noise Question */}
          <View style={styles.input}>
            <Text style={styles.inputHeader}>
              Does noise keep you up at night?
            </Text>
            <TouchableOpacity onPress={() => setNoiseModalVisible(true)}>
              <View style={styles.inputControl}>
                <Text style={styles.inputText}>{selectedNoise}</Text>
              </View>
            </TouchableOpacity>
            <Modal
              visible={noiseModalVisible}
              animationType="slide"
              transparent
            >
              <View style={styles.modalContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.picker}
                    selectedValue={selectedNoise}
                    onValueChange={(itemValue) => setSelectedNoise(itemValue)}
                  >
                    {noisePreferences.map((pref) => (
                      <Picker.Item key={pref} label={pref} value={pref} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.bbuttons}>
                  <Button
                    title="Save"
                    onPress={() => {
                      handleSaveNoise();
                    }}
                  />
                  <Button
                    title="Cancel"
                    onPress={() => setNoiseModalVisible(false)}
                  />
                </View>
              </View>
            </Modal>
          </View>

          {/* Rest of the component... */}
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
                handleUpdate(userData, session);
                //navigation.navigate("TagSelectionScreen");
              }}
            >
              <View style={styles.continue}>
                <Text style={styles.continueText}>Next</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

// ... [styles and export]

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

export default MatchingData;
