import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    Image,
    StyleSheet, 
    TouchableOpacity, 
    ActivityIndicator,
    StatusBar,
    ScrollView,
    Dimensions,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as api from '../../../utilities/api'; 

const { width, height } = Dimensions.get('window');

export default function ImageViewer() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    
    // --- State Management ---
    const [imageUri, setImageUri] = useState(null);
    const [fileName, setFileName] = useState("Loading...");
    const [isLoading, setIsLoading] = useState(true);
    const [rotation, setRotation] = useState(0);

    // --- Fetch Image from API ---
    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await api.getFileById(id);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Handle Content (Base64 vs URL)
                    // If the server returns raw Base64, we must prefix it.
                    let uri = data.content;
                    if (uri && !uri.startsWith('http') && !uri.startsWith('data:')) {
                        uri = `data:image/jpeg;base64,${uri}`;
                    }
                    
                    setImageUri(uri);
                    setFileName(data.name || "Image");
                } else {
                    Alert.alert("Error", "Failed to load image from server.");
                }
            } catch (error) {
                console.error("Image Fetch Error:", error);
                Alert.alert("Error", "Network connection failed.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchImage();
    }, [id]);

    // --- Handlers ---
    const handleRotate = () => {
        setRotation(prev => prev + 90);
    };

    // Calculate if the image is rotated sideways (90 or 270 degrees)
    // Used to swap width/height dimensions to prevent clipping
    const isRotated = rotation % 180 !== 0;

    return (
        <View style={styles.container}>
            {/* Translucent StatusBar for immersive experience */}
            <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.3)" translucent={true} />
            
            {/* --- Header Overlay --- 
                Dynamically adjusted for device Notch/Status Bar height using insets 
            */}
            <View style={[styles.headerOverlay, { paddingTop: insets.top, height: 60 + insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <MaterialIcons name="arrow-back" size={28} color="#fff" style={styles.shadow} />
                </TouchableOpacity>
                
                <Text style={[styles.fileName, styles.shadow]} numberOfLines={1}>
                    {fileName}
                </Text>

                <TouchableOpacity onPress={handleRotate} style={styles.iconButton}>
                    <MaterialIcons name="rotate-right" size={28} color="#fff" style={styles.shadow} />
                </TouchableOpacity>
            </View>

            {/* --- Image Container with Zoom & Rotate --- */}
            <View style={styles.imageContainer}>
                {isLoading && (
                    <ActivityIndicator size="large" color="#fff" style={styles.loader} />
                )}
                
                {!isLoading && imageUri && (
                    <ScrollView
                        minimumZoomScale={1}
                        maximumZoomScale={5} // Allow pinch-to-zoom up to 5x
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        centerContent={true}
                    >
                        <Image 
                            source={{ uri: imageUri }} 
                            style={{
                                // Rotation Logic:
                                // When rotated 90deg, we swap width and height so it fits the screen perfectly
                                // without clipping the top/bottom (now sides).
                                width: isRotated ? height : width,
                                height: isRotated ? width : height,
                                transform: [{ rotate: `${rotation}deg` }]
                            }}
                            resizeMode="contain"
                        />
                    </ScrollView>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Professional dark background
    },
    headerOverlay: {
        position: 'absolute',
        top: 0, 
        left: 0,
        right: 0,
        // Height is calculated inline based on safe area insets
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        zIndex: 10, // Ensure header stays on top of the image
        backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent background
    },
    iconButton: {
        padding: 10,
    },
    fileName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    shadow: {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    scrollContent: {
        width: width,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        position: 'absolute',
        zIndex: 5,
    }
});