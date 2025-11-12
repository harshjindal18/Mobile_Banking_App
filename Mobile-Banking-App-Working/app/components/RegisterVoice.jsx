import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const RegisterVoice = ({ username }) => {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recordings, setRecordings] = useState([]);

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

            const fileName = `sample_${Date.now()}.m4a`;
            const newPath = FileSystem.documentDirectory + fileName;

            await FileSystem.moveAsync({
                from: uri,
                to: newPath,
            });

            console.log('File moved to:', newPath);
            setRecordings((prev) => [...prev, newPath]);
            setRecording(null);
        } catch (err) {
            console.error('Failed to stop recording', err);
            Alert.alert('Recording Error', 'Failed to stop recording.');
        }
    };

    const registerUser = async () => {
        if (recordings.length < 5) {
            Alert.alert('Insufficient Recordings', 'Please record at least 5 samples.');
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('username', username);

        recordings.forEach((uri, index) => {
            formData.append(`file${index + 1}`, {
                uri,
                name: `sample${index + 1}.m4a`,
                type: 'audio/m4a',
            });
        });

        try {
            const response = await axios.post(
                'https://voiceauthentication-1.onrender.com/register-user',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            console.log('Register Response:', response.data);
            Alert.alert('Registration Success', 'Your voice has been registered.');
        } catch (error) {
            console.error('Error during registration:', error.message);
            Alert.alert('Registration Error', 'Failed to register your voice.');
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
            <TouchableOpacity
                style={styles.button}
                onPress={registerUser}
                disabled={isLoading || recordings.length < 5}
            >
                <Text style={styles.buttonText}>Register Voice</Text>
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
        marginVertical: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
    },
});

export default RegisterVoice;
