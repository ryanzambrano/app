import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from "@react-native-picker/picker";

const FiltersUI = () => {
  const navigation = useNavigation();
  const [housingOption, setHousingOption] = useState('Any');
  const [ageFilter, setAgeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAgeChange = (value) => {
    setAgeFilter(value);
  };

  const handleApplyFilters = () => {
    // Implement your logic for applying the filters here
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Housing Option</Text>
        {/* Implement your icon or indicator for the dropdown here */}
      </View>
      <Picker
        selectedValue={housingOption}
        onValueChange={(itemValue) => setHousingOption(itemValue)}
      >
        <Picker.Item label="Any" value="Any" />
        <Picker.Item label="Dorm" value="Dorm" />
        <Picker.Item label="Apartment" value="Apartment" />
        <Picker.Item label="House" value="House" />
      </Picker>

      <View style={styles.labelContainer}>
        <Text style={styles.label}>Age Filter</Text>
      </View>
      <TextInput
        style={styles.input}
        value={ageFilter}
        onChangeText={handleAgeChange}
        placeholder="Enter age filter"
      />

      {/* Add other filters as needed */}
      {/* <View style={styles.labelContainer}>
        <Text style={styles.label}>Another Filter</Text>
      </View>
      <TextInput
        style={styles.input}
        value={anotherFilterValue}
        onChangeText={handleAnotherFilterChange}
        placeholder="Enter another filter"
      /> */}

      <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
        <Text style={styles.applyButtonText}>Apply Filters</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  applyButton: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FiltersUI;
