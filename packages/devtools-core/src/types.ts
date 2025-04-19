import type { ChannelOptions } from "birpc";
import type { ModuleNode } from "vite";

export type MergeableChannelOptions = Omit<
  ChannelOptions,
  "serialize" | "deserialize"
>;

export type Channel =
  | MergeableChannelOptions
  | {
      channels: MergeableChannelOptions[];
    };

// assets
export type AssetType =
  | "image"
  | "font"
  | "video"
  | "audio"
  | "text"
  | "json"
  | "wasm"
  | "other";
export interface AssetInfo {
  path: string;
  type: AssetType;
  publicPath: string;
  relativePath: string;
  filePath: string;
  size: number;
  mtime: number;
}
export interface ImageMeta {
  width: number;
  height: number;
  orientation?: number;
  type?: string;
  mimeType?: string;
}

export type AssetImporter = Pick<ModuleNode, "url" | "id">;

export interface AssetEntry {
  path: string;
  content: string;
  encoding?: BufferEncoding;
  override?: boolean;
}

