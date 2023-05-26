import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Image, SafeAreaView, TouchableOpacity, Button, Picker } from 'react-native';
import { supabase } from './auth/supabase.js';
import { NavigationHelpersContext } from '@react-navigation/native';
import BirthdayPicker from './smaller components/birthdaypicker.js';

export const Questionaire = () => {

    const [form, setForm] = useState({
        gender: '',
        race: '',
    })

    

    const handleBirthdaySelected = (birthday) => {
      setForm({ ...form, birthday: `${birthday.day} ${birthday.month} ${birthday.year}` });
      alert('Selected Birthday:', birthday);
    };
    

return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eBecf4' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          
          <Text style = { styles.titleText }>Answer a few questions about yourself!</Text>
        </View>

        <View style={styles.form}>

          <View style={styles.input}>
            <Text style={styles.inputHeader}>Birthday</Text>
            <TextInput style={styles.inputControl}
            onFocus= {() => {
              // handle onPress
              BirthdayPicker();
              
            }}
            >
            </TextInput>
          </View>

          <View style={styles.input}>
            <Text style={styles.inputHeader}>Gender</Text>
            <TextInput style={styles.inputControl}hi
              autoCapitalize='none'
              autoCorrect={false}
              placeholderTextColor="#6b7280"
              value={form.email}
              onChangeText={email => setForm({ ...form, birthday })} 
            />
          </View>

          <View style={styles.input}>
            <Text style={styles.inputHeader}>Race (optional)</Text>
            <TextInput style={styles.inputControl}hi
              autoCapitalize='none'
              autoCorrect={false}
              placeholderTextColor="#6b7280"
              value={form.email}
              onChangeText={email => setForm({ ...form, birthday })} 
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
    marginBottom: 40,
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
