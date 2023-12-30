import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../auth/supabase";

const ReportUI = ({ route }) => {
  const { session } = route.params;
  const { user_id } = route.params;
  const navigation = useNavigation();
  const [description, setDescription] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);

  const handleDescriptionChange = (text) => {
    setDescription(text);
    setDescriptionCharCount(text.length);
  };

  const handleSubmitReport = async () => {
    console.log(description);
    if (description.length > 300) {
      Alert.alert("Error", "Report should be less than 300 characters.");
      return;
    }
    const trimmedReport = description.trimEnd();
    try {
      const { data, error } = await supabase.from('Reports').insert([
        {
          reported_user_id: user_id,
          sender_user_id: session.user.id,
          description: trimmedReport,
          isUserReport: true,
        },
      ]);

      if (error) {
        console.error('Error inserting report:', error);
      } else {
        try {
          const payload = {
            PersonReported: user_id,
            Report_Sender: session.user.id,
            // Add any other fields as needed
          };
      
          // Make an HTTP POST request to trigger the edge function
          const response = await fetch('https://jaupbyhwvfulpvkfxmgm.supabase.co/functions/v1/Report_Moderation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Add any additional headers as needed
            },
            // You can include an empty JSON object as the body
            body: JSON.stringify(payload),
          });
      
          if (response.ok) {
            //console.log('Edge function triggered successfully.');
            // Handle success if needed
          } else {
            console.error('Error triggering edge function:', response.statusText);
            // Handle error if needed
          }
        } catch (error) {
          console.error('Error triggering edge function:', error.message);
          // Handle error if needed
        }
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.swipeIndicator}></View>
      <View style={styles.headerContainer}>
        <View style={{ width: '33%' }}></View>
        <Text style={styles.headerText}>Report User</Text>
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionLabel}>
          Why are you reporting this user?
        </Text>
        <Text style={styles.smallerText}>Your report is anonymous, unless someone is in immediate danger. If so, call the local emergency services - don't wait.</Text>
        <View style={styles.inputContainer}>
        <TextInput
            style={styles.input}
            value={description}
            onChangeText={(text) => {
              handleDescriptionChange(text); 
            }}
            multiline
            placeholder="Describe the issue..."
            placeholderTextColor="#575D61"
          />
          <Text
            style={{
              color: descriptionCharCount > 300 ? "red" : "lightgrey",
              textAlign: "right",
              marginRight: 10,
              marginBottom: 10,
              fontSize: 12,
              position: "absolute",
              bottom: -3,
              right: 0,
            }}
          >
            {descriptionCharCount}/300
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmitReport}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1D20",
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#2B2D2F'
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: "center",
    width: '33%',
    textAlign: 'center'
  },

  descriptionContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  characterCount: {
    color: 'white',
    alignSelf: 'flex-end',
    paddingTop: 10,
  },
  submitButton: {
    alignSelf: "center",
    backgroundColor: "#14999999",
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  border: {
    borderColor: "grey",
    borderRadius: 2,
    backgroundColor: "#1D1D20"
  },
  swipeIndicator: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'grey',
    marginTop: 25,
    marginBottom: 5, 
  },
  smallerText: {
    color: "grey",
    marginTop: 10,
    marginBottom: 2,
    
  },
  inputContainer: {
    flexDirection: "column",
    backgroundColor: "#2B2D2F",
    borderRadius: 8,
    marginBottom: 10,
    paddingLeft: 15,
    paddingTop: 8,
    marginTop: 15,
    height: 200,
    
    gap: 5,
  },
  input: {
    flex: 0,
    fontSize: 16,
    paddingRight: 15,
    
    paddingLeft: 2,
    color: "white",
    marginBottom: 10,
  },
});

export default ReportUI;
