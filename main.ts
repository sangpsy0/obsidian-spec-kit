import { Plugin, WorkspaceLeaf } from "obsidian";
import { SpecKitView, VIEW_TYPE_SPEC_KIT } from "./src/view";
import { SpecKitSettingsTab } from "./src/settings";

export interface SpecKitSettings {
    provider: string;
    apiKey: string;
    rootFolder: string;
    model: string;
    models: { id: string; name: string }[];
    isConnected: boolean;
    language: 'ko' | 'en';  // 언어 설정 추가
}

const DEFAULT_SETTINGS: SpecKitSettings = {
    provider: 'openrouter',
    apiKey: '',
    rootFolder: 'Speckit',
    model: '',
    models: [],
    isConnected: false,
    language: 'ko'  // 기본값: 한글
};

export default class SpecKitPlugin extends Plugin {
    settings: SpecKitSettings;

    async onload() {
        await this.loadSettings();

        this.registerView(
            VIEW_TYPE_SPEC_KIT,
            (leaf) => new SpecKitView(leaf, this)
        );

        this.addRibbonIcon("bot", "Spec-Kit Chat", () => {
            this.activateView();
        });

        this.addSettingTab(new SpecKitSettingsTab(this.app, this));
    }

    async onunload() { }

    async activateView() {
        const { workspace } = this.app;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_SPEC_KIT);

        if (leaves.length > 0) {
            workspace.revealLeaf(leaves[0]);
        } else {
            const leaf = workspace.getRightLeaf(false);
            if (leaf) {
                await leaf.setViewState({ type: VIEW_TYPE_SPEC_KIT, active: true });
                workspace.revealLeaf(leaf);
            }
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
