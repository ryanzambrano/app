
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  "https://jaupbyhwvfulpvkfxmgm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdXBieWh3dmZ1bHB2a2Z4bWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODQ2MDM4MzUsImV4cCI6MjAwMDE3OTgzNX0.ng3kxKK2ZGkWtl2xkbaFoTqclkeTFNCr_Ca3e4O1tGc"
)

// Example: Querying data from a table
async function getUsers() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Users:', data);
  }
}

// Example: Inserting data into a table
async function insertUser(user) {
  const { data, error } = await supabase.from('profiles').insert([user]);
  if (error) {
    console.error('Error inserting user:', error);
  } else {
    console.log('User inserted successfully:', data);
  }
}

async function signupUser(email, password) {
  try {
    // Sign up a user with email and password
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error signing up user:', error.message);
      return;
    }

    console.log('User signed up successfully:', user);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function signInWithEmail(email, password) {
  setLoading(true)
  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })

  if (error) Alert.alert(error.message)
  setLoading(false)
}



// Call the function to signup a user
//signupUser('example@example.com', 'password');
// Call the functions or other Supabase methods as needed
//getUsers();
//insertUser({ name: 'John', age: 25 });

