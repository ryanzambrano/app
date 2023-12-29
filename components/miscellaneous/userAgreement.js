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

const UserAgreement = ({ navigation, route }) => {
  //const { session } = route.params;

  useEffect(() => {}, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.left}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#159e9e" />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.centerHeaderText}>User Agreement</Text>
        </View>
        <View style={styles.right}></View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.textContainer}
      >
        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By accessing and using the Cabana app, you agree to be bound by the
          terms and conditions contained in this User Agreement, including our
          Privacy Policy and Content Policy.
        </Text>

        <Text style={styles.heading}>2. Modification of Terms</Text>
        <Text style={styles.text}>
          Cabana reserves the right to change, modify, or update these terms at
          any time without prior notice. It's your responsibility to review this
          User Agreement periodically.
        </Text>
        {/* ... Previous sections ... */}

        <Text style={styles.heading}>3. Account Registration and Use</Text>
        <Text style={styles.text}>
          Eligibility: You must be at least 18 years old to create an account
          and use Cabana.
        </Text>
        <Text style={styles.text}>
          Account Security: You are responsible for maintaining the
          confidentiality of your account credentials.
        </Text>
        <Text style={styles.text}>
          Account Use: You agree to use your account for personal,
          non-commercial use only.
        </Text>

        <Text style={styles.heading}>4. Content and Conduct</Text>
        <Text style={styles.text}>
          User Content: You are solely responsible for the content you upload,
          post, or share on Cabana.
        </Text>
        <Text style={styles.text}>
          Prohibited Conduct: Engaging in harassing, threatening, or
          discriminatory behavior is strictly prohibited.
        </Text>

        <Text style={styles.heading}>5. Intellectual Property Rights</Text>
        <Text style={styles.text}>
          All content on Cabana, including text, graphics, logos, and software,
          is the property of Cabana or its licensors and protected by
          international copyright laws.
        </Text>

        <Text style={styles.heading}>6. Dispute Resolution</Text>
        <Text style={styles.text}>
          Any disputes arising out of or related to this User Agreement or your
          use of Cabana will be governed by the laws of [Jurisdiction].
        </Text>

        <Text style={styles.heading}>
          7. Limitation of Liability and Disclaimer of Warranties
        </Text>
        <Text style={styles.text}>
          Cabana is provided "as is" and without warranties of any kind. We do
          not guarantee that Cabana will be available at all times or that it
          will meet your needs.
        </Text>

        <Text style={styles.heading}>8. Indemnification</Text>
        <Text style={styles.text}>
          You agree to indemnify and hold harmless Cabana, its affiliates,
          officers, and employees from any claims arising out of your use of
          Cabana.
        </Text>

        <Text style={styles.heading}>9. Termination</Text>
        <Text style={styles.text}>
          Cabana reserves the right to suspend or terminate your account at any
          time for any reason.
        </Text>

        <Text style={styles.heading}>10. Contact Information</Text>
        <Text style={styles.text}>
          If you have any questions or concerns regarding this User Agreement,
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
    color: "lightgrey",
    lineHeight: 28,
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

export default UserAgreement;
