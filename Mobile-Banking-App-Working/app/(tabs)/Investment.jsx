import React from 'react'
import { View, Text } from "react-native";
import FingerprintAuth from '../components/FingerprintAuth';
import AuthVoice from '../components/AuthVoice'


const Investment = () => {
    const handleAuthSuccess = () => {
        console.log("User authenticated!");
        // Navigate to Home screen or perform any action
    };
    return (
        <View className="flex-1">
            <AuthVoice />
        </View>
    )
}
export default Investment
