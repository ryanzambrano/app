import "react-native-url-polyfill/auto";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image } from "react-native";
const LoadingScreen = () => {
  const logo = require("./../../assets/logo4.png");

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.headerImage} alt="Logo " />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    justifySelf: "center",
    backgroundColor: "#111111",
    width: "100%",
  },
  headerImage: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 25,
  },
});

export default LoadingScreen;
