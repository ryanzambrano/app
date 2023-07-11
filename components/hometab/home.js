import React, { useEffect, useState } from "react";
import { Image, TextInput, View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://jaupbyhwvfulpvkfxmgm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDYwMzgzNSwiZXhwIjoyMDAwMTc5ODM1fQ.Jr5Q7WBvMDpFgZ9FOJ1vw71P8gEeVqNaN2S8AfqTRrM';
const supabase = createClient(supabaseUrl, supabaseKey);
import UserCard from './userCard.js';


const Home = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('UGC').select('*');
      if (error) {
        console.error(error);
      } else {
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);

  const handleUserCardPress = (user) => {
    setSelectedUser(user);
    navigation.navigate('userCard', { user }); // Navigate to UserProfile component with selected user data
  };

  const renderUserCard = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleUserCardPress(item)}>
        <View style={styles.card}>
          <Image style={styles.profileImage} source={{ uri: "https://pbs.twimg.com/media/FZK2qvKVQAE6Kbb?format=jpg&name=large"}} />
          <View style={styles.userInfo}>
            <Text style={styles.name}> {item.name}</Text>
            <Text style={styles.bio}>{item.bio}</Text>
          </View>
        </View>
        
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image style={styles.logo} source = {{ uri: "https://cdn3.iconfinder.com/data/icons/user-interface-865/24/36_Home_App_House-256.png"}} />
        <Text style={styles.headerText}> Cabana </Text>
      </View>
      <FlatList
        data={users}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'gray',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: -7,
  },

  logo: {
    width: 27,
    height: 27,
    marginRight: 0,
    marginTop: -10,
  },

  userInfo: {
    flex: 1,
  },

  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 30,
    backgroundColor: "#F4F4F4",
    borderRadius: 8,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
    marginVertical: 5,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  bio: {
    fontSize: 14,
    color: 'gray',
    paddingHorizontal: 3,
  },

});

export default Home;
