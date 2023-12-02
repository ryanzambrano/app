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

export const QuestionaireAnswers = ({ navigation, route }) => {
  const { session } = route.params;
  const { currentUser } = route.params;
  const user_id = currentUser.user_id;
  const [answers, setAnswers] = useState([]);

  const questionaireQuestions = {
    living_preferences: "What type of housing do you plan on living in?",
    for_fun: "Do you prefer to stay in or go out for a fun night?",
    tidiness: "How tidy are you when it comes to your living spaces?",
    noise_preference: "Does noise bother you when relaxing and/or sleeping?",
    sleep_time: "What time do you rougly go to sleep?",
  };

  useEffect(() => {
    const fetchAnswers = async () => {
      const { data: questionaireData, error: questionaireError } =
        await supabase.from("profile").select("*").eq("user_id", user_id);

      if (questionaireData) {
        const answeredQuestions = Object.entries(questionaireQuestions)
          .map(([key, question]) => ({
            question,
            answer: questionaireData[0][key],
          }))
          .filter(({ answer }) => answer !== null);

        setAnswers(answeredQuestions);
      } else {
        console.log("Error fetching prompts: ", questionaireError);
      }
    };

    fetchAnswers();
  }, []);

  const renderItems = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.question}>{item.question}</Text>
      <View style={styles.answerContainer}>
        <Text style={styles.input}>{item.answer}</Text>
        
      </View>
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
        <Text style={styles.headerText}>Answers</Text>
      </View>
      <FlatList
        data={answers}
        renderItem={renderItems}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1D1D20",
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
    color: "#149999",
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
    padding: 0,
    height: 40,
    fontSize: 26,
    fontFamily: "Helvetica",
    //textDecorationLine: 'underline', 
  },
  answerContainer: {
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: "white",
    paddingBottom: 0,
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5,
},


});

export default QuestionaireAnswers;
