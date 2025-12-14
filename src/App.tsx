import * as React from "react";
import SpecKitPlugin from "../main";
import { LLMService } from "./services/llm";
import { Notice } from "obsidian";

interface AppProps {
    plugin: SpecKitPlugin;
}

// ============================================
// 언어별 시스템 프롬프트 (단계별 워크플로우)
// ============================================

const getSystemPrompt = (lang: 'ko' | 'en') => lang === 'ko'
    ? `당신은 Spec-Driven Development 전문가입니다.
사용자의 아이디어를 **단계별로 고도화**하여 고품질 기술 문서를 작성합니다.

## 🎯 필수 워크플로우 (순서대로!)
1. **Clarify (명확화)** - 아이디어에 대해 5-7개의 핵심 질문
2. **Analyze (분석)** - 요구사항 분석, 문제점/위험 파악
3. **Generate (생성)** - 충분한 대화 후 3개 문서 생성

## ⚠️ 중요 규칙
- 사용자가 아이디어를 설명하면 **바로 문서를 생성하지 마세요!**
- 먼저 **명확화 질문**을 통해 요구사항을 구체화하세요
- 충분한 대화(최소 2-3번 왕복) 후에 문서를 생성하세요
- 문서 생성 전 반드시 사용자 확인을 받으세요

## 📋 명령어
- \`/speckit.clarify\` - 명확화 질문 (추가 질문하기)
- \`/speckit.analyze\` - 분석하기 (문제점, 위험, 개선점)
- \`/speckit.generate\` - 3개 문서 생성 (spec.md, plan.md, tasks.md)

## 대화 예시
사용자: "사진 앨범 앱 만들고 싶어"
AI: "좋은 아이디어네요! 몇 가지 질문드릴게요:
1. 사진은 어디서 가져오나요? (로컬/클라우드)
2. 여러 사용자가 함께 사용하나요?
3. ..."

## 문서 생성 형식
문서 생성 시 아래 형식 사용:
\`\`\`file:파일명.md
(내용)
\`\`\``

    : `You are a Spec-Driven Development expert.
You **refine ideas step-by-step** to create high-quality technical documents.

## 🎯 Required Workflow (in order!)
1. **Clarify** - Ask 5-7 key questions about the idea
2. **Analyze** - Analyze requirements, identify issues/risks
3. **Generate** - Create 3 documents after sufficient discussion

## ⚠️ Important Rules
- When user describes an idea, **DO NOT generate documents immediately!**
- First, ask **clarifying questions** to refine requirements
- Generate documents only after sufficient conversation (at least 2-3 exchanges)
- Always get user confirmation before generating documents

## 📋 Commands
- \`/speckit.clarify\` - Ask clarifying questions
- \`/speckit.analyze\` - Analyze (issues, risks, improvements)
- \`/speckit.generate\` - Generate 3 documents (spec.md, plan.md, tasks.md)

## Conversation Example
User: "I want to build a photo album app"
AI: "Great idea! Let me ask a few questions:
1. Where do photos come from? (local/cloud)
2. Will multiple users share it?
3. ..."

## Document Generation Format
When generating documents, use:
\`\`\`file:filename.md
(content)
\`\`\``;

// ============================================
// 명령어별 프롬프트
// ============================================

