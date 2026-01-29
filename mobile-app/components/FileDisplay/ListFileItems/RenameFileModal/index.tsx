import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform 
} from 'react-native';

import { styles } from './styles';

import { useTheme } from '@/utilities/ThemeContext';
import Themes from '@/styles/themes';

interface RenameModalProps {
  visible: boolean;
  fileName: string | null; 
  onClose: () => void;
  onRename: (newName: string) => void;
}

const RenameModal = ({ visible, fileName, onClose, onRename }: RenameModalProps) => {
  const { isDarkMode } = useTheme();
  const theme = Themes[isDarkMode ? 'dark' : 'light'];

  const [nameWithoutExt, setNameWithoutExt] = useState("");
  const [extension, setExtension] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible && fileName) {
      const lastDotIndex = fileName.lastIndexOf('.');
      if (lastDotIndex > 0) {
        setNameWithoutExt(fileName.substring(0, lastDotIndex));
        setExtension(fileName.substring(lastDotIndex));
      } else {
        setNameWithoutExt(fileName);
        setExtension("");
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible, fileName]);

  const handleSave = () => {
    if (!nameWithoutExt.trim()) return;
    onRename(nameWithoutExt + extension);
    onClose();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        
        <View style={[styles.modalContent, { backgroundColor: theme.bgForm }]}>
          
          <Text style={[styles.title, { color: theme.textMain }]}>Rename</Text>

          <View style={[styles.inputWrapper, { backgroundColor: theme.bgPrimary }]}>
            <TextInput
              ref={inputRef}
              style={[
                styles.textInput, 
                { 
                  color: theme.textMain, 
                  borderColor: theme.brandBlue 
                }
              ]}
              placeholderTextColor={theme.textSecondary}
              value={nameWithoutExt}
              onChangeText={setNameWithoutExt}
              selectTextOnFocus={true}
              onSubmitEditing={handleSave}
              returnKeyType="done"
              autoCorrect={false}
            />
            {extension ? (
                <Text style={[styles.extensionText, { color: theme.textSecondary }]}>
                    {extension}
                </Text>
            ) : null}
          </View>
          
          <View style={styles.actionsContainer}>
            <Pressable onPress={onClose}>
                <Text style={[styles.buttonTextCancel, { color: theme.brandBlue }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave}>
                <Text style={[styles.buttonTextOk, { color: theme.brandBlue }]}>OK</Text>
            </Pressable>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RenameModal;