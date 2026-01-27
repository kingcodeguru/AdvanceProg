import React, { useRef, useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    Alert,
    ScrollView,
    Modal,
    Keyboard,
    ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
// Import the API helper to communicate with the backend
import * as api from '../../../utilities/api'; 

// Preset colors matching the Web App for consistency
const PRESET_COLORS = [
    "#000000", "#434343", "#666666", "#999999", "#cccccc", "#efefef",
    "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", 
    "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"
];

export default function TextEditor() {
    const router = useRouter();
    // Get the file ID from the URL params
    const { id } = useLocalSearchParams(); 
    // Reference to the editor component to control it (get HTML, set focus, etc.)
    const richText = useRef(); 

    // --- State Management ---
    const [htmlContent, setHtmlContent] = useState(''); // Stores the actual HTML
    const [fileName, setFileName] = useState("Loading...");
    const [isLoading, setIsLoading] = useState(true); // Show spinner while fetching
    const [isSaving, setIsSaving] = useState(false);  // Show spinner while saving
    const [isReadOnly, setIsReadOnly] = useState(false); // If true, user can't edit

    // Color Picker UI State
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [currentColor, setCurrentColor] = useState("#000000");

    // --- 1. Load Data from Server ---
    useEffect(() => {
        const loadFile = async () => {
            try {
                // Fetch file details (content, name)
                const response = await api.getFileById(id);
                
                if (response.ok) {
                    const data = await response.json();
                    setFileName(data.name || "Untitled");
                    // Use empty string if content is null to prevent crashes
                    setHtmlContent(data.content || ""); 
                    
                    // Check permissions: If role is 0, it means "Viewer" (Read Only)
                    const role = await api.getRole(id);
                    if (role === 0) {
                        setIsReadOnly(true);
                    }
                } else {
                    Alert.alert("Error", "Failed to load file content.");
                    router.back(); // Go back if we can't load the file
                }
            } catch (error) {
                console.error("Error loading file:", error);
                Alert.alert("Error", "Could not connect to server.");
            } finally {
                setIsLoading(false); // Hide the main loading spinner
            }
        };

        loadFile();
    }, [id]);

    // --- 2. Save Data to Server ---
    const handleSave = async () => {
        // Double check: don't save if read-only
        if (isReadOnly) return;
        
        setIsSaving(true);
        try {
            // Extract the HTML string from the editor
            const contentToSave = await richText.current.getContentHtml();
            
            // Send PATCH request to update the file content
            // We send it as an object { content: ... } to match the Web API structure
            const response = await api.patchFile(id, { content: contentToSave });

            if (response.ok) {
                Alert.alert("Success", "File saved successfully");
            } else {
                Alert.alert("Error", "Failed to save file.");
            }
        } catch (error) {
            console.error("Save error:", error);
            Alert.alert("Error", "Network error while saving.");
        } finally {
            setIsSaving(false); // Hide the saving spinner
        }
    };

    // --- Helper Functions ---

    // Change text color and close the modal
    const handleColorChange = (color) => {
        setCurrentColor(color);
        // We must focus the editor first, otherwise the color won't apply to the selection
        richText.current?.focusContentEditor(); 
        richText.current?.setForeColor(color); 
        setShowColorPicker(false); 
    };

    // Close the keyboard manually (used by the custom toolbar button)
    const handleDismissKeyboard = () => {
        richText.current?.blurContentEditor(); 
        Keyboard.dismiss(); 
    };

    // --- Render Loading State ---
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0b57d0" />
                <Text style={{ marginTop: 10, color: '#555' }}>Opening document...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FBFD" />
            
            {/* --- Header Section --- */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#444" />
                </TouchableOpacity>
                
                <Text style={styles.fileName} numberOfLines={1}>
                    {fileName}
                    {isReadOnly && <Text style={{fontSize: 12, color: '#666'}}> (Read Only)</Text>}
                </Text>

                {/* Save Button: Only visible if user has edit permissions */}
                {!isReadOnly && (
                    <TouchableOpacity 
                        style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#001D35" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* --- Editor & Toolbar Section --- */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                {/* Toolbar: Hidden in Read-Only mode */}
                {!isReadOnly && (
                    <View style={styles.toolbarContainer}>
                        <RichToolbar
                            editor={richText}
                            selectedIconTint="#0b57d0" // Blue for active tools
                            iconTint="#444" // Gray for inactive tools
                            style={styles.richToolbar}
                            actions={[
                                actions.undo,
                                actions.redo,
                                actions.setBold,
                                actions.setItalic,
                                actions.setUnderline,
                                actions.insertBulletsList,
                                actions.insertOrderedList,
                                actions.alignLeft,
                                actions.alignCenter,
                                actions.alignRight,
                                'customColorPicker', // Custom action key
                                actions.keyboard,    // Custom action key
                            ]}
                            // Map custom keys to icons
                            iconMap={{
                                customColorPicker: ({tintColor}) => (
                                    <MaterialIcons name="format-color-text" size={20} color={currentColor} />
                                ),
                                [actions.keyboard]: ({tintColor}) => (
                                    <MaterialIcons name="keyboard-hide" size={20} color={tintColor} />
                                ),
                            }}
                            // Define what happens when custom buttons are pressed
                            onPressAddImage={() => {}} // Disable image button
                            customColorPicker={() => {
                                Keyboard.dismiss(); // Hide keyboard to show modal clearly
                                setShowColorPicker(true);
                            }}
                            onPressKeyboard={handleDismissKeyboard}
                        />
                    </View>
                )}

                <ScrollView contentContainerStyle={styles.editorScroll} keyboardShouldPersistTaps="handled">
                    <View style={[styles.paperShadow, isReadOnly && styles.readOnlyPaper]}>
                        <RichEditor
                            ref={richText}
                            initialContentHTML={htmlContent} // Load the content fetched from server
                            placeholder={isReadOnly ? "" : "Start typing..."}
                            disabled={isReadOnly} // Disable editing if read-only
                            editorStyle={{
                                backgroundColor: isReadOnly ? '#fafafa' : '#ffffff',
                                color: '#000000',
                                contentCSSText: 'font-size: 16px; line-height: 24px; min-height: 600px;',
                            }}
                            style={styles.richEditor}
                            useContainer={false} // Needed for proper scrolling inside ScrollView
                        />
                    </View>
                </ScrollView>

                {/* --- Custom Color Picker Modal --- */}
                <Modal
                    visible={showColorPicker}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowColorPicker(false)}
                >
                    <TouchableOpacity 
                        style={styles.modalOverlay} 
                        activeOpacity={1} 
                        onPress={() => setShowColorPicker(false)}
                    >
                        <View style={styles.colorPopup}>
                            <Text style={styles.modalTitle}>Select Color</Text>
                            <View style={styles.colorGrid}>
                                {PRESET_COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorSwatch, 
                                            { backgroundColor: color },
                                            currentColor === color && styles.selectedSwatch
                                        ]}
                                        onPress={() => handleColorChange(color)}
                                    />
                                ))}
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FBFD',
    },
    container: {
        flex: 1,
        backgroundColor: '#F0F2F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // --- Header Styles ---
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 50,
        backgroundColor: '#F9FBFD',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    iconButton: { padding: 8 },
    fileName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f1f1f',
        flex: 1,
        marginLeft: 12,
        textAlign: 'center',
    },
    saveBtn: {
        backgroundColor: '#C2E7FF',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 60,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#001D35',
        fontWeight: '600',
        fontSize: 14,
    },
    // --- Toolbar Styles ---
    toolbarContainer: {
        backgroundColor: '#F9FBFD',
        borderBottomWidth: 1,
        borderBottomColor: '#dadce0',
        height: 50,
        justifyContent: 'center',
    },
    richToolbar: {
        backgroundColor: '#F9FBFD',
    },
    // --- Editor Styles ---
    editorScroll: {
        padding: 16,
        flexGrow: 1,
    },
    paperShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        backgroundColor: 'transparent',
        minHeight: 600,
    },
    readOnlyPaper: {
        opacity: 0.9, 
    },
    richEditor: {
        minHeight: 600,
        borderRadius: 2,
    },
    // --- Color Modal Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorPopup: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        width: 320,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
    },
    // Fixed size swatches to ensure they are always round circles
    colorSwatch: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#eee',
    },
    selectedSwatch: {
        borderWidth: 3,
        borderColor: '#444',
        transform: [{ scale: 1.1 }]
    }
});