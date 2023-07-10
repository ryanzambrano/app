import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://jaupbyhwvfulpvkfxmgm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDYwMzgzNSwiZXhwIjoyMDAwMTc5ODM1fQ.Jr5Q7WBvMDpFgZ9FOJ1vw71P8gEeVqNaN2S8AfqTRrM';
const supabase = createClient(supabaseUrl, supabaseKey);


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
  
  const renderUserCard = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleUserCardPress(item)}>
        <View>
          <Text>{item.name}</Text>
          <Text>{item.bio}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleUserCardPress = (user) => {
    setSelectedUser(user);
    navigation.navigate('UserProfile', { user });
  };

  return (
    <SafeAreaView style={styles.container}>
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
    padding: 30,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    backgroundColor: "#F4F4F4",
    borderRadius: 8,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 6,
    paddingLeft: 15,
    paddingRight: 15,
    //color: "black",
    //borderBottomWidth: 0.5,
    //borderColor: "#11",
    backgroundColor: "white",
  },
});

export default Home;
