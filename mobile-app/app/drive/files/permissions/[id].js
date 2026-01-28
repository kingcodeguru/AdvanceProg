import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    FlatList, 
    TextInput, 
    Alert, 
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import API functions
import { 
    getMyDetails, 
    getFilePermissions, 
    addFilePermission, 
    updateFilePermission, 
    removePermission,
    getFileById
} from '../../../../utilities/api';

// 1. Import Theme Hooks
import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

// --- Constants ---

const ROLES = {
    VIEWER: 0,
    EDITOR: 1,
    ADMIN: 2,
    OWNER: 3
};

export default function PermissionsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); 

    // 2. Get Current Theme
    const { isDarkMode } = useTheme();
    const theme = Themes[isDarkMode ? 'dark' : 'light'];

    // --- State ---
    const [permissions, setPermissions] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Add User State
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState(ROLES.EDITOR); 
    
    // --- Initial Data Loading ---

    const loadData = useCallback(async () => {
        try {
            // 1. Get My Details
            const meRes = await getMyDetails();
            if (meRes.ok) {
                const meData = await meRes.json();
                setCurrentUser(meData);
            }

            // 2. Get File Details
            const fileRes = await getFileById(id);
            if (fileRes.ok) {
                const fileData = await fileRes.json();
                setFileName(fileData.name || "Untitled File");
            }

            // 3. Get Permissions List
            await fetchPermissionsList();

        } catch (error) {
            console.error("Failed to load initial data", error);
            Alert.alert("Error", "Could not load file details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchPermissionsList = async () => {
        try {
            const permRes = await getFilePermissions(id);
            if (permRes.ok) {
                const permData = await permRes.json();
                setPermissions(permData);
            } else {
                console.error("Failed to fetch permissions");
            }
        } catch (error) {
            console.error("Error fetching permissions:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- Computed Properties ---
    const myPermission = currentUser ? permissions.find(p => p.uid === currentUser.uid) : null;
    const myRole = myPermission ? myPermission.role : ROLES.VIEWER;
    const canManage = myRole >= ROLES.ADMIN;

    // --- Helpers ---

    const getSortedPermissions = () => {
        if (!currentUser) return permissions;

        return [...permissions].sort((a, b) => {
            if (a.uid === currentUser.uid) return -1;
            if (b.uid === currentUser.uid) return 1;
            if (a.role === ROLES.OWNER) return -1;
            if (b.role === ROLES.OWNER) return 1;
            return 0; 
        });
    };

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    const stringToColor = (string) => {
        if (!string) return '#8e24aa';
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + "00000".substring(0, 6 - c.length) + c;
    };

    const getRoleName = (role) => {
        switch (role) {
            case ROLES.OWNER: return "Owner";
            case ROLES.ADMIN: return "Admin";
            case ROLES.EDITOR: return "Editor";
            case ROLES.VIEWER: return "Viewer";
            default: return "Viewer";
        }
    };

    // --- Handlers ---

    const handleSelectNewUserRole = () => {
        Alert.alert(
            "Select Access Level",
            "Choose role for the new user:",
            [
                { text: "Viewer", onPress: () => setNewRole(ROLES.VIEWER) },
                { text: "Editor", onPress: () => setNewRole(ROLES.EDITOR) },
                { text: "Admin", onPress: () => setNewRole(ROLES.ADMIN) },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const handleAddUser = async () => {
        if (!newEmail.trim()) return;

        try {
            const response = await addFilePermission(id, newEmail, newRole);
            if (response.ok) {
                Alert.alert("Success", "User added successfully.");
                setNewEmail('');
                fetchPermissionsList(); 
            } else {
                Alert.alert("Error", "Failed to add user. Check email or permissions.");
            }
        } catch (error) {
            Alert.alert("Error", `Network error while adding user: ${error.message}`);
        }
    };

    const handleChangeRole = (user) => {
        if (user.role === ROLES.OWNER) {
            Alert.alert("Action Denied", "Cannot change Owner's role.");
            return;
        }

        const isMe = currentUser && user.uid === currentUser.uid;

        Alert.alert(
            isMe ? "Manage Access" : `Manage ${user.name || user.email}`,
            isMe ? "What would you like to do?" : "Select action:",
            [
                { text: "Make Viewer", onPress: () => performUpdateRole(user, ROLES.VIEWER) },
                { text: "Make Editor", onPress: () => performUpdateRole(user, ROLES.EDITOR) },
                { text: "Make Admin", onPress: () => performUpdateRole(user, ROLES.ADMIN) },
                { 
                    text: isMe ? "Leave File" : "Remove User", 
                    style: 'destructive', 
                    onPress: () => performRemoveUser(user) 
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const performUpdateRole = async (user, newRole) => {
        try {
            const response = await updateFilePermission(id, user.uid, newRole);
            if (response.ok) {
                fetchPermissionsList(); 
            } else {
                Alert.alert("Error", "Failed to update role.");
            }
        } catch (error) {
            Alert.alert("Error", "Network error.");
        }
    };

    const performRemoveUser = (user) => {
        const isMe = currentUser && user.uid === currentUser.uid;

        Alert.alert(
            isMe ? "Leave File?" : "Remove User",
            isMe 
                ? "Are you sure? You will lose access to this file immediately." 
                : `Are you sure you want to remove ${user.name || user.email}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: isMe ? "Leave" : "Remove", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await removePermission(id, user.uid);
                            if (response.ok) {
                                if (isMe) {
                                    Alert.alert("Left File", "You have successfully left the file.", [
                                        { text: "OK", onPress: () => router.back() }
                                    ]);
                                } else {
                                    fetchPermissionsList(); 
                                }
                            } else {
                                Alert.alert("Error", "Failed to remove user.");
                            }
                        } catch (error) {
                            Alert.alert("Error", "Network error.");
                        }
                    }
                }
            ]
        );
    };

    // --- Render Row ---

    const renderItem = ({ item }) => {
        if (!currentUser) return null;

        const isMe = item.uid === currentUser.uid;
        const isOwner = item.role === ROLES.OWNER;
        const showEdit = canManage && (!isOwner || isMe);

        return (
            <View style={styles.userRow}>
                {/* Avatar (Random Color) */}
                <View style={[styles.avatar, { backgroundColor: stringToColor(item.email) }]}>
                    <Text style={styles.avatarText}>{getInitials(item.name || item.email)}</Text>
                </View>

                {/* User Info (Dynamic Colors) */}
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.textMain }]} numberOfLines={1}>
                        {item.name || item.email} {isMe && <Text style={[styles.meTag, { color: theme.textSecondary }]}>(Me)</Text>}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]} numberOfLines={1}>
                        {item.email}
                    </Text>
                </View>

                {/* Role (Dynamic Colors) */}
                <TouchableOpacity 
                    style={styles.roleContainer}
                    disabled={!showEdit}
                    onPress={() => handleChangeRole(item)}
                >
                    <Text style={[
                        styles.roleText, 
                        // Inactive = Secondary Color, Active = Main Color
                        { color: showEdit ? theme.textMain : theme.textSecondary } 
                    ]}>
                        {getRoleName(item.role)}
                    </Text>
                    {showEdit && (
                        <MaterialIcons name="arrow-drop-down" size={20} color={theme.textSecondary} />
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    // --- Main Layout ---

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.bgMain }]}>
                <ActivityIndicator size="large" color={theme.brandBlue} />
            </View>
        );
    }

    return (
        // 3. Dynamic Container Background
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bgMain }]} edges={['top', 'bottom']}>
            <StatusBar 
                barStyle={isDarkMode ? "light-content" : "dark-content"} 
                backgroundColor={theme.bgMain} 
            />
            
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.textMain} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textMain }]} numberOfLines={1}>
                    Share "{fileName}"
                </Text>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                {canManage && (
                    <View style={[styles.addSection, { borderBottomColor: isDarkMode ? theme.bgForm : '#f8f9fa' }]}>
                        {/* Input Box Background */}
                        <View style={[styles.inputBox, { backgroundColor: theme.bgForm }]}>
                            <MaterialIcons name="person-add-alt" size={20} color={theme.textSecondary} style={{marginRight: 8}} />
                            <TextInput
                                style={[styles.input, { color: theme.textMain }]}
                                placeholder="Add people (email)"
                                placeholderTextColor={theme.textSecondary}
                                value={newEmail}
                                onChangeText={setNewEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        
                        {newEmail.length > 0 && (
                            <View style={styles.addActions}>
                                {/* Role Dropdown */}
                                <TouchableOpacity 
                                    style={[styles.newRoleBtn, { backgroundColor: theme.bgForm, borderColor: theme.borderSubtle }]}
                                    onPress={handleSelectNewUserRole}
                                >
                                    <Text style={[styles.newRoleText, { color: theme.textSecondary }]}>{getRoleName(newRole)}</Text>
                                    <MaterialIcons name="arrow-drop-down" size={18} color={theme.textSecondary} />
                                </TouchableOpacity>

                                {/* Send Button */}
                                <TouchableOpacity onPress={handleAddUser}>
                                    <Text style={[styles.sendBtn, { color: theme.brandBlue }]}>Send</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                <Text style={[styles.listTitle, { color: theme.textSecondary }]}>Who has access</Text>

                <FlatList
                    data={getSortedPermissions()} 
                    keyExtractor={(item) => item.uid ? item.uid.toString() : Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={true}
                />

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor handled inline
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        // borderBottomColor handled inline
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '400',
        marginLeft: 16,
        flex: 1,
        // color handled inline
    },
    iconButton: {
        padding: 4,
    },
    addSection: {
        padding: 16,
        borderBottomWidth: 8,
        // borderBottomColor handled inline
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50,
        // backgroundColor handled inline
    },
    input: {
        flex: 1,
        fontSize: 16,
        // color handled inline
    },
    addActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingHorizontal: 4,
    },
    newRoleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        // bg and border color handled inline
    },
    newRoleText: {
        fontSize: 13,
        fontWeight: '500',
        marginRight: 4,
        // color handled inline
    },
    sendBtn: {
        fontSize: 16,
        fontWeight: '600',
        // color handled inline
    },
    listTitle: {
        fontSize: 14,
        fontWeight: '500',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        // color handled inline
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    userInfo: {
        flex: 1,
        marginRight: 10,
    },
    userName: {
        fontSize: 16,
        // color handled inline
    },
    meTag: {
        fontSize: 14,
        fontWeight: '500', 
        // color handled inline
    },
    userEmail: {
        fontSize: 13,
        marginTop: 2,
        // color handled inline
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roleText: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 2,
        // color handled inline
    },
});