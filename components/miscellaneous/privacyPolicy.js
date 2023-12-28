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

const PrivacyPolicy = ({ navigation, route }) => {
  // const { session } = route.params;

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
          <Text style={styles.centerHeaderText}>Privacy Policy</Text>
        </View>
        <View></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.textContainer}>
        <Text style={styles.heading}>1. Introduction </Text>
        <Text style={styles.text}>
          {"\t"}Welcome to Cabana, a dedicated platform designed to connect college
          students with potential roommates. Your privacy is of utmost
          importance to us. This Privacy Policy document outlines the types of
          information collected by Cabana, and how we use, maintain, protect,
          and disclose that information.
        </Text>
        <Text style={styles.heading}>2. Consent</Text>
        <Text style={styles.text}>
        {"\t"}By using our app, you hereby consent to our Privacy Policy and agree
          to its terms.
        </Text>
        <Text style={styles.heading}>3. Information We Collect</Text>
        <Text style={styles.text}>
        {"\t"}Personal Identification Information: We may collect personal
          identification information including, but not limited to, your name,
          email address, phone number, college/university details, and profile
          picture.
        </Text>
        <Text style={styles.text}>
        {"\n\t"}Roommate Preferences: Information regarding your roommate preferences,
          living habits, interests, and hobbies to facilitate a compatible
          roommate match.
        </Text>
        <Text style={styles.text}>
        {"\n\t"}Location Information: We may collect and process information about
          your geographical location to provide localized services.
        </Text>
        <Text style={styles.text}>
        {"\n\t"}Usage Data: Information about how the user accesses and uses the app,
          which may include your IP address, browser type, and version, the
          pages of our app that you visit, the time and date of your visit, the
          time spent on those pages, and other diagnostic data.
        </Text>
        <Text style={styles.heading}>4. Cookies and Tracking Technologies</Text>
        <Text style={styles.text}>
        {"\t"}We use cookies, beacons, tags, and other tracking technologies to
          collect and store information about your preferences and navigation
          to, from, and on our app.
        </Text>
        <Text style={styles.heading}>5. Use of Your Information</Text>
        <Text style={styles.text}>
        {"\t"}We may use the collected data for various purposes including: - To
          provide and maintain our services. - To notify you about changes to
          our services. - To allow you to participate in interactive features of
          our service when you choose to do so. - To provide customer support. -
          To gather analysis or valuable information so that we can improve our
          service. - To monitor the usage of our service. - To detect, prevent,
          and address technical issues.
        </Text>
        <Text style={styles.heading}>
          6. Sharing and Disclosure of Information
        </Text>
        <Text style={styles.text}>
          {"\t"}Third-Party Service Providers: We may share your information with
          third-party service providers to provide necessary services on our
          behalf, perform service-related services, or assist us in analyzing
          how our service is used.
        </Text>
        <Text style={styles.text}>
          Business Transactions: If Cabana is involved in a merger, acquisition,
          or asset sale, your personal data may be transferred.
        </Text>
        <Text style={styles.heading}>7. Security of Data We employ</Text>
        <Text style={styles.text}>
          {"\t"}Commercially acceptable means of protecting your data but remember
          that no method of transmission over the internet or method of
          electronic storage is 100% secure.
        </Text>
        <Text style={styles.heading}>8. Changes to This Privacy Policy</Text>
        <Text style={styles.text}>
          {"\t"}We may update our Privacy Policy from time to time and will notify you
          of any changes by posting the new Privacy Policy on this page.
        </Text>
        <Text style={styles.heading}>9. Your Acceptance of These Terms</Text>
        <Text style={styles.text}>
        {"\t"}By using Cabana, you signify your acceptance of this policy and terms
          of service. If you do not agree to this policy, please do not use our
          app.
        </Text>
        <Text style={styles.heading}>10. Contact Us</Text>
        <Text style={styles.text}>
        {"\t"}If you have any questions or suggestions about our Privacy Policy, do
          not hesitate to contact us at: {"\n\n"}team@thecabanaapp.com
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

  sectionTitle: {
    color: "grey",
    fontSize: 15,
    marginLeft: 15,
    paddingVertical: 10,
    fontWeight: "bold",
    //borderBottomWidth: 1,
    borderBottomColor: "grey",
  },

  centerHeaderText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },

  text: {
    fontSize: 18,
    lineHeight: 28,
    color: "lightgrey",
    marginVertical: 2,
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

export default PrivacyPolicy;
