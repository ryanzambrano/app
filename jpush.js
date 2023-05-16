import React from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Image } from 'react-native';
import { Button } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style = { styles.welcomeText }>Roomba</Text>
      <Text style = { styles.sloganText }>Find and meet your new roomates</Text>
      <Button title="Sign Up"> Details </Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeText: {
    flex: 1,
    fontFamily: 'Verdana-Bold',
    fontSize: 45,
    textAlign: "center",
    marginBottom: 10,
    marginTop: "40%",
  },

  sloganText: {
    flex: 1,
    fontFamily: 'Verdana',
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
  },

  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mid: {
    fontSize: 50,
    marginTop: 50,
  },

  box: {
    width: 100, height: 100, backgroundColor: 'green', borderRadius: 1,
  },

  balls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent:'center',
    alignContent: 'center',
  },

  bar: {
    width: 100, borderBottomColor:'red', borderBottomWidth: 5,
  },

  none: {
    
  }


});