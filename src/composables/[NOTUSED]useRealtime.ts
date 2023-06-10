import { User } from "../types/authTypes";
import { Channel, Payload } from "../types/webrtcTypes";
// Configuration
const BROADCAST_CONFIG = {
  config: {
    broadcast: {
      self: false,
      ack: false,
    },
  },
};

const EVENT_JOIN = "join";
const EVENT_LEAVE = "leave";
const EVENT_SEND_USER_POSITION = "sendUserPositionEvent";
const BROADCAST_SUBSCRIBED_STATUS = "SUBSCRIBED";

let broadCastChannel: Channel;

const initChannel = (spaceId: string) => {
  broadCastChannel = supabase.channel(spaceId, BROADCAST_CONFIG);
};

const getUserPayload = (
  x: number,
  y: number,
  facingTo: string,
  userId: string,
  userName: string,
  characterSpriteName: string
): Payload => ({
  id: userId,
  userName,
  characterSpriteName,
  x,
  y,
  facingTo,
});

const sendUserAction = (
  x: number,
  y: number,
  facingTo: string,
  userId: string,
  userName: string,
  characterSpriteName: string
): void => {
  broadCastChannel.send({
    type: "broadcast",
    event: EVENT_SEND_USER_POSITION,
    payload: getUserPayload(x, y, facingTo, userId, userName, characterSpriteName),
  });

  console.log(
    "sendUserAction",
    getUserPayload(x, y, facingTo, userId, userName, characterSpriteName)
  );
};

const handleJoinEvent =
  (users: User[], emitter: any, userId: string) =>
  async ({ newPresences }: { newPresences: User[] }): Promise<void> => {
    const [newUser] = newPresences;

    console.log("newUser", newUser);

    users.push({ ...newUser });

    console.log("Someone joined the space!", newPresences);

    if (newUser.id !== userId) {
      emitter.emit("newUserJoined", newUser);
      console.log("Emit new user", newUser);
    }
  };

const handleLeaveEvent =
  (users: User[], emitter: any, userId: string) =>
  ({ leftPresences }: { leftPresences: User[] }): void => {
    const leftUser = leftPresences[0];
    if (!leftUser) {
      console.log("No user in leftPresences array");
      return;
    }

    const userIndex = users.findIndex(({ id }) => id === leftUser.id);
    if (userIndex === -1) {
      console.log(`No user found with id ${leftUser.id}`);
      return;
    }

    users.splice(userIndex, 1);

    console.log("Someone left the space!", leftUser);

    if (leftUser.id !== userId) {
      emitter.emit("userLeft", leftUser);
      console.log("Emit left user", leftUser);
    }
  };

const handleUserPositionBroadcast =
  (users: User[], emitter: any) =>
  ({ payload: userPayload }: { payload: User }): void => {
    if (!userPayload) {
      console.error("Invalid payload received");
      return;
    }

    const user = users.find(({ id }) => id === userPayload.id);
    if (user) {
      Object.assign(user, userPayload);
    }

    emitter.emit("userPositionUpdated", userPayload);
  };

const doRealtimeStuff = (
  spaceId: string,
  initialUserPosition: any,
  canvasLocalStorage: any,
  users: User[],
  emitter: any,
  userId: string,
  userName: string,
  characterSpriteName: string
) => {
  try {
    initChannel(spaceId);
    broadCastChannel
      .on("presence", { event: EVENT_JOIN }, handleJoinEvent(users, emitter, userId))
      .on("presence", { event: EVENT_LEAVE }, handleLeaveEvent(users, emitter, userId))
      .on(
        "broadcast",
        { event: EVENT_SEND_USER_POSITION },
        handleUserPositionBroadcast(users, emitter)
      )
      .subscribe((status: string) => {
        if (status === BROADCAST_SUBSCRIBED_STATUS) {
          const lastPosition =
            canvasLocalStorage.value.lastUserPosition || initialUserPosition;
          broadCastChannel.track({
            ...getUserPayload(
              lastPosition.x,
              lastPosition.y,
              "down",
              userId,
              userName,
              characterSpriteName
            ),
            online_at: new Date().toISOString(),
            lastPosition,
          });
        }
      });
  } catch (error) {
    console.error("An error occurred in doRealtimeStuff:", error);
  }
};

// Export functions
export { sendUserAction, doRealtimeStuff };
