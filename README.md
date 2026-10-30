# Cube Tool

정육면체 블록 조합 3D 목업 툴 (React + R3F + Tailwind).

```bash
npm install
npm run dev               # http://localhost:5173
node tests/snap.test.ts   # 스냅 로직 셀프체크
```

## 구조
- `src/store.ts` — 블록 상태 (zustand)
- `src/snap.ts` — 그리드 스냅 + 면 밀착 스냅 (순수 함수)
- `src/components/Scene.tsx` — Canvas, 조명/그림자, OrbitControls, TransformControls
- `src/components/Block.tsx` — 블록 메시, 면별 재질/텍스처
- `src/components/{Header,Toolbar,Inspector}.tsx` — UI 패널
- `src/exportUtils.ts` — PNG/SVG/GLB/glTF/OBJ/STL 내보내기. 새 3D 포맷은 `MODEL_FORMATS`에 항목 하나 추가.
