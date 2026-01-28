import React, { useState } from 'react';
import { 
    View, Text, Modal, StyleSheet, TouchableOpacity, 
    Pressable, TextInput, Alert, ScrollView, Platform, TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../../utilities/api'; // Adjust path
import { useRefresh } from '../../context/RefreshContext';
import SidebarButton from './SidebarButton';

export default function Sidebar({ visible, onClose }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { triggerRefresh } = useRefresh();
    
    // --- Input Modal State (For naming files/folders) ---
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [inputType, setInputType] = useState(''); // 'folder' or 'text'

    const menuItems = [
        'Home', 'My Drive', 'Shared with me', 'Recent', 'Starred', 'Trash'
    ];

    // --- Helpers ---
    const getCurrentDir = async () => {
        return await AsyncStorage.getItem('currentDir') || null;
    };

    const sendToFileAPI = async (payload) => {
        try {
            const response = await api.postFiledir(payload);
            if (response.ok || response.status === 201) return true;
        } catch (err) {
            console.error("API Error:", err);
            Alert.alert("Error", "Action failed");
        }
        return false;
    };

    // --- Actions ---

    // 1. Prepare Input for Folder/Text
    const initiateCreate = (type) => {
        setIsDropdownOpen(false); // Close "New" menu
        // We need a small delay/timeout if we are closing the sidebar modal
        // But here we keep sidebar open, just open input modal on top
        setInputType(type);
        setInputValue('');
        setInputVisible(true);
    };

    // 2. Submit Creation
    const handleCreateSubmit = async () => {
        if (!inputValue.trim()) return;
        
        const parentId = await getCurrentDir();
        const isFile = inputType === 'text';
        
        await sendToFileAPI({
            name: inputValue,
            is_file: isFile,
            content: isFile ? "" : undefined,
            parent_id: parentId,
            type: isFile ? "text" : undefined
        });

        setInputVisible(false);
        triggerRefresh();
        onClose(); // Close sidebar after success
    };

    // 3. Upload Logic
    const handleUpload = async (type) => {
        setIsDropdownOpen(false);
        const parentId = await getCurrentDir();

        try {
            if (type === 'image') {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    base64: true,
                    quality: 0.7,
                });

                if (!result.canceled) {
                    const asset = result.assets[0];
                    await sendToFileAPI({
                        name: asset.fileName || "image.jpg",
                        is_file: true,
                        content: `data:image/jpeg;base64,${asset.base64}`,
                        parent_id: parentId,
                        type: "image"
                    });
                    triggerRefresh();
                    onClose();
                }
            } else {
                // Text/Doc upload
                const result = await DocumentPicker.getDocumentAsync({
                    type: ['text/*', 'application/json', 'text/javascript'],
                    copyToCacheDirectory: true
                });

                if (result.assets && result.assets.length > 0) {
                    const file = result.assets[0];
                    // Note: Ensure you have expo-file-system to read content
                    const FileSystem = require('expo-file-system');
                    const content = await FileSystem.readAsStringAsync(file.uri);

                    await sendToFileAPI({
                        name: file.name,
                        is_file: true,
                        content: content,
                        parent_id: parentId,
                        type: "text"
                    });
                    triggerRefresh();
                    onClose();
                }
            }
        } catch (e) {
            console.log("Upload error", e);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Clicking outside closes the sidebar */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                {/* Main Sidebar Content */}
                <View style={styles.sidebarContainer}>
                    <View style={styles.headerSpacer} />
                    
                    {/* Brand / Logo Area */}
                    <Text style={styles.brandTitle}>LOT Drive</Text>

                    {/* Navigation Items */}
                    <ScrollView style={styles.navContainer}>
                        {menuItems.map((item) => (
                            <SidebarButton 
                                key={item} 
                                label={item} 
                                onPress={onClose} 
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Custom Input Modal for Creating Files/Folders */}
                {inputVisible && (
                    <Modal transparent visible={inputVisible} animationType="fade">
                        <View style={styles.inputModalOverlay}>
                            <View style={styles.inputModalContent}>
                                <Text style={styles.inputTitle}>
                                    New {inputType === 'folder' ? 'Folder' : 'Text File'}
                                </Text>
                                <TextInput 
                                    style={styles.inputField}
                                    placeholder="Enter name"
                                    value={inputValue}
                                    onChangeText={setInputValue}
                                    autoFocus
                                />
                                <View style={styles.inputActions}>
                                    <TouchableOpacity onPress={() => setInputVisible(false)}>
                                        <Text style={styles.btnCancel}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleCreateSubmit}>
                                        <Text style={styles.btnCreate}>Create</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sidebarContainer: {
        width: '80%',
        maxWidth: 300,
        backgroundColor: '#fff',
        height: '100%',
        paddingTop: 20,
        elevation: 10, // Shadow Android
        shadowColor: '#000', // Shadow iOS
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.2,
    },
    headerSpacer: { height: Platform.OS === 'ios' ? 40 : 10 },
    brandTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#444',
        marginLeft: 24,
        marginBottom: 20,
    },
    newButtonWrapper: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    btnNew: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        // Material Shadow
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        alignSelf: 'flex-start',
    },
    btnNewText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#3c4043',
    },
    dropdownContainer: {
        backgroundColor: '#f8f9fa',
        marginHorizontal: 16,
        borderRadius: 8,
        paddingVertical: 8,
        marginBottom: 16,
        elevation: 2,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        gap: 12,
    },
    dropdownText: {
        fontSize: 14,
        color: '#3c4043',
    },
    divider: {
        height: 1,
        backgroundColor: '#dadce0',
        marginVertical: 4,
    },
    navContainer: {
        flex: 1,
    },
    // Input Modal
    inputModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputModalContent: {
        width: 280,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 20,
    },
    inputTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    inputField: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        fontSize: 16,
        marginBottom: 20,
    },
    inputActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 20,
    },
    btnCancel: { color: '#1a73e8', fontWeight: '600' },
    btnCreate: { color: '#1a73e8', fontWeight: '600' },
});