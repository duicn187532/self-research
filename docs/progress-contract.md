# Learning progress contract

All durable learning keys use the `study:` prefix. The existing shelf backup exports those keys as raw JSON strings with `paper-study-backup` format version 1; import previews the contents and creates an undo snapshot. The optional cloud sync copies the same keys per authenticated account and compares revisions before each upload. It does not delete cloud work on logout.

| Source record | Meaning | Recovery / merge rule |
| --- | --- | --- |
| `study:<paper>:done` | Stable completed section IDs | Union; never replace a nonempty set with an unexplained empty set |
| `study:<paper>:grasp` | Per-section understanding and due date | Keep the more recent mark; review schedule comes from this record |
| `study:<paper>:qstat`, `:battle` | First answers, mastery inputs and wins | Preserve recorded attempts/wins on conflict |
| `study:<paper>:asked`, `:note:*`, `:try` | Opened answers and free-form learner writing | Union answer IDs; conflicting free text requires explicit choice |
| `study:profile`, `study:titles` | Display ID, active/unlocked paper achievements, Boss titles | Merge unlocked achievements; conflicting names require explicit choice |
| `study:quest:fademem-v1` | NPC acceptance and one-time report achievement | Version 1; accepted/reported are monotonic, required section IDs are unioned. Unknown future versions stop automatic merge. |
| `study:<paper>:exp`, `:quizsum` | Display caches | Rebuild from source sections, answers, notes and question records. These are not authority for task completion. |

The introductory quest reads the existing FadeMem section and Boss records. Its own key only records acceptance and final report, so direct paper navigation and NPC navigation advance the same learning state. A reported achievement stays reported after import or sync. Saving a chapter completion rolls its checkbox back on write failure; other failed learning writes show a persistent alert so the learner can export a backup. Quest data never grants repeat EXP.

On sign-out the sync must complete and a local, account-scoped snapshot must be stored before lesson keys are removed from the current browser. A returning account downloads its cloud entries and reloads the page before cached lesson UI is trusted. The old profile job names are migrated to the current short names at read/merge time. No migration clears `localStorage`.
