import {React, useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { picURL } from '../auth/supabase';

import Swiper from 'react-native-swiper';
// npm install react-native-swiper

const MAX_IMAGES = 6;
const supabaseUrl = "https://jaupbyhwvfulpvkfxmgm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDYwMzgzNSwiZXhwIjoyMDAwMTc5ODM1fQ.Jr5Q7WBvMDpFgZ9FOJ1vw71P8gEeVqNaN2S8AfqTRrM";
const supabase = createClient(supabaseUrl, supabaseKey);


const UserCard = ({ navigation, route }) => {
  const { name, bio, user_id } = route.params.user;
  const [photos, setPhotos] = useState([]);

  
  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const getProfilePictures = async () => {
      try {
        const imagePromises = Array(MAX_IMAGES)
          .fill(null)
          .map(async (_, i) => {
            const profilePictureURL = `${picURL}/${user_id}/${user_id}-${i}`;
            const response = await fetch(profilePictureURL, {
              cache: "no-store",
            });
            if (response.ok) {
              const blob = await response.blob();
              return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            }
          });

        const newImages = await Promise.all(imagePromises);
        const nonNullImages = newImages.filter(Boolean);
        setPhotos(nonNullImages);
      } catch (error) {
        console.error(error);
      }
    };

    getProfilePictures();
  }, [user_id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.name}>{name}</Text>
      </View>
      <ScrollView>
        <ScrollView horizontal style={styles.photoContainer} pagingEnabled={true}>
          {photos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.photo} />
          ))}
        </ScrollView>

        <View style={styles.bioContainer}>
          <View style={styles.roundedContainer}>
            <Text style={styles.bio}>{bio}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'flex-start',
    paddingVertical: 5,
  },
  backButton: {
    marginRight: -48,
    marginLeft: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
  },
  name: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  photoContainer: {
    height: 440,
    marginBottom: 8,
    marginHorizontal: 6,
    borderRadius: 15,
  },
  photo: {
    width: Dimensions.get('window').width,
    height: 440,
  },
  bioContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#404040',
    borderRadius: 15,
    marginHorizontal: 6, 
    marginBottom: 10, 
  },
  roundedContainer: {
    backgroundColor: '#404040',
    borderRadius: 50,
    padding: 10,
  },
  bio: {
    color: 'white',
    fontSize: 16,
    textAlign: 'justify',
  },
});

export default UserCard;
