# 🌱 Obsidian Spec-Kit

**Spec-Driven Development를 위한 Obsidian 플러그인**

아이디어를 **단계별로 고도화**하여 고품질 기술 문서를 생성합니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ 주요 기능

- 🔄 **단계별 워크플로우**: Clarify → Analyze → Generate
- 📄 **3개 핵심 문서 생성**: spec.md, plan.md, tasks.md
- 🌐 **다중 LLM 지원**: OpenRouter, OpenAI, Anthropic (Claude), Google Gemini
- 🌍 **다국어**: 한글/영어 지원
- 💾 **자동 저장**: Obsidian vault에 직접 저장

## 📋 워크플로우

| 단계 | 명령어 | 설명 |
|------|--------|------|
| 1️⃣ | (아이디어 설명) | 만들고 싶은 것 설명 |
| 2️⃣ | `/speckit.clarify` | 명확화 질문 |
| 3️⃣ | `/speckit.analyze` | 분석 (문제점/위험) |
| 4️⃣ | `/speckit.generate` | 문서 생성 |

## 📄 생성되는 문서

| 파일 | 내용 |
|------|------|
| `spec.md` | 기능 명세서 - 무엇을 만들지 |
| `plan.md` | 구현 계획 - 어떻게 만들지 |
| `tasks.md` | 작업 목록 - 순서대로 뭘 할지 |

## 🚀 설치 방법

### 수동 설치

1. [Releases](https://github.com/YOUR_USERNAME/obsidian-spec-kit/releases)에서 최신 버전 다운로드
2. `main.js`, `manifest.json`, `styles.css`를 vault의 `.obsidian/plugins/obsidian-spec-kit/` 폴더에 복사
3. Obsidian 재시작
4. 설정 > Community plugins에서 "Spec-Kit" 활성화

### 개발 환경에서 빌드

```bash
git clone https://github.com/YOUR_USERNAME/obsidian-spec-kit.git
cd obsidian-spec-kit
npm install
npm run build
```

## ⚙️ 설정

1. **AI 제공자 선택**: OpenRouter (추천), OpenAI, Anthropic, Gemini
2. **API 키 입력**
3. **연결 테스트** 클릭
4. **모델 불러오기** 클릭
5. **모델 선택**
6. 저장 폴더 설정 (기본값: `Speckit`)
7. 문서 언어 선택 (한글/영어)

## 🎯 사용법

1. 리본 아이콘(🤖)을 클릭하여 Spec-Kit 패널 열기
2. 프로젝트 아이디어 설명
3. AI의 질문에 답변
4. `/speckit.clarify` - 추가 질문
5. `/speckit.analyze` - 분석
6. `/speckit.generate` - 3개 문서 생성

## 🔧 지원하는 LLM

| Provider | 모델 로딩 | API |
|----------|----------|-----|
| OpenRouter | ✅ 동적 | OpenAI 호환 |
| OpenAI | ✅ 동적 | Official |
| Anthropic | 📋 목록 | Official |
| Google Gemini | ✅ 동적 | Official |

## 📁 프로젝트 구조

```
obsidian-spec-kit/
├── main.ts              # 플러그인 엔트리
├── manifest.json        # 플러그인 메타데이터
├── styles.css           # UI 스타일
└── src/
    ├── App.tsx          # 채팅 UI
    ├── view.tsx         # Obsidian 뷰
    ├── settings.ts      # 설정 탭
    └── services/
        └── llm.ts       # LLM 서비스
```

## 🙏 Credits

Inspired by [GitHub Spec-Kit](https://github.com/github/spec-kit)

## 📄 License

MIT License
