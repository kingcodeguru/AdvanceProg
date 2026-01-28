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

// 1. Import Theme Hook and Data
import { useTheme } from '../utilities/ThemeContext';
import Themes from '../styles/themes';

export default function Navbar({ onMenuPress }) {
    const router = useRouter();
    
    // 2. Get Current Theme
    const { isDarkMode } = useTheme();
    const theme = Themes[isDarkMode ? 'dark' : 'light'];

    // --- State Management ---
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState({
        name: '',
        email: '',
        avatar: null 
    });
// --- Data Fetching ---
    const fetchUserData = async () => {
        try {
            const response = await api.getMyDetails();
            if (response.ok) {
                const data = await response.json();
                setUser({
                    name: data.name || 'User',
                    email: data.email || '',
                    avatar: data.avatar || null 
                });
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    // --- Event Handlers ---
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

    // --- Helpers ---
    const getInitial = () => {
        return user.name ? user.name.charAt(0).toUpperCase() : '?';
    };

    // --- Components ---
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
                        {/* 3. Apply Theme to Modal Content */}
                        <View style={[styles.modalContent, { backgroundColor: theme.bgForm }]}>
                            
                            {/* Close Icon (Dynamic Color) */}
                            <TouchableOpacity 
                                style={styles.closeBtn} 
                                onPress={() => setModalVisible(false)}
                            >
                                <MaterialIcons name="close" size={22} color={theme.textSecondary} />
                            </TouchableOpacity>

                            {/* Brand Logo */}
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

                                {/* Dynamic Text Colors */}
                                <Text style={[styles.userName, { color: theme.textMain }]}>
                                    Hi, {user.name.split(' ')[0]}!
                                </Text>
                                <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                                    {user.email}
                                </Text>
                            </View>

                            {/* Dynamic Divider */}
                            <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

                            {/* Sign Out Button */}
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

    // --- Main Render ---
    return (
        // 4. SafeArea matches Main Background (e.g., White or Dark Gray)
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgMain }]}>
            <View style={[styles.headerContainer, { backgroundColor: theme.bgMain }]}>
                
                {/* 5. Search Bar Background: Light Gray vs Dark Gray */}
                <View style={[styles.searchBarContainer, { backgroundColor: isDarkMode ? theme.bgForm : '#f0f4f9' }]}>
                    
                    {/* Hamburger Menu */}
                    <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
                        <MaterialIcons name="menu" size={26} color={theme.textMain} />
                    </TouchableOpacity>

                    {/* Search Input */}
                    <TextInput
                        style={[styles.searchInput, { color: theme.textMain }]}
                        placeholder="Search in Drive"
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />

                    {/* Profile Avatar Button */}
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

// --- Styles ---
// Note: Colors that are DYNAMIC are handled inline above.
// Static layout styles remain here.
const styles = StyleSheet.create({
    safeArea: {
        // backgroundColor handled inline
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        // backgroundColor handled inline
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor handled inline
        borderRadius: 28, 
        height: 52,
        paddingHorizontal: 8,
        // Shadow/Elevation
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
        // color handled inline
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
        // backgroundColor handled inline
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
        // color handled inline 
        marginBottom: 4 
    },
    userEmail: { 
        fontSize: 14, 
        // color handled inline 
    },
    divider: {
        height: 1,
        // backgroundColor handled inline
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
        // borderColor handled inline
        borderRadius: 24, 
        paddingVertical: 10,
        paddingHorizontal: 40,
    },
    signOutText: { 
        fontSize: 15, 
        // color handled inline 
        fontWeight: '500' 
    },
});