import {
  HMSReactiveStore,
  selectDevices,
  selectHMSMessages,
  selectIsConnectedToRoom,
  selectIsLocalAudioEnabled,
  selectIsLocalScreenShared,
  selectIsLocalVideoEnabled,
  selectIsSomeoneScreenSharing,
  selectLocalMediaSettings,
  selectPeers,
  selectPeerScreenSharing,
} from "@100mslive/hms-video-store";
//  import type { HMSStore } from '@100mslive/hms-video-store';

const hms = new HMSReactiveStore();

// by default subscriber is notified about store changes post subscription only, this can be
// changed to call it right after subscribing too using this function.
hms.triggerOnSubscribe(); // optional, recommended

const hmsActions = hms.getActions();
const hmsStore = hms.getStore();
const hmsNotifications = hms.getNotifications();

export { hmsActions, hmsStore, hmsNotifications };

export const tokenStore = ref();

export const hmsIsConnected = ref(selectIsConnectedToRoom);
export const hmsPeers = ref(selectPeers);
export const hmsIsAudioEnabled = ref(selectIsLocalAudioEnabled);
export const hmsIsVideoEnabled = ref(selectIsLocalVideoEnabled);
export const hmsMessages = ref(selectHMSMessages);

// For knowing list of audio and video devices as well as the currently selected ones
export const hmsAllDevices = ref(selectDevices);
export const hmsSelectedDevices = ref(selectLocalMediaSettings);

// UI things
export const isChatOpen = ref(false);

// Screenshare related
export const hmsAmIScreenSharing = ref(selectIsLocalScreenShared);
export const hmsIsAnyoneScreenSharing = ref(selectIsSomeoneScreenSharing);
export const hmsPeerScreenSharing = ref(selectPeerScreenSharing);
