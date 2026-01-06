# 居酒屋タイムカード - 給与計算アプリ

個人経営の居酒屋向けのスタッフ給与計算・管理アプリケーション

## 機能

- **アクセスコード認証**: 簡単なコードでデータを保護
- **クラウド保存**: Firebase Firestoreでデータを保存し、どの端末からでもアクセス可能
- **勤務記録の入力**: 日付、スタッフ名、開始・終了時間、時給を入力
- **自動計算**: 勤務時間と日当を自動計算（分単位対応）
- **スタッフ別給料明細**: スタッフごとに勤務記録を集計し、コピー可能な明細を生成
- **リアルタイム同期**: 複数の端末で同時にアクセスしても自動的に同期
- **CSVエクスポート**: Excel対応のCSV形式でダウンロード可能
- **レスポンシブデザイン**: スマホ・タブレットから簡単に入力可能

## 技術スタック

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (アイコン)
- Firebase Firestore (データベース)

## 使い方

### 1. アクセスコードでログイン
アプリを開くと、アクセスコード入力画面が表示されます。好きなコード（4文字以上）を入力してください。

### 2. データの共有
同じアクセスコードを使えば、PC、スマホ、タブレットなど、どの端末からも同じデータにアクセスできます。

### 3. 勤務記録の入力
日付、スタッフ名、時間、時給を入力すると、自動的に日当が計算されます。

### 4. 給料明細のコピー
スタッフ別給料明細セクションの「コピー」ボタンをクリックすると、LINEやメールで送れる形式でコピーされます。

## 開発環境

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### GitHub Pagesへデプロイ

```bash
npm run deploy
```

## Firebase設定

このアプリはFirebase Firestoreを使用しています。本番環境で使用する場合は、以下の手順でFirebaseプロジェクトを作成してください：

### 1. Firebaseプロジェクトを作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名（例: izakaya-timecard）を入力
4. プロジェクトを作成

### 2. Firestoreを有効化

1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「本番環境モードで開始」を選択
4. ロケーションを選択（asia-northeast1がおすすめ）

### 3. セキュリティルールを設定

Firestoreのルールタブで以下のルールを設定してください：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /timecards/{document} {
      allow read, write: if true;
    }
  }
}
```

### 4. Firebase設定を更新

1. Firebaseコンソールの「プロジェクトの設定」から「Firebase SDK snippet」の「構成」を選択
2. 表示された設定値を `src/firebase.ts` に貼り付け

```typescript
const firebaseConfig = {
  apiKey: "あなたのAPIキー",
  authDomain: "あなたのプロジェクト.firebaseapp.com",
  projectId: "あなたのプロジェクトID",
  storageBucket: "あなたのプロジェクト.appspot.com",
  messagingSenderId: "あなたのメッセージングセンダーID",
  appId: "あなたのアプリID"
}
```

## ライセンス

MIT
