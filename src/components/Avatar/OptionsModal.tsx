import { Modal, TouchableOpacity, View } from 'react-native';

// Components
import { Typo } from '../Typo';

// Icons
import { CancelIcon } from '@/icons/CancelIcon';
import { memo } from 'react';

interface OptionsModalProps {
  visible: boolean;
  iconSize: number;
  onClose: () => void;
  onOpenCamera: () => void;
  onPickImage: () => void;
}

export const OptionsModal = memo(
  ({
    visible,
    iconSize,
    onClose,
    onOpenCamera,
    onPickImage,
  }: OptionsModalProps) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-bg-primary/50 justify-center items-center"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="bg-white rounded-xl p-5 w-4/5">
          <View className="flex flex-row justify-between items-center mb-3">
            <Typo className="text-lg font-semibold text-center text-gray-800">
              Choose an option
            </Typo>
            <TouchableOpacity
              className="bg-red rounded-full"
              onPress={onClose}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <CancelIcon width={iconSize} height={iconSize} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="p-3 rounded-base bg-gray-100 mb-3 items-center"
            onPress={onOpenCamera}
            accessibilityLabel="Take photo with camera"
            accessibilityRole="button"
          >
            <Typo className="text-base font-medium text-gray-800">
              Take Photo
            </Typo>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-3 rounded-base bg-gray-100 items-center"
            onPress={onPickImage}
            accessibilityLabel="Choose from gallery"
            accessibilityRole="button"
          >
            <Typo className="text-base font-medium text-gray-800">
              Choose from Gallery
            </Typo>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  ),
);

OptionsModal.displayName = 'OptionsModal';
