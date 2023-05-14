import { EnvVariables } from "@/envVariables";
import type { Room, RoomEvent } from "livekit-client";
const WEBRTC_BASE_URL = EnvVariables.webRtcApiBaseUrl;

export async function createAccessToken(roomName: string, participantName: string) {
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
  const data = await response.text();
  return data;
}

export async function createRestrictedAccessToken(
  roomName: string,
  participantName: string
) {
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
  const data = await response.json();
  return data;
}

export async function listRooms() {
  const response = await fetch(`${WEBRTC_BASE_URL}/listRooms`);
  const data = await response.json();
  return data as Room[];
}

export async function createRoom(
  name: string,
  emptyTimeout: number,
  maxParticipants: number
) {
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
  const data = await response.json();
  return data as Room;
}

export async function deleteRoom(name: string) {
  const response = await fetch(`${WEBRTC_BASE_URL}/deleteRoom/${name}`, {
    method: "DELETE",
  });
  return response.status === 200;
}

export async function receiveWebhookEvent(body: any, authorization: string) {
  const response = await fetch(`${WEBRTC_BASE_URL}/webhook-endpoint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return data as RoomEvent;
}
