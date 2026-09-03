import { ComponentType, useCallback, useState } from 'react';
import { Alert } from 'react-native';

// SDKs
import { CameraType, useCameraPermissions } from 'expo-camera';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

// Constants
import { MESSAGES } from '@/constants';
import { CameraModal } from '../components/CameraModal';
import { OptionsModal } from '../components/OptionsModal';
import { PreviewModal } from '../components/PreviewModal';

// Components

export interface WithCameraOptionProps {
  onImageSelected?: (uri: string) => void;
  maxImageSize?: number;
  imageQuality?: number;
  iconSize?: number;
}

export interface CameraOptionInjectedProps {
  openCameraOptions: () => void;
  isSelectingImage: boolean;
}

/**
 * HOC that adds camera/gallery selection functionality
 * Handles: Camera, Gallery, Preview, Compression
 *
 * @example
 * const MyComponent = withCameraOption(BaseComponent);
 *
 * function BaseComponent({ openCameraOptions, isSelectingImage }) {
 *   return (
 *     <div>
 *       <button onClick={openCameraOptions}>Select Photo</button>
 *       {isSelectingImage && <Spinner />}
 *     </div>
 *   );
 * }
 */
export function withCameraOption<P extends object>(
  WrappedComponent: ComponentType<P & CameraOptionInjectedProps>,
) {
  return function WithCameraOptionComponent({
    onImageSelected,
    maxImageSize = 800,
    imageQuality = 0.7,
    iconSize = 24,
    ...props
  }: P & WithCameraOptionProps) {
    const [showOptions, setShowOptions] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('back');
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * Compress and resize image
     */
    const compressImage = useCallback(
      async (uri: string): Promise<string> => {
        try {
          const context = ImageManipulator.manipulate(uri);
          context.resize({ width: maxImageSize });
          const renderedImage = await context.renderAsync();
          const result = await renderedImage.saveAsync({
            compress: imageQuality,
            format: SaveFormat.JPEG,
          });
          return result.uri;
        } catch {
          return uri;
        }
      },
      [imageQuality, maxImageSize],
    );

    /**
     * Handle image picker from gallery
     */
    const handlePickImage = useCallback(async () => {
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

      setIsProcessing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const originalUri = result.assets[0].uri;
        const compressedUri = await compressImage(originalUri);
        onImageSelected?.(compressedUri);
      }

      setShowOptions(false);
      setIsProcessing(false);
    }, [compressImage, onImageSelected]);

    /**
     * Handle opening camera
     */
    const handleOpenCamera = useCallback(async () => {
      if (!cameraPermission) return;

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
    }, [cameraPermission, requestCameraPermission]);

    /**
     * Handle taking picture
     */
    const handleTakePicture = useCallback((uri: string) => {
      setPreviewUri(uri);
      setShowCamera(false);
      setShowPreview(true);
    }, []);

    /**
     * Handle confirming photo from preview
     */
    const handleConfirmPhoto = useCallback(async () => {
      if (previewUri) {
        setIsProcessing(true);
        try {
          const compressedUri = await compressImage(previewUri);
          onImageSelected?.(compressedUri);
          setShowPreview(false);
          setPreviewUri(null);
        } catch {
          Alert.alert('Error', 'Failed to save photo');
        } finally {
          setIsProcessing(false);
        }
      }
    }, [compressImage, previewUri, onImageSelected]);

    /**
     * Handle retaking photo
     */
    const handleRetakePhoto = useCallback(() => {
      setPreviewUri(null);
      setShowPreview(false);
      setShowCamera(true);
    }, []);

    /**
     * Handle canceling preview
     */
    const handleCancelPreview = useCallback(() => {
      setPreviewUri(null);
      setShowPreview(false);
    }, []);

    /**
     * Toggle camera facing
     */
    const toggleCameraFacing = useCallback(() => {
      setFacing(current => (current === 'back' ? 'front' : 'back'));
    }, []);

    /**
     * Open options modal (camera or gallery)
     */
    const openCameraOptions = useCallback(() => {
      setShowOptions(true);
    }, []);

    /**
     * Close options modal
     */
    const handleCloseOptions = useCallback(() => {
      setShowOptions(false);
    }, []);

    /**
     * Close camera modal
     */
    const handleCloseCamera = useCallback(() => {
      setShowCamera(false);
    }, []);

    return (
      <>
        {/* Wrapped Component with injected props */}
        <WrappedComponent
          {...(props as P)}
          openCameraOptions={openCameraOptions}
          isSelectingImage={isProcessing}
        />

        {/* Modals */}
        <OptionsModal
          visible={showOptions}
          iconSize={iconSize}
          onClose={handleCloseOptions}
          onOpenCamera={handleOpenCamera}
          onPickImage={handlePickImage}
        />

        <CameraModal
          visible={showCamera}
          facing={facing}
          onClose={handleCloseCamera}
          onTakePicture={handleTakePicture}
          onToggleFacing={toggleCameraFacing}
        />

        <PreviewModal
          visible={showPreview}
          previewUri={previewUri}
          onClose={handleCancelPreview}
          onConfirm={handleConfirmPhoto}
          onRetake={handleRetakePhoto}
        />
      </>
    );
  };
}
