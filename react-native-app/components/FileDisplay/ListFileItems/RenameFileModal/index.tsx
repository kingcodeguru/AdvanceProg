import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform 
} from 'react-native';

// הייבוא עובד עכשיו כי שניהם באותה תיקייה חדשה
import { styles } from './styles';

interface RenameModalProps {
  visible: boolean;
  fileName: string | null;
  onClose: () => void;
  onRename: (newName: string) => void;
}

const RenameModal = ({ visible, fileName, onClose, onRename }: RenameModalProps) => {
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
        <View style={styles.modalContent}>
          <Text style={styles.title}>Rename</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={nameWithoutExt}
              onChangeText={setNameWithoutExt}
              selectTextOnFocus={true}
              onSubmitEditing={handleSave}
              returnKeyType="done"
              autoCorrect={false}
            />
            {extension ? <Text style={styles.extensionText}>{extension}</Text> : null}
          </View>
          <View style={styles.actionsContainer}>
            <Pressable onPress={onClose}><Text style={styles.buttonTextCancel}>Cancel</Text></Pressable>
            <Pressable onPress={handleSave}><Text style={styles.buttonTextOk}>OK</Text></Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RenameModal;