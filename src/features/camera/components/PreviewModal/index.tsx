import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { memo } from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// SDKs
import { Image } from 'expo-image';

// Components
import { Typo } from '@/components/Typo';

// Icons
import { CancelIcon } from '@/icons/CancelIcon';

interface PreviewModalProps {
  visible: boolean;
  previewUri: string | null;
  onClose: () => void;
  onConfirm: () => void;
  onRetake: () => void;
}

/**
 * Photo preview modal with confirm/retake/cancel options
 */
export const PreviewModal = memo(
  ({
    visible,
    previewUri,
    onClose,
    onConfirm,
    onRetake,
  }: PreviewModalProps) => {
    const insets = useSafeAreaInsets();

    return (
      <Modal
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
        accessible
        accessibilityLabel="Photo preview"
        accessibilityViewIsModal
      >
        <View className="flex-1 bg-bg-primary">
          {/* Preview Image */}
          {previewUri && (
            <Image
              source={{ uri: previewUri }}
              contentFit="cover"
              style={{
                width: '100%',
                height: '100%',
              }}
              accessibilityLabel="Photo preview"
              accessibilityRole="image"
            />
          )}

          {/* Preview Controls */}
          <View
            className="absolute bottom-0 left-0 right-0 p-6"
            style={{
              bottom: insets.bottom,
            }}
            accessible
            accessibilityRole="toolbar"
            accessibilityLabel="Preview controls"
          >
            <View className="flex-row justify-around items-center">
              {/* Cancel Button */}
              <TouchableOpacity
                className="items-center"
                onPress={onClose}
                accessibilityLabel="Cancel photo"
                accessibilityRole="button"
                accessibilityHint="Double tap to discard this photo"
              >
                <View className="w-14 h-14 rounded-full bg-red justify-center items-center mb-2">
                  <CancelIcon width={32} height={32} />
                </View>
                <Typo className="text-white text-sm">Cancel</Typo>
              </TouchableOpacity>

              {/* Retake Button */}
              <TouchableOpacity
                className="items-center"
                onPress={onRetake}
                accessibilityLabel="Retake photo"
                accessibilityRole="button"
                accessibilityHint="Double tap to take another photo"
              >
                <View className="w-14 h-14 rounded-full bg-gray-600 justify-center items-center mb-2">
                  <MaterialIcons name="refresh" size={32} color="white" />
                </View>
                <Typo className="text-white text-sm">Retake</Typo>
              </TouchableOpacity>

              {/* Use Photo Button */}
              <TouchableOpacity
                className="items-center"
                onPress={onConfirm}
                accessibilityLabel="Use this photo"
                accessibilityRole="button"
                accessibilityHint="Double tap to use this photo as your avatar"
              >
                <View className="w-14 h-14 rounded-full bg-primary justify-center items-center mb-2">
                  <MaterialIcons name="check" size={32} color="white" />
                </View>
                <Typo className="text-white text-sm">Use Photo</Typo>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

PreviewModal.displayName = 'PreviewModal';
