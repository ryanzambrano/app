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

export const Colleges = ({ navigation, route }) => {
  const { session } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [isError, setIsError] = useState("");

  const shakeAnimationValue = useRef(new Animated.Value(0)).current;
  const shakeAnimationStyle = {
    transform: [
      {
        translateX: shakeAnimationValue.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-5, 0, 5],
        }),
      },
    ],
  };

  const handleUpdate = async (session) => {
    setIsError(null);

    if (session?.user) {
      //alert("session.user");
      if (!!selectedCollege) {
        const { data, error } = await supabase
          .from("profile")
          .update({
            college: selectedCollege,
          })
          .eq("user_id", session.user.id);

        if (error) {
          startShakeAnimation();
          setIsError(error.message);
        } else {
          navigation.navigate("Questionaire1");
        }
      } else setIsError("please select a College");
    }
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery) {
        setFilteredColleges(
          colleges.filter(
            (college) =>
              college.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              college.value.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } else {
        setFilteredColleges([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timerId);
  }, [searchQuery]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111111" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Select your College</Text>
        </View>

        <TextInput
          style={styles.inputControl}
          placeholder="Enter your college..."
          placeholderTextColor={'grey'}
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
        />
        {searchQuery ? (
          <FlatList
            data={filteredColleges.slice(0, 10)} // Limiting to 50 results
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setIsError(null);
                  setSelectedCollege(item.label);
                  setSearchQuery("");
                }}
                style={styles.item}
              >
                <Text style={styles.collegeText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        ) : null}
        {isError && (
          <Animated.Text
            style={[styles.errorText, shakeAnimationStyle]}
            value={isError}
          >
            {isError}
          </Animated.Text>
        )}
        {selectedCollege && (
          <View style={styles.sItem}>
            <Text style={styles.collegeText}>{selectedCollege}</Text>
          </View>
        )}
        <View style={styles.formAction}>
          <TouchableOpacity
            onPress={() => {
              {
                handleUpdate(session);
                //navigation.navigate("Questionaire1");
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
    margin: 24,
    flex: 1,
    backgroundColor: "#111111",
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
    marginVertical: 24,
  },

  continue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
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

export default Colleges;
