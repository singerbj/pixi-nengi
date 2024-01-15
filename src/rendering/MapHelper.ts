import * as PIXI from "pixi.js";
//@ts-expect-error
import TileUtilities from "tiled-utils";
export const injectAndGetTileUtilites = () => {
  return new TileUtilities(PIXI);
};
