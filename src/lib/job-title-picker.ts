export type JobTitleOption = {
  label: string;
  value: string;
};

export const normalizeJobTitleName = (value: string) => value.trim();

export const shouldOfferCreateJobTitle = (
  search: string,
  options: JobTitleOption[]
) => {
  const trimmed = normalizeJobTitleName(search);
  if (!trimmed) {
    return false;
  }

  return !options.some((option) =>
    option.label.toLowerCase().includes(trimmed.toLowerCase())
  );
};

export const toJobTitleOption = (job: { id?: string | number; name?: string }) => ({
  label: job.name || "",
  value: job.id != null ? String(job.id) : "",
});
