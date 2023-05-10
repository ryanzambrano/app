import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Image, SafeAreaView, TouchableOpacity, Button } from 'react-native';

export default function App() {

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eBecf4' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: "https://th.bing.com/th/id/R.2e5759904001f6bfb51514cfe25d9fae?rik=mjp6tYknw47rEA&riu=http%3a%2f%2fwww.newdesignfile.com%2fpostpic%2f2009%2f07%2fhome-button-icon_6176.png&ehk=Lun4Q0YhJO1adNrK72JB3%2brQm5p6s2ug3vWUBSJnthA%3d&risl=&pid=ImgRaw&r=0"}}
            style={styles.headerImage}
            alt="Logo "
          />
          <Text style = { styles.titleText }>Sign into RoomBa</Text>
          <Text style = { styles.sloganText }>Find and meet new roomates, for any situation!</Text>
        </View>

        <View style={styles.form}>

          <View style={styles.input}>
            <Text style={styles.inputHeader}>Email Address:</Text>
            <TextInput style={styles.inputControl} 
              autoCapitalize='none'
              autoCorrect={false}
              keyboardType='email-address'
              placeholder='deeznuts@bruh.com'S
              placeholderTextColor="#6b7280"
              value={form.email} 
              onChangeText={email => setForm({ ...form, email })} 
            />
          </View>

          <View style={styles.input}>
            <Text style={styles.inputHeader}>Password:</Text>
            <TextInput style={styles.inputControl} 
              styles={styles.inputControl}
              autoCorrect={false}
              placeholder='*********'
              placeholderTextColor="#6b7280"
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
                <Text style={styles.continueText}>Sign in</Text>
              
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              // handle link
            }}
            style={{ marginTop: 'auto' }}>
            <Text style={styles.formFooter}>
              Don't have an account?{' '} <Text style={{ textDecorationLine: 'underline' }}>Sign up</Text>
            </Text>
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
    marginBottom: 33,
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
