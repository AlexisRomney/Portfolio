import { getDb } from "@gd/lib/db/client";
import { DEMO_TICKETS } from "@gd/data/demo-tickets";

let schemaReady: Promise<void> | null = null;

async function createTicketsTable() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT,
      subcategory TEXT,
      priority TEXT,
      sentiment TEXT,
      summary TEXT,
      action TEXT,
      department TEXT,
      assignee_type TEXT,
      routing_reason TEXT,
      recommended_action TEXT,
      escalation BOOLEAN,
      escalation_reason TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      ai_response TEXT,
      control_approved BOOLEAN,
      control_score DOUBLE PRECISION,
      control_issues JSONB,
      control_warnings JSONB,
      requires_human_review BOOLEAN,
      review_reason TEXT,
      corrected_priority TEXT,
      corrected_department TEXT,
      corrected_action TEXT,
      control_summary TEXT,
      control_attempt_version BIGINT NOT NULL DEFAULT 0,
      control_completed_version BIGINT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Migration non destructive pour les bases déjà créées
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS department TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assignee_type TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS routing_reason TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS recommended_action TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS escalation BOOLEAN`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS escalation_reason TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS control_approved BOOLEAN`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS control_score DOUBLE PRECISION`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS control_issues JSONB`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS control_warnings JSONB`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS requires_human_review BOOLEAN`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS review_reason TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS corrected_priority TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS corrected_department TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS corrected_action TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS control_summary TEXT`;
  await sql`
    ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS control_attempt_version BIGINT NOT NULL DEFAULT 0
  `;
  await sql`
    ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS control_completed_version BIGINT
  `;
  // Les contrôles antérieurs à cette migration n'ont pas d'identifiant de
  // tentative fiable. Ils sont invalidés une seule fois et devront être relancés.
  await sql`
    UPDATE tickets
    SET
      control_attempt_version = 1,
      control_completed_version = NULL
    WHERE control_attempt_version = 0
      AND control_approved IS NOT NULL
  `;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS processed_by TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS automation_status TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assignee_id UUID`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assignee_name TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS response_sent BOOLEAN`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS response_sent_at TIMESTAMPTZ`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS response_sent_mode TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS useful_information JSONB`;

  await sql`
    CREATE INDEX IF NOT EXISTS tickets_created_at_idx
    ON tickets (created_at DESC)
  `;
}

async function createTicketMessagesTable() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS ticket_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      sender_type TEXT NOT NULL,
      sender_name TEXT,
      sender_email TEXT,
      content TEXT NOT NULL,
      direction TEXT NOT NULL,
      delivery_status TEXT NOT NULL DEFAULT 'sent',
      send_key TEXT,
      sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Migration non destructive : messages existants = déjà envoyés / historiques.
  await sql`
    ALTER TABLE ticket_messages
    ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'sent'
  `;
  await sql`ALTER TABLE ticket_messages ADD COLUMN IF NOT EXISTS send_key TEXT`;
  await sql`ALTER TABLE ticket_messages ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ`;

  await sql`
    CREATE INDEX IF NOT EXISTS ticket_messages_ticket_id_created_at_idx
    ON ticket_messages (ticket_id, created_at ASC)
  `;

  // Idempotence d'envoi : une même action/message ne peut pas être réservée deux fois.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS ticket_messages_send_key_uidx
    ON ticket_messages (send_key)
    WHERE send_key IS NOT NULL
  `;
}

