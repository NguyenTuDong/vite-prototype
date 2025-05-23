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

export interface CodeSnippet {
  code: string;
  lang: string;
  name: string;
  docs?: string;
}

export interface LinterCommonResult {
  file: string;
  relativeFilePath: string;
  line: number;
  column: number;
  message: string;
  rule: string;
  severity: string;
}

export type LinterResult = Record<string, LinterCommonResult[]>;

export interface LinterReport {
  linter: string;
  errorCount: number;
  warningCount: number;
  results: LinterResult;
}

export interface RouteInfo {
  filePath: string;
  relativePath: string;
  routePath: string;
}
