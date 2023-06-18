import { supabase } from "@/utils/supabaseInit";
import type { SpacesType, VisitedSpacesType } from "@/types/supabaseTypes";
import { TileMap } from "@/types/canvasTypes";

export let gameMapJson: TileMap | null = null;
export let gameMapTileset: string = "";

// Read user profile
export const handleReadProfile = async (userId: string, spaceId: string) => {
  try {
    if (!userId) throw new Error("No user ID found in authStore session");

    const { data: profiles, error } = await supabase
      .from("profiles")
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
      return {
        userName: userNameForThisSpace[spaceId],
        characterSpriteName: userProfile.character_sprite,
        initialSetupCompleted: true,
      };
    } else {
      return {
        userName: "",
        characterSpriteName: "",
        initialSetupCompleted: false,
      };
    }
  } catch (error: unknown) {
    console.warn("READ PROFILES CATCH ERROR: ", error);

    return {
      userName: "",
      characterSpriteName: "",
      initialSetupCompleted: false,
      error: error,
    };
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
    await getVisitedSpaces(userId).then(async (res) => {
      if (!res.some((space) => space.space_id === spaceId)) {
        await getUserSpaces(userId).then(async (res) => {
          // If the user doesn't own the space
          if (!res.some((space: VisitedSpacesType) => space.id === spaceId)) {
            await addSpaceToVisitedSpaces(userId, spaceId, spaceName);
          }
        });
      }
    });
  } catch (error) {
    console.error("Error in handleAddSpaceToVisitedSpaces: ", error);
  }
};

// Get visited spaces
export const getVisitedSpaces = async (userId: string) => {
  const { data: spaces, error } = await supabase
    .from("visited_spaces")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;

  return spaces;
};

// Get user spaces
export const getUserSpaces = async (userId: string) => {
  const { data: spaces, error } = await supabase
    .from("spaces")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return spaces;
};

// Add space to visited spaces
export const addSpaceToVisitedSpaces = async (
  userId: string,
  spaceId: string,
  spaceName: string
) => {
  const { error } = await supabase.from("visited_spaces").insert([
    {
      user_id: userId,
      space_id: spaceId,
      name: spaceName,
    },
  ]);

  if (error) throw error;
};