async function createTeamMembersTable() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS team_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      role TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Migration inverse : cette colonne ne servait qu'au concept supprimé
  // de « responsable du service ». Les responsables de tickets sont conservés.
  await sql`
    DROP INDEX IF EXISTS team_members_one_manager_per_department_idx
  `;
  await sql`
    ALTER TABLE team_members DROP COLUMN IF EXISTS is_service_manager
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS team_members_department_idx
    ON team_members (department)
  `;

  // Seed collaboratrices/teurs de démonstration (idempotent).
  const seeds = [
    {
      id: "c1111111-1111-4111-8111-111111111111",
      name: "Sandrine",
      email: "delivered+sandrine@resend.dev",
      legacyEmail: "sandrine@example.com",
      department: "Facturation",
      role: "Comptable",
    },
    {
      id: "c2222222-2222-4222-8222-222222222222",
      name: "Mathieu",
      email: "delivered+mathieu@resend.dev",
      legacyEmail: "mathieu@example.com",
      department: "IT Support",
      role: "Technicien support",
    },
    {
      id: "c3333333-3333-4333-8333-333333333333",
      name: "Fabienne",
      email: "delivered+fabienne@resend.dev",
      legacyEmail: "fabienne@example.com",
      department: "Ressources humaines",
      role: "Responsable RH",
    },
    {
      id: "c4444444-4444-4444-8444-444444444444",
      name: "Camille",
      email: "delivered+camille@resend.dev",
      legacyEmail: "camille.commercial@example.com",
      department: "Commercial",
      role: "Chargée commerciale",
    },
    {
      id: "c5555555-5555-4555-8555-555555555555",
      name: "Thomas",
      email: "delivered+thomas@resend.dev",
      legacyEmail: "thomas.it@example.com",
      department: "IT Support",
      role: "Technicien support",
    },
    {
      id: "c6666666-6666-4666-8666-666666666666",
      name: "Julien",
      email: "delivered+julien@resend.dev",
      legacyEmail: "julien.it@example.com",
      department: "IT Support",
      role: "Technicien support",
    },
    {
      id: "c7777777-7777-4777-8777-777777777777",
      name: "Laura",
      email: "delivered+laura@resend.dev",
      legacyEmail: "laura.facturation@example.com",
      department: "Facturation",
      role: "Gestionnaire facturation",
    },
    {
      id: "c8888888-8888-4888-8888-888888888888",
      name: "Nicolas",
      email: "delivered+nicolas@resend.dev",
      legacyEmail: "nicolas.facturation@example.com",
      department: "Facturation",
      role: "Gestionnaire facturation",
    },
    {
      id: "c9999999-9999-4999-8999-999999999999",
      name: "Claire",
      email: "delivered+claire@resend.dev",
      legacyEmail: "claire.rh@example.com",
      department: "Ressources humaines",
      role: "Chargée RH",
    },
    {
      id: "caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      name: "Sophie",
      email: "delivered+sophie@resend.dev",
      legacyEmail: "sophie.rh@example.com",
      department: "Ressources humaines",
      role: "Chargée RH",
    },
    {
      id: "cbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      name: "Antoine",
      email: "delivered+antoine@resend.dev",
      legacyEmail: "antoine.commercial@example.com",
      department: "Commercial",
      role: "Chargé commercial",
    },
    {
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      name: "Marc",
      email: "delivered+marc@resend.dev",
      legacyEmail: "marc.commercial@example.com",
      department: "Commercial",
      role: "Chargé commercial",
    },
  ];

  for (const member of seeds) {
    // Upsert sur l'id fixe du seed.
    // Ne pas écraser un email déjà personnalisé (évite aussi le conflit
    // team_members_pkey quand l'email seed a changé).
    await sql`
      INSERT INTO team_members (id, name, email, department, role, active)
      VALUES (
        ${member.id}::uuid,
        ${member.name},
        ${member.email},
        ${member.department},
        ${member.role},
        true
      )
      ON CONFLICT (id) DO NOTHING
    `;

    // Migration ciblée des anciennes adresses de démonstration. Une adresse
    // personnalisée par l'utilisateur n'est jamais écrasée.
    await sql`
      UPDATE team_members
      SET email = ${member.email}, updated_at = NOW()
      WHERE id = ${member.id}::uuid
        AND email = ${member.legacyEmail}
    `;
  }

  // Normalisation de l'ancien seed vers le service utilisé par le routage.
  await sql`
    UPDATE team_members
    SET department = 'Facturation', updated_at = NOW()
    WHERE id = 'c1111111-1111-4111-8111-111111111111'::uuid
      AND name = 'Sandrine'
      AND department = 'Comptabilité'
  `;
}

