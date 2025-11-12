import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { Buffer } from 'buffer';

const VoiceToTextTransfer = ({ onSpeechResult }) => {
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

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
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
            console.log('Recording stopped at', uri);

            await sendToAssemblyAI(uri);
        } catch (err) {
            console.error('Failed to stop recording', err);
            Alert.alert('Recording Error', 'Failed to stop recording.');
        }
    };

    const sendToAssemblyAI = async (uri) => {
        setIsLoading(true);

        try {
            const fileData = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const binaryData = Buffer.from(fileData, 'base64');

            const uploadResponse = await axios.post(
                'https://api.assemblyai.com/v2/upload',
                binaryData,
                {
                    headers: {
                        authorization: '3374c0b1d2344366a5632fe080533b45',
                        'Content-Type': 'application/octet-stream',
                    },
                }
            );

            const audioUrl = uploadResponse.data.upload_url;

            const transcriptResponse = await axios.post(
                'https://api.assemblyai.com/v2/transcript',
                { audio_url: audioUrl },
                {
                    headers: {
                        authorization: '3374c0b1d2344366a5632fe080533b45',
                        'Content-Type': 'application/json',
                    },
                }
            );

            const transcriptId = transcriptResponse.data.id;
            await pollTranscriptionStatus(transcriptId);
        } catch (error) {
            console.error('AssemblyAI error:', error.response?.data || error.message);
            setIsLoading(false);
        }
    };

    const pollTranscriptionStatus = async (transcriptId) => {
        try {
            let completed = false;
            let transcriptionText = '';

            while (!completed) {
                const pollingResponse = await axios.get(
                    `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                    {
                        headers: { authorization: '3374c0b1d2344366a5632fe080533b45' },
                    }
                );

                if (pollingResponse.data.status === 'completed') {
                    completed = true;
                    transcriptionText = pollingResponse.data.text;
                } else if (pollingResponse.data.status === 'failed') {
                    completed = true;
                    transcriptionText = '';
                } else {
                    console.log('Waiting for transcription...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }

            console.log('Final Transcribed Text:', transcriptionText);

            if (transcriptionText && onSpeechResult) {
                onSpeechResult(transcriptionText);
            }
        } catch (error) {
            console.error('Polling error:', error.response?.data || error.message);
        }
        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={isRecording ? stopRecording : startRecording}
            >
                <Text style={styles.buttonText}>
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
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

export default VoiceToTextTransfer;
