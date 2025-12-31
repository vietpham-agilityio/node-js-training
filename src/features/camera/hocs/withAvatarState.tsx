import { ComponentType, useCallback, useState } from 'react';

export interface WithAvatarStateProps {
  initialSource?: string | null;
  onChangeImage?: (uri: string) => void;
}

export interface AvatarStateInjectedProps {
  avatarUri: string | null;
  setAvatarUri: (uri: string | null) => void;
  removeAvatar: () => void;
  hasAvatar: boolean;
}

/**
 * HOC that manages avatar state
 * Handles: Current avatar URI, change callbacks, remove functionality
 *
 * @example
 * const MyComponent = withAvatarState(BaseComponent);
 *
 * function BaseComponent({ avatarUri, setAvatarUri, removeAvatar, hasAvatar }) {
 *   return (
 *     <div>
 *       <img src={avatarUri} />
 *       <button onClick={() => setAvatarUri('new.jpg')}>Change</button>
 *       <button onClick={removeAvatar}>Remove</button>
 *     </div>
 *   );
 * }
 */
export function withAvatarState<P extends object>(
  WrappedComponent: ComponentType<P & AvatarStateInjectedProps>,
): ComponentType<P & WithAvatarStateProps> {
  return function WithAvatarStateComponent({
    initialSource,
    onChangeImage,
    ...props
  }: P & WithAvatarStateProps) {
    const [avatarUri, setAvatarUriState] = useState<string | null>(
      initialSource || null,
    );
    const hasAvatar = !!avatarUri;

    /**
     * Set avatar URI and call callback
     */
    const setAvatarUri = useCallback(
      (uri: string | null) => {
        setAvatarUriState(uri);
        if (uri) {
          onChangeImage?.(uri);
        }
      },
      [onChangeImage],
    );

    /**
     * Remove current avatar
     */
    const removeAvatar = useCallback(() => {
      setAvatarUriState(null);
      onChangeImage?.('');
    }, [onChangeImage]);

    return (
      <WrappedComponent
        {...(props as P)}
        avatarUri={avatarUri}
        setAvatarUri={setAvatarUri}
        removeAvatar={removeAvatar}
        hasAvatar={hasAvatar}
        onImageSelected={setAvatarUri}
      />
    );
  };
}
