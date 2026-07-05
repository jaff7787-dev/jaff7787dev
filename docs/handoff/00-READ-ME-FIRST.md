# 📦 보카 퀘스트 인수인계 패키지

다른 계정/세션에서 이 프로젝트를 이어받을 때 이 순서로 읽으세요.

1. `01-프로젝트-개요와-현재상태.md` — 무엇을 만들었고 지금 어디까지 왔는지, 배포 주소
2. `02-대화-및-요청-이력.md` — 사용자의 요청 8건과 각각 어떻게 반영됐는지, 사용자 취향 메모
3. `03-기술-아키텍처와-빌드방법.md` — 코드 구조, localStorage 스키마, 재빌드 방법, 주의사항
4. `04-요청별-조사내역과-기획.md` — 망각곡선 설계, 오답 UX 조사(듀오링고 등), 자동 TTS 기획 근거

`build-src/` 폴더:
- `app_template.html` — 앱의 진짜 소스 (index.html은 이걸로 빌드한 산출물!)
- `build.py` — 폰트 서브셋 + 토큰 치환 빌드 스크립트 (경로 변수만 환경에 맞게 수정)
- `extract.py` — 원본 PDF → 단어 데이터 추출 스크립트
- `vocab.json` — 정제 완료된 2,400단어 데이터 (재추출 불필요)
- `test3.js / test5.js / test6.js` — Playwright 회귀 테스트

핵심 요약: 저장소는 github.com/jaff7787-dev/jaff7787dev (브랜치 claude/vocab-game-app-8misel),
실사용 주소는 https://jaff7787-dev.github.io/jaff7787dev/ (푸시하면 자동 배포).
**index.html을 직접 고치지 말고 app_template.html 수정 → build.py 실행 → 커밋/푸시.**
