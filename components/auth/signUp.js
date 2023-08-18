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

import { supabase } from "./supabase.js";
import { startShakeAnimation } from "./profileUtils.js";

export const SignUp = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const [isError, setIsError] = useState("");
  const shakeAnimationValue = useRef(new Animated.Value(0)).current;

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

    if (form.password === form.confirmPassword) {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) {
        startShakeAnimation(shakeAnimationValue);
        setIsError(error.message);
        setIsSignedUp(false);
      } else {
        setIsSignedUp(true);
      }
    } else {
      startShakeAnimation(shakeAnimationValue);
      setPasswordsMatch(false);
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
        {isSignedUp ? (
          <>
            <View style={styles.container}>
              <View style={styles.verifyHeader}>
                <Image
                  source={{
                    uri: "https://cdn3.iconfinder.com/data/icons/furniture-volume-1-2/48/12-512.png",
                  }}
                  style={styles.headerImage}
                  alt="Logo "
                />
                <Text style={styles.titleText}>Verify your email!</Text>
              </View>
              <Text style={styles.sloganText}>
                Check your email for an account verification email, and then
                sign in!
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
            <View style={styles.header}>
              <Image
                source={{
                  uri: "https://cdn3.iconfinder.com/data/icons/furniture-volume-1-2/48/12-512.png",
                }}
                style={styles.headerImage}
                alt="Logo "
              />
              <Text style={styles.titleText}>Create an Account!</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.input}>
                <Text style={styles.inputHeader}>
                  Enter your College Email Address:
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

              {passwordsMatch == false && (
                <Animated.Text style={[styles.errorText, shakeAnimationStyle]}>
                  Passwords Do Not Match
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
    justifyContent: "left",
    gap: "10%",
    marginBottom: "20%",
    //padding: "0%",
  },

  verifyHeader: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "left",
    gap: "10%",
    marginBottom: "10%",
    //padding: "0%",
  },

  headerImage: {
    width: 40,
    height: 40,
    //alignSelf: "center",
    marginBottom: 0,
  },

  titleText: {
    fontFamily: "Verdana-Bold",
    fontSize: 27,
    fontWeight: "700",
    textAlign: "center",
    //AlignSelf: "center",
    color: "#1e1e1e",
    paddingTop: 5,
  },

  sloganText: {
    //flex: 1,
    fontFamily: "Verdana",
    fontSize: 15,
    fontWeight: "500",
    color: "#929292",
    textAlign: "center",
    marginBottom: "10%",
  },

  input: {
    marginBottom: "10%",
  },

  inputHeader: {
    fontSize: 17,
    fontWeight: "500",
    color: "#222",
    marginBottom: 10,
  },

  inputControl: {
    backgroundColor: "#fff",
    color: "#222",
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
    color: "#222",
    textAlign: "center",
    letterSpacing: 0.15,
  },

  continue: {
    marginTop: 5,
    marginBottom: 20,

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

  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
});

export default SignUp;
