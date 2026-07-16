# Node.js >=22.22.0 / Vite 7+ サポートへの移行 設計書

日付: 2026-07-14

## 目的

- サポートする Node.js バージョンを v22.22.0 以上に引き上げる(Node 20 サポート終了)
- サポートする Vite バージョンを 7 以降に絞る(Vite 5 / 6 サポート終了)

## 変更内容

### 1. Node.js >=22.22.0 への引き上げ

- ルート・`vite-plugin-react-router-amplify-hosting`・`amplify-adapter-react-router` の
  `engines.node` を `>=22.22.0` に統一(adapter には新規追加)
- `@types/node` を `^22.0.0` に更新
  (pnpm-workspace.yaml の overrides、各パッケージの devDependencies、todo-app example)
- README の「Node.js v20 or later (v20, v22, or v24)」を
  「Node.js v22.22.0 or later (v22 or v24)」に更新。`nvm install 24` の例は維持

### 2. Vite 7+ のみサポート

- `vite-plugin-react-router-amplify-hosting` の peerDependencies を
  `vite: "^7.0.0 || ^8.0.0"` に変更
- `integration/helpers/vite-5-template`・`vite-6-template` を削除し、
  `integration/helpers/vite.ts` の `TemplateName` 型とテンプレート一覧から除去。
  `createProject` のデフォルトテンプレートを `vite-7-template` に変更

### 3. ランタイム判定の変更(破壊的変更)

- `parseNodeVersion`: `>=24` → `nodejs24.x`、`>=22` → `nodejs22.x`。
  それ未満・不明・未指定は警告を出して `nodejs22.x` にフォールバック。
  `nodejs20.x` への分岐を削除
- `ComputeRuntime` 型から `nodejs20.x` を除外(generateDeployManifest 側も追随)
- `determineRuntimeVersion.test.ts` を新挙動に合わせて更新(テスト先行)

### 4. リリース

- 両パッケージ major バンプの changeset を追加
  (vite-plugin: 0.8.0 → 1.0.0、adapter: 0.2.0 → 1.0.0)
- adapter はコード変更がなくても Node 要件変更(engines 追加)を breaking として含める

## 検証

- 各パッケージディレクトリ内で `vp check`(リポジトリルートからは実行しない)
- `vp test --run`(ユニット + 統合テスト)