async function createDepartmentAssignmentStateTable() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS department_assignment_state (
      department TEXT PRIMARY KEY,
      next_sequence BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function createAutomationLogsTable() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS automation_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      status TEXT NOT NULL,
      target TEXT,
      recipient TEXT,
      message_id TEXT,
      executed_by TEXT NOT NULL DEFAULT 'trigger.dev',
      error TEXT,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE automation_logs ADD COLUMN IF NOT EXISTS target TEXT`;
  await sql`ALTER TABLE automation_logs ADD COLUMN IF NOT EXISTS recipient TEXT`;
  await sql`ALTER TABLE automation_logs ADD COLUMN IF NOT EXISTS message_id TEXT`;

  await sql`
    CREATE INDEX IF NOT EXISTS automation_logs_ticket_id_idx
    ON automation_logs (ticket_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS automation_logs_executed_at_idx
    ON automation_logs (executed_at DESC)
  `;
}

/** Réglages globaux du prototype (une entreprise). Évolutif vers un company_id. */
async function createAppSettingsTable() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    INSERT INTO app_settings (key, value)
    VALUES
      ('control_score_threshold', '90'),
      ('auto_send_responses', 'false')
    ON CONFLICT (key) DO NOTHING
  `;
}

async function seedDemoTicketsIfEmpty() {
  const sql = getDb();
  const rows = await sql`SELECT COUNT(*)::int AS count FROM tickets`;
  const count = Number(rows[0]?.count ?? 0);
  if (count > 0) return;

  for (const ticket of DEMO_TICKETS) {
    await sql`
      INSERT INTO tickets (
        id,
        name,
        email,
        subject,
        message,
        category,
        subcategory,
        priority,
        sentiment,
        summary,
        action,
        department,
        assignee_type,
        routing_reason,
        recommended_action,
        escalation,
        escalation_reason,
        status,
        ai_response,
        control_approved,
        control_score,
        control_issues,
        control_warnings,
        requires_human_review,
        review_reason,
        corrected_priority,
        corrected_department,
        corrected_action,
        control_summary,
        control_attempt_version,
        control_completed_version,
        is_demo,
        created_at,
        updated_at
      ) VALUES (
        ${ticket.id}::uuid,
        ${ticket.name},
        ${ticket.email},
        ${ticket.subject},
        ${ticket.message},
        ${ticket.category},
        ${ticket.subcategory},
        ${ticket.priority},
        ${ticket.sentiment},
        ${ticket.summary},
        ${ticket.action},
        ${ticket.department},
        ${ticket.assigneeType},
        ${ticket.routingReason},
        ${ticket.recommendedAction},
        ${ticket.escalation},
        ${ticket.escalationReason},
        ${ticket.status},
        ${ticket.aiResponse},
        ${ticket.controlApproved},
        ${ticket.controlScore},
        ${JSON.stringify(ticket.controlIssues ?? [])}::jsonb,
        ${JSON.stringify(ticket.controlWarnings ?? [])}::jsonb,
        ${ticket.requiresHumanReview},
        ${ticket.reviewReason},
        ${ticket.correctedPriority},
        ${ticket.correctedDepartment},
        ${ticket.correctedAction},
        ${ticket.controlSummary},
        ${ticket.controlApproved === null ? 0 : 1},
        ${ticket.controlApproved === null ? null : 1},
        true,
        ${ticket.createdAt}::timestamptz,
        ${ticket.updatedAt}::timestamptz
      )
    `;
  }
}

/** Crée les tables tickets / team_members / automation_logs et seed si besoin. */
export async function ensureTicketsSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await createTicketsTable();
      await createTeamMembersTable();
      await createDepartmentAssignmentStateTable();
      await createTicketMessagesTable();
      await createAutomationLogsTable();
      await createAppSettingsTable();
      await ensureDemoColumnsAndQuota();
      await seedDemoTicketsIfEmpty();
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  await schemaReady;
}

async function ensureDemoColumnsAndQuota() {
  const sql = getDb();
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false`;
  await sql`
    CREATE TABLE IF NOT EXISTS demo_email_quota (
      email TEXT PRIMARY KEY,
      send_count INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Marque les tickets seed connus comme démo (IDs fixes DEMO_TICKETS).
  await sql`
    UPDATE tickets
    SET is_demo = true
    WHERE id IN (
      '11111111-1111-4111-8111-111111111111'::uuid,
      '22222222-2222-4222-8222-222222222222'::uuid,
      '33333333-3333-4333-8333-333333333333'::uuid,
      '44444444-4444-4444-8444-444444444444'::uuid,
      '55555555-5555-4555-8555-555555555555'::uuid,
      '66666666-6666-4666-8666-666666666666'::uuid,
      '77777777-7777-4777-8777-777777777777'::uuid
    )
  `;
}
