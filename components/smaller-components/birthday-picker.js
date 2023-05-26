import React, { useState } from 'react';
import { View, TextInput, Modal, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export const BirthdayPicker = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
  
    const days = Array.from(Array(31).keys()).map((day) => String(day + 1));
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = Array.from(Array(100).keys()).map((year) => String(2023 - year));
  
    const openModal = () => {
      setIsModalVisible(true);
    };
  
    const closeModal = () => {
      setIsModalVisible(false);
    };
  

    const handleSave = () => {

        closeModal();

        const birthday = {
          day: selectedDay,
          month: selectedMonth,
          year: selectedYear
        };

      };
      
  
    return (
      <View>
        <TextInput style={styles.inputControl}
            placeholder="Select your birthday"
            placeholderTextColor="#6b7280"
            value={`${selectedDay} ${selectedMonth} ${selectedYear}`}
            onFocus={openModal}>
    </TextInput>
  
        <Modal visible={isModalVisible} animationType="slide">
          <View>
            <Picker
              selectedValue={selectedDay}
              onValueChange={(itemValue) => setSelectedDay(itemValue)}
            >
              {days.map((day) => (
                <Picker.Item key={day} label={day} value={day} />
              ))}
            </Picker>
  
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            >
              {months.map((month) => (
                <Picker.Item key={month} label={month} value={month} />
              ))}
            </Picker>
  
            <Picker
              selectedValue={selectedYear}
              onValueChange={(itemValue) => setSelectedYear(itemValue)}
            >
              {years.map((year) => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
            </Picker>
  
            <Button title="Save" onPress={handleSave} />
            <Button title="Cancel" onPress={closeModal} />
          </View>
        </Modal>
      </View>
    );
  };

  const styles = StyleSheet.create({
  inputControl: {
    backgroundColor: '#fff',
    color: '#222',
    fontWeight: '500',
    height: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
  },
});
export default BirthdayPicker;