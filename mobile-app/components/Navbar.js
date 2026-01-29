import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity, 
    Modal, 
    TouchableWithoutFeedback,
    SafeAreaView,
    Platform,
    StatusBar,
    Alert,
    Image 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../utilities/api';

import { useTheme } from '../utilities/ThemeContext';
import Themes from '../styles/themes';

// --- Solution: Global Cache Variable ---
// This variable survives component unmounts/remounts.
let globalUserCache = null;

export default function Navbar({ onMenuPress }) {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const theme = Themes[isDarkMode ? 'dark' : 'light'];

    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Smart Initialization ---
    // If we have data in the cache, use it immediately to prevent flickering.
    // Otherwise, use default empty state.
    const [user, setUser] = useState(globalUserCache || {
        name: '',
        email: '',
        avatar: null 
    });

    const fetchUserData = async () => {
        try {
            const response = await api.getMyDetails();
            if (response.ok) {
                const data = await response.json();
                
                const newUserState = {
                    name: data.name || 'User',
                    email: data.email || '',
                    avatar: data.avatar || null 
                };

                // Update the global cache for next time
                globalUserCache = newUserState;
                
                // Update state only if data changed (optional optimization)
                setUser(newUserState);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    // Fetch data once on mount (background update)
    useEffect(() => {
        fetchUserData();
    }, []); 

    const handleSearch = () => {
        if (searchQuery.trim().length > 0) {
            console.log("Navigating to search:", searchQuery);
            router.push(`/drive/search/${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Sign out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Sign out", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('userToken');
                            
                            // Clear cache on logout so next user doesn't see old data
                            globalUserCache = null;
                            
                            setModalVisible(false);
                            router.replace('/login');
                        } catch (e) {
                            console.error("Logout failed:", e);
                        }
                    }
                }
            ]
        );
    };

    const getInitial = () => {
        return user.name ? user.name.charAt(0).toUpperCase() : '?';
    };

    const renderProfileModal = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.modalContent, { backgroundColor: theme.bgForm }]}>
                            
                            <TouchableOpacity 
                                style={styles.closeBtn} 
                                onPress={() => setModalVisible(false)}
                            >
                                <MaterialIcons name="close" size={22} color={theme.textSecondary} />
                            </TouchableOpacity>

                            <View style={styles.logoContainer}>
                                <Text style={styles.brandLogo}>
                                    <Text style={{color: '#4285F4'}}>L</Text>
                                    <Text style={{color: '#FBBC05'}}>O</Text> 
                                    <Text style={{color: '#34A853'}}>T</Text>
                                </Text>
                            </View>

                            <View style={styles.userInfoSection}>
                                <View style={styles.largeAvatarContainer}>
                                    {user.avatar ? (
                                        <Image source={{ uri: user.avatar }} style={styles.largeAvatarImage} />
                                    ) : (
                                        <View style={[styles.largeAvatar, { backgroundColor: '#8e24aa' }]}>
                                            <Text style={styles.largeAvatarText}>{getInitial()}</Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={[styles.userName, { color: theme.textMain }]}>
                                    Hi, {user.name.split(' ')[0]}!
                                </Text>
                                <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                                    {user.email}
                                </Text>
                            </View>

                            <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

                            <View style={styles.footerSection}>
                                <TouchableOpacity 
                                    style={[styles.signOutBtn, { borderColor: theme.borderSubtle }]}
                                    onPress={handleLogout}
                                >
                                    <MaterialIcons name="logout" size={20} color={theme.textSecondary} style={{marginRight: 8}} />
                                    <Text style={[styles.signOutText, { color: theme.textMain }]}>Sign out</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgMain }]}>
            <View style={[styles.headerContainer, { backgroundColor: theme.bgMain }]}>
                
                <View style={[styles.searchBarContainer, { backgroundColor: isDarkMode ? theme.bgForm : '#f0f4f9' }]}>
                    
                    <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
                        <MaterialIcons name="menu" size={26} color={theme.textMain} />
                    </TouchableOpacity>

                    <TextInput
                        style={[styles.searchInput, { color: theme.textMain }]}
                        placeholder="Search in Drive"
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />

                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.profileBtn}>
                        {user.avatar ? (
                             <Image source={{ uri: user.avatar }} style={styles.smallAvatarImage} />
                        ) : (
                            <View style={[styles.smallAvatar, { backgroundColor: '#8e24aa' }]}>
                                <Text style={styles.smallAvatarText}>{getInitial()}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                </View>
            </View>
            
            {renderProfileModal()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 28, 
        height: 52,
        paddingHorizontal: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    iconBtn: { padding: 10 },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 8,
        textAlign: 'left', 
    },
    profileBtn: { padding: 6 },
    smallAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallAvatarImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    smallAvatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxWidth: 320,
        borderRadius: 16,
        paddingVertical: 20,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    closeBtn: {
        position: 'absolute',
        top: 12,
        left: 12,
        padding: 8,
        zIndex: 10,
    },
    logoContainer: { 
        alignItems: 'center', 
        marginTop: 5, 
        marginBottom: 20 
    },
    brandLogo: { 
        fontSize: 28, 
        fontWeight: '600', 
        letterSpacing: 4 
    },
    userInfoSection: { 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        marginBottom: 10 
    },
    largeAvatarContainer: { 
        marginBottom: 15 
    },
    largeAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    largeAvatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    largeAvatarText: { 
        color: '#fff', 
        fontSize: 36, 
        fontWeight: '500' 
    },
    userName: { 
        fontSize: 18, 
        fontWeight: '500', 
        marginBottom: 4 
    },
    userEmail: { 
        fontSize: 14, 
    },
    divider: {
        height: 1,
        marginVertical: 15,
        width: '100%'
    },
    footerSection: { 
        alignItems: 'center',
        paddingBottom: 5 
    },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 24, 
        paddingVertical: 10,
        paddingHorizontal: 40,
    },
    signOutText: { 
        fontSize: 15, 
        fontWeight: '500' 
    },
});