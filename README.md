# 코리햄 KoriHam 🐹

한국어를 배우는 외국인이 실제 한국 생활 상황을 시뮬레이션으로 체험하며 학습하는 웹게임.

## 실행 방법

ES Module(`import/export`)을 사용하므로 반드시 **로컬 서버**에서 열어야 합니다.

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# VS Code
# "Live Server" 익스텐션으로 index.html 열기
```

브라우저에서 `http://localhost:8080` 접속.

## 구조 요약

| 경로 | 역할 |
|------|------|
| `index.html` | 전체 화면 마크업 (타이틀/지도/게임/결과/카드/뱃지) |
| `src/game/` | 씬 전환, 대사, 선택지, 발음 인식 |
| `src/system/` | 진행도(LocalStorage), 카드·뱃지 상태 관리, 오디오 |
| `src/ui/` | 각 화면 렌더링 |
| `data/scenarios/` | 시나리오 JSON (CVS_001, SUBWAY_001, RESTAURANT_001) |
| `data/collections/` | 카드·뱃지 메타데이터 JSON |
| `styles/` | 화면별 CSS |
| `assets/` | 이미지·오디오·폰트 (현재 빈 폴더) |

## 개발 단계 계획

- **Phase 1** (현재) — 폴더 구조 + 기본 틀
- **Phase 2** — 게임 루프 완성 (대사 → 선택지 → 피드백 → 다음)
- **Phase 3** — 지도 비주얼 + 건물 클리어 애니메이션
- **Phase 4** — 발음 기능 (Web Speech API) 통합
- **Phase 5** — 이미지·오디오 애셋 추가
- **Phase 6** — 폴리싱 & 모바일 최적화
