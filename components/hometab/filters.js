import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';

const FiltersUI = () => {
  const navigation = useNavigation();
  const [housingPreference, setHousingPreference] = useState(null);

  const roomOptions = [
    { label: 'Any', value: 'any' },
    { label: 'Apartment', value: 'apartment' },
    { label: 'Dorm', value: 'dorm' },
    // Add more options as needed
  ];

  const handleHousingPreferenceChange = (item) => {
    setHousingPreference(item.value);
  };

  const handleApplyFilters = () => {
    // Do something with the selected housingPreference value, e.g., save it to state, or send it to the parent component
    console.log('Selected Housing Preference:', housingPreference);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Filters</Text>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Housing Preferences</Text>
        <Dropdown
          style={styles.dropdown}
          data={roomOptions}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder='Select Housing Preference'
          searchPlaceholder="Search..."
          value={housingPreference}
          onSelect={handleHousingPreferenceChange} // Handle the selection
        />
      </View>
      {/* Implement other filter UI elements as needed */}
      <TouchableOpacity onPress={handleApplyFilters}>
        <Text style={styles.applyButton}>Apply Filters</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: -10,
    alignSelf: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  dropdown: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  applyButton: {
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 20,
  },
});

export default FiltersUI;
