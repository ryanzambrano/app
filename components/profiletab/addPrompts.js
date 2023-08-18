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
            navigation.goBack();
          }
        } else {
          alert(error.message);
        }
      } else {
        navigation.goBack();
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
        placeholderTextColor="grey"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Prompts</Text>
      </View>
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
    backgroundColor: "#1D1D20", //1D1D20
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backButton: {
    marginRight: 15,
    paddingLeft: 15,
    paddingRight: 85,
  },
  backButtonText: {
    fontSize: 30,
    color: "white",
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
  },
  card: {
    backgroundColor: "#2B2D2F",
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
    fontSize: 25,
    fontWeight: 300,
    color: "white",
    marginBottom: 10,
    fontFamily: "Helvetica",
  },
  input: {
    color: "white",
    borderBottomWidth: 1,
    borderBottomColor: "white",
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
    fontWeight: 500,
    textAlign: "center",
    fontSize: 15,
  },
});

export default AddPrompts;
