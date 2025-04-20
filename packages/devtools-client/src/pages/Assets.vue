<script setup lang="ts">
import {
  onViteRpcConnected,
  viteRpc,
  type AssetInfo,
} from "@prototype/devtools-core";
import { computed, onUnmounted, ref } from "vue";
import MainLayout from "../components/MainLayout.vue";
import Button from "../components/common/Button.vue";
import SectionBlock from "../components/common/SectionBlock.vue";
import Checkbox from "../components/common/Checkbox.vue";
import AssetGridItem from "../components/assets/AssetGridItem.vue";
import AssetListItem from "../components/assets/AssetListItem.vue";
import AssetDetails from "../components/assets/AssetDetails.vue";
import Fuse from "fuse.js";
import { watchOnce } from "@vueuse/core";
import { Dropdown } from "floating-vue";

const DETAILS_MAX_ITEMS = 50;
const search = ref("");
const view = ref("grid");
const assets = ref<AssetInfo[]>([]);

interface Option {
  label: string;
  value: string;
}

const uniqAssetsTypes = computed(() => {
  const results: Option[] = [];
  for (const asset of assets.value || []) {
    const ext = asset.path.split(".").pop();
    if (ext && !results.find((e) => e.value === ext))
      results.push({ label: ext, value: ext });
  }
  return results;
});
const filteredExtensions = ref<string[]>([]);
// first time, selected all
watchOnce(
  () => uniqAssetsTypes.value,
  (v) => {
    filteredExtensions.value = v.map((i) => i.value);
  },
);

function onToggleSelection(item: Option) {
  filteredExtensions.value = filteredExtensions.value.includes(item.value)
    ? filteredExtensions.value.filter((i) => i !== item.value)
    : [...filteredExtensions.value, item.value];
}

const selected = ref<AssetInfo>();
const fuse = computed(
  () =>
    new Fuse(assets.value || [], {
      keys: ["path"],
    }),
);
const filtered = computed(() => {
  const result = search.value
    ? fuse.value.search(search.value).map((i) => i.item)
    : assets.value || [];
  return result.filter((asset) => {
    const ext = asset.path.split(".").pop();
    return !ext || filteredExtensions.value.includes(ext);
  });
});

const byFolders = computed(() => {
  const result: Record<string, AssetInfo[]> = {};
  for (const asset of filtered.value) {
    const folder = `${asset.relativePath.split("/").slice(0, -1).join("/")}/`;
    if (!result[folder]) result[folder] = [];
    result[folder].push(asset);
  }
  return Object.entries(result).sort(([a], [b]) => a.localeCompare(b));
});

const byTree = computed(() => {
  const root = { path: "public", children: [] };

  const addToTree = (node: any, pathParts: any, file: AssetInfo) => {
    const [currentPart, ...remainingParts] = pathParts;

    let child = node.children.find((child: any) => child.path === currentPart);
    if (!child) {
      child = { ...file, path: currentPart, children: [] };
      node.children.push(child);
    }

    if (remainingParts.length > 1) addToTree(child, remainingParts, file);
    else if (remainingParts.length === 1)
      child.children.push({ ...file, path: remainingParts[0] });
  };

  filtered.value.forEach((file) => {
    const pathParts = file.relativePath
      .split("/")
      .filter((part) => part !== "");
    addToTree(root, pathParts, file);
  });

  return root.children;
});

function fetchAssets() {
  viteRpc.value.getStaticAssets().then((res) => {
    assets.value = res;
  });
}

function onAssetsUpdated() {
  fetchAssets();
}

function toggleView() {
  view.value = view.value === "list" ? "grid" : "list";
}

onViteRpcConnected(() => {
  fetchAssets();
  viteRpc.functions.on("assetsUpdated", onAssetsUpdated);
});

onUnmounted(() => {
  viteRpc.functions.off("assetsUpdated", onAssetsUpdated);
});
</script>
<template>
  <MainLayout
    :title="selected ? selected.relativePath : 'Assets'"
    :has-back-button="!!selected"
    :open-drawer="!!selected"
    @back="selected = undefined"
  >
    <template v-if="!selected" #actions>
      <span class="text-gray-400 text-sm">
        {{ assets.length }} assets in total
      </span>

      <div flex="~ items-center">
        <Dropdown
          @click="
            (e: MouseEvent) => {
              e.stopPropagation();
            }
          "
        >
          <Button icon="i-ph-funnel-duotone"></Button>
          <template #popper>
            <div class="m1 min-w-35 w-auto flex flex-col">
              <div
                v-for="item in uniqAssetsTypes"
                :key="item.value"
                class="cursor-pointer"
                @click="onToggleSelection(item)"
              >
                <div w-full flex="~ gap-2 items-center" rounded px2 py2>
                  <Checkbox
                    :model-value="filteredExtensions.includes(item.value)"
                  />
                  <span text-sm op75>{{ item.label }}</span>
                </div>
              </div>
            </div>
          </template>
        </Dropdown>

        <Button
          :icon="
            view === 'grid'
              ? 'i-ph-squares-four-duotone'
              : 'i-ph-list-bullets-duotone'
          "
          @click="toggleView"
        ></Button>
      </div>

      <input
        v-model="search"
        placeholder="Search..."
        border="~ base"
        class="bg-gray-50 text-sm rounded outline-none focus:ring-primary-300 focus:border-primary-300 block px-2.5 py-1 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white"
      />
    </template>

    <template v-if="selected" #drawer>
      <AssetDetails v-model="selected" />
    </template>

    <div :class="selected ? 'op-0' : ''">
      <template v-if="view === 'grid'">
        <template v-if="byFolders.length > 1">
          <SectionBlock
            v-for="[folder, items] of byFolders"
            :key="folder"
            :text="folder"
            :description="`${items.length} items`"
            :open="items.length <= DETAILS_MAX_ITEMS"
            :padding="false"
          >
            <div flex="~ wrap">
              <AssetGridItem
                v-for="a of items"
                :key="a.path"
                :asset="a"
                :folder="folder"
                @click="selected = a"
              />
            </div>
          </SectionBlock>
        </template>
        <div v-else p2 grid="~ cols-minmax-8rem">
          <AssetGridItem
            v-for="a of filtered"
            :key="a.path"
            :asset="a"
            @click="selected = a"
          />
        </div>
      </template>
      <div v-else>
        <AssetListItem
          v-for="(item, key) of byTree"
          :key="key"
          v-model="selected"
          :item="item"
        />
      </div>
    </div>
  </MainLayout>
</template>
