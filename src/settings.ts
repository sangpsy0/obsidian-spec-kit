import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import SpecKitPlugin from "../main";
import { LLMService } from "./services/llm";

export class SpecKitSettingsTab extends PluginSettingTab {
    plugin: SpecKitPlugin;
    llmService: LLMService;
    connectionStatus: HTMLElement | null = null;

    constructor(app: App, plugin: SpecKitPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.llmService = new LLMService();
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl("h2", { text: "Spec-Kit 설정" });

        // ========== Provider 선택 ==========
        new Setting(containerEl)
            .setName("AI 제공자")
            .setDesc("사용할 AI 서비스를 선택하세요.")
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("openrouter", "OpenRouter (추천)")
                    .addOption("openai", "OpenAI")
                    .addOption("anthropic", "Anthropic (Claude)")
                    .addOption("gemini", "Google Gemini")
                    .setValue(this.plugin.settings.provider)
                    .onChange(async (value) => {
                        this.plugin.settings.provider = value;
                        this.plugin.settings.models = [];
                        this.plugin.settings.model = "";
                        this.plugin.settings.isConnected = false;
                        await this.plugin.saveSettings();
                        this.display();
                    })
            );

        // ========== API Key 입력 ==========
        new Setting(containerEl)
            .setName("API 키")
            .setDesc("선택한 서비스의 API 키를 입력하세요.")
            .addText((text) => {
                text.inputEl.type = "password";
                text.inputEl.style.width = "300px";
                text
                    .setPlaceholder("sk-... 또는 API 키 입력")
                    .setValue(this.plugin.settings.apiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.apiKey = value;
                        this.plugin.settings.isConnected = false;
                        await this.plugin.saveSettings();
                        this.updateConnectionStatus(false, "");
                    });
            });

        // ========== 연결 테스트 ==========
        const connectionSetting = new Setting(containerEl)
            .setName("연결 상태");

        this.connectionStatus = connectionSetting.descEl.createSpan();
        this.updateConnectionStatus(
            this.plugin.settings.isConnected,
            this.plugin.settings.isConnected ? "✅ 연결됨" : "연결 테스트를 클릭하세요"
        );

        connectionSetting.addButton((btn) =>
            btn
                .setButtonText("🔌 연결 테스트")
                .setCta()
                .onClick(async () => {
                    btn.setButtonText("테스트 중...");
                    btn.setDisabled(true);

                    const isValid = await this.llmService.testConnection(
                        this.plugin.settings.provider,
                        this.plugin.settings.apiKey
                    );

                    this.plugin.settings.isConnected = isValid;
                    await this.plugin.saveSettings();

                    if (isValid) {
                        this.updateConnectionStatus(true, "✅ 연결 성공!");
                        new Notice("✅ API 연결 성공!");
                    } else {
                        this.updateConnectionStatus(false, "❌ 연결 실패 - API 키를 확인하세요");
                        new Notice("❌ 연결 실패!");
                    }

                    btn.setButtonText("🔌 연결 테스트");
                    btn.setDisabled(false);
                })
        );

        // ========== 모델 로드 ==========
        const modelLoadSetting = new Setting(containerEl)
            .setName("모델 불러오기")
            .setDesc("사용 가능한 AI 모델 목록을 불러옵니다.");

        modelLoadSetting.addButton((btn) =>
            btn
                .setButtonText("📥 모델 불러오기")
                .onClick(async () => {
                    if (!this.plugin.settings.apiKey) {
                        new Notice("⚠️ 먼저 API 키를 입력하세요.");
                        return;
                    }

                    btn.setButtonText("불러오는 중...");
                    btn.setDisabled(true);

                    const models = await this.llmService.getModels(
                        this.plugin.settings.provider,
                        this.plugin.settings.apiKey
                    );

                    this.plugin.settings.models = models;
                    if (models.length > 0 && !this.plugin.settings.model) {
                        this.plugin.settings.model = models[0].id;
                    }
                    await this.plugin.saveSettings();

                    new Notice(`✅ ${models.length}개 모델을 불러왔습니다.`);
                    btn.setButtonText("📥 모델 불러오기");
                    btn.setDisabled(false);
                    this.display();
                })
        );

        // ========== 모델 선택 ==========
        if (this.plugin.settings.models.length > 0) {
            new Setting(containerEl)
                .setName("모델 선택")
                .setDesc("사용할 AI 모델을 선택하세요.")
                .addDropdown((dropdown) => {
                    this.plugin.settings.models.forEach((m) => {
                        dropdown.addOption(m.id, m.name);
                    });
                    dropdown.setValue(this.plugin.settings.model);
                    dropdown.onChange(async (value) => {
                        this.plugin.settings.model = value;
                        await this.plugin.saveSettings();
                    });
                });
        } else {
            new Setting(containerEl)
                .setName("모델 선택")
                .setDesc("⚠️ 위의 '모델 불러오기' 버튼을 클릭하세요.");
        }

        // ========== 문서 설정 ==========
        containerEl.createEl("h3", { text: "📄 문서 설정" });

        // ========== 언어 선택 ==========
        new Setting(containerEl)
            .setName("문서 언어")
            .setDesc("생성되는 문서의 언어를 선택하세요.")
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("ko", "한글 (Korean)")
                    .addOption("en", "English")
                    .setValue(this.plugin.settings.language || "ko")
                    .onChange(async (value: 'ko' | 'en') => {
                        this.plugin.settings.language = value;
                        await this.plugin.saveSettings();
                    })
            );

        // ========== 저장 폴더 ==========
        new Setting(containerEl)
            .setName("저장 폴더")
            .setDesc("생성된 모든 문서가 이 폴더에 저장됩니다.")
            .addText((text) =>
                text
                    .setPlaceholder("Speckit")
                    .setValue(this.plugin.settings.rootFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.rootFolder = value || "Speckit";
                        await this.plugin.saveSettings();
                    })
            );

        // ========== 문서 유형 설명 ==========
        containerEl.createEl("h3", { text: "📋 생성 가능한 문서" });

        const docInfo = containerEl.createDiv();
        docInfo.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                <tr style="border-bottom: 1px solid var(--background-modifier-border);">
                    <td style="padding: 8px;"><strong>spec.md</strong></td>
                    <td style="padding: 8px;">기능 명세서 - 무엇을 만들지</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--background-modifier-border);">
                    <td style="padding: 8px;"><strong>plan.md</strong></td>
                    <td style="padding: 8px;">구현 계획 - 어떻게 만들지</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--background-modifier-border);">
                    <td style="padding: 8px;"><strong>tasks.md</strong></td>
                    <td style="padding: 8px;">작업 목록 - 순서대로 뭘 할지</td>
                </tr>
            </table>
        `;
    }

    updateConnectionStatus(connected: boolean, message: string) {
        if (this.connectionStatus) {
            this.connectionStatus.empty();
            this.connectionStatus.setText(message);
            this.connectionStatus.style.color = connected ? "green" : "var(--text-muted)";
            this.connectionStatus.style.fontWeight = connected ? "bold" : "normal";
        }
    }
}
