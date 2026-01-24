import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    ActivityIndicator,
    Modal,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../../utilities/api'; 

const PRESET_COLORS = [
    "#000000", "#434343", "#666666", "#999999", "#cccccc", "#efefef",
    "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", 
    "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"
];

export default function TextEditor() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // --- State Management ---
    const [content, setContent] = useState('');
    const [fileName, setFileName] = useState("Loading...");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Permission State
    const [isReadOnly, setIsReadOnly] = useState(false);

    // UI States
    const [fontSize, setFontSize] = useState(16);
    const [currentColor, setCurrentColor] = useState("#000000");
    const [showColorPicker, setShowColorPicker] = useState(false);
    
    const [activeFormats, setActiveFormats] = useState({
        bold: false, italic: false, underline: false, align: 'left'
    });

    // --- Undo/Redo Logic ---
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const typingTimeoutRef = useRef(null);

    const saveToHistory = (newContent, newFormats, newColor, newSize) => {
        const snapshot = {
            content: newContent !== undefined ? newContent : content,
            formats: newFormats !== undefined ? newFormats : activeFormats,
            color: newColor !== undefined ? newColor : currentColor,
            fontSize: newSize !== undefined ? newSize : fontSize
        };

        setHistory(prev => {
            const currentHistory = prev.slice(0, historyIndex + 1);
            return [...currentHistory, snapshot];
        });
        setHistoryIndex(prev => prev + 1);
    };

    // --- Data Loading ---
    useEffect(() => {
        const initEditor = async () => {
            try {
                // 1. Fetch File Content
                const fileResponse = await api.getFileById(id);
                
                if (fileResponse.ok) {
                    const data = await fileResponse.json();
                    const loadedContent = data.content || ""; 
                    
                    setContent(loadedContent);
                    setFileName(data.name || "Untitled");

                    // 2. Fetch Permissions (Role)
                    const role = await api.getRole(id);
                    
                    // If role is 0 (Viewer) -> Read Only
                    if (role === 0) {
                        setIsReadOnly(true);
                    } else {
                        setIsReadOnly(false);
                    }

                    // Initialize History
                    const initialSnapshot = {
                        content: loadedContent,
                        formats: { bold: false, italic: false, underline: false, align: 'left' },
                        color: "#000000",
                        fontSize: 16
                    };
                    setHistory([initialSnapshot]);
                    setHistoryIndex(0);

                } else {
                    Alert.alert("Error", "Could not load file. Status: " + fileResponse.status);
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Connection Error", "Check API_IP in utilities/api.js");
            } finally {
                setIsLoading(false);
            }
        };

        initEditor();
    }, [id]);

    // --- Handlers ---

    const handleContentChange = (newText) => {
        if (isReadOnly) return;

        let processedText = newText;
        // Smart List Logic
        if (newText.length > content.length && newText.endsWith('\n')) {
            const lines = newText.split('\n');
            const prevLine = lines[lines.length - 2];
            if (prevLine) {
                const numberMatch = prevLine.match(/^(\d+)\.\s/);
                const bulletMatch = prevLine.match(/^•\s/);
                if (numberMatch) processedText += `${parseInt(numberMatch[1]) + 1}. `;
                else if (bulletMatch) processedText += `• `;
            }
        }
        setContent(processedText);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            saveToHistory(processedText, undefined, undefined, undefined);
        }, 500);
    };

    const handleUndo = () => {
        if (isReadOnly) return;
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const snapshot = history[newIndex];
            setHistoryIndex(newIndex);
            setContent(snapshot.content);
            setActiveFormats(snapshot.formats);
            setCurrentColor(snapshot.color);
            setFontSize(snapshot.fontSize);
        }
    };

    const handleRedo = () => {
        if (isReadOnly) return;
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const snapshot = history[newIndex];
            setHistoryIndex(newIndex);
            setContent(snapshot.content);
            setActiveFormats(snapshot.formats);
            setCurrentColor(snapshot.color);
            setFontSize(snapshot.fontSize);
        }
    };

    const changeFontSize = (step) => {
        if (isReadOnly) return;
        const newSize = Math.max(12, Math.min(fontSize + step * 2, 30));
        setFontSize(newSize);
        saveToHistory(undefined, undefined, undefined, newSize);
    };

    const toggleFormat = (format) => {
        if (isReadOnly) return;
        const newFormats = { ...activeFormats, [format]: !activeFormats[format] };
        setActiveFormats(newFormats);
        saveToHistory(undefined, newFormats, undefined, undefined);
    };

    const setAlignment = (alignment) => {
        if (isReadOnly) return;
        const newFormats = { ...activeFormats, align: alignment };
        setActiveFormats(newFormats);
        saveToHistory(undefined, newFormats, undefined, undefined);
    };

    const changeColor = (color) => {
        if (isReadOnly) return;
        setCurrentColor(color);
        setShowColorPicker(false);
        saveToHistory(undefined, undefined, color, undefined);
    };

    const addListPrefix = (type) => {
        if (isReadOnly) return;
        const prefix = type === 'bullet' ? '\n• ' : '\n1. ';
        const newText = content + prefix;
        setContent(newText);
        saveToHistory(newText, undefined, undefined, undefined);
    };

    const handleSave = async () => {
        if (isReadOnly) return;
        setIsSaving(true);
        
        try {
            const response = await api.patchFile(id, content);
            
            if (response.ok) {
                setTimeout(() => setIsSaving(false), 500); 
            } else {
                Alert.alert("Error", "Failed to save file.");
                setIsSaving(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Connection error while saving.");
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0b57d0" />
                <Text style={{marginTop: 10, color: '#666'}}>Fetching file...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}> 
            <StatusBar barStyle="dark-content" backgroundColor="#F9FBFD" />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                {/* --- Toolbar --- */}
                <View style={[styles.toolbarContainer, isReadOnly && styles.readOnlyToolbar]}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <MaterialIcons name="arrow-back" size={24} color="#444" />
                        </TouchableOpacity>
                        
                        <Text style={styles.fileName} numberOfLines={1}>
                            {fileName} 
                            {isReadOnly && <Text style={{color: '#666', fontSize: 12}}> (View Only)</Text>}
                        </Text>

                        {!isReadOnly && (
                            <TouchableOpacity 
                                style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                <Text style={styles.saveBtnText}>{isSaving ? "Saving..." : "Save"}</Text>
                            </TouchableOpacity>
                        )}
                        
                        {isReadOnly && (
                            <View style={{padding: 8}}>
                                <MaterialIcons name="visibility" size={22} color="#888" />
                            </View>
                        )}
                    </View>

                    {!isReadOnly && (
                        <View style={styles.toolsRow}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolsScroll}>
                                <TouchableOpacity onPress={handleUndo} style={[styles.toolBtn, historyIndex <= 0 && styles.disabledBtn]} disabled={historyIndex <= 0}>
                                    <MaterialIcons name="undo" size={20} color={historyIndex <= 0 ? "#ccc" : "#444"} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleRedo} style={[styles.toolBtn, historyIndex >= history.length - 1 && styles.disabledBtn]} disabled={historyIndex >= history.length - 1}>
                                    <MaterialIcons name="redo" size={20} color={historyIndex >= history.length - 1 ? "#ccc" : "#444"} />
                                </TouchableOpacity>
                                
                                <View style={styles.divider} />
                                
                                <View style={styles.toolGroup}>
                                    <TouchableOpacity onPress={() => changeFontSize(-1)} style={styles.toolBtnSmall}><Text style={styles.fontBtnText}>-</Text></TouchableOpacity>
                                    <Text style={styles.fontSizeDisplay}>{fontSize}</Text>
                                    <TouchableOpacity onPress={() => changeFontSize(1)} style={styles.toolBtnSmall}><Text style={styles.fontBtnText}>+</Text></TouchableOpacity>
                                </View>
                                
                                <View style={styles.divider} />
                                
                                <TouchableOpacity onPress={() => toggleFormat('bold')} style={[styles.toolBtn, activeFormats.bold && styles.activeToolBtn]}><MaterialIcons name="format-bold" size={20} color={activeFormats.bold ? "#0b57d0" : "#444"} /></TouchableOpacity>
                                <TouchableOpacity onPress={() => toggleFormat('italic')} style={[styles.toolBtn, activeFormats.italic && styles.activeToolBtn]}><MaterialIcons name="format-italic" size={20} color={activeFormats.italic ? "#0b57d0" : "#444"} /></TouchableOpacity>
                                <TouchableOpacity onPress={() => toggleFormat('underline')} style={[styles.toolBtn, activeFormats.underline && styles.activeToolBtn]}><MaterialIcons name="format-underlined" size={20} color={activeFormats.underline ? "#0b57d0" : "#444"} /></TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowColorPicker(true)} style={styles.toolBtn}>
                                    <MaterialIcons name="format-color-text" size={20} color={currentColor} />
                                    <View style={[styles.colorIndicator, { backgroundColor: currentColor }]} />
                                </TouchableOpacity>
                                
                                <View style={styles.divider} />
                                
                                <TouchableOpacity onPress={() => setAlignment('left')} style={[styles.toolBtn, activeFormats.align === 'left' && styles.activeToolBtn]}><MaterialIcons name="format-align-left" size={20} color={activeFormats.align === 'left' ? "#0b57d0" : "#444"} /></TouchableOpacity>
                                <TouchableOpacity onPress={() => setAlignment('center')} style={[styles.toolBtn, activeFormats.align === 'center' && styles.activeToolBtn]}><MaterialIcons name="format-align-center" size={20} color={activeFormats.align === 'center' ? "#0b57d0" : "#444"} /></TouchableOpacity>
                                <TouchableOpacity onPress={() => setAlignment('right')} style={[styles.toolBtn, activeFormats.align === 'right' && styles.activeToolBtn]}><MaterialIcons name="format-align-right" size={20} color={activeFormats.align === 'right' ? "#0b57d0" : "#444"} /></TouchableOpacity>
                                
                                <View style={styles.divider} />
                                
                                <TouchableOpacity onPress={() => addListPrefix('bullet')} style={styles.toolBtn}><MaterialIcons name="format-list-bulleted" size={20} color="#444" /></TouchableOpacity>
                                <TouchableOpacity onPress={() => addListPrefix('ordered')} style={styles.toolBtn}><MaterialIcons name="format-list-numbered" size={20} color="#444" /></TouchableOpacity>
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* --- Editor Area --- */}
                <ScrollView style={styles.editorScrollArea} contentContainerStyle={styles.editorContentContainer}>
                    <View style={[styles.paperShadow, isReadOnly && styles.readOnlyPaper]}>
                        <TextInput
                            multiline
                            value={content}
                            onChangeText={handleContentChange}
                            placeholder="Start writing here..."
                            textAlign={activeFormats.align} 
                            editable={!isReadOnly} 
                            style={[
                                styles.documentPage,
                                {
                                    fontSize: fontSize,
                                    color: currentColor,
                                    fontWeight: activeFormats.bold ? 'bold' : 'normal',
                                    fontStyle: activeFormats.italic ? 'italic' : 'normal',
                                    textDecorationLine: activeFormats.underline ? 'underline' : 'none',
                                }
                            ]}
                        />
                    </View>
                </ScrollView>

                {/* --- Color Modal --- */}
                {!isReadOnly && (
                    <Modal visible={showColorPicker} transparent={true} animationType="fade">
                        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowColorPicker(false)}>
                            <View style={styles.colorPopup}>
                                <Text style={styles.modalTitle}>Select Color</Text>
                                <View style={styles.colorGrid}>
                                    {PRESET_COLORS.map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[styles.colorSwatch, { backgroundColor: color }]}
                                            onPress={() => changeColor(color)}
                                        />
                                    ))}
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                )}
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
    toolbarContainer: {
        backgroundColor: '#F9FBFD',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    readOnlyToolbar: {
        paddingBottom: 0,
        borderBottomWidth: 0,
        elevation: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 50,
    },
    iconButton: {
        padding: 8,
    },
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
    },
    saveBtnText: {
        color: '#001D35',
        fontWeight: '600',
        fontSize: 14,
    },
    toolsRow: {
        marginTop: 4,
    },
    toolsScroll: {
        paddingHorizontal: 16,
        alignItems: 'center',
        height: 44,
        gap: 4,
    },
    toolGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dadce0',
        height: 36,
        paddingHorizontal: 4,
    },
    toolBtnSmall: {
        width: 28,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fontBtnText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#444',
    },
    fontSizeDisplay: {
        fontSize: 14,
        fontWeight: '500',
        minWidth: 24,
        textAlign: 'center',
        color: '#444',
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: '#dadce0',
        marginHorizontal: 6,
    },
    toolBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    disabledBtn: {
        opacity: 0.3,
    },
    activeToolBtn: {
        backgroundColor: '#D3E3FD',
    },
    colorIndicator: {
        width: 14,
        height: 3,
        marginTop: 2,
        borderRadius: 1,
    },
    editorScrollArea: {
        flex: 1,
    },
    editorContentContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    paperShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        backgroundColor: 'transparent',
    },
    readOnlyPaper: {
        backgroundColor: '#fdfdfd',
    },
    documentPage: {
        backgroundColor: '#ffffff',
        minHeight: 600,
        borderRadius: 2,
        padding: 24,
        textAlignVertical: 'top',
        lineHeight: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#444',
        textAlign: 'center',
    },
    colorPopup: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        width: 260,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    colorSwatch: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
    },
});