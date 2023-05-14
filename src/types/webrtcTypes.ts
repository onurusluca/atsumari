export type HmsTokenResponse = {
  user_id?: String;
  room_id?: String;
  token: String;
};

export interface HMSConnectionQuality {
  peerID: string;
  downlinkQuality: number;
}

export type DevicesStoreTypes = {
  microphoneName: string;
  cameraName: string;
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
  isMicrophoneMuted: boolean;
  isCameraMuted: boolean;
  isScreenSharing: boolean;
};
