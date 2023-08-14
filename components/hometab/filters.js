import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../auth/supabase";

const FiltersUI = ({ route }) => {
  const { session } = route.params;

  const navigation = useNavigation();
  const [housingPreference, setHousingPreference] = useState("Any");
  const [genderPreference, setGenderPreference] = useState("Any");
  const [youngestAgePreference, setYoungestAgePreference] = useState("Any");
  const [oldestAgePreference, setOldestAgePreference] = useState("Any");
  const [studyPreference, setStudyPreference] = useState("Any");
  const [isFocus, setIsFocus] = useState(false);

  const roomOptions = [
    { label: "Any", value: "Any" },
    { label: "Apartment", value: "Apartment" },
    { label: "Dorm", value: "Dorm" },
  ];

  const genders = [
    { label: "Any", value: "Any" },
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  const ages = [
    { label: "Any", value: "Any" },
    ...Array.from({ length: 83 }, (_, index) => ({
      label: (18 + index).toString(),
      value: (18 + index).toString(),
    })),
  ];

  const studies = [
    "Business",
    "Natural Science",
    "Social Science",
    "Mathematics",
    "Engineering",
    "Art",
    "Exploratory",
    "Other",
  ];

  const handleApplyFilters = () => {
    console.log(
      housingPreference,
      genderPreference,
      youngestAgePreference,
      oldestAgePreference,
      studyPreference
    );
    navigation.navigate("Home", {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Filters</Text>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Housing Preference:</Text>
        <Dropdown
          style={styles.dropdown}
          data={roomOptions}
          maxHeight={300}
          labelField="label"

          valueField="value"
          placeholder="Select Housing Preference"
          searchPlaceholder="Search..."
          value={housingPreference}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {d
            setHousingPreference(item.value);
            setIsFocus(false);
          }}
        />
      </View>
      <View style={styles.divider}></View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Gender Preference:</Text>
        <Dropdown
          style={styles.dropdown}
          data={genders}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select Gender Preference"
          searchPlaceholder="Search..."
          value={genderPreference}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            setGenderPreference(item.value);
            setIsFocus(false);
          }}
        />
      </View>
      <View style={styles.divider}></View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Youngest Age:</Text>
        <Dropdown
          style={styles.dropdown}
          data={ages}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select Youngest Age Preference"
          searchPlaceholder="Search..."
          value={youngestAgePreference}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            setYoungestAgePreference(item.value);
            setIsFocus(false);
          }}
        />
      </View>
      <View style={styles.divider}></View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Oldest Age:</Text>
        <Dropdown
          style={styles.dropdown}
          data={ages}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select Oldest Age Preference"
          searchPlaceholder="Search..."
          value={oldestAgePreference}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            setOldestAgePreference(item.value);
            setIsFocus(false);
          }}
        />
      </View>
      <View style={styles.divider}></View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Area of Study:</Text>
        <Dropdown
          style={styles.dropdown}
          data={ages}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select Area of Preference"
          searchPlaceholder="Search..."
          value={studyPreference}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            setStudyPreference(item.value);
            setIsFocus(false);
          }}
        />
      </View>
      <TouchableOpacity onPress={handleApplyFilters}>
        <Text style={styles.applyButton}>Apply Filters</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1D20",
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 10,
    padding: 15,
    color: 'white',
    alignSelf: "center",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 16,
  },
  filterLabel: {
    fontSize: 16,
    color: "white",
    marginRight: 8,
  },
  dropdown: {
    flex: 1,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    color: "white",
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  divider: {
    height: 0.5,
    marginRight: 20,
    marginLeft: 20,
    backgroundColor: "grey",
    marginVertical: 8,
    marginHorizontal: -10,
  },
  applyButton: {
    alignSelf: "center",
    fontSize: 15,
    fontWeight: "bold",
    backgroundColor: "#149999",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 20,
  },
});

export default FiltersUI;
