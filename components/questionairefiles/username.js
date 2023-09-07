import "react-native-url-polyfill/auto";
import React, { useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
} from "react-native";
import { supabase } from "../auth/supabase.js";

export const Username = ({ navigation, route }) => {
  const { session } = route.params;
  const [selectedUsername, setSelectedUsername] = useState("");
  const [isError, setIsError] = useState("");

  const shakeAnimationValue = useRef(new Animated.Value(0)).current;

  const userData = {
    username: selectedUsername,
  };

  const handleUpdate = async (userData, session) => {
    setIsError(null);

    if (session?.user) {
      if (!!userData.username) {
        // Check if the name is longer than 30 characters
        if (userData.username.length > 20) {
          setIsError("Too many characters");
          return; // Stop the function execution
        }

        // Check if the name contains non-alphabetic characters
        if (!/^[a-z0-9_]+$/i.test(userData.username)) {
          setIsError("Invalid characters");
          return; // Stop the function execution
        }

        const { data, error } = await supabase
          .from("profile")
          .update({
            username: selectedUsername,
          })
          .eq("user_id", session.user.id);

        if (error) {
          startShakeAnimation();
          setIsError(error.message);
        } else {
          navigation.navigate("Colleges");
        }
      } else setIsError("Enter a Username");
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const startShakeAnimation = () => {
    shakeAnimationValue.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnimationValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimationValue, {
        toValue: -1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimationValue, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
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
            <Text style={styles.titleText}>Create a Username!</Text>
          </View>
          <View style={styles.input}>
            <Text style={styles.inputHeader}>Username</Text>

            <TextInput
              style={styles.inputControl}
              placeholder="Enter a username..."
              placeholderTextColor="grey"
              value={selectedUsername}
              onChangeText={(selectedUsername) =>
                setSelectedUsername(selectedUsername)
              }
              keyboardAppearance="dark"
            ></TextInput>
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
                  //navigation.navigate("Questionaire1");
                }
              }}
            >
              <View style={styles.continue}>
                <Text style={styles.continueText}>Next</Text>
              </View>
            </TouchableOpacity>
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
    marginVertical: 36,
  },

  titleText: {
    fontFamily: "Verdana-Bold",
    fontSize: 27,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
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
    color: "white",
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

export default Username;
