import React, { useState, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../utilities/api'; // Ensure this path matches your project structure

export default function Navbar({ onMenuPress }) {
    const router = useRouter();
    
    // --- State Management ---
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState({
        name: '',
        email: '',
        avatar: null 
    });

    // --- Data Fetching ---
    
    // Fetches the current user's details from the server
    const fetchUserData = async () => {
        try {
            const response = await api.getMyDetails();
            if (response.ok) {
                const data = await response.json();
                setUser({
                    name: data.name || 'User',
                    email: data.email || '',
                    // Assuming the server returns a URL for 'avatar', otherwise null
                    avatar: data.avatar || null 
                });
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    // Reloads user data every time the screen comes into focus (e.g., after login)
    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [])
    );

    // --- Event Handlers ---

    // Navigates to the search results page with the query
    const handleSearch = () => {
        if (searchQuery.trim().length > 0) {
            console.log("Navigating to search:", searchQuery);
            // Pushes the search route. You must implement the [query].js page to handle this.
            router.push(`/drive/search/${encodeURIComponent(searchQuery)}`);
        }
    };

    // Handles the logout process with a confirmation alert
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
                            // 1. Remove the authentication token
                            await AsyncStorage.removeItem('userToken');
                            // 2. Close the profile modal
                            setModalVisible(false);
                            // 3. Redirect to the login screen
                            router.replace('/login');
                        } catch (e) {
                            console.error("Logout failed:", e);
                        }
                    }
                }
            ]
        );
    };

    // --- Helpers ---
    
    // Extracts the first letter of the name for the avatar placeholder
    const getInitial = () => {
        return user.name ? user.name.charAt(0).toUpperCase() : '?';
    };

    // --- Components ---

    // Renders the Profile Modal (The popup when clicking the avatar)
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
                        <View style={styles.modalContent}>
                            
                            {/* Close Icon */}
                            <TouchableOpacity 
                                style={styles.closeBtn} 
                                onPress={() => setModalVisible(false)}
                            >
                                <MaterialIcons name="close" size={22} color="#5f6368" />
                            </TouchableOpacity>

                            {/* Brand Logo (LOT) with Custom Colors */}
                            <View style={styles.logoContainer}>
                                <Text style={styles.brandLogo}>
                                    <Text style={{color: '#4285F4'}}>L</Text>
                                    <Text style={{color: '#FBBC05'}}>O</Text> 
                                    <Text style={{color: '#34A853'}}>T</Text>
                                </Text>
                            </View>

                            {/* User Information */}
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

                                <Text style={styles.userName}>Hi, {user.name.split(' ')[0]}!</Text>
                                <Text style={styles.userEmail}>{user.email}</Text>
                            </View>

                            {/* Divider Line */}
                            <View style={styles.divider} />

                            {/* Sign Out Button */}
                            <View style={styles.footerSection}>
                                <TouchableOpacity 
                                    style={styles.signOutBtn}
                                    onPress={handleLogout}
                                >
                                    <MaterialIcons name="logout" size={20} color="#5f6368" style={{marginRight: 8}} />
                                    <Text style={styles.signOutText}>Sign out</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    // --- Main Render ---
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <View style={styles.searchBarContainer}>
                    
                    {/* Hamburger Menu Icon (Triggers parent callback) */}
                    <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
                        <MaterialIcons name="menu" size={26} color="#444746" />
                    </TouchableOpacity>

                    {/* Search Input Field */}
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search in Drive"
                        placeholderTextColor="#444746"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch} // Triggers search on "Enter"
                        returnKeyType="search"
                    />

                    {/* Profile Avatar Button (Opens Modal) */}
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
            
            {/* Render the modal component (hidden by default) */}
            {renderProfileModal()}
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#fff', 
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
    },
    // Search Bar Styling
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f4f9', 
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
        color: '#1f1f1f',
        paddingHorizontal: 8,
        textAlign: 'left', 
    },
    profileBtn: { padding: 6 },
    // Small Avatar (In Navbar)
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

    // Modal Styling
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxWidth: 320,
        backgroundColor: '#fff',
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
    // Large Avatar (In Modal)
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
        color: '#1f1f1f', 
        marginBottom: 4 
    },
    userEmail: { 
        fontSize: 14, 
        color: '#5f6368' 
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
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
        borderColor: '#dadce0',
        borderRadius: 24, 
        paddingVertical: 10,
        paddingHorizontal: 40,
    },
    signOutText: { 
        fontSize: 15, 
        color: '#3c4043', 
        fontWeight: '500' 
    },
});