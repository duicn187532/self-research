# 跨裝置學習進度同步（Supabase）

目前為可選功能：**未設定 Supabase 時原有教材與 localStorage 照常使用**。不要在公開 GitHub 儲存任何 OAuth client secret、service_role key 或使用者 token。

## 部署

1. 建立一個 Supabase 專案，於 SQL Editor 執行 `study-sync/schema.sql`。
2. 在 Supabase Authentication → Providers 啟用 GitHub、Google，按各供應商的 OAuth 文件設定 callback；Secret 僅填入 Supabase 後台，不可寫入 GitHub Pages。
3. 在 Authentication → URL Configuration 設定 Site URL 與 Additional Redirect URLs，**同時加入** `https://duicn187532.github.io/os-lab/`、各科目網址及 `https://duicn187532.github.io/self-research/`、`https://duicn187532.github.io/self-research/papers/*`。登入跳轉路徑必須在 allow list 內。
4. 把 `study-sync-config.js` 的 `url` 和 `anonKey` 設為專案公開 URL 及 publishable/anon key；兩個 Repository 使用**同一個** Supabase 專案，才可共用登入識別。
5. 測試訪客、不同行動裝置登入、兩帳號隔離、離線編輯與同時寫入；有衝突時手動決定版本，並先匯出 JSON。

## 行為與限制

- 僅同步網站允許的學習紀錄鍵；OAuth 使用 Supabase Auth，資料庫 SELECT 受 RLS 限制，寫入經 CAS 函式檢查登入者、紀錄版本與使用者 ID。
- 第一次同步前保留本機快照於瀏覽器 `__study_sync_first_backup:...`；登入之前建議先使用原有 JSON 匯出功能留下額外備份。
- 多裝置學習採定期檢查、視窗重新聚焦及回到線上後同步；頁面在初始化時已將狀態載入記憶體，所以雲端進度下載後必須點選「重新載入套用」。
- 筆記與程式草稿不做盲目最後寫入獲勝；出現衝突時可明確選擇版本。衝突選擇前請手動備份；更完整的逐欄衝突編輯 UI 可後續擴充。
- 不支援自動將 Google 與 GitHub 兩種登入方式綁為同一身分；如需跨供應商帳號連結，另行導入 Supabase identity linking。
- 免費方案可能有閒置暫停、配額與 CDN 可用性限制；離線本機資料仍能使用。

## Self Research OAuth 實際設定清單（PR：Top Bar）

1. Supabase 建立專案後，執行此倉庫的 `study-sync/schema.sql`，並確認 `study_sync_entries` 表與 `study_sync_cas` 函數建立成功。
2. Supabase Dashboard → Authentication → URL Configuration：設定 Site URL 為 `https://duicn187532.github.io/self-research/`，並將以下值放進 Redirect URLs：
   - `https://duicn187532.github.io/self-research/`
   - `https://duicn187532.github.io/self-research/papers/*/index.html`
   - `https://duicn187532.github.io/self-research/compare/*`（若有登入入口）
3. Supabase Dashboard → Authentication → Providers → GitHub：啟用 GitHub，註冊 GitHub OAuth App，**Authorization callback URL 必須使用 Supabase 頁面提示的 `https://<project-ref>.supabase.co/auth/v1/callback`**，不是 GitHub Pages URL。OAuth App 的 `Client ID` 與 `Client Secret` 只填 Supabase Dashboard。
4. Supabase Dashboard → Authentication → Providers → Google：在 Google Cloud Console 建立 OAuth 2.0 Client（Web application）。Authorized redirect URI 同樣使用 Supabase 的 `/auth/v1/callback`；設定 OAuth consent screen 所需資訊，視 Google 目前的測試／正式發布規則處理使用者；Client ID / Secret 只填 Supabase。
5. GitHub Pages 專案內 `assets/study-sync-config.js` 僅放 Supabase 公開 project URL 與 **publishable/anon key**，不要放 service_role/secret key 或 OAuth client secret。
6. 用兩個不同帳號驗證雲端紀錄完全隔離，再測試電腦與手機同一帳號登入、重新載入讀取、離線後上線與編輯衝突。不通過前保留 Draft。
7. 此登入介面尚未提供 Google／GitHub identity linking；同一個人用不同 provider 登入，不能假設帳號會自動合併。

**注意**：目前仍未獲授權的 Supabase 專案連線。此清單是待執行部署步驟，不表示雲端服務已建立或 OAuth 已啟用。
