import type { Metadata } from "next";

import { ModuleManager } from "@/components/admin/module-manager";
import { moduleConfigs, type ModuleKey } from "@/components/admin/module-configs";

/** Builds the page and metadata for a content module: `export default createModulePage("projects")`. */
export function createModulePage(key: ModuleKey) {
  return function ModulePage() {
    return <ModuleManager moduleKey={key} />;
  };
}

export function moduleMetadata(key: ModuleKey): Metadata {
  return { title: moduleConfigs[key].label };
}
