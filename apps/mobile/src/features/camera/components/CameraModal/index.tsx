import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { memo, useState } from 'react';
import { Alert, Modal, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

// SDKs
import { CameraType, CameraView } from 'expo-camera';

// Constants
import { ERROR_MESSAGES } from '@/constants';

// Icons
import { CancelIcon } from '@/icons/CancelIcon';

interface CameraModalProps {
  visible: boolean;
  facing: CameraType;
  onClose: () => void;
  onTakePicture: (uri: string) => void;
  onToggleFacing: () => void;
}

const StyledCameraView = withUniwind(CameraView);

/**
 * Camera modal for taking photos
 */
export const CameraModal = memo(
  ({
    visible,
    facing,
    onClose,
    onTakePicture,
    onToggleFacing,
  }: CameraModalProps) => {
    const insets = useSafeAreaInsets();
    const [cameraRef, setCameraRef] = useState<CameraView | null>(null);

    const handleTakePicture = async () => {
      if (cameraRef) {
        try {
          const photo = await cameraRef.takePictureAsync({
            quality: 0.6,
            base64: false,
            skipProcessing: false,
          });

          if (photo?.uri) {
            onTakePicture(photo.uri);
          }
        } catch {
          Alert.alert('Error', ERROR_MESSAGES.TAKE_PICTURE_ERROR);
        }
      }
    };

    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
        accessible
        accessibilityLabel="Camera"
        accessibilityViewIsModal
      >
        <StyledCameraView
          facing={facing}
          ref={ref => setCameraRef(ref)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          accessible={false}
        />

        {/* Camera Controls Overlay */}
        <View
          className="absolute bottom-0 left-0 right-0 p-6"
          style={{
            bottom: insets.bottom,
          }}
          accessible
          accessibilityRole="toolbar"
          accessibilityLabel="Camera controls"
        >
          <View className="flex-row justify-around items-center">
            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close camera"
              accessibilityRole="button"
              accessibilityHint="Double tap to close camera"
            >
              <CancelIcon width={40} height={40} />
            </TouchableOpacity>

            {/* Capture Button */}
            <TouchableOpacity
              className="w-20 h-20 rounded-full bg-white justify-center items-center"
              onPress={handleTakePicture}
              accessibilityLabel="Take picture"
              accessibilityRole="button"
              accessibilityHint="Double tap to take photo"
            >
              <View className="w-16 h-16 rounded-full bg-white border-3" />
            </TouchableOpacity>

            {/* Switch Camera Button */}
            <TouchableOpacity
              onPress={onToggleFacing}
              accessibilityLabel="Switch camera"
              accessibilityRole="button"
              accessibilityHint="Double tap to switch between front and back camera"
            >
              <MaterialIcons name="cameraswitch" size={40} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  },
);

CameraModal.displayName = 'CameraModal';
