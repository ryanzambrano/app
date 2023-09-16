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
    "My budget restrictions for housing are...",
    "A perfect night out for me looks like...",
    "My biggest pet peeves are...",
    "My favorite movies are...",
    "My favorite artists / bands are...",
    "The dorms halls / apartment complexes I'm considering are...",
    "When it comes to sharing my amenities and personal property...",
    "When it comes to sharing food and cooking...",
    "When I'm burnt out, I relax by...",
    "The organizations I'm involved in on campus are...",
    "My opinion toward smoking in the dorm / apartment are...",
    "My thoughts on having guests over are...",
    "I like the temperature of the room to be...",
    "My thoughts on having pets are...",
    "My thoughts on throwing parties are...",
    "My ideas for decorating the home involve...",
    "When it comes to handling conflict, I am...",
  ]; 

  const questionColumnMapping = {
    "Are you participating in Greek Life?": "greek_life",
    "My budget restrictions for housing are...": "budget",
    "A perfect night out for me looks like...": "night_out",
    "My biggest pet peeves are...": "pet_peeves",
    "My favorite movies are...": "favorite_movies",
    "My favorite artists / bands are...": "favorite_artists",
    "The dorms halls / apartment complexes I'm considering are...": "living_considerations",
    "When it comes to sharing my amenities and personal property...": "sharing",
    "When it comes to sharing food and cooking...": "cooking",
    "When I'm burnt out, I relax by...": "burnt_out",
    "The organizations I'm involved in on campus are...": "involvement",
    "My opinion toward smoking in the dorm / apartment are...": "smoking",
    "My thoughts on having guests over are...": "other_people",
    "I like the temperature of the room to be...": "temperature",
    "My thoughts on having pets are...": "pets",
    "My thoughts on throwing parties are...": "parties",
    "My ideas for decorating the home involve...": "decorations",
    "When it comes to handling conflict, I am...": "conflict",
  }; 

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
        maxLength={60}
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
    color: "#14999999",
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
