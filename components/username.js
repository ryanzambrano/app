import "react-native-url-polyfill/auto";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Button,
  Modal,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "./auth/supabase.js";
import SignUp from "./signUp.js";
//import { insertUser} from './server.js';

export const Username = ({ navigation }) => {
  const windowHeight = Dimensions.get("window").height;
  const [isBirthdayModalVisible, setIsBirthdayModalVisible] = useState(false);
  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
  const [isRaceModalVisible, setIsRaceModalVisible] = useState(false);

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedBirthday, setSelectedBirthday] = useState(
    "Select your Birthday"
  );

  const [selectedGender, setSelectedGender] = useState("Select your Gender");

  const [selectedUsername, setSelectedUsername] = useState("");

  const days = Array.from(Array(31).keys()).map((day) => String(day + 1));
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthIndex = months.indexOf(selectedMonth);
  const numericalMonth = monthIndex + 1;

  const gender = ["Male", "Female", "Other"];

  const race = ["White", "Black", "Brown", "Yellow"];

  const openBirthdayModal = () => {
    setIsBirthdayModalVisible(true);
  };

  const closeBirthdayModal = () => {
    setIsBirthdayModalVisible(false);
  };

  const openGenderModal = () => {
    setIsGenderModalVisible(true);
  };

  const closeGenderModal = () => {
    setIsGenderModalVisible(false);
  };

  const openRaceModal = () => {
    setIsRaceModalVisible(true);
  };

  const closeRaceModal = () => {
    setIsRaceModalVisible(false);
  };

  const handleSaveBirthday = () => {
    const formattedBirthday = `${selectedYear}-${numericalMonth
      .toString()
      .padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`;

    setSelectedBirthday(selectedMonth + " " + selectedDay + " " + selectedYear);

    closeBirthdayModal();
  };

  const userData = {
    username: selectedUsername,
  };

  async function insertUser(userData) {
    const { data, error } = await supabase.from("profiles").insert([
      {
        username: userData.username,
      },
    ]);
    if (error) {
      console.error("Error inserting user:", error);
    } else {
      console.log("User inserted successfully:", data);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eBecf4" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Pick a Username!</Text>
        </View>

        <View style={styles.input}>
          <Text style={styles.inputHeader}>Username</Text>

          <TextInput
            style={styles.inputControl}
            placeholder="Select your birthday"
            placeholderTextColor="#6b7280"
            //value={selectedUsername}
            onChangeText={(username) => setSelectedUsername(selectedUsername)}
          ></TextInput>

          <Modal
            visible={isGenderModalVisible}
            animationType="slide"
            transparent
          >
            <View style={styles.modalContainerGender}>
              <View style={styles.pickerContainerGender}>
                <Picker
                  style={styles.picker}
                  selectedValue={selectedGender}
                  onValueChange={(itemValue) => setSelectedGender(itemValue)}
                >
                  {gender.map((Gender) => (
                    <Picker.Item key={Gender} label={Gender} value={Gender} />
                  ))}
                </Picker>
              </View>
              <View style={styles.bbuttons}>
                <Button title="Save" onPress={closeGenderModal} />
                <Button title="Cancel" onPress={closeGenderModal} />
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.formAction}>
          <TouchableOpacity
            onPress={() => {
              {
                insertUser(userData);
                navigation.navigate("Questionaire2");
              }
            }}
          >
            <View style={styles.continue}>
              <Text style={styles.continueText}>Next</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },

  header: {
    marginVertical: 36,
  },

  titleText: {
    fontFamily: "Verdana-Bold",
    fontSize: 27,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#1e1e1e",
  },

  input: {
    marginBottom: 16,
  },

  inputHeader: {
    fontSize: 17,
    fontWeight: "500",
    color: "#222",
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
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#6b7280",
    borderColor: "#fff",
  },

  inputText: {
    color: "#6b7280",
    fontWeight: "500",
  },

  form: {
    marginBottom: 24,
    flex: 1,
  },

  formAction: {
    marginVertical: 24,
  },

  continue: {
    marginBottom: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: "#075eec",
    borderColor: "#075eec",
  },

  continueText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },

  center: {
    marginTop: "60%",
    marginBottom: "20%",
  },

  modalContainer: {
    flex: 1,
    marginTop: "100%",
    backgroundColor: "#fff",
    justifyContent: "space-around",
    gap: "50%",
  },

  modalContainerGender: {
    flex: 1,
    marginTop: "130%",
    backgroundColor: "#fff",
    justifyContent: "space-around",
    gap: "50%",
  },

  pickerContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: "7%",
  },

  pickerContainerGender: {
    flex: 1,
    flexDirection: "row",
    marginTop: "1%",
  },
  picker: {
    flex: 1,
  },

  pickerDate: {
    flex: 0,
    width: "28%",
  },

  pickerYear: {
    flex: 0,
    width: "28%",
  },

  bbuttons: {
    flex: 1,
    flexDirection: "column",
    gap: "20%",
  },
});

export default Username;
