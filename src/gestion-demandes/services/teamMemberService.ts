import { getDb } from "@gd/lib/db/client";
import { ensureTicketsSchema } from "@gd/lib/db/schema";
import {
  assignmentDepartmentKey,
  departmentsCompatible,
} from "@gd/lib/departments";
import type { TeamMember } from "@gd/types/teamMember";

export { departmentsCompatible } from "@gd/lib/departments";

type TeamMemberRow = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
};

function toIso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapRow(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    department: row.department,
    role: row.role,
    active: row.active,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

export async function listActiveTeamMembers(): Promise<TeamMember[]> {
  await ensureTicketsSchema();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM team_members
    WHERE active = true
    ORDER BY department ASC, name ASC
  `;
  return (rows as TeamMemberRow[]).map(mapRow);
}

export async function getTeamMemberById(
  id: string,
): Promise<TeamMember | null> {
  await ensureTicketsSchema();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM team_members
    WHERE id = ${id}::uuid
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return mapRow(rows[0] as TeamMemberRow);
}

export async function getActiveTeamMembersByDepartment(
  department: string,
): Promise<TeamMember[]> {
  const members = await listActiveTeamMembers();
  return members.filter((m) => departmentsCompatible(m.department, department));
}

export async function verifyAssigneeForDepartment(
  assigneeId: string,
  department: string,
): Promise<TeamMember | null> {
  const member = await getTeamMemberById(assigneeId);
  if (!member || !member.active) return null;
  if (!departmentsCompatible(member.department, department)) return null;
  return member;
}

/**
 * Avance atomiquement la rotation d'un service dans Neon puis retourne
 * le collaborateur actif correspondant.
 */
export async function assignNextActiveTeamMember(
  department: string,
): Promise<TeamMember | null> {
  await ensureTicketsSchema();
  const sql = getDb();
  const stateKey = assignmentDepartmentKey(department);

  const rows = await sql`
    WITH advanced AS (
      INSERT INTO department_assignment_state (
        department, next_sequence, updated_at
      )
      VALUES (${stateKey}, 1, NOW())
      ON CONFLICT (department) DO UPDATE SET
        next_sequence = department_assignment_state.next_sequence + 1,
        updated_at = NOW()
      RETURNING next_sequence - 1 AS assignment_index
    ),
    active_pool AS (
      SELECT
        tm.*,
        ROW_NUMBER() OVER (
          ORDER BY tm.created_at ASC, tm.id ASC
        ) - 1 AS member_index,
        COUNT(*) OVER () AS member_count
      FROM team_members tm
      WHERE tm.active = true
        AND tm.department = ${stateKey}
    )
    SELECT
      active_pool.id,
      active_pool.name,
      active_pool.email,
      active_pool.department,
      active_pool.role,
      active_pool.active,
      active_pool.created_at,
      active_pool.updated_at
    FROM active_pool
    CROSS JOIN advanced
    WHERE active_pool.member_index =
      MOD(advanced.assignment_index, active_pool.member_count)
    LIMIT 1
  `;

  return rows[0] ? mapRow(rows[0] as TeamMemberRow) : null;
}

export async function listAllTeamMembers(): Promise<TeamMember[]> {
  await ensureTicketsSchema();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM team_members
    ORDER BY active DESC, department ASC, name ASC
  `;
  return (rows as TeamMemberRow[]).map(mapRow);
}

export type TeamMemberCreateInput = {
  name: string;
  email: string;
  department: string;
  role?: string;
  active?: boolean;
};

export type TeamMemberUpdateInput = Partial<{
  name: string;
  email: string;
  department: string;
  role: string;
  active: boolean;
}>;

export async function createTeamMember(
  input: TeamMemberCreateInput,
): Promise<TeamMember> {
  await ensureTicketsSchema();
  const sql = getDb();
  const rows = await sql`
    INSERT INTO team_members (name, email, department, role, active)
    VALUES (
      ${input.name.trim()},
      ${input.email.trim().toLowerCase()},
      ${input.department.trim()},
      ${(input.role ?? "").trim() || "Collaborateur"},
      ${input.active ?? true}
    )
    RETURNING *
  `;
  return mapRow(rows[0] as TeamMemberRow);
}

export async function updateTeamMember(
  id: string,
  patch: TeamMemberUpdateInput,
): Promise<TeamMember | null> {
  const current = await getTeamMemberById(id);
  if (!current) return null;

  const next = {
    name: patch.name?.trim() ?? current.name,
    email: patch.email?.trim().toLowerCase() ?? current.email,
    department: patch.department?.trim() ?? current.department,
    role: patch.role?.trim() ?? current.role,
    active: patch.active ?? current.active,
  };

  await ensureTicketsSchema();
  const sql = getDb();
  const rows = await sql`
    UPDATE team_members SET
      name = ${next.name},
      email = ${next.email},
      department = ${next.department},
      role = ${next.role},
      active = ${next.active},
      updated_at = NOW()
    WHERE id = ${id}::uuid
    RETURNING *
  `;
  if (!rows[0]) return null;
  return mapRow(rows[0] as TeamMemberRow);
}