const COMMANDS = {
    "/speckit.clarify": {
        ko: `현재까지의 대화를 바탕으로 **명확화 질문**을 해주세요.

아직 파악되지 않은 부분에 대해 5-7개의 구체적인 질문을 하세요:
1. 핵심 기능에 대한 세부사항
2. 사용자/대상에 대한 정보
3. 기술적 제약사항
4. 우선순위와 범위
5. 특별한 요구사항

**질문만 하고, 문서는 생성하지 마세요!**`,
        en: `Based on the conversation so far, ask **clarifying questions**.

Ask 5-7 specific questions about unclear aspects:
1. Details about core features
2. Information about users/audience
3. Technical constraints
4. Priorities and scope
5. Special requirements

**Only ask questions, do NOT generate documents!**`
    },
    "/speckit.analyze": {
        ko: `현재까지의 대화를 바탕으로 **분석**해주세요.

다음 항목을 분석하세요:
1. **요구사항 정리** - 지금까지 파악된 요구사항
2. **잠재적 문제점** - 예상되는 기술적/비즈니스적 문제
3. **위험 요소** - 프로젝트 위험과 대응 방안
4. **개선 제안** - 더 나은 방향에 대한 제안
5. **누락된 부분** - 추가로 논의가 필요한 사항

**분석만 하고, 문서는 생성하지 마세요!**`,
        en: `Based on the conversation so far, provide **analysis**.

Analyze the following:
1. **Requirements Summary** - Requirements identified so far
2. **Potential Issues** - Expected technical/business problems
3. **Risk Factors** - Project risks and mitigation strategies
4. **Improvement Suggestions** - Better approaches
5. **Missing Parts** - Items needing further discussion

**Only analyze, do NOT generate documents!**`
    },
    "/speckit.generate": {
        ko: `지금까지의 대화를 바탕으로 **3개의 기술 문서를 모두 생성**하세요.

## 필수 생성 파일
1. \`\`\`file:spec.md - 기능 명세서
2. \`\`\`file:plan.md - 구현 계획
3. \`\`\`file:tasks.md - 작업 목록

## 각 문서 구조

### spec.md
- 프로젝트 개요 (이름, 설명, 목표 사용자)
- 핵심 기능 (사용자 스토리, 수용 조건)
- 비기능 요구사항
- 우선순위

### plan.md
- 기술 스택 (선택 이유 포함)
- 시스템 아키텍처
- 데이터 모델
- API 설계
- 디렉토리 구조

### tasks.md
- 마일스톤별 작업 분류
- 각 작업에 파일 경로, 예상 시간 포함
- 의존성 표시
- 체크포인트

**반드시 3개 파일 모두 생성하세요!**`,
        en: `Based on our conversation, **generate all 3 technical documents**.

## Required Files
1. \`\`\`file:spec.md - Functional Specification
2. \`\`\`file:plan.md - Implementation Plan
3. \`\`\`file:tasks.md - Task List

## Document Structure

### spec.md
- Project Overview (name, description, target users)
- Core Features (user stories, acceptance criteria)
- Non-functional requirements
- Priorities

### plan.md
- Tech Stack (with reasons)
- System Architecture
- Data Model
- API Design
- Directory Structure

### tasks.md
- Tasks by milestone
- Each task with file path, estimated time
- Dependencies marked
- Checkpoints

**Generate ALL 3 files!**`
    }
};

