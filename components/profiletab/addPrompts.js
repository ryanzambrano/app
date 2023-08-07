import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import { supabase } from "../auth/supabase";

export const AddPrompts = ({ navigation, route }) => {
  const { session } = route.params;
  const presetQuestions = [
    "Are you participating in Greek Life?",
    "Describe a good night out",
    "What are some of your pet peeves?",
    "What are your favorite movies?",
  ]; // Replace with your questions

  const questionColumnMapping = {
    "Are you participating in Greek Life?": "greek_life",
    "Describe a good night out": "night_out",
    "What are some of your pet peeves?": "pet_peeves",
    "What are your favorite movies?": "favorite_movies",
  }; // Map your questions to the column names

  const [answers, setAnswers] = useState(
    Array(presetQuestions.length).fill("")
  );

  const handleAnswerChange = (text, index) => {
    const newAnswers = [...answers];
    newAnswers[index] = text;
    setAnswers(newAnswers);
  };

  useEffect(() => {
    fetchExistingAnswers();
  }, [session]);
  const fetchExistingAnswers = async () => {
    if (session?.user) {
      const { data: existingAnswers, error } = await supabase
        .from("prompts") // Replace "prompts" with your actual table name.
        .select("*")
        .eq("user_id", session.user.id)
        .single(); // Use this if there's only one row of data for each user.

      if (error) {
        console.error("Error fetching existing answers:", error);
      } else if (existingAnswers) {
        // Map existing answers to your questions.
        const mappedAnswers = presetQuestions.map((question) => {
          const columnName = questionColumnMapping[question];
          return existingAnswers[columnName] || "";
        });

        setAnswers(mappedAnswers);
      }
    }
  };

  const handleSave = async () => {
    const answersObj = presetQuestions.reduce((obj, question, index) => {
      const columnName = questionColumnMapping[question];
      obj[columnName] = answers[index];

      return obj;
    }, {});

    console.log(answersObj);

    // Uncomment when ready to send data to your database

    if (session?.user) {
      const { data, error } = await supabase
        .from("prompts")
        .upsert([{ ...answersObj, user_id: session.user.id }]);

      if (error) {
        if (error.message.includes("prompts_user_id_key")) {
          const { data, error: updateError } = await supabase
            .from("prompts")
            .update([answersObj])
            .eq("user_id", session.user.id);

          if (updateError) {
            alert(updateError.message);
          } else {
            navigation.navigate("EditProfileScreen", { updated: true });
          }
        } else {
          alert(error.message);
        }
      } else {
        navigation.navigate("EditProfileScreen", { updated: true });
      }
    }
  };

  const renderItems = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.question}>{item}</Text>
      <TextInput
        style={styles.input}
        value={answers[index]}
        onChangeText={(text) => handleAnswerChange(text, index)}
        placeholder="Answer here..."
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={presetQuestions}
        renderItem={renderItems}
        keyExtractor={(item, index) => index.toString()}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  card: {
    backgroundColor: "#ffffff",
    gap: 40,
    paddingTop: 50,
    paddingBottom: 40,
    padding: 40,
    borderRadius: 50,
    margin: 15,
    //shadowing
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  question: {
    fontSize: 20,
    fontWeight: 300,
    marginBottom: 10,
    fontFamily: "Helvetica",
  },
  input: {
    //color: "gray",
    borderBottomWidth: 1,
    borderRadius: 5,
    padding: 10,
    height: 40,
    fontSize: 26,
    fontFamily: "Helvetica",
  },
  saveButton: {
    backgroundColor: "#14999999",
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 15,
  },
});

export default AddPrompts;
