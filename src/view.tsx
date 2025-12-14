import { ItemView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import * as React from "react";
import { App } from "./App";
import SpecKitPlugin from "../main";

export const VIEW_TYPE_SPEC_KIT = "spec-kit-view";

export class SpecKitView extends ItemView {
    root: Root | null = null;
    plugin: SpecKitPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: SpecKitPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return VIEW_TYPE_SPEC_KIT;
    }

    getDisplayText() {
        return "Spec-Kit Chat";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        const rootEl = container.createDiv();
        this.root = createRoot(rootEl);
        this.root.render(
            <React.StrictMode>
                <App plugin={this.plugin} />
            </React.StrictMode>
        );
    }

    async onClose() {
        this.root?.unmount();
    }
}
