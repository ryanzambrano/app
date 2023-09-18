import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../auth/supabase";

const ReportUI = ({ route }) => {
  const { session } = route.params;
  const navigation = useNavigation();

  const [isFocus, setIsFocus] = useState(false);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.swipeIndicator}></View>
      <View style={styles.headerContainer}>
        <View style={{ width: '33%' }}></View>
        <Text style={styles.headerText}>Filters</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D1D20",
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    //borderBottomWidth: 0.5,
    borderColor: 'grey'
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: "center",
    width: '33%',
    textAlign: 'center'
  },
  clearAllText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'grey' 
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 16,
    
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
    marginRight: 8,
  },
  dropdown: {
    flex: 1,
    borderColor: "gray",
    
    //borderWidth: 0.5,
    borderRadius: 8,
    color: "white",
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "white",
    backgroundColor: "#2D2D30",
  },
  divider: {
    height: 0.5,
    paddingVertical: 0.4,
    marginRight: 18,
    marginLeft: 18,
    backgroundColor: "#2B2D2F",
    marginVertical: 8,
    marginHorizontal: -10,
  },
  applyButtonContainer: {
    alignSelf: "center",
    backgroundColor: "#149999",
    borderRadius: 10,  
    marginTop: 20,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  placeholderText: {
    color: "white",
    paddingLeft: 5,
    //backgroundColor: "white",
  },
  listContainer: {
    backgroundColor: "#1D1D20",
  },
  border: {
    borderColor: "grey",
    borderRadius: 2,
    backgroundColor: "#1D1D20"
  },
  swipeIndicator: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'grey',
    marginTop: 25,
    marginBottom: 5, 
  },
});

export default ReportUI;
