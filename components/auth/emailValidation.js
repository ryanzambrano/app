import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { supabase } from "./supabase";

const Email = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);

  const generateConfirmationCode = () => {
    // Generate a random 6-digit confirmation code
    return Math.floor(100000 + Math.random() * 900000);
  };

  const sendEmail = async (email, password) => {
    async function signUpUser() {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      setIsEmailSent(true);

      if (error) Alert.alert(error.message);
      setLoading(false);
    }
  };

  const verifyCode = () => {
    if (confirmationCode === generatedCode) {
      console.log("Verification successful");
      Alert.alert("Verification successful");
    } else {
      console.log("Incorrect confirmation code");
      Alert.alert("Incorrect confirmation code");
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Enter email"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        placeholder="Enter password"
        onChangeText={setPassword}
        value={password}
      />

      <Button title="Sign up" onPress={sendEmail} disabled={!email} />

      {isEmailSent && (
        <>
          <TextInput
            placeholder="go to your email and verify your account"
            onChangeText={setConfirmationCode}
            value={confirmationCode}
          />
          <Button
            title="Verify"
            onPress={verifyCode}
            disabled={!confirmationCode}
          />
        </>
      )}
    </View>
  );
};

export default Email;
