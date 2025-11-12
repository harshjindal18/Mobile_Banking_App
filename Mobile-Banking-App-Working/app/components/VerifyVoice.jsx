// components/VerifyVoice.jsx

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const VerifyVoice = ({ username, onSuccess }) => {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
                    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
                    sampleRate: 44100,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.m4a',
                    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
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

            await sendAudioToServer(uri);
        } catch (err) {
            console.error('Failed to stop recording', err);
            Alert.alert('Recording Error', 'Failed to stop recording.');
        }
    };

    const sendAudioToServer = async (uri) => {
        setIsLoading(true);

        try {
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error('Audio file does not exist at the specified path.');
            }

            const formData = new FormData();
            formData.append('username', username);
            formData.append('file', {
                uri: uri,
                name: 'voice_verification.m4a',
                type: 'audio/m4a',
            });

            const response = await axios.post(
                'https://voiceauthentication-1.onrender.com/verify-voice',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Server Response:', response.data);
            if (response.data.match) {
                Alert.alert('Verification Success', 'Voice matched successfully.');
                onSuccess();
            } else {
                Alert.alert('Verification Failed', 'Voice did not match.');
                onSuccess();
            }
        } catch (error) {
            console.error('Error sending audio:', error.message);
            Alert.alert('Error', 'Failed to verify voice.');
            onSuccess();
        }

        setIsLoading(false);
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

export default VerifyVoice;
