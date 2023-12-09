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
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";

import { supabase } from "./supabase.js";
import { startShakeAnimation } from "./profileUtils.js";

const logo = require("../../assets/logo4.png");

export const ForgotPassword = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const shakeAnimationValue = useRef(new Animated.Value(0)).current;
  const [emailSent, setEmailSent] = useState(false);
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  /*const showSuccess = () => {
    Alert.alert(
      "Email sent",
      "Choose a sorting method:",
      [
        {
          text: "Alphabetical Order",
        },
        {
          text: "Shared Interests",
        },
        {
          text: "Recommended",
        },
      ],
      { cancelable: true }
    );
  };*/

  async function forgotPassword(email) {
    setLoading(true);
    setError(null);

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://thecabanaapp.com/forgot-password",
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setError("There was a problem sending the password reset email.");
    } finally {
      setEmailSent(true);
      setLoading(false);
    }
  }

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

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
          <TouchableOpacity
            onPress={() => {
              // handle onPress
              navigation.goBack();
            }}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.header}>
            <Image source={logo} style={styles.headerImage} alt="Logo " />
            <Text style={styles.titleText}>Forgot Password?</Text>
            <Text style={styles.sloganText}>
              Enter the email address that you used to sign up and we'll send
              you an email
            </Text>
          </View>
          {emailSent && (
            <Animated.Text style={[styles.formFooter, shakeAnimationStyle]}>
              Email successfully sent (0-5 minute wait time)
            </Animated.Text>
          )}
          {error && (
            <Animated.Text style={[styles.errorText, shakeAnimationStyle]}>
              {error}
            </Animated.Text>
          )}

          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={styles.inputHeader}>Email Address:</Text>
              <TextInput
                style={styles.inputControl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                //placeholder="deeznuts@bruh.com"
                placeholderTextColor="#6b7280"
                value={form.email}
                onChangeText={(email) => setForm({ ...form, email })}
              />
            </View>

            <View style={styles.formAction}>
              <TouchableOpacity
                onPress={async () => {
                  // handle onPress
                  await forgotPassword(form.email);
                  setForm({ ...form, email: "" });
                }}
              >
                <View style={styles.continue}>
                  <Text style={styles.continueText}>Send Email</Text>
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
    marginTop: 24,
    marginBottom: 36,
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
    color: "#fff",
  },

  sloganText: {
    //fontFamily: "Verdana",
    marginTop: 10,
    fontSize: 18,
    fontWeight: "500",
    color: "lightgrey",
    textAlign: "center",
  },

  input: {
    marginBottom: 16,
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
    marginVertical: 24,
  },

  formFooter: {
    fontSize: 17,
    fontWeight: "600",
    color: "lightgreen",
    textAlign: "center",
    letterSpacing: 0.15,
    marginBottom: 20,
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
    //borderColor: "#14999999",
  },

  continueText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },

  backButtonText: {
    fontSize: 30,
    color: "#149999",
    zIndex: 1,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
});

export default ForgotPassword;
