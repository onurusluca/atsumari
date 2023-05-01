import { EnvVariables } from "@/envVariables";
import { HMSReactiveStore } from "@100mslive/hms-video-store";

import type { HmsTokenResponse } from "@/types/webrtcTypes";

const WEBRTC_BASE_URL = EnvVariables.webRtcApiBaseUrl;
const hmsManager = new HMSReactiveStore();

// store will be used to get any state of the room
// actions will be used to perform an action in the room
export const hmsStore = hmsManager.getStore();
export const hmsActions = hmsManager.getActions();

export async function createRoom(
  name: string,
  region: string,
  description?: string,
  template_id?: string
): Promise<any> {
  console.log("createRoom", WEBRTC_BASE_URL);

  const response = await fetch(`${WEBRTC_BASE_URL}/create-room`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      name,
      description,
      template_id,
      region,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create room");
  }

  return await response.json();
}

// Get auth token to join the room
export async function generateAuthToken(
  room_id: string,
  user_id: string,
  role: string
): Promise<any> {
  const response = await fetch(`${WEBRTC_BASE_URL}/auth-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      room_id,
      user_id,
      role,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate auth token");
  }

  return await response.json();
}

export const fetchToken = async (
  userName: string,
  roomName: string
): Promise<HmsTokenResponse | any> => {
  try {
    // create or fetch the room_id for the passed in room
    const roomResponse = await fetch(`${WEBRTC_BASE_URL}/createRoom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room: roomName }),
    });

    if (!roomResponse.ok) {
      throw new Error("Failed to create or fetch the room");
    }

    const room = await roomResponse.json();

    // Generate the app/authToken
    const tokenResponse = await fetch(`${WEBRTC_BASE_URL}/generateAppToken`, {
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

    if (!tokenResponse.ok) {
      throw new Error("Failed to generate app/authToken");
    }

    const token = await tokenResponse.json();
    return token;
  } catch (error: any) {
    throw error;
  }
};

export async function getSessionAnalyticsByRoom(room_id: string): Promise<any> {
  const response = await fetch(
    `${WEBRTC_BASE_URL}/session-analytics-by-room?room_id=${encodeURIComponent(
      room_id
    )}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get session analytics");
  }

  return await response.json();
}

export async function getSessionListByRoom(room_id: string): Promise<any> {
  const response = await fetch(
    `${WEBRTC_BASE_URL}/session-list-by-room?room_id=${encodeURIComponent(room_id)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get session list");
  }

  return await response.json();
}
