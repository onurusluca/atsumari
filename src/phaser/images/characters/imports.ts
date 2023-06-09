import boy from "./boy.png";
import dog from "./dog.png";
import eskimo from "./eskimo.png";
import frog from "./frog.png";
import goldKnight from "./gold-knight.png";
import knight from "./knight.png";
import ninja from "./ninja.png";
import oldMan from "./old-man.png";
import princess from "./princess.png";
import samurai from "./samurai.png";
import suitMan from "./suit-man.png";
import woman from "./woman.png";

const avatarImages: {
  [key: string]: string;
} = {
  "boy.png": boy,
  "dog.png": dog,
  "eskimo.png": eskimo,
  "frog.png": frog,
  "gold-knight.png": goldKnight,
  "knight.png": knight,
  "ninja.png": ninja,
  "old-man.png": oldMan,
  "princess.png": princess,
  "samurai.png": samurai,
  "suit-man.png": suitMan,
  "woman.png": woman,
};

export const getCharacterSpriteSheet = (avatarName: string) => avatarImages[avatarName];
