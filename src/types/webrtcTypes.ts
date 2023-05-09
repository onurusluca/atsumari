export type HmsTokenResponse = {
  user_id?: String;
  room_id?: String;
  token: String;
};

export interface HMSConnectionQuality {
  peerID: string;
  downlinkQuality: number;
}
