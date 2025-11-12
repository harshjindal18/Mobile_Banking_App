import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../../constants";
import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../utility/firebaseConfig";
import Loader from "../../components/Loader";
import { useGlobalStore } from "../../context/globalStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from 'expo-speech';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ phone: "", password: "" });
    const { setUser } = useGlobalStore();

    // Read screen options aloud on mount
    useEffect(() => {
        Speech.speak("Welcome to the login page. Tap anywhere to hear options. You can say Login to sign in.");
    }, []);

    async function handleLogin() {
        if (!form.phone || !form.password) {
            Speech.speak("Please fill all fields.");
            Alert.alert('Error', 'Please fill all the fields');
            return;
        }

        if (!/^\d{10}$/.test(form.phone)) {
            Speech.speak("Please enter a valid 10 digit account number.");
            Alert.alert('Error', 'Please enter a valid 10 digit account number');
            return;
        }

        try {
            setLoading(true);
            const q = query(collection(db, "users"), where("accountNumber", "==", form.phone));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                throw new Error('No user found with this account number');
            }
            const userDoc = querySnapshot.docs[0];
            const email = userDoc.data().email;

            const credential = await signInWithEmailAndPassword(auth, email, form.password);
            const user = auth.currentUser;
            if (user.emailVerified) {
                setUser(credential.user);
                await AsyncStorage.setItem('userAuth', JSON.stringify(credential.user));
                router.replace('/Home');
                Speech.speak("Login successful. Redirecting to home page.");
            } else {
                Speech.speak("Email not verified. Please check your inbox.");
                Alert.alert('Error', 'Email not verified. Please check your inbox.');
            }

        } catch (error) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    }

    const handleAuthError = (error) => {
        let message = "An error occurred";
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
                message = "Invalid password";
                break;
            case 'auth/user-disabled':
                message = "Your account has been disabled";
                break;
            case 'auth/too-many-requests':
                message = "Too many login attempts. Try again later.";
                break;
            default:
                message = error.message;
        }
        Speech.speak(message);
        Alert.alert("Error", message);
    };

    return (
        <SafeAreaView className="bg-primary h-full w-full justify-center px-3">
            {loading && <Loader />}

            <TouchableOpacity onPress={() => Speech.speak("Enter account number, then enter password, and press login.")}>
                <View className="w-full justify-center items-center mt-7">
                    <Text className="text-2xl font-pbold text-secondary" accessible={true} accessibilityLabel="Welcome">Welcome</Text>
                    <Text className="text-gray-200 text-lg">Login to get started</Text>
                </View>
            </TouchableOpacity>

            <View className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                <Image className="w-6 h-6" source={icons.phone} resizeMode="contain" />
                <TextInput
                    onChangeText={(e) => setForm({ ...form, phone: e })}
                    className="flex-1 font-pmedium ml-2"
                    placeholder="Account number"
                    keyboardType="numeric"
                    accessible={true}
                    accessibilityLabel="Account number input field"
                />
            </View>

            <View className="mt-6 rounded-3xl border-2 border-[#E7E7E7] flex-row items-center w-full h-[56px] px-4">
                <Image className="w-6 h-6" source={icons.lock} resizeMode="contain" />
                <TextInput
                    onChangeText={(e) => setForm({ ...form, password: e })}
                    className="flex-1 font-pmedium ml-2"
                    placeholder="Password"
                    keyboardType="default"
                    secureTextEntry={!showPassword}
                    accessible={true}
                    accessibilityLabel="Password input field"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Image
                        source={!showPassword ? icons.eye : icons.eyeHide}
                        className="w-6 h-6"
                        resizeMode="contain"
                        accessible={true}
                        accessibilityLabel={!showPassword ? "Show password" : "Hide password"}
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={handleLogin}
                className="bg-secondary mt-5 flex-row p-3 rounded-full items-center justify-center"
                accessible={true}
                accessibilityLabel="Login button"
            >
                <Text className="ml-3 text-lg text-white items-center justify-center">Login</Text>
            </TouchableOpacity>

            <View className="w-full justify-end items-center pt-3 flex-row">
                <Text className="font-pregular text-gray-200">Don't have an account? </Text>
                <Link href="/Register" className="text-lg text-secondary mx-2" accessible={true} accessibilityLabel="Register now">Register</Link>
            </View>
        </SafeAreaView>
    );
}

export default Login;