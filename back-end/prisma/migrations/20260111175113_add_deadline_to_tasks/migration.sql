-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_task_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "oldStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "task_id" TEXT NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    CONSTRAINT "task_history_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_task_history" ("changedAt", "changed_by_id", "id", "newStatus", "oldStatus", "task_id") SELECT "changedAt", "changed_by_id", "id", "newStatus", "oldStatus", "task_id" FROM "task_history";
DROP TABLE "task_history";
ALTER TABLE "new_task_history" RENAME TO "task_history";
CREATE TABLE "new_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "project_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,
    "deadline" DATETIME,
    "allocatedAt" DATETIME,
    "completedAt" DATETIME,
    "closedAt" DATETIME,
    CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tasks_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("allocatedAt", "assigned_to_id", "closedAt", "completedAt", "createdAt", "creator_id", "description", "id", "project_id", "status", "title") SELECT "allocatedAt", "assigned_to_id", "closedAt", "completedAt", "createdAt", "creator_id", "description", "id", "project_id", "status", "title" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
