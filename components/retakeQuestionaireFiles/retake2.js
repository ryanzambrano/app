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

export const Retake2 = ({ navigation, route }) => {
  const { session } = route.params;
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  const shakeAnimationValue = useRef(new Animated.Value(0)).current;
  const [isError, setIsError] = useState("");
  const [fetched, setFetched] = useState(false);

  const [isStudiesModalVisible, setIsStudiesModalVisible] = useState(false);
  const [isForFunModalVisible, setIsForFunModalVisible] = useState(false);
  const [isLivingPreferencesModalVisible, setIsLivingPreferencesModalVisible] =
    useState(false);

  const [selectedStudies, setSelectedStudies] = useState("");
  const [selectedForFun, setSelectedForFun] = useState("");
  const [selectedLivingPreferences, setSelectedLivingPreferences] =
    useState("");

  const livingPreferences = ["Apartment", "Dorm", "House", "No Preferences"];
  const forFun = ["Going Clubbing", "Movie night in", "Inner circle hang"];
  const studies = [
    "Business",
    "Natural Science",
    "Social Science",
    "Medical",
    "Mathematics",
    "Engineering",
    "Art",
    "Exploratory",
    "Other",
  ];

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

  useEffect(() => {
    if (!fetched) {
      fetchData();
    }
  }, [fetched]);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("profile")
      .select("living_preferences, for_fun, studies")
      .eq("user_id", session.user.id)
      .single();

    if (error) {
    }
    if (data) {
      setSelectedLivingPreferences(data.living_preferences);
      setSelectedForFun(data.for_fun);
      setSelectedStudies(data.studies);
      setFetched(true);
    }
  };

  const userData = {
    livingPreferences: selectedLivingPreferences,
    forFun: selectedForFun,
    studies: selectedStudies,
  };

  const handleUpdate = async (userData, session) => {
    setIsError(null);

    if (session?.user) {
      if (
        !!userData.livingPreferences &&
        !!userData.forFun &&
        !!userData.studies
      ) {
        const { data, error } = await supabase
          .from("profile")
          .update({
            living_preferences: userData.livingPreferences,
            for_fun: userData.forFun,
            studies: userData.studies,
          })
          .eq("user_id", session.user.id);

        if (error) {
          startShakeAnimation(shakeAnimationValue);
          setIsError(error.message);
        } else {
          navigation.navigate("Retake3");
        }
      } else {
        startShakeAnimation(shakeAnimationValue);
        setIsError("All fields are required");
      }
    }
  };

  handleLivingPreferences = () => {
    if (!selectedLivingPreferences) {
      setSelectedLivingPreferences("Apartment");
    }
    closeLivingPreferencesModal();
  };
  handleForFun = () => {
    if (!selectedForFun) {
      setSelectedForFun("Stay in");
    }
    closeForFunModal();
  };
  handleStudies = () => {
    if (!selectedStudies) {
      setSelectedStudies("Science");
    }
    closeStudiesModal();
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
            <Text style={styles.titleText}>
              Answer some lifestyle questions!
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={styles.inputHeader}>
                What is your preferred housing situation?
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
                    <Button title="Save" onPress={handleLivingPreferences} />

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
                A typical weekend looks like?
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
                      onValueChange={(itemValue) =>
                        setSelectedForFun(itemValue)
                      }
                    >
                      {forFun.map((Gender) => (
                        <Picker.Item
                          key={Gender}
                          label={Gender}
                          value={Gender}
                        />
                      ))}
                    </Picker>
                  </View>
                  <View style={styles.bbuttons}>
                    <Button title="Save" onPress={handleForFun} />
                    <Button title="Cancel" onPress={closeForFunModal} />
                  </View>
                </View>
              </Modal>
            </View>

            <View style={styles.input}>
              <Text style={styles.inputHeader}>
                What is your general area of study?
              </Text>

              <TouchableOpacity
                onPress={() => {
                  openStudiesModal();
                }}
              >
                <View style={styles.inputControl}>
                  <Text style={styles.inputText}>{selectedStudies}</Text>
                </View>
              </TouchableOpacity>

              <Modal
                visible={isStudiesModalVisible}
                animationType="slide"
                transparent
              >
                <View style={styles.modalContainer}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      style={styles.picker}
                      selectedValue={selectedStudies}
                      onValueChange={(itemValue) =>
                        setSelectedStudies(itemValue)
                      }
                    >
                      {studies.map((studies) => (
                        <Picker.Item
                          key={studies}
                          label={studies}
                          value={studies}
                        />
                      ))}
                    </Picker>
                  </View>

                  <View style={styles.bbuttons}>
                    <Button title="Save" onPress={handleStudies} />
                    <Button title="Cancel" onPress={closeStudiesModal} />
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
    marginBottom: 40,
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
    backgroundColor: "lightgrey",
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

export default Retake2;
