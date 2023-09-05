import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
} from "react-native";
import { colleges } from "../auth/collegesList.js";
import { supabase } from "../auth/supabase.js";
import { startShakeAnimation } from "../auth/profileUtils.js";
import { StatusBar } from "expo-status-bar";
import ConfettiCannon from 'react-native-confetti-cannon';



export const Congrats = ({ navigation, route }) => {
  const { session } = route.params;
  const [showConfetti, setShowConfetti] = useState(true); 

  async function refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    const { session, user } = data;
  }

  const triggerConfetti = () => { 
    setShowConfetti(false); 
    setTimeout(() => setShowConfetti(true), 0); 
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111111" }}>
        {showConfetti && <ConfettiCannon explosionSpeed={600} zIndex={10} count={400} origin={{x: -10, y: 1000}} />}
        <View style={styles.header}>
          <Text style={styles.titleText}>You're all Set!</Text>
        </View>
        <View style={styles.formAction}>
          <TouchableOpacity
            onPress={() => {
              {
                refreshSession();
                //navigation.navigate("Questionaire1");
              }
            }}
          >
            <View style={styles.continue}>
              <Text style={styles.continueText}>Lets go!</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
          onPress={triggerConfetti}
          >
          <View style={styles.continue}>
            <Text style={styles.continueText}>More Confetti</Text>
          </View>
        </TouchableOpacity>
        </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 24,
    flex: 1,
    backgroundColor: "#111111",
  },

  header: {
    marginTop: 200,
    marginVertical: 5,
    //zIndex: -1,
  },

  titleText: {
    fontFamily: "Verdana-Bold",
    fontSize: 27,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
    color: "white",
  },

  input: {
    //marginBottom: 16,
  },

  inputHeader: {
    fontSize: 17,
    fontWeight: "500",
    color: "white",
    marginBottom: 10,
  },

  inputControl: {
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "500",
    height: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    //marginBottom: 20,
    backgroundColor: "#1D1D20",
    color: "white",
    borderColor: "#fff",
  },

 
  formAction: {
    flex: 1, // Take up remaining available space
    alignItems: 'center', // Center children horizontally
  },

  continue: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 80,
    borderWidth: 1,
    marginBottom: 30,
    backgroundColor: "#14999999",
    borderColor: "#14999999",
  },

  continueText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "white",
  },

  collegeText: {
    color: "white",
    textAlign: "center",
    fontSize: 15,
    //fontWeight: "600",
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 15,
    backgroundColor: "#1D1D20",
    borderColor: "#ccc",
    //borderWidth: 1,
  },

  sItem: {
    padding: 20,
    marginTop: 16,
    //marginHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#2B2D2F",
    //borderColor: "#ccc",
    //borderWidth: 1,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },
});

export default Congrats;
