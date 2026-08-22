export type IntegrationProject = {
  id: string;
  key: string;
  name: string;
};

const unwrapIntegrationList = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { data?: unknown[] }).data)
  ) {
    return (data as { data: unknown[] }).data;
  }
  return [];
};

export const mapIntegrationProjects = (data: unknown): IntegrationProject[] =>
  unwrapIntegrationList(data)
    .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
    .filter((item) => item.closed !== true)
    .map((item) => {
      const id = item.id != null ? String(item.id) : "";
      const key =
        item.key != null
          ? String(item.key)
          : id;
      const name =
        (typeof item.name === "string" && item.name) ||
        (typeof item.title === "string" && item.title) ||
        (item.number != null ? String(item.number) : "") ||
        key ||
        "Unnamed project";

      return {
        id: id || key,
        key,
        name,
      };
    })
    .filter((project) => project.key);
