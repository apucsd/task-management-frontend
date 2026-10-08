import { Project, UnifiedProjectMember } from "@/types/project";

/**
 * Normalizes and deduplicates project members including the project owner
 * so that dropdowns and member listings never show redundant owner records.
 */
export function getUnifiedProjectMembers(
  project: Project | null | undefined
): UnifiedProjectMember[] {
  if (!project) return [];
  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();
  const list: UnifiedProjectMember[] = [];

  const ownerId = project.owner?.id || project.ownerId;
  const ownerEmail = project.owner?.email?.toLowerCase();

  // 1. Add owner first
  if (ownerId || project.owner) {
    if (ownerId) seenIds.add(ownerId);
    if (ownerEmail) seenEmails.add(ownerEmail);

    const ownerMemberRecord = project.members?.find(
      (m) =>
        (ownerId && (m.userId === ownerId || m.user?.id === ownerId)) ||
        (ownerEmail && m.user?.email?.toLowerCase() === ownerEmail)
    );

    list.push({
      id: ownerMemberRecord?.id || ownerId || "owner",
      userId: ownerId || "",
      name: project.owner?.name || "Owner",
      email: project.owner?.email || "",
      image: project.owner?.image,
      isOwner: true,
    });
  }

  // 2. Add members, skipping anyone matching owner ID or email
  project.members?.forEach((m) => {
    const uId = m.userId || m.user?.id;
    const uEmail = m.user?.email?.toLowerCase();

    const isDuplicate =
      (uId && seenIds.has(uId)) ||
      (uEmail && seenEmails.has(uEmail)) ||
      (ownerId && uId === ownerId) ||
      (ownerEmail && uEmail === ownerEmail);

    if (!isDuplicate) {
      if (uId) seenIds.add(uId);
      if (uEmail) seenEmails.add(uEmail);

      list.push({
        id: m.id,
        userId: uId || m.id,
        name: m.user?.name || "Member",
        email: m.user?.email || "",
        image: m.user?.image,
        isOwner: false,
      });
    }
  });

  return list;
}
