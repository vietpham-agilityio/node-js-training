import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { memo, useState } from 'react';
import { Alert, Modal, Platform, TouchableOpacity, View } from 'react-native';

// SDKs
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

// Constants
import { BLUR_HASH, ERROR_MESSAGES, MESSAGES } from '@/constants';

// Components
import { Typo } from '../Typo';

// Icons
import {
  AddIcon,
  CancelIcon,
  PhotoProfileIcon,
  UserProfileIcon,
} from '@/icons';

type Size = 48 | 92 | 132 | 160;
type Variant = 'default' | 'picker';

interface AvatarProps {
  size?: Size;
  variant?: Variant;
  source?: string;
  onChangeImage?: (uri: string) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// Size configurations mapping
const SIZE_MAP: Record<
  Size,
  {
    container: string;
    avatar: string;
    button: string;
    buttonPosition: string;
    iconSize: number;
  }
> = {
  48: {
    container: 'w-12 h-12',
    avatar: 'w-12 h-12',
    button: 'w-6 h-6',
    buttonPosition: 'bottom-0 left-1/2 -translate-x-1/2',
    iconSize: 24,
  },
  92: {
    container: 'w-23 h-23',
    avatar: 'w-23 h-23',
    button: 'w-7 h-7',
    buttonPosition: '-bottom-3.5 left-1/2 -translate-x-1/2',
    iconSize: 24,
  },
  132: {
    container: 'w-33 h-33',
    avatar: 'w-33 h-33',
    button: 'w-10 h-10',
    buttonPosition: 'bottom-0 left-1/2 -translate-x-1/2',
    iconSize: 24,
  },
  160: {
    container: 'w-40 h-40',
    avatar: 'w-40 h-40',
    button: 'w-12 h-12',
    buttonPosition: 'bottom-0 left-1/2 -translate-x-1/2',
    iconSize: 24,
  },
};

export const Avatar = memo(
  ({
    size = 92,
    variant = 'default',
    source,
    onChangeImage,
    accessibilityLabel,
    accessibilityHint,
  }: AvatarProps) => {
    const [imageUri, setImageUri] = useState<string | null>(source || null);
    const [showOptions, setShowOptions] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
    const [facing, setFacing] = useState<CameraType>('back');

    const config = SIZE_MAP[size];
    const isImageSelected = !!imageUri;

    // Accessibility labels
    const defaultAvatarLabel = accessibilityLabel || 'Profile picture';
    const pickerButtonLabel = isImageSelected
      ? 'Remove profile picture'
      : 'Add profile picture';
    const pickerButtonHint = isImageSelected
      ? 'Double tap to remove your profile picture'
      : 'Double tap to select a profile picture from your device';

    /**
     * Handle the image picker result. If the variant is 'default',
     * do nothing. If the permission status is not 'granted', show an alert.
     * If the result is not canceled and has a valid URI, set the image URI
     * and call the onChangeImage callback with the new URI. Finally, hide the
     * options modal.
     */
    const handlePickImage = async () => {
      if (variant === 'default') return;

      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          MESSAGES.PERMISSION_REQUIRED,
          MESSAGES.CAMERA_ROLL_PERMISSION_REQUIRED,
          [{ text: 'OK' }],
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        onChangeImage?.(uri);
      }

      setShowOptions(false);
    };

    /**
     * Remove the currently selected image, and call the onChangeImage callback with an empty string.
     */
    const handleRemoveImage = () => {
      setImageUri(null);
      onChangeImage?.('');
    };

    /**
     * Handle opening the camera. If the variant is 'default', do nothing.
     * If the permission status is not 'granted', show an alert.
     * If the permission status is 'granted', hide the options modal, show the camera
     * and toggle the facing of the camera.
     */
    const handleOpenCamera = async () => {
      if (variant === 'default') return;

      if (!cameraPermission) {
        return;
      }

      if (!cameraPermission.granted) {
        const { status } = await requestCameraPermission();
        if (status !== 'granted') {
          Alert.alert(
            MESSAGES.PERMISSION_REQUIRED,
            MESSAGES.CAMERA_PERMISSION_REQUIRED,
            [{ text: 'OK' }],
          );
          return;
        }
      }

      setShowOptions(false);
      setShowCamera(true);
    };

    /**
     * Handle taking a picture from the camera. If the camera ref is null, do nothing.
     * If the camera ref is valid, take a picture, and if successful, set the image URI
     * and call the onChangeImage callback with the new URI. If the picture taking fails,
     * show an error alert.
     */
    const handleTakePicture = async () => {
      if (cameraRef) {
        try {
          const photo = await cameraRef.takePictureAsync({
            quality: 1,
            base64: false,
          });

          if (photo?.uri) {
            setImageUri(photo.uri);
            onChangeImage?.(photo.uri);
            setShowCamera(false);
          }
        } catch (error) {
          console.error('Error taking picture:', error);
          Alert.alert('Error', ERROR_MESSAGES.TAKE_PICTURE_ERROR);
        }
      }
    };

    /**
     * Handle button press event. If the image is selected, remove the image. Otherwise, show options.
     */
    const handleButtonPress = () => {
      if (isImageSelected) {
        handleRemoveImage();
      } else {
        setShowOptions(true);
      }
    };

    /**
     * Toggle the camera facing between 'back' and 'front'.
     * If the current facing is 'back', set it to 'front', and vice versa.
     */
    const toggleCameraFacing = () => {
      setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const handleCloseOptions = () => {
      setShowOptions(false);
    };

    const handleCloseCamera = () => {
      setShowCamera(false);
    };

    // Default avatar (user icon)
    const DefaultAvatarIcon = () => (
      <View
        testID="default-avatar-icon"
        className={`${config.avatar} rounded-full items-center justify-center overflow-hidden`}
        accessible
        accessibilityLabel={defaultAvatarLabel}
        accessibilityRole="image"
        accessibilityHint="Default avatar placeholder"
      >
        {/* User icon SVG representation */}
        <View
          className="items-center justify-center w-full h-full"
          importantForAccessibility="no-hide-descendants"
        >
          {variant === 'default' ? (
            <PhotoProfileIcon width={size} height={size} />
          ) : (
            <UserProfileIcon width={size} height={size} />
          )}
        </View>
      </View>
    );

    const renderPickerButton = () => {
      if (variant !== 'picker') return null;

      return (
        <TouchableOpacity
          onPress={handleButtonPress}
          className={`${config.button} rounded-full items-center justify-center absolute ${config.buttonPosition} border border-white ${
            isImageSelected ? 'bg-red' : 'bg-primary'
          }`}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel={pickerButtonLabel}
          accessibilityRole="button"
          accessibilityHint={accessibilityHint || pickerButtonHint}
          accessibilityState={{ disabled: !handlePickImage }}
          {...Platform.select({
            ios: {
              accessibilityTraits: ['button'],
            },
            android: {
              accessibilityComponentType: 'button',
            },
          })}
        >
          {isImageSelected ? (
            <CancelIcon width={config.iconSize} height={config.iconSize} />
          ) : (
            <AddIcon width={config.iconSize} height={config.iconSize} />
          )}
        </TouchableOpacity>
      );
    };

    return (
      <>
        <View
          className={`${config.container} relative`}
          accessible={variant === 'default'}
          accessibilityLabel={
            variant === 'default' ? defaultAvatarLabel : undefined
          }
          accessibilityRole={variant === 'default' ? 'image' : undefined}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              contentFit="cover"
              transition={200}
              placeholder={{ blurhash: BLUR_HASH }}
              accessible={true}
              accessibilityLabel={accessibilityLabel || 'Profile picture'}
              accessibilityRole="image"
              accessibilityIgnoresInvertColors
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 9999,
              }}
            />
          ) : (
            <DefaultAvatarIcon />
          )}
          {renderPickerButton()}
        </View>

        {/* Options Modal */}
        <Modal
          visible={showOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseOptions}
        >
          <TouchableOpacity
            className="flex-1 bg-bg-primary/50 justify-center items-center"
            activeOpacity={1}
            onPress={handleCloseOptions}
          >
            <View className="bg-white rounded-xl p-5 w-4/5 max-w-md">
              <View className="flex flex-row justify-between items-center mb-3">
                <Typo className="text-lg font-semibold  text-center text-gray-800">
                  Choose an option
                </Typo>
                <TouchableOpacity
                  className="bg-red rounded-full"
                  onPress={handleCloseOptions}
                  accessibilityLabel="Cancel"
                  accessibilityRole="button"
                >
                  <CancelIcon
                    width={config.iconSize}
                    height={config.iconSize}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="p-3 rounded-base bg-gray-100 mb-3 items-center"
                onPress={handleOpenCamera}
                accessibilityLabel="Take photo with camera"
                accessibilityRole="button"
              >
                <Typo className="text-base font-medium text-gray-800">
                  Take Photo
                </Typo>
              </TouchableOpacity>

              <TouchableOpacity
                className="p-3 rounded-base bg-gray-100 items-center"
                onPress={handlePickImage}
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

        {/* Camera Modal */}
        <Modal
          visible={showCamera}
          animationType="slide"
          onRequestClose={handleCloseCamera}
        >
          <View className="flex-1 bg-bg-primary">
            <CameraView
              className="flex-1"
              facing={facing}
              ref={ref => setCameraRef(ref)}
            />

            {/* Camera Controls Overlay */}
            <View className="absolute bottom-16 left-7 right-0 pointer-events-box-none">
              {/* Close Button */}
              <TouchableOpacity
                className="self-start"
                onPress={handleCloseCamera}
                accessibilityLabel="Close camera"
                accessibilityRole="button"
              >
                <CancelIcon width={40} height={40} />
              </TouchableOpacity>
            </View>
            <View className="absolute bottom-10 left-0 right-0 pointer-events-box-none">
              {/* Capture Button */}
              <TouchableOpacity
                className="self-center w-20 h-20 rounded-full bg-white justify-center items-center"
                onPress={handleTakePicture}
                accessibilityLabel="Take picture"
                accessibilityRole="button"
              >
                <View className="w-16 h-16 rounded-full bg-white border-3" />
              </TouchableOpacity>
            </View>
            <View className="absolute bottom-16 right-7 pointer-events-box-none">
              <TouchableOpacity
                className="self-end"
                onPress={toggleCameraFacing}
                accessibilityLabel="Switch camera"
                accessibilityRole="button"
              >
                <MaterialIcons name="cameraswitch" size={40} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  },
);

Avatar.displayName = 'Avatar';
