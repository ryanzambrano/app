import "react-native-url-polyfill/auto";
import React, { useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";

import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

import { supabase } from "./supabase.js";
import { startShakeAnimation } from "./profileUtils.js";

const logo = require("../../assets/logo4.png");

export const SignUp = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const [isError, setIsError] = useState("");
  const shakeAnimationValue = useRef(new Animated.Value(0)).current;
  const [isChecked, setIsChecked] = useState(null);

  const toggleCheck = () => {
    setIsChecked(!isChecked);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignUp = async () => {
    setPasswordsMatch(true);
    setIsError(null);

    // Check if the last 4 characters of email are ".edu"
    /*if (form.email.slice(-4) !== ".edu") {
      startShakeAnimation(shakeAnimationValue);
      return;
    }*/

    if (form.password !== form.confirmPassword) {
      startShakeAnimation(shakeAnimationValue);
      setPasswordsMatch(false);
      return;
    }

    if (!isChecked) {
      startShakeAnimation(shakeAnimationValue);
      setIsChecked(false);
      return;
    }

    try {
      // If all checks pass, proceed with sign-up
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: "https://thecabanaapp.com/congratulations",
        },
      });

      if (error) {
        startShakeAnimation(shakeAnimationValue);
        setIsError(error.message);
        setIsSignedUp(false);
      } else {
        setIsSignedUp(true);
      }
    } catch (error) {
      // Handle any unexpected errors during sign-up
      //console.error("Error during sign-up:", error);
      // You can set an appropriate error message here if needed
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111111" }}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        {isSignedUp ? (
          <>
            <View style={styles.container}>
              <View style={styles.verifyHeader}>
                <Image source={logo} style={styles.headerImage} alt="Logo " />
                <Text style={styles.titleText}>Verify your email!</Text>
              </View>
              <Text style={styles.successText}>
                Check your email for an account verification email, and then
                sign in!
              </Text>
              <Text style={styles.successText}>
                (0-5 minute wait time.){"\n"}Make sure to check your spam.
              </Text>
              <View style={styles.verifyFormAction}>
                <TouchableOpacity
                  onPress={() => {
                    // handle onPress
                    navigation.navigate("SignIn");
                  }}
                >
                  <View style={styles.continue}>
                    <Text style={styles.continueText}>Sign in</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.container}>
            <TouchableOpacity
              onPress={() => {
                // handle onPress
                navigation.goBack();
              }}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.header}>
              {/*<Image source={logo} style={styles.headerImage} alt="Logo " />*/}
              <Text style={styles.titleText}>Create an Account!</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.input}>
                <Text style={styles.inputHeader}>
                  Enter your Email Address:
                </Text>
                <TextInput
                  style={styles.inputControl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholderTextColor="#6b7280"
                  value={form.email}
                  onChangeText={(email) => setForm({ ...form, email })}
                />
              </View>

              <View style={styles.input}>
                <Text style={styles.inputHeader}>Create a password:</Text>
                <TextInput
                  style={styles.inputControl}
                  styles={styles.inputControl}
                  autoCorrect={false}
                  placeholderTextColor="#6b7280"
                  value={form.password}
                  onChangeText={(password) => setForm({ ...form, password })}
                  secureTextEntry={true}
                />
              </View>

              <View style={styles.input}>
                <Text style={styles.inputHeader}>Confirm your password:</Text>
                <TextInput
                  style={styles.inputControl}
                  styles={styles.inputControl}
                  autoCorrect={false}
                  placeholderTextColor="#6b7280"
                  value={form.confirmPassword}
                  onChangeText={(confirmPassword) =>
                    setForm({ ...form, confirmPassword })
                  }
                  secureTextEntry={true}
                />
              </View>

              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={[
                    styles.termsBox,
                    { backgroundColor: isChecked ? "#14999999" : "grey" },
                  ]}
                  onPress={toggleCheck}
                ></TouchableOpacity>
                <Text style={styles.formFooter}>I Agree to </Text>
                <TouchableOpacity
                  style={styles.termsContainer}
                  onPress={() => {
                    // handle link
                    navigation.navigate("PrivacyPolicy");
                  }}
                >
                  <Text
                    style={[
                      styles.formFooter,
                      { textDecorationLine: "underline" },
                    ]}
                  >
                    Privacy
                  </Text>
                </TouchableOpacity>
                <Text style={styles.formFooter}>and{"  "}</Text>
                <TouchableOpacity
                  style={styles.termsContainer}
                  onPress={() => {
                    // handle link
                    navigation.navigate("UserAgreement");
                  }}
                >
                  <Text
                    style={[
                      styles.formFooter,
                      { textDecorationLine: "underline" },
                    ]}
                  >
                    User Agreement
                  </Text>
                </TouchableOpacity>
              </View>

              {passwordsMatch == false && (
                <Animated.Text style={[styles.errorText, shakeAnimationStyle]}>
                  Passwords Do Not Match
                </Animated.Text>
              )}

              {isChecked == false && (
                <Animated.Text style={[styles.errorText, shakeAnimationStyle]}>
                  You Must Agree to the Privacy Policy and User Agreement to
                  Register
                </Animated.Text>
              )}

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
                    handleSignUp();
                    //signUpUser(form.email, form.password);
                  }}
                >
                  <View style={styles.continue}>
                    <Text style={styles.continueText}>Sign up</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  // handle link
                  navigation.navigate("SignIn");
                }}
                style={{ marginTop: "auto" }}
              >
                <Text style={styles.formFooter}>
                  Have an account already?{" "}
                  <Text style={{ textDecorationLine: "underline" }}>
                    Sign in
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    flex: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "5%",
    marginBottom: "10%",
    //padding: "0%",
  },

  verifyHeader: {
    flex: 0,
    flexDirection: "row",
    alignItems: "center",
    //alignSelf: "center",
    marginBottom: "10%",
    //padding: "0%",
  },

  headerImage: {
    width: 40,
    height: 40,
    marginBottom: 0,
  },

  titleText: {
    fontSize: 27,
    fontWeight: "700",
    paddingLeft: 10,
    //textAlign: "center",
    //AlignSelf: "center",
    color: "#fff",
  },

  sloganText: {
    //flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#929292",
    textAlign: "center",
    marginBottom: "10%",
  },

  successText: {
    fontSize: 16,
    fontWeight: "500",
    color: "lightgreen",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    marginBottom: "10%",
  },

  inputHeader: {
    fontSize: 17,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 10,
  },

  inputControl: {
    backgroundColor: "#1D1D20",
    color: "#fff",
    fontWeight: "500",
    height: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
  },

  form: {
    marginBottom: 24,
    flex: 1,
  },

  formAction: {
    flex: 1,
  },

  verifyFormAction: {
    marginTop: 20,
  },

  formFooter: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.15,
  },

  continue: {
    //marginTop: 5,
    marginBottom: 20,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    //borderWidth: 1,
    backgroundColor: "#14999999",
    borderColor: "#14999999",
  },

  continueText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },

  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  backButtonText: {
    fontSize: 30,
    color: "#149999",
    zIndex: 1,
  },

  termsContainer: {
    flexDirection: "row",
    marginBottom: 10,
    //gap: 5,
  },

  termsBox: {
    backgroundColor: "white",
    padding: 10,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 5,
    flex: 0,
    flexDirection: "row",
    height: "1%",
    marginRight: 5,
  },
});

export default SignUp;
