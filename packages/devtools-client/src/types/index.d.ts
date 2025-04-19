import type { RouterLinkProps } from "vue-router";

declare global {
  interface NavItem {
    to: RouterLinkProps["to"];
    icon: string;
    name: string
  }
}
