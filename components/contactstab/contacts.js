import React, { useEffect, useState } from "react";
import {
  Image,
  TextInput,
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { createClient } from "@supabase/supabase-js";
import { Button } from "react-native-paper";

const supabaseUrl = "https://jaupbyhwvfulpvkfxmgm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDYwMzgzNSwiZXhwIjoyMDAwMTc5ODM1fQ.Jr5Q7WBvMDpFgZ9FOJ1vw71P8gEeVqNaN2S8AfqTRrM";
const supabase = createClient(supabaseUrl, supabaseKey);

const ContactsUI = ({ route }) => {
  const { session } = route.params;
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("UGC").select("*");
    if (error) {
      console.error(error);
    } else {
      setUsers(data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCardPress = (user) => {
    setSelectedUser(user);

    navigation.navigate("Message", {
      contactName: user.name,
      contactId: user.user_id,
      myId: session.user.id,
    });
  };

  const renderContact = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleUserCardPress(item)}>
        <View style={styles.contactItem}>
          <Image
            style={styles.profilePicture}
            source={{
              uri: "https://pbs.twimg.com/media/FZK2qvKVQAE6Kbb?format=jpg&name=large",
            }}
          />
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Contacts</Text>
        <Image
          style={styles.logo}
          source={{
            uri: "https://example.com/logo.png",
          }}
        />
      </View>
      <View style={styles.viewContainer}>
        <FlatList
          data={users}
          renderItem={renderContact}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  viewContainer: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  contactStatus: {
    fontSize: 14,
    color: "#888",
  },
});

export default ContactsUI;
