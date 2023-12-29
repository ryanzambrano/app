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
  TextInput,
} from "react-native";
import { supabase } from "../auth/supabase";
import { AntDesign } from "@expo/vector-icons";
import { picURL } from "../auth/supabase.js";

const FAQ = ({ navigation, route }) => {
  const { session } = route.params;

  const [improvements, setImprovements] = useState(["", "", ""]);
  const [likes, setLikes] = useState(["", ""]);

  const handleInputChange = (text, index, type) => {
    if (type === "improvements") {
      const newImprovements = [...improvements];
      newImprovements[index] = text;
      setImprovements(newImprovements);
    } else if (type === "likes") {
      const newLikes = [...likes];
      newLikes[index] = text;
      setLikes(newLikes);
    }
  };

  const handleSubmit = async () => {
    const { data, error } = await supabase.from("beta").insert({
      imp1: improvements[0],
      imp2: improvements[1],
      imp3: improvements[2],
      like1: likes[0],
      like2: likes[1],
    });
    //.eq("user_id", session.user.id);
    //if (data) {
    setImprovements(["", "", ""]); // Reset to an array of empty strings
    setLikes(["", ""]); // Reset to an array of empty strings
    // }

    if (error) {
      setImprovements(["", "", ""]); // Reset to an array of empty strings
      setLikes(["", ""]);
    }

    alert("Thank you for your feedback!");

    console.log("Improvements:", improvements);
    console.log("Likes:", likes);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.vContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#159e9e" />
          </TouchableOpacity>
          <Text style={styles.centerHeaderText}>Anonymous Survey</Text>
        </View>
        <ScrollView>
          <Text style={styles.question}>Three things you would improve:</Text>
          {improvements.map((item, index) => (
            <TextInput
              key={index}
              style={styles.input}
              onChangeText={(text) =>
                handleInputChange(text, index, "improvements")
              }
              value={item}
              placeholder={`Improvement ${index + 1}`}
            />
          ))}
          <Text style={styles.question}>Two things you liked:</Text>
          {likes.map((item, index) => (
            <TextInput
              key={index}
              style={styles.input}
              onChangeText={(text) => {
                handleInputChange(text, index, "likes");
              }}
              value={item}
              placeholder={`Like ${index + 1}`}
            />
          ))}
          <Button title="Submit" onPress={handleSubmit} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1D20", //#1D1D20
  },
  vContainer: {
    flex: 1,
    backgroundColor: "#1D1D20", //#1D
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
    alignSelf: "center",
  },
  text: {
    fontSize: 18,
    color: "#fff",
  },
  textContainer: {
    margin: 15,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  question: {
    fontSize: 18,
    marginTop: 20,
    color: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    color: "white",
  },
  button: {},
});

export default FAQ;
