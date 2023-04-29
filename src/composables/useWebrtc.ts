import {
  HMSReactiveStore,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectPeers,
  selectIsConnectedToRoom,
  selectVideoTrackByID,
} from "@100mslive/hms-video-store";

import type { HmsTokenResponse } from "@/types/webrtcTypes";

const FUNCTION_BASE_URL = "/.netlify/functions";
const hmsManager = new HMSReactiveStore();

// store will be used to get any state of the room
// actions will be used to perform an action in the room
export const hmsStore = hmsManager.getStore();
export const hmsActions = hmsManager.getActions();

export const fetchToken = async (
  userName: string,
  roomName: string
): Promise<HmsTokenResponse | any> => {
  try {
    // create or fetch the room_id for the passed in room
    const roomResponse = await fetch(`${FUNCTION_BASE_URL}/createRoom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room: roomName }),
    });

    const room = await roomResponse.json();

    // Generate the app/authToken
    const tokenResponse = await fetch(`${FUNCTION_BASE_URL}/generateAppToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userName,
        room_id: room.id,
        role: "host",
      }),
    });

    const token = await tokenResponse.json();

    return token;
  } catch (error) {
    throw error;
  }
};

// GUIDE: https://www.100ms.live/blog/vuejs-video-call-app-golang
