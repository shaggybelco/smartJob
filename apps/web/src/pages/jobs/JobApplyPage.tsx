import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileUp, X, FileText } from "lucide-react";
import { useJob } from "../../api/jobs";
import { useApplyToJob } from "../../api/jobApplications";
import { CompanyAvatar } from "./JobBoardPage";

const ACCEPTED_EXT = ".pdf,.doc,.docx,.txt";
const MAX_BYTES = 5 * 1024 * 1024; // must match the API setting

export function JobApplyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJob(id);
  const apply = useApplyToJob(id ?? "");

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) return <div className="card h-48 animate-pulse" />;
  if (!job) return <div className="card p-6 text-rose-600">Job not found.</div>;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > MAX_BYTES) {
      setError(`File is too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`);
      e.target.value = "";
      setResumeFile(null);
      return;
    }
    setError(null);
    setResumeFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!coverLetter.trim() && !resumeUrl.trim() && !resumeFile) {
      setError("Attach a CV or write a cover letter.");
      return;
    }
    try {
      await apply.mutateAsync({
        coverLetter: coverLetter.trim() || undefined,
        resumeUrl: resumeUrl.trim() || undefined,
        resumeFile,
      });
      navigate("/applications");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply");
    }
  };

  return (
    <div className="space-y-5">
      <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={14} />
        Back to job
      </Link>

      <div className="card flex items-start gap-4 p-5">
        <CompanyAvatar name={job.company.name} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Apply: {job.title}</h1>
          <div className="text-sm text-slate-500">
            {job.company.name}
            {job.location ? ` · ${job.location}` : ""}
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* CV upload */}
        <div className="card p-5">
          <div className="label">CV / Resume</div>
          {!resumeFile ? (
            <label
              className="mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-700 dark:hover:bg-brand-950/30"
            >
              <FileUp size={22} className="text-slate-400" />
              <div className="text-sm font-medium">Click to upload your CV</div>
              <div className="text-xs text-slate-500">PDF, DOC, DOCX or TXT — max 5 MB</div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXT}
                onChange={onFileChange}
                className="sr-only"
              />
            </label>
          ) : (
            <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm dark:border-brand-900/40 dark:bg-brand-950/30">
              <div className="flex min-w-0 items-center gap-2">
                <FileText size={16} className="shrink-0 text-brand-600 dark:text-brand-400" />
                <div className="min-w-0">
                  <div className="truncate font-medium">{resumeFile.name}</div>
                  <div className="text-xs text-slate-500">
                    {(resumeFile.size / 1024).toFixed(0)} KB
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResumeFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-rose-600 dark:hover:bg-slate-900"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="mt-4">
            <label htmlFor="resumeUrl" className="label">
              Or paste a resume URL <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="resumeUrl"
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://example.com/my-resume.pdf"
              className="input"
            />
          </div>
        </div>

        {/* Cover letter */}
        <div className="card p-5">
          <label htmlFor="coverLetter" className="label">
            Cover letter <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            id="coverLetter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={8}
            className="input"
            placeholder="Tell the recruiter why you're a great fit (optional)…"
          />
        </div>

        {error && (
          <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={apply.isPending} className="btn-primary">
            {apply.isPending ? "Submitting…" : "Submit application"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
