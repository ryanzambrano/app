import "react-native-url-polyfill/auto";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Button,
} from "react-native";
import { supabase } from "./auth/supabase.js";
import SignUp from "./signUp.js";
import Questionaire from "./questionaire1.js";

export const SignIn = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  async function insertUser(email) {
    const { data, error } = await supabase.from("profiles").insert([
      {
        email: email,
      },
    ]);
    if (error) {
      console.error("Error inserting user:", error);
    } else {
      console.log("User inserted successfully:", data);
    }
  }
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  async function checkProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", form.email);
    if (error) {
      console.error("Error fetching users:", error);
    }

    if (data.length === 0) {
      insertUser(form.email);
      navigation.navigate("Questionaire");
    } else if (data) {
      alert(data);
    } else {
    }
  }

  async function validateUserSession() {
    const {
      data: { user, error },
    } = await supabase.auth.getUser();
    if (error) {
      console.error(error.message);
    } else if (user == null) {
      console.error("invalid authentication");
    }
  }

  async function signInUser(email, password) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("no works");
      setLoading(false);
    } else {
      validateUserSession();
    }
  }

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function getsesh() {
    const { data, error } = await supabase.auth.getSession();
    //alert(user);
    if (data) {
      // User is authenticated
      //alert();
    } else {
      // User is not authenticated
      alert("User is not authenticated");
    }
    if (error) {
      alert(error.message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eBecf4" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{
              uri: "https://cdn3.iconfinder.com/data/icons/furniture-volume-1-2/48/12-512.png",
            }}
            style={styles.headerImage}
            alt="Logo "
          />
          <Text style={styles.titleText}>Sign into Casa</Text>
          <Text style={styles.sloganText}>
            Find and meet new roomates, for any situation!
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={styles.inputHeader}>Email Address:</Text>
            <TextInput
              style={styles.inputControl}
              hi
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="deeznuts@bruh.com"
              placeholderTextColor="#6b7280"
              value={form.email}
              onChangeText={(email) => setForm({ ...form, email })}
            />
          </View>

          <View style={styles.input}>
            <Text style={styles.inputHeader}>Password:</Text>
            <TextInput
              style={styles.inputControl}
              styles={styles.inputControl}
              autoCorrect={false}
              placeholder="*********"
              placeholderTextColor="#6b7280"
              value={form.password}
              onChangeText={(password) => setForm({ ...form, password })}
              secureTextEntry={true}
            />
          </View>

          <View style={styles.formAction}>
            <TouchableOpacity
              onPress={() => {
                // handle onPress

                signInUser(form.email, form.password);
              }}
            >
              <View style={styles.continue}>
                <Text style={styles.continueText}>Sign in</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              // handle link
              navigation.navigate("SignUp");
            }}
            style={{ marginTop: "auto" }}
          >
            <Text style={styles.formFooter}>
              Don't have an account?{" "}
              <Text style={{ textDecorationLine: "underline" }}>Sign up</Text>
            </Text>
          </TouchableOpacity>
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
    marginVertical: 24,
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

  none: {},
});

export default SignIn;
