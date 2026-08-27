/** Un collaborateur appartient à un seul service. */
export function departmentsCompatible(a: string, b: string): boolean {
  return a === b;
}

/** Les demandes comptables sont affectées à l'équipe Facturation du prototype. */
export function assignmentDepartmentKey(department: string): string {
  return department === "Comptabilité" ? "Facturation" : department;
}
