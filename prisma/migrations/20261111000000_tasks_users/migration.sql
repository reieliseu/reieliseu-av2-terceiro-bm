CREATE TABLE "app_users" (
  "id" UUID NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(254) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "app_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "app_users_email_key" ON "app_users"("email");

CREATE TABLE "study_tasks" (
  "id" UUID NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "description" TEXT,
  "subject" VARCHAR(100) NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  "priority" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  "due_date" TIMESTAMPTZ(6),
  "user_id" UUID NOT NULL,
  "parent_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "study_tasks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "study_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "study_tasks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "study_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "study_tasks_status_check" CHECK ("status" IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
  CONSTRAINT "study_tasks_priority_check" CHECK ("priority" IN ('LOW', 'MEDIUM', 'HIGH'))
);

CREATE INDEX "study_tasks_user_id_status_idx" ON "study_tasks"("user_id", "status");
CREATE INDEX "study_tasks_user_id_due_date_idx" ON "study_tasks"("user_id", "due_date");
CREATE INDEX "study_tasks_parent_id_idx" ON "study_tasks"("parent_id");
