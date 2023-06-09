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

// The Payload type for the broadcast message
export type Payload = {
  id: string;
  userName: string;
  characterSpriteName: string;
  x: number;
  y: number;
  facingTo: string;
};

// The Channel type represents a broadcasting channel
export type Channel = {
  send: (data: any) => void;
  on: (type: string, event: any, handler: (payload: any) => void) => Channel;
  subscribe: (callback: (status: string) => void) => void;
  track: (data: any) => void;
  unsubscribe: () => void;
};
