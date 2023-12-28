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

const AboutUs = ({ navigation, route }) => {
  const { session } = route.params;

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
          <Text style={styles.centerHeaderText}>About Us</Text>
        </View>
        <View></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.textContainer}>
        <Text style={styles.text}>
          {"    "}
          Cabana, established by a team of dedicated college students, emerged
          as a strategic solution to a prevalent challenge faced within the
          academic community - the pursuit of an ideal roommate. Our inception
          is deeply rooted in the collective experiences and insights gained
          from navigating the intricacies of campus life, particularly in the
          realm of shared living arrangements. 
          
          {"\n\n     "}Our platform is meticulously
          designed to streamline the roommate selection process, employing a
          data-driven approach to ensure optimal compatibility among users. At
          Cabana, we emphasize the criticality of aligning key lifestyle
          attributes such as study preferences, sleeping patterns, and
          recreational interests, amongst others. Leveraging advanced algorithms
          and a comprehensive user interface, Cabana offers an efficient,
          user-friendly experience that simplifies the roommate search. We are
          committed to continuously evolving our services, incorporating
          cutting-edge technologies and user feedback to enhance our offerings.
          
          {"\n\n     "}Cabana's corporate philosophy is centered around fostering a
          supportive and cohesive community among college students. We aim to
          provide a reliable, secure, and intuitive platform that not only
          connects individuals based on compatibility but also contributes to
          their overall collegiate experience. Our dedication to excellence and
          innovation in the realm of shared living solutions positions us at the
          forefront of this sector. We remain steadfast in our commitment to
          facilitating harmonious living arrangements that resonate with the
          dynamic needs of today's college students.
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
    paddingBottom: 10,
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
    lineHeight: 28,
  },
  textContainer: {
    marginHorizontal: 15,
    marginBottom: -10,
    //alignItems: "center",
  },
});

export default AboutUs;
