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

const FAQ = ({ navigation, route }) => {
  const { session } = route.params;

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
          <Text style={styles.centerHeaderText}>FAQ</Text>
        </View>
        <View style={styles.right}></View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text}>faq list</Text>
      </View>
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
    color: "#fff",
  },
  textContainer: {
    margin: 15,
    alignItems: "center",
  },
});

export default FAQ;
