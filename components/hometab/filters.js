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
import { RangeSlider } from '@react-native-assets/slider';


const FiltersUI = ({ route }) => {
  const { session } = route.params;
  const navigation = useNavigation();

  const {
    currentHousingPreference,
    currentGenderPreference,
    currentYoungestAgePreference,
    currentOldestAgePreference,
    currentStudyPreference,
    originalGenderPreference,
    originalHousingPreference,
  } = route.params;

  const [housingPreference, setHousingPreference] = useState(
    currentHousingPreference || "Any"
  );
  const [genderPreference, setGenderPreference] = useState(
    currentGenderPreference || "Any"
  );
  const [youngestAgePreference, setYoungestAgePreference] = useState(
    currentYoungestAgePreference || "Any"
  );
  const [oldestAgePreference, setOldestAgePreference] = useState(
    currentOldestAgePreference || "Any"
  );
  const [studyPreference, setStudyPreference] = useState(
    currentStudyPreference || "Any"
  );
  const [isFocus, setIsFocus] = useState(false);

  const roomOptions = [
    { label: "Any", value: "No Preferences" },
    { label: "Apartment", value: "Apartment" },
    { label: "Dorm", value: "Dorm" },
    { label: "House", value: "House" },
  ];

  const genders = [
    { label: "Any", value: "Any" },
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  const ages = [
    { label: "Any", value: "Any" },
    ...Array.from({ length: 9 }, (_, index) => ({
      label: (18 + index).toString(),
      value: (18 + index).toString(),
    })),
  ];

  const [ageRange, setAgeRange] = useState([
    parseInt(currentYoungestAgePreference) || 18, 
    parseInt(currentOldestAgePreference) || 26
  ]);
  

  const studies = [
    { label: "Any", value: "Any" },
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
      youngestAgePreference: ageRange[0],
      oldestAgePreference: ageRange[1],
      studyPreference,
    });
  };

  const resetFilters = () => {
    setHousingPreference(originalHousingPreference);
    setGenderPreference(originalGenderPreference);
    setAgeRange([18, 26]);
    setStudyPreference("Any");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.swipeIndicator}></View>
      <View style={styles.headerContainer}>
        <View style={{ width: "33%" }}></View>
        <Text style={styles.headerText}>Filters</Text>
        <TouchableOpacity
          onPress={resetFilters}
          style={{ width: "33%", alignItems: "flex-end" }}
        >
          <Text style={styles.clearAllText}>Reset Filters</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Housing Preference:</Text>
        <Dropdown
          style={styles.dropdown}
          data={roomOptions}
          maxHeight={300}
          labelField="label"
          placeholderStyle={{ backgroundColor: "white" }}
          valueField="value"
          selectedTextStyle={styles.placeholderText}
          itemTextStyle={styles.placeholderText}
          itemContainerStyle={styles.listContainer}
          containerStyle={styles.border}
          autoScroll={false}
          showsVerticalScrollIndicator={false}
          activeColor="#2b3138"
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
          selectedTextStyle={styles.placeholderText}
          itemTextStyle={styles.placeholderText}
          itemContainerStyle={styles.listContainer}
          containerStyle={styles.border}
          autoScroll={false}
          showsVerticalScrollIndicator={false}
          activeColor="#2b3138"
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
        <Text style={styles.filterLabel}>Area of Study:</Text>
        <Dropdown
          style={styles.dropdown}
          data={studies}
          maxHeight={300}
          labelField="label"
          valueField="value"
          selectedTextStyle={styles.placeholderText}
          itemTextStyle={styles.placeholderText}
          itemContainerStyle={styles.listContainer}
          containerStyle={styles.border}
          autoScroll={false}
          showsVerticalScrollIndicator={false}
          activeColor="#2b3138"
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
      <View style={styles.divider}></View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Age Range:</Text>
        <View style={{flex: 1, paddingLeft: 10, paddingRight: 20, alignItems: 'stretch', justifyContent: 'center'}}>
        <RangeSlider
          range={ageRange}
          minimumValue={18}
          maximumValue={26}
          minimumRange={0}
          step={1}
          outboundColor='#2b3138'
          inboundColor='darkcyan'
          thumbTintColor='white'
          trackHeight={4}
          thumbSize={15}
          onValueChange={(newRange) => setAgeRange(newRange)}
        />
      </View>
      <Text style={{color: "white", fontSize: 16, fontWeight: "400",}}>{`${ageRange[0]} - ${ageRange[1]}`}</Text>
    </View> 
      <TouchableOpacity onPress={handleApplyFilters}>
        <View style={styles.applyButtonContainer}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    //borderBottomWidth: 0.5,
    borderColor: "grey",
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    alignSelf: "center",
    width: "33%",
    textAlign: "center",
  },
  clearAllText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "grey",
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
    backgroundColor: "#2b3138",
  },
  divider: {
    height: 0.5,
    paddingVertical: 0.4,
    marginRight: 18,
    marginLeft: 18,
    backgroundColor: "#2B2D2F",
    marginVertical: 8,
    marginHorizontal: -10,
  },
  applyButtonContainer: {
    alignSelf: "center",
    backgroundColor: "#149999",
    borderRadius: 10,
    marginTop: 20,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  placeholderText: {
    color: "white",
    paddingLeft: 5,
    //backgroundColor: "white",
  },
  listContainer: {
    backgroundColor: "#1D1D20",
  },
  border: {
    borderColor: "grey",
    borderRadius: 2,
    backgroundColor: "#1D1D20",
  },
  swipeIndicator: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "grey",
    marginTop: 25,
    marginBottom: 5,
  },
});

export default FiltersUI;
