import React from 'react';
import { 
    View, Text, Modal, StyleSheet, TouchableOpacity, 
    ScrollView, Platform, TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SidebarButton from './SidebarButton';

import { useTheme } from '../../utilities/ThemeContext';
import Themes from '../../styles/themes';

export default function Sidebar({ visible, onClose }) {
    const { isDarkMode, toggleTheme } = useTheme();
    const theme = Themes[isDarkMode ? 'dark' : 'light'];

    const menuItems = [
        'Home', 'My Drive', 'Shared with me', 'Recent', 'Starred', 'Trash'
    ];

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Clicking backdrop closes the sidebar */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                {/* SIDEBAR CONTAINER:
                   Using 'bgPrimary' because it is #ffffff in Light and #37393b in Dark 
                */}
                <View style={[styles.sidebarContainer, { backgroundColor: theme.bgPrimary }]}>
                    
                    <View style={styles.headerSpacer} />
                    
                    {/* Brand Title */}
                    <Text style={[styles.brandTitle, { color: theme.textMain }]}>
                        LOT Drive
                    </Text>

                    {/* Navigation Items */}
                    <ScrollView style={[styles.navContainer, { backgroundColor: theme.bgMain }]}>
                        {menuItems.map((item) => (
                            <SidebarButton 
                                key={item} 
                                label={item} 
                                onPress={onClose} 
                            />
                        ))}
                    </ScrollView>

                    {/* Footer with Theme Toggle */}
                    <View style={[styles.footer, { borderTopColor: theme.borderSubtle }]}>
                        <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
                            <Ionicons 
                                name={isDarkMode ? "sunny" : "moon"} 
                                size={22} 
                                color={theme.textMain} 
                            />
                            <Text style={[styles.themeBtnText, { color: theme.textMain }]}>
                                {isDarkMode ? "Light Mode" : "Dark Mode"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        // backgroundColor handled dynamically
        height: '100%',
        paddingTop: 20,
        elevation: 10, 
        shadowColor: '#000', 
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.2,
    },
    headerSpacer: { height: Platform.OS === 'ios' ? 40 : 10 },
    brandTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        // color handled dynamically
        marginLeft: 24,
        marginBottom: 20,
    },
    navContainer: {
        flex: 1,
    },
    // --- Footer Styles ---
    footer: {
        padding: 20,
        borderTopWidth: 1,
        marginTop: 'auto', 
    },
    themeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginLeft: 5,
        paddingVertical: 10
    },
    themeBtnText: {
        fontSize: 16,
        fontWeight: '500',
    },
});