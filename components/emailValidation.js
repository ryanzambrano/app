import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey("YOUR_SENDGRID_API_KEY");

const Email = () => {
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);

  const generateConfirmationCode = () => {
    // Generate a random 6-digit confirmation code
    return Math.floor(100000 + Math.random() * 900000);
  };

  const sendConfirmationCode = async () => {
    const code = generateConfirmationCode();
    setGeneratedCode(code);

    const sendEmail = async (toEmail, subject, content) => {
      const msg = {
        to: toEmail,
        from: "YOUR_SENDER_EMAIL_ADDRESS", // Replace with your sender email address
        subject,
        text: content,
      };

      try {
        await sgMail.send(msg);
        console.log("Email sent successfully");
      } catch (error) {
        console.error("Error sending email:", error);
      }
    };

    module.exports = sendEmail;
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

      <Button
        title="Send Confirmation Code"
        onPress={sendConfirmationCode}
        disabled={!email}
      />

      {isCodeSent && (
        <>
          <TextInput
            placeholder="Enter confirmation code"
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
