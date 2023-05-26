import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Image, SafeAreaView, TouchableOpacity, Button, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from './auth/supabase.js';
import SignUp from './signUp.js';
import BirthdayPicker from './smaller-components/birthday-picker.js';
//import { insertUser} from './server.js';

export const Questionaire = ({navigation}) => {

  const [loading, setLoading] = useState(false)
  async function signInUser(email, password) {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }


  const [form, setForm] = useState({
    email: '',
    password: '',
  });

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eBecf4' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style = { styles.titleText }>Answer some questions about yourself!</Text>
        </View>

        <View style={styles.form}>

          <View style={styles.input}>
            <Text style={styles.inputHeader}>Birthday</Text>
            
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

          <View style={styles.input}>
            <Text style={styles.inputHeader}>Gender</Text>
            <TextInput style={styles.inputControl}hi
              autoCapitalize='none'
              autoCorrect={false}
              value={form.email}
              onChangeText={email => setForm({ ...form, email })} 
            />
          </View>

          <View style={styles.input}>
            <Text style={styles.inputHeader}>Race</Text>
            <TextInput style={styles.inputControl} 
              styles={styles.inputControl}
              autoCorrect={false}
              value={form.password}
              onChangeText={password => setForm({ ...form, password })}
              secureTextEntry={true}
            />
          </View>

          <View style={styles.formAction}>
            <TouchableOpacity
              onPress={() => {
                // handle onPress
                
                
              }}>
              <View style={styles.continue}>
                <Text style={styles.continueText}>Next</Text>
              
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              // handle link
            navigation.navigate('SignUp')
            }}
            style={{ marginTop: 'auto' }}>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>

    
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },

  header: {
    marginVertical: 36,
  },

  headerImage: {
    width: 90,
    height: 90,
    alignSelf: 'center',
    marginBottom: 25,
  },

  titleText: {
    fontFamily: 'Verdana-Bold',
    fontSize: 27,
    fontWeight: '700',
    textAlign: "center",
    marginBottom: 12,
    color: '#1e1e1e',
  },

  sloganText: {
    fontFamily: 'Verdana',
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
    textAlign: "center",
  },

  input: {
    marginBottom: 16,
  },

  inputHeader: {
    fontSize: 17,
    fontWeight: '500',
    color: '#222',
    marginBottom: 10,
  },

  inputControl: {
    backgroundColor: '#fff',
    color: '#222',
    fontWeight: '500',
    height: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    marginBottom: 20,
  },

  form: {
    marginBottom: 24,
    flex: 1,
  },

  formAction: {
    marginVertical: 24,
  },

  formFooter: {
     fontSize: 17,
     fontWeight: '600',
     color: '#222',
     textAlign: 'center',
     letterSpacing: 0.15,
  },

  continue: {
    marginTop: 5,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#075eec',
    borderColor: '#075eec',
  },

  continueText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },

  none: {
    
  },


});

export default Questionaire;
