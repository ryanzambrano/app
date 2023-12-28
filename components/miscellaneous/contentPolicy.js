import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Switch,
  SafeAreaView,
  Button,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { supabase } from "../auth/supabase";
import { AntDesign } from "@expo/vector-icons";
import { picURL } from "../auth/supabase.js";

const ContentPolicy = ({ navigation, route }) => {
  //const { session } = route.params;

  useEffect(() => {}, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#159e9e" />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.centerHeaderText}>Content Policy</Text>
        </View>
        <View></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.textContainer}>
        <Text style={styles.heading}>1. Introduction </Text>
        <Text style={styles.text}>
        {"\t"}Cabana is a platform aimed at connecting college students with
          potential roommates. We strive to maintain a respectful, safe, and
          inclusive environment for all users. This Content Policy outlines the
          guidelines and standards for content shared within the Cabana app.
        </Text>

        <Text style={styles.heading}>2. User Responsibilities</Text>
        <Text style={styles.text}>
        {"\t"}Accuracy: Users are responsible for providing accurate information
          regarding their identity, college/university affiliation, and roommate
          preferences.
        </Text>
        <Text style={styles.text}>
        {"\n\t"}Respect: Users should respect the opinions and preferences of other
          users, and refrain from engaging in hateful, discriminatory, or
          harassing behavior.
        </Text>
        <Text style={styles.text}>
        {"\n\t"}Age Requirement: Users must be at least 18 years old to use Cabana.
        </Text>

        {/* ... Previous sections ... */}

        <Text style={styles.heading}>3. Prohibited Content</Text>
        <Text style={styles.text}>
        {"\t"}False Information: Sharing false or misleading information is strictly
          prohibited.
        </Text>
        <Text style={styles.text}>
        {"\n\t"}Hateful Content: Any form of discrimination or hate towards
          individuals or groups based on attributes such as race, ethnicity,
          religion, gender, or sexual orientation is not allowed.
        </Text>
        <Text style={styles.text}>
        {"\n\t"}Harassment: Engaging in harassment, threats, or bullying towards other
          users is strictly prohibited.
        </Text>
        <Text style={styles.text}>
        {"\n\t"}Illegal Content: Sharing or promoting illegal content, including drugs
          or violence, is not allowed.
        </Text>

        <Text style={styles.heading}>4. Reporting Violations</Text>
        <Text style={styles.text}>
        {"\t"}Users are encouraged to report any violations of this Content Policy
          through the reporting features provided within the app, or by
          contacting us directly at [Email].
        </Text>

        <Text style={styles.heading}>5. Enforcement</Text>
        <Text style={styles.text}>
        {"\t"}Review: We reserve the right to review any reported content for
          violations of this Content Policy.
        </Text>
        <Text style={styles.text}>
        {"\n\t"}Actions: We may take various actions against violations, including
          warning the offending user, removing the content, suspending the user
          account, or reporting to law enforcement as necessary.
        </Text>

        <Text style={styles.heading}>
          6. Modifications to This Content Policy
        </Text>
        <Text style={styles.text}>
        {"\t"}Cabana reserves the right to modify this Content Policy at any time.
          Any changes will be posted on this page and, where appropriate,
          notified to you by email or through the app.
        </Text>

        <Text style={styles.heading}>7. Contact Us</Text>
        <Text style={styles.text}>
        {"\t"}If you have any questions or concerns regarding this Content Policy,
          please contact us at:
          {"\n\n"}team@thecabanaapp.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1D20", //#1D1D20
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginLeft: 15,
    marginRight: 39,
  },

  center: {
    alignContent: "center",
    textAlign: "center",
    alignItems: "center",
  },

  left: {
    alignContent: "left",
    textAlign: "left",
    alignItems: "left",
  },

  right: {
    alignContent: "right",
    textAlign: "right",
    alignItems: "right",
  },
  centerHeaderText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },

  text: {
    fontSize: 18,
    color: "lightgrey",
    marginVertical: 2,
    lineHeight: 28,
  },
  textContainer: {
    margin: 15,
    //alignItems: "center",
  },
  heading: {
    fontWeight: "bold",
    color: "lightgrey",
    fontSize: 20,
    marginTop: 5,
    marginBottom: 2,
  },
});

export default ContentPolicy;
