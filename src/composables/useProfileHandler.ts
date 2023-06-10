import { supabase } from "@/utils/supabaseInit";
import type { SpacesType, ProfilesType } from "@/api/types";
import { TileMap } from "@/types/canvasTypes";

export let userName: string = "";
export let characterSpriteName: string = "";
export let initialSetupCompleted: boolean = false;
export let gameMapJson: TileMap | null = null;
export let gameMapTileset: string = "";

// Read user profile
export const handleReadProfile = async (userId: string, spaceId: string) => {
  try {
    if (!userId) throw new Error("No user ID found in authStore session");

    const { data: profiles, error } = await supabase
      .from<ProfilesType>("profiles")
      .select("*")
      .eq("id", userId);

    if (error) throw error;
    if (!profiles || profiles.length === 0)
      throw new Error("No user profile found for the user");

    const userProfile = profiles[0];

    const userNameForThisSpace = Object(userProfile.user_name_for_each_space).find(
      (space: { [key: string]: string }) => space[spaceId]
    );

    if (userNameForThisSpace && userProfile.character_sprite) {
      userName = userNameForThisSpace[spaceId];
      characterSpriteName = userProfile.character_sprite;
      initialSetupCompleted = true;
    } else {
      initialSetupCompleted = false;
    }
  } catch (error: any) {
    console.warn("READ PROFILES CATCH ERROR: ", error.message);
  }
};

// Download user character sprite sheet
export const downloadCharacterSpriteSheets = async (spriteSheetName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from("character-sprites")
      .download(`characters/${spriteSheetName}`);

    if (data) {
      const url = URL.createObjectURL(data);
      return url as string;
    }

    if (error) throw error;
  } catch (error: any) {
    console.warn("DOWNLOAD OTHER CHARACTERS SPRITE SHEET CATCH ERROR: ", error);
  }

  return "";
};

// Get space map
export const downloadSpaceMap = async () => {
  try {
    const { data, error } = await supabase.storage
      .from("space-maps")
      .download("nature-map.json");

    if (data) {
      const text = await data.text();
      const jsonData = JSON.parse(text);

      gameMapJson = jsonData;
    }
    if (error) throw error;
  } catch (error: any) {
    console.warn("DOWNLOAD gameMapJson CATCH ERROR: ", error.message);
  }

  try {
    const { data, error } = await supabase.storage
      .from("space-maps")
      .download("tileset_nature-map.png");

    if (data) {
      const url = URL.createObjectURL(data);
      gameMapTileset = url;
    }
    if (error) throw error;
  } catch (error: any) {
    console.warn("DOWNLOAD gameMapTileset CATCH ERROR: ", error.message);
  }
};

// Add space to visited spaces
export const handleAddSpaceToVisitedSpaces = async (
  userId: string,
  spaceId: string,
  spaceName: string
) => {
  try {
    const visitedSpaces = await getVisitedSpaces(userId);

    if (!visitedSpaces.some((space: SpacesType) => space.id === spaceId)) {
      const userSpaces = await getUserSpaces(userId, spaceName);

      if (!userSpaces.some((space: SpacesType) => space.id === spaceId)) {
        await addSpaceToVisitedSpaces(spaceName, spaceId, userId);
      }
    }
  } catch (error) {
    console.error("Error in handleAddSpaceToVisitedSpaces: ", error);
  }
};

// Get visited spaces
export const getVisitedSpaces = async (userId: string) => {
  const { data: spaces, error } = await supabase
    .from<SpacesType>("visited_spaces")
    .select("*")
    .eq("visited_user_id", userId);

  if (error) throw error;
  return spaces || [];
};

// Get user spaces
export const getUserSpaces = async (userId: string, spaceName: string) => {
  const { data: spaces, error } = await supabase
    .from<SpacesType>("spaces")
    .select("*")
    .eq("user_id", userId)
    .eq("name", spaceName);

  if (error) throw error;
  return spaces || [];
};

// Add space to visited spaces
export const addSpaceToVisitedSpaces = async (
  spaceName: string,
  spaceId: string,
  userId: string
) => {
  const { error } = await supabase.from("visited_spaces").insert({
    name: spaceName,
    id: spaceId,
    visited_user_id: userId,
  });

  if (error) throw error;
};

// After all the initial setups are done in the modal, do the preparations
export const handleInitialSetupCompleted = async (
  userId: string,
  spaceId: string,
  spaceName: string
) => {
  initialSetupCompleted = true;
  await handleReadProfile(userId, spaceId);
  // Assuming initialPreparations and doRealtimeStuff are defined elsewhere.
  // await initialPreparations();
  // doRealtimeStuff();
};
