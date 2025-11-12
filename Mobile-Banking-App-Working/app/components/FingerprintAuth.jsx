import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const FingerprintAuth = ({ onSuccess }) => {
    const handleBiometricAuth = async () => {
        try {
            const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();
            if (!isBiometricAvailable) return;

            const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
            if (!savedBiometrics) return;

            const biometricAuth = await LocalAuthentication.authenticateAsync({
                promptMessage: "Authenticate",
                cancelLabel: "Cancel",
                disableDeviceFallback: true,
            });

            if (biometricAuth.success && onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Biometric authentication error:", error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleBiometricAuth} style={styles.authButton}>
                <Icon name="fingerprint" size={50} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    authButton: {
        padding: 16,
        backgroundColor: "#2563eb",
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        elevation: 8,
    },
});

export default FingerprintAuth;
