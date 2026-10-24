# Learning progress contract

All durable learning keys use the `study:` prefix. The existing shelf backup exports those keys as raw JSON strings with `paper-study-backup` format version 1; import previews the contents and creates an undo snapshot. The optional cloud sync copies the same keys per authenticated account and compares revisions before each upload. It does not delete cloud work on logout.

| Source record | Meaning | Recovery / merge rule |
| --- | --- | --- |
| `study:<paper>:done` | Stable completed section IDs | Union; never replace a nonempty set with an unexplained empty set |
| `study:<paper>:last` | Last section opened, its title and timestamp | Resume location only; take the newer timestamp on import or sync. It never counts as completion. |
| `study:<paper>:grasp` | Per-section understanding and due date | Keep the more recent mark; review schedule comes from this record |
| `study:<paper>:qstat`, `:battle` | First answers, mastery inputs and wins | Preserve recorded attempts/wins. If devices disagree about the latest answer, do not claim mastery without another attempt. |
| `study:<paper>:asked`, `:note:*`, `:try` | Opened answers and free-form learner writing | Union answer IDs; conflicting free text requires explicit choice |
| `study:profile`, `study:titles` | Display ID, active/unlocked paper achievements, Boss titles | Merge unlocked achievements; conflicting names require explicit choice |
| `study:quest:fademem-v2` | NPC acceptance and one-time report achievement | Version 2; accepted/reported are monotonic. The five representative challenge wins and Boss win come from `:battle`. Earlier v1 reports remain readable. |
| `study:<paper>:exp`, `:quizsum` | Display caches | Rebuild from source sections, answers, notes and question records. The shelf recomputes mastery and Boss status from `:qstat` and `:battle`; old caches without question IDs show a conservative estimate until that paper is opened. These caches are not authority for task completion. |

The introductory quest reads the existing FadeMem battle records for `s-problem`, `s-decay`, `s-results`, `s-context`, `s-critique`, and `s-boss`. Its own key only records acceptance and final report, so direct paper navigation and NPC navigation advance the same learning state. A reported achievement stays reported after import or sync. A battle win is announced to the quest only after first-answer stats and the battle outcome are saved. Failed writes show an unsaved verdict and a persistent alert; the answer review remains available. A saved Boss win repairs a missing title on the next page load. Saving a chapter completion rolls its checkbox back on write failure. Quest data never grants repeat EXP. The older v1 quest record remains readable and is never deleted by the migration.

On sign-out the sync must complete and a local, account-scoped snapshot must be stored before lesson keys are removed from the current browser. A returning account downloads its cloud entries and reloads the page before cached lesson UI is trusted. The old profile job names are migrated to the current short names at read/merge time. No migration clears `localStorage`.
