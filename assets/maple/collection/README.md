# 楓之谷素材 collection

此目錄為獨立素材庫；既有 `assets/maple/` 素材、網站 UI、CSS、JS、教材與遊戲邏輯不在本次修改範圍。

**原版美術公開再散布授權未確認。** 依倉庫擁有者 2026-10-23 的明確指示公開存放；這不構成權利人的授權。使用前請讀 [RIGHTS.md](RIGHTS.md)。

## 已入庫與候選分開

- [manifest.json](manifest.json)：實際下載、可解碼 PNG 的素材與影格；`collected` 表示已取得 API 所列動作的全部影格，`partial` 表示仍有缺漏。兩者均不代表授權已確認。
- [validation-report.json](validation-report.json)：實際數量、地區、完整度與驗證結果。
- [name-index.zh-TW.json](name-index.zh-TW.json)：供應用程式快速讀取的精簡台版中文名稱索引。
- [candidates.json](candidates.json)：失敗下載或尚未取得項目，不計入已入庫數量。
- [existing-inventory.json](existing-inventory.json)：本次以前就存在的圖片，只盤點不算新增。
- 每個 `類型/地區/ID/版本/asset.json` 提供個別素材資料；目前包含 GMS/83 與 TWMS/256。

原始 PNG 位元組直接保存，不縮放、不重新編碼。影格按 `index` 數值排序；不要用目錄排序重建動畫。相同 SHA-256 或相同尺寸與 RGBA 像素雜湊的圖檔只存一份，其他影格以 `github_path` 引用，播放時仍須保留每一個影格位置與各自延遲。編碼不同但像素相同的來源以 `source_png_sha256` 保留原下載雜湊。某些引用指向同一倉庫的既有素材。

`duration_ms`、`origin` 是 WZ 節點查詢結果；`null` 表示未知，不能當成 0 或任意預設值。定位方式為以畫布座標減去 `origin.x/y` 決定繪製位置。未驗證的播放效果不宣稱完成。

`all_api_listed_action_frames_present` 僅表示 API 所列動作數量吻合，不保證來源 API 已包含該角色歷代全部動作。`all_wz_numeric_frame_nodes_present` 另逐動作查核 WZ 的實際數字節點；來源有跳號時保留跳號，不補造不存在的影格。UOL 連結影格會由 API renderer 解析補抓，另標 `retrieval`；renderer 的位置序號與 WZ 節點編號不同，必須按實際節點表映射。未下載原始 WZ binary 比對。GMS/83 是服務標示版本。

`name_zh_tw` 是 TWMS/256 相同素材 ID 的正式名稱，`display_name_zh_tw` 是應用程式優先顯示欄位；Boss 會在顯示名稱附上階段，但 `name_zh_tw` 保持正式角色名。應用程式可依序讀取 `display_name_zh_tw ?? name_zh_tw ?? name`。舊 GMS/83 美術以相同 ID 對照 TWMS/256，狀態標為 `source_twms_256_id_match`。NPC 職責取 API `role`、`is_shop`，未提供者不臆測職責。`town` 是人工建立的蒐集分組，`source_locations` 是 API 回傳位置；部分 API 位置有明顯疑義，不能當成已驗證出生地。

## 分類與數量

NPC、普通怪物、精英怪、菁英 Boss、一般 Boss 分開。素材 ID／版本不同可分開保存，但動作、重複圖片、同人物服裝不算不同人物。統計表的 `entity_records` 是 ID／版本紀錄數，不宣稱所有不同 ID 都是不同角色或物種；本次選取計畫已排除同英文名稱重複 NPC。

既有 `spr-elite-yeti-*` 的 elite 名稱是網站用途，不是已驗證的遊戲精英分類；本次不將它計為新增精英怪。既有殺人鯨、露希妲、英雄團、皇家騎士團與弓箭手村／魔法森林／登入場景均保留。

長期目標：NPC 150、普通怪物 200、精英怪 30、Boss 40、角色 30、寵物 20、地圖 30、UI／道具／技能／特效 100。目標不是本次已完成數量。

P1 已開始收錄拉契爾恩 NPC／場景、露希妲、戴米安、威爾，以及玩具城／時間塔、天空之城、冰原雪域與神木村。Boss 各階段獨立存放；場景共用資源集保留 Back／Obj／Tile 獨立 PNG。P2 後續擴充寵物、UI、道具與技能特效。

## 重現與驗證

需要 Python 3.10+ 與 Pillow。這些是離線素材整理工具，不是網站程式。

```sh
python assets/maple/collection/collect.py assets/maple/collection/batch-01.json --acknowledge-unconfirmed-rights
python assets/maple/collection/repair_frames.py
python assets/maple/collection/collect_nested_effects.py
python assets/maple/collection/collect_maps.py assets/maple/collection/batch-04-maps.json
python assets/maple/collection/collect_map_resource_batch.py assets/maple/collection/batch-04-map-resources.json
python assets/maple/collection/sync_tw_names.py
python assets/maple/collection/enrich.py
python assets/maple/collection/verify_wz_indices.py --prepare
python assets/maple/collection/verify_wz_indices.py --apply
python assets/maple/collection/deduplicate.py
python assets/maple/collection/validate.py
```

批次 JSON 的每列依序是類型、ID、地區、城鎮、中文待核名稱。工具只寫 collection，不重建舊 sprite strips。每批驗證通過後才提交；驗證檢查 PNG 解碼、SHA-256、尺寸、影格順序、重複存放與 ID／版本唯一性。
