import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProfileUI = ({ route }) => {
  const { contactName, contactImage } = route.params;
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.navigate('Message');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
      <AntDesign name="arrowleft" size={24} color="#007AFF" />
      </TouchableOpacity>
      <Image source={{ uri: contactImage }} style={styles.profilePicture} />
      <Text style={styles.contactName}>{contactName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
  },
  profilePicture: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  contactName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    paddingVertical: 15,
    top: 20,
    left: 20,
  },
});

export default ProfileUI;
