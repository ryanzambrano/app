import "react-native-url-polyfill/auto";
import React, { useState, useRef, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";

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

export const Retake3 = ({ navigation, route }) => {
  const { session } = route.params;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  const shakeAnimationValue = useRef(new Animated.Value(0)).current;
  const [isError, setIsError] = useState("");
  const [fetched, setFetched] = useState(false);

  const [isGradYearModalVisible, setIsGradYearModalVisible] = useState(false);

  const [selectedGradYear, setSelectedGradYear] = useState("");

  const gradYear = [
    "2023",
    "2024",
    "2025",
    "2026",
    "2027",
    "2028",
    "2029",
    "2030",
  ];

  const openGradYearModal = () => {
    setIsGradYearModalVisible(true);
  };
  const closeGradYearModal = () => {
    setIsGradYearModalVisible(false);
  };

  useEffect(() => {
    if (!fetched) {
      fetchData();
    }
  }, [fetched]);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("UGC")
      .select("class_year")
      .eq("user_id", session.user.id)
      .single();

    if (error) {
    }
    if (data) {
      setSelectedGradYear(data.class_year);
      setFetched(true);
    }
  };

  const userData = {
    gradYear: selectedGradYear,
  };

  const handleUpdate = async (userData, session) => {
    setIsError(null);

    if (session?.user) {
      if (!userData.gradYear) {
        startShakeAnimation(shakeAnimationValue);
        return setIsError("All fields are required");
      }

      try {
        const { error: ugcError } = await supabase
          .from("UGC")
          .update({ class_year: userData.gradYear })
          .eq("user_id", session.user.id);

        if (ugcError) throw ugcError;

        navigation.navigate("Retake4");
      } catch (error) {
        startShakeAnimation(shakeAnimationValue);
        setIsError(error.message);
      }
    }
  };

  handleGradYear = () => {
    if (!selectedGradYear) {
      setSelectedGradYear(2023);
    }
    closeGradYearModal();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111111" }}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.heading}>
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <AntDesign name="arrowleft" size={24} color="#159e9e" />
              </TouchableOpacity>
            </View>
            <Text style={styles.titleText}>What year do you graduate?</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={styles.inputHeader}>Class Year</Text>

              <TouchableOpacity
                onPress={() => {
                  openGradYearModal();
                }}
              >
                <View style={styles.inputControl}>
                  <Text style={styles.inputText}>{selectedGradYear}</Text>
                </View>
              </TouchableOpacity>

              <Modal
                visible={isGradYearModalVisible}
                animationType="slide"
                transparent
              >
                <View style={styles.modalContainer}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      style={styles.picker}
                      selectedValue={selectedGradYear}
                      onValueChange={(itemValue) =>
                        setSelectedGradYear(itemValue)
                      }
                    >
                      {gradYear.map((gradYear) => (
                        <Picker.Item
                          color="white"
                          key={gradYear}
                          label={gradYear}
                          value={gradYear}
                        />
                      ))}
                    </Picker>
                  </View>

                  <View style={styles.bbuttons}>
                    <Button title="Save" onPress={handleGradYear} />

                    <Button title="Cancel" onPress={closeGradYearModal} />
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
        </View>
      </TouchableWithoutFeedback>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },

  header: {
    //marginVertical: 36,
  },

  titleText: {
    fontFamily: "Verdana-Bold",
    fontSize: 27,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 60,
    color: "white",
  },

  input: {
    marginBottom: 16,
  },

  inputHeader: {
    fontSize: 17,
    fontWeight: "500",
    color: "white",
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
    backgroundColor: "#1D1D20",
    color: "white",
    borderColor: "#fff",
  },

  inputText: {
    color: "#fff",
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
    //borderColor: "#14999999",
  },

  continueText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },

  modalContainer: {
    flex: 1,
    marginTop: "130%",
    backgroundColor: "#111111",
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
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 36,
  },
});
export default Retake3;
