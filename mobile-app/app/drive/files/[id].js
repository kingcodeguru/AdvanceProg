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
import * as api from '../../../utilities/api'; 

// 1. Import Theme Hook and Data
import { useTheme } from '../../../utilities/ThemeContext';
import Themes from '../../../styles/themes';

const PRESET_COLORS = [
    "#000000", "#434343", "#666666", "#999999", "#cccccc", "#efefef",
    "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", 
    "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"
];

export default function TextEditor() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); 
    const richText = useRef(); 

    // 2. Get Theme
    const { isDarkMode } = useTheme();
    const theme = Themes[isDarkMode ? 'dark' : 'light'];

    // --- State ---
    const [htmlContent, setHtmlContent] = useState('');
    const [fileName, setFileName] = useState("Loading...");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const [showColorPicker, setShowColorPicker] = useState(false);
    const [currentColor, setCurrentColor] = useState("#000000");

    // --- Load Data ---
    useEffect(() => {
        const loadFile = async () => {
            try {
                const response = await api.getFileById(id);
                if (response.ok) {
                    const data = await response.json();
                    setFileName(data.name || "Untitled");
                    setHtmlContent(data.content || ""); 
                    const role = await api.getRole(id);
                    if (role === 0) setIsReadOnly(true);
                } else {
                    Alert.alert("Error", "Failed to load file content.");
                    router.back();
                }
            } catch (error) {
                console.error("Error loading file:", error);
                Alert.alert("Error", "Could not connect to server.");
            } finally {
                setIsLoading(false);
            }
        };
        loadFile();
    }, [id]);

    // --- Save Data ---
    const handleSave = async () => {
        if (isReadOnly) return;
        setIsSaving(true);
        try {
            const contentToSave = await richText.current.getContentHtml();
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
            setIsSaving(false);
        }
    };

    // --- Helpers ---
    const handleColorChange = (color) => {
        setCurrentColor(color);
        richText.current?.focusContentEditor(); 
        richText.current?.setForeColor(color); 
        setShowColorPicker(false); 
    };

    const handleDismissKeyboard = () => {
        richText.current?.blurContentEditor(); 
        Keyboard.dismiss(); 
    };

    if (isLoading) {
        return (
            // Dynamic Background
            <View style={[styles.loadingContainer, { backgroundColor: theme.bgMain }]}>
                <ActivityIndicator size="large" color={theme.brandBlue} />
                <Text style={{ marginTop: 10, color: theme.textSecondary }}>Opening document...</Text>
            </View>
        );
    }

    return (
        // Dynamic Background for Safe Area
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgMain }]}>
            <StatusBar 
                barStyle={isDarkMode ? "light-content" : "dark-content"} 
                backgroundColor={theme.bgMain} 
            />
            
            {/* --- Header Section --- */}
            <View style={[styles.header, { backgroundColor: theme.bgMain, borderBottomColor: theme.borderSubtle }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.textMain} />
                </TouchableOpacity>
                
                <Text style={[styles.fileName, { color: theme.textMain }]} numberOfLines={1}>
                    {fileName}
                    {isReadOnly && <Text style={{fontSize: 12, color: theme.textSecondary }}> (Read Only)</Text>}
                </Text>

                {/* Save Button */}
                {!isReadOnly && (
                    <TouchableOpacity 
                        // Dynamic Save Button Colors
                        style={[
                            styles.saveBtn, 
                            { backgroundColor: isDarkMode ? theme.brandBlue : '#C2E7FF' },
                            isSaving && { opacity: 0.7 }
                        ]} 
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={isDarkMode ? theme.bgMain : "#001D35"} />
                        ) : (
                            <Text style={[styles.saveBtnText, { color: isDarkMode ? theme.bgMain : "#001D35" }]}>
                                Save
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* --- Editor & Toolbar Section --- */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={[styles.container, { backgroundColor: theme.bgMain }]}
            >
                {/* Toolbar */}
                {!isReadOnly && (
                    <View style={[styles.toolbarContainer, { backgroundColor: theme.bgMain, borderBottomColor: theme.borderSubtle }]}>
                        <RichToolbar
                            editor={richText}
                            selectedIconTint={theme.brandBlue} 
                            iconTint={theme.textMain} 
                            style={[styles.richToolbar, { backgroundColor: theme.bgMain }]}
                            actions={[
                                actions.undo, actions.redo, actions.setBold, actions.setItalic,
                                actions.setUnderline, actions.insertBulletsList, actions.insertOrderedList,
                                actions.alignLeft, actions.alignCenter, actions.alignRight,
                                'customColorPicker', actions.keyboard,
                            ]}
                            iconMap={{
                                customColorPicker: ({tintColor}) => (
                                    <MaterialIcons name="format-color-text" size={20} color={currentColor} />
                                ),
                                [actions.keyboard]: ({tintColor}) => (
                                    <MaterialIcons name="keyboard-hide" size={20} color={tintColor} />
                                ),
                            }}
                            onPressAddImage={() => {}} 
                            customColorPicker={() => {
                                Keyboard.dismiss(); 
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
                            initialContentHTML={htmlContent} 
                            placeholder={isReadOnly ? "" : "Start typing..."}
                            disabled={isReadOnly}
                            // --- CRITICAL: Pass Theme Colors to WebView Editor ---
                            editorStyle={{
                                backgroundColor: theme.bgPrimary, // White (Light) vs DarkGray (Dark)
                                color: theme.textMain,            // Black (Light) vs White (Dark)
                                placeholderColor: theme.textSecondary,
                                contentCSSText: `font-size: 16px; line-height: 24px; min-height: 600px; color: ${theme.textMain};`,
                            }}
                            style={[styles.richEditor, { backgroundColor: theme.bgPrimary }]}
                            useContainer={false} 
                        />
                    </View>
                </ScrollView>

                {/* --- Color Picker Modal --- */}
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
                        {/* Dynamic Modal Background */}
                        <View style={[styles.colorPopup, { backgroundColor: theme.bgForm }]}>
                            <Text style={[styles.modalTitle, { color: theme.textMain }]}>Select Color</Text>
                            <View style={styles.colorGrid}>
                                {PRESET_COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorSwatch, 
                                            { backgroundColor: color, borderColor: theme.borderSubtle },
                                            currentColor === color && [styles.selectedSwatch, { borderColor: theme.textMain }]
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
        // backgroundColor handled inline
    },
    container: {
        flex: 1,
        // backgroundColor handled inline
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 50,
        borderBottomWidth: 1,
        // Colors handled inline
    },
    iconButton: { padding: 8 },
    fileName: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        marginLeft: 12,
        textAlign: 'center',
    },
    saveBtn: {
        // backgroundColor handled inline
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 60,
        alignItems: 'center',
    },
    saveBtnText: {
        fontWeight: '600',
        fontSize: 14,
        // color handled inline
    },
    toolbarContainer: {
        borderBottomWidth: 1,
        height: 50,
        justifyContent: 'center',
        // Colors handled inline
    },
    richToolbar: {
        // Colors handled inline
    },
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorPopup: {
        padding: 20,
        borderRadius: 16,
        width: 320,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        // backgroundColor handled inline
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        // color handled inline
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
    },
    colorSwatch: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        // borderColor handled inline
    },
    selectedSwatch: {
        borderWidth: 3,
        transform: [{ scale: 1.1 }]
    }
});