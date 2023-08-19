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

  const {
    currentHousingPreference,
    currentGenderPreference,
    currentYoungestAgePreference,
    currentOldestAgePreference,
    currentStudyPreference
  } = route.params;
  const [housingPreference, setHousingPreference] = useState(currentHousingPreference || "Any");
  const [genderPreference, setGenderPreference] = useState(currentGenderPreference || "Any");
  const [youngestAgePreference, setYoungestAgePreference] = useState(currentYoungestAgePreference || "Any");
  const [oldestAgePreference, setOldestAgePreference] = useState(currentOldestAgePreference || "Any");
  const [studyPreference, setStudyPreference] = useState(currentStudyPreference || "Any");
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
    { label: 'Any', value: 'Any' },
    { label: "Business", value: "Business" }, 
    { label: "Natural Science", value: "Natural Science" },
    { label: "Mathematics", value: "Mathematics" },
    { label: "Social Science", value: "Social Science" },
    { label: "Engineering", value: "Engineering" },
    { label: "Arts", value: "Art" },
    { label: "Exploratory", value: "Exploratory" },
  ];

  const handleApplyFilters = () => {
    navigation.navigate("Home", {
      housingPreference,
      genderPreference,
      youngestAgePreference,
      oldestAgePreference,
      //studyPreference
    });
  };

  const resetFilters = () => {
    setHousingPreference("Any");
    setGenderPreference("Any");
    setYoungestAgePreference("Any");
    setOldestAgePreference("Any");
    setStudyPreference("Any");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={{ width: '33%' }}></View>
        <Text style={styles.headerText}>Filters</Text>
        <TouchableOpacity onPress={resetFilters} style={{ width: '33%', alignItems: 'flex-end' }}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Housing Preference:</Text>
        <Dropdown
          style={styles.dropdown}
          data={roomOptions}
          maxHeight={300}
          labelField="label"
          placeholderStyle={{ backgroundColor: "white"}}
          valueField="value"
          placeholder="Select Housing Preference"
          searchPlaceholder="Search..."
          value={housingPreference}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
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
          data={studies}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    //borderBottomWidth: 0.5,
    borderColor: 'grey'
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: "center",
    width: '33%',
    textAlign: 'center'
  },
  clearAllText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'grey' 
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
    marginRight: 8,
  },
  dropdown: {
    flex: 1,
    borderColor: "gray",
    //borderWidth: 0.5,
    borderRadius: 8,
    color: "white",
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "white",
    
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
