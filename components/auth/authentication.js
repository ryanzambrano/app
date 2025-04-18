import "react-native-url-polyfill/auto";
import React from "react";
import SignIn from "./signIn.js";
import SignUp from "./signUp.js";
import ForgotPassword from "./forgotPassword.js";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const Authentication = ({ navigation }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
};

export default Authentication;
