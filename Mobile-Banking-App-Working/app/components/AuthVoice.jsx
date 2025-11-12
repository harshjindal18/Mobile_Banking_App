import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useGlobalStore } from "../../context/globalStore";

const AuthVoice = () => {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user } = useGlobalStore(); // Assuming 'user' has the username

    const startRecording = async () => {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync({
                android: {
                    extension: '.m4a',
                    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
                    audioEncoder: Audio.AndroidAudioEncoder.AAC,
                    sampleRate: 44100,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.m4a',
                    audioQuality: Audio.IOSAudioQuality.MAX,
                    sampleRate: 44100,
                    numberOfChannels: 1,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                isMeteringEnabled: true,
            });

            await newRecording.startAsync();
            setRecording(newRecording);
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Recording Error', 'Failed to start recording.');
        }
    };

    const stopRecording = async () => {
        try {
            setIsRecording(false);
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            console.log('Recording stopped. File stored at:', uri);

            const info = await FileSystem.getInfoAsync(uri);
            console.log('Recorded file info:', info);

            await sendAudioToServer(uri);
        } catch (err) {
            console.error('Failed to stop recording', err);
            Alert.alert('Recording Error', 'Failed to stop recording.');
        }
    };

    const sendAudioToServer = async (uri) => {
        setIsLoading(true);

        try {
            const formData = new FormData();

            formData.append('file', {
                uri: uri.startsWith('file://') ? uri : 'file://' + uri,
                name: 'voice_auth.m4a', // Name it .m4a
                type: 'audio/m4a',      // Correct MIME type
            });

            formData.append('user', "yash"); // Correctly send user name

            const response = await axios.post(
                'https://voiceauth.onrender.com/authenticate',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Server Response:', response.data);
            handleServerResponse(response.data);

        } catch (error) {
            console.error('Error sending audio:', error.message);
            if (error.response) {
                console.log('Server responded with:', error.response.data);
            }
            Alert.alert('Error', 'Failed to authenticate voice.');
        }

        setIsLoading(false);
    };

    const handleServerResponse = (data) => {
        if (data.authenticated) {
            Alert.alert('Authentication Success', `Welcome ${user.username}!`);
            router.push('/Transfer');
        } else {
            Alert.alert('Authentication Failed', data.message || 'Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isRecording ? 'Stop Recording' : isLoading ? 'Processing...' : 'Start Recording'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 0,
        flex: 0,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#0066cc',
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        height: 60,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
    },
});

export default AuthVoice;