export const App: React.FC<AppProps> = ({ plugin }) => {
    const lang = plugin.settings.language || 'ko';

    const getWelcomeMessage = () => lang === 'ko'
        ? `# 🌱 Spec-Kit

아이디어를 **단계별로 고도화**하여 기술 문서를 생성합니다.

## 📋 워크플로우
| 단계 | 명령어 | 설명 |
|------|--------|------|
| 1️⃣ | (아이디어 설명) | 만들고 싶은 것 설명 |
| 2️⃣ | \`/speckit.clarify\` | 명확화 질문 |
| 3️⃣ | \`/speckit.analyze\` | 분석 (문제점/위험) |
| 4️⃣ | \`/speckit.generate\` | 문서 생성 (spec, plan, tasks) |

## 🚀 시작하기
**어떤 프로젝트를 만들고 싶으신가요?**

> 아이디어를 설명하면, 질문을 통해 함께 구체화해 나갑니다.`
        : `# 🌱 Spec-Kit

We **refine your idea step-by-step** to generate technical documents.

## 📋 Workflow
| Step | Command | Description |
|------|---------|-------------|
| 1️⃣ | (Describe idea) | Explain what you want to build |
| 2️⃣ | \`/speckit.clarify\` | Clarifying questions |
| 3️⃣ | \`/speckit.analyze\` | Analysis (issues/risks) |
| 4️⃣ | \`/speckit.generate\` | Generate documents (spec, plan, tasks) |

## 🚀 Getting Started
**What project would you like to build?**

> Describe your idea, and we'll refine it together through questions.`;

    const [messages, setMessages] = React.useState<{ role: string; content: string }[]>([
        { role: "system", content: getSystemPrompt(lang) },
        { role: "assistant", content: getWelcomeMessage() }
    ]);
    const [input, setInput] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [selectedModel, setSelectedModel] = React.useState(plugin.settings.model);

    const llmService = React.useMemo(() => new LLMService(), []);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    React.useEffect(() => {
        setSelectedModel(plugin.settings.model);
    }, [plugin.settings.model]);

    const saveToFolder = async (filename: string, content: string) => {
        const { vault } = plugin.app;
        const folder = plugin.settings.rootFolder || "Speckit";
        const cleanFilename = filename.split('/').pop() || filename;
        const fullPath = `${folder}/${cleanFilename}`;

        try {
            if (!(await vault.adapter.exists(folder))) {
                await vault.createFolder(folder);
            }

            if (await vault.adapter.exists(fullPath)) {
                const file = vault.getAbstractFileByPath(fullPath);
                if (file) {
                    await vault.modify(file as any, content);
                    new Notice(`✅ ${fullPath}`);
                }
            } else {
                await vault.create(fullPath, content);
                new Notice(`✅ ${fullPath}`);
            }
            return true;
        } catch (e) {
            new Notice(`❌ ${lang === 'ko' ? '저장 실패' : 'Save failed'}: ${fullPath}`);
            return false;
        }
    };

    const processResponse = async (content: string) => {
        const regex = /```file:([^\n]+)\n([\s\S]*?)```/g;
        let match;
        let savedFiles: string[] = [];

        while ((match = regex.exec(content)) !== null) {
            const filename = match[1].trim();
            const fileContent = match[2];
            const saved = await saveToFolder(filename, fileContent);
            if (saved) savedFiles.push(filename);
        }

        return savedFiles;
    };

    const saveResponse = async (content: string) => {
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `response-${timestamp}.md`;
        await saveToFolder(filename, content);
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        if (!plugin.settings.model) {
            new Notice(lang === 'ko' ? "⚠️ 먼저 설정에서 모델을 선택하세요." : "⚠️ Please select a model first.");
            return;
        }

        let content = input;
        const cmd = input.trim().split(' ')[0] as keyof typeof COMMANDS;

        // 명령어 감지
        if (COMMANDS[cmd]) {
            const cmdPrompt = COMMANDS[cmd][lang];
            content = `${input}\n\n[System Instruction]\n${cmdPrompt}`;
        }

        const userMsg = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await llmService.sendMessage(
                plugin.settings.provider,
                plugin.settings.apiKey,
                selectedModel,
                [...messages, { role: "user", content }]
            );

            setMessages(prev => [...prev, { role: "assistant", content: response }]);

            // 파일 저장 (생성 명령어일 때만)
            const savedFiles = await processResponse(response);
            if (savedFiles.length > 0) {
                new Notice(`📁 ${savedFiles.length}${lang === 'ko' ? '개 파일 생성' : ' files created'} → ${plugin.settings.rootFolder}/`);
            }

        } catch (e: any) {
            new Notice(`❌ ${e.message}`);
            setMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="spec-kit-container">
            <div className="header">
                <select
                    value={selectedModel}
                    onChange={async (e) => {
                        setSelectedModel(e.target.value);
                        plugin.settings.model = e.target.value;
                        await plugin.saveSettings();
                    }}
                >
                    {plugin.settings.models.length > 0 ? (
                        plugin.settings.models.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))
                    ) : (
                        <option value="">{lang === 'ko' ? "⚠️ 설정에서 모델 불러오기" : "⚠️ Load models in settings"}</option>
                    )}
                </select>
                {plugin.settings.isConnected && <span className="connected-badge">✅</span>}
            </div>

            <div className="messages-list">
                {messages.filter(m => m.role !== 'system').map((msg, i) => (
                    <div key={i} className={`message ${msg.role}`}>
                        <strong>{msg.role === 'user' ? (lang === 'ko' ? '나' : 'You') : 'SpecKit'}:</strong>
                        <div className="message-content">{msg.content}</div>
                        {msg.role === 'assistant' && (
                            <button className="save-btn" onClick={() => saveResponse(msg.content)}>
                                💾 {lang === 'ko' ? '저장' : 'Save'}
                            </button>
                        )}
                    </div>
                ))}
                {loading && <div className="message assistant">⏳ {lang === 'ko' ? '생각 중...' : 'Thinking...'}</div>}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder={lang === 'ko'
                        ? "아이디어 설명 또는 명령어 (/speckit.clarify, /speckit.analyze, /speckit.generate)"
                        : "Describe idea or use commands (/speckit.clarify, /speckit.analyze, /speckit.generate)"}
                    rows={3}
                    disabled={loading}
                />
                <button onClick={handleSend} disabled={loading}>{lang === 'ko' ? '보내기' : 'Send'}</button>
            </div>
        </div>
    );
};
