import EnvVariables from "@/envVariables";
import type { Room, RoomEvent } from "livekit-client";

const WEBRTC_BASE_URL = EnvVariables.webRtcApiBaseUrl;

export interface ErrorResponse {
  error: string;
}

export async function createAccessToken(
  roomName: string,
  participantName: string
): Promise<string | ErrorResponse> {
  try {
    const response = await fetch(`${WEBRTC_BASE_URL}/createAccessToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomName,
        participantName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error creating access token: ${errorData.error}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function createRestrictedAccessToken(
  roomName: string,
  participantName: string
): Promise<any | ErrorResponse> {
  try {
    const response = await fetch(`${WEBRTC_BASE_URL}/createRestrictedAccessToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomName,
        participantName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error creating restricted access token: ${errorData.error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function listRooms(): Promise<Room[] | ErrorResponse> {
  try {
    const response = await fetch(`${WEBRTC_BASE_URL}/listRooms`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error listing rooms: ${errorData.error}`);
    }

    const data = await response.json();
    return data as Room[];
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function createRoom(
  name: string,
  emptyTimeout: number,
  maxParticipants: number
): Promise<Room | ErrorResponse> {
  try {
    const response = await fetch(`${WEBRTC_BASE_URL}/createRoom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        emptyTimeout,
        maxParticipants,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error creating room: ${errorData.error}`);
    }

    const data = await response.json();
    return data as Room;
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function deleteRoom(name: string): Promise<boolean | ErrorResponse> {
  try {
    const response = await fetch(`${WEBRTC_BASE_URL}/deleteRoom/${name}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error deleting room: ${errorData.error}`);
    }

    return response.status === 200;
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
}

export async function receiveWebhookEvent(
  body: any,
  authorization: string
): Promise<RoomEvent | ErrorResponse> {
  try {
    const response = await fetch(`${WEBRTC_BASE_URL}/webhook-endpoint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error receiving webhook event: ${errorData.error}`);
    }

    const data = await response.json();
    return data as RoomEvent;
  } catch (error) {
    console.error(error);
    return { error };
  }
}
