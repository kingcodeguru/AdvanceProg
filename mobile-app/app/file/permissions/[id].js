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
    addPermission, 
    updatePermission, 
    removePermission,
    getFileById
} from '../../../utilities/api'; // Adjust path if needed

// --- Constants ---

const ROLES = {
    VIEWER: 0,
    EDITOR: 1,
    ADMIN: 2,
    OWNER: 3
};

export default function PermissionsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // This is the fileId

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
            // 1. Get My Details (to know who "Me" is)
            const meRes = await getMyDetails();
            if (meRes.ok) {
                const meData = await meRes.json();
                setCurrentUser(meData);
            }

            // 2. Get File Details (for the title)
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

    // Find my role in the permissions list based on my UID
    const myPermission = currentUser ? permissions.find(p => p.uid === currentUser.uid) : null;
    const myRole = myPermission ? myPermission.role : ROLES.VIEWER;
    const canManage = myRole >= ROLES.ADMIN;

    // --- Helpers ---

    const getSortedPermissions = () => {
        if (!currentUser) return permissions;

        return [...permissions].sort((a, b) => {
            // Priority 1: Me
            if (a.uid === currentUser.uid) return -1;
            if (b.uid === currentUser.uid) return 1;

            // Priority 2: Owner
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
            const response = await addPermission(id, newEmail, newRole);
            if (response.ok) {
                Alert.alert("Success", "User added successfully.");
                setNewEmail('');
                fetchPermissionsList(); // Refresh list
            } else {
                Alert.alert("Error", "Failed to add user. Check email or permissions.");
            }
        } catch (error) {
            Alert.alert("Error", "Network error while adding user.");
        }
    };

    const handleChangeRole = (user) => {
        // Validation: Admin cannot change Owner
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
            const response = await updatePermission(id, user.uid, newRole);
            if (response.ok) {
                fetchPermissionsList(); // Refresh list
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
                                    fetchPermissionsList(); // Refresh list
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
        
        // Logic: Can edit if I am Admin/Owner AND (target is not Owner OR target is Me)
        // Note: Even admins can't remove the owner, but they can demote themselves.
        const showEdit = canManage && (!isOwner || isMe);

        return (
            <View style={styles.userRow}>
                <View style={[styles.avatar, { backgroundColor: stringToColor(item.email) }]}>
                    <Text style={styles.avatarText}>{getInitials(item.name || item.email)}</Text>
                </View>

                <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                        {item.name || item.email} {isMe && <Text style={styles.meTag}>(Me)</Text>}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                        {item.email}
                    </Text>
                </View>

                <TouchableOpacity 
                    style={styles.roleContainer}
                    disabled={!showEdit}
                    onPress={() => handleChangeRole(item)}
                >
                    <Text style={[styles.roleText, showEdit && styles.roleTextActive]}>
                        {getRoleName(item.role)}
                    </Text>
                    {showEdit && (
                        <MaterialIcons name="arrow-drop-down" size={20} color="#5f6368" />
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    // --- Main Layout ---

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#0b57d0" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#444" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    Share "{fileName}"
                </Text>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                {canManage && (
                    <View style={styles.addSection}>
                        <View style={styles.inputBox}>
                            <MaterialIcons name="person-add-alt" size={20} color="#666" style={{marginRight: 8}} />
                            <TextInput
                                style={styles.input}
                                placeholder="Add people (email)"
                                value={newEmail}
                                onChangeText={setNewEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        
                        {newEmail.length > 0 && (
                            <View style={styles.addActions}>
                                <TouchableOpacity 
                                    style={styles.newRoleBtn}
                                    onPress={handleSelectNewUserRole}
                                >
                                    <Text style={styles.newRoleText}>{getRoleName(newRole)}</Text>
                                    <MaterialIcons name="arrow-drop-down" size={18} color="#666" />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleAddUser}>
                                    <Text style={styles.sendBtn}>Send</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                <Text style={styles.listTitle}>Who has access</Text>

                <FlatList
                    data={getSortedPermissions()} 
                    keyExtractor={(item) => item.uid ? item.uid.toString() : Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={true}
                />

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.copyLinkBtn} onPress={() => Alert.alert("Link Copied!")}>
                        <MaterialIcons name="link" size={22} color="#444" />
                        <Text style={styles.copyLinkText}>Copy link</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '400',
        color: '#1f1f1f',
        marginLeft: 16,
        flex: 1,
    },
    iconButton: {
        padding: 4,
    },
    addSection: {
        padding: 16,
        borderBottomWidth: 8,
        borderBottomColor: '#f8f9fa',
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f3f4',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
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
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#dadce0',
        borderRadius: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    newRoleText: {
        fontSize: 13,
        color: '#5f6368',
        fontWeight: '500',
        marginRight: 4,
    },
    sendBtn: {
        color: '#0b57d0',
        fontSize: 16,
        fontWeight: '600',
    },
    listTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#5f6368',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
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
        color: '#1f1f1f',
    },
    meTag: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500', 
    },
    userEmail: {
        fontSize: 13,
        color: '#5f6368',
        marginTop: 2,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roleText: {
        fontSize: 14,
        color: '#5f6368',
        fontWeight: '500',
        marginRight: 2,
    },
    roleTextActive: {
        color: '#1f1f1f',
    },
    footer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20, 
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    copyLinkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    copyLinkText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
    }
});