type Props = {
    title?: string;
    summary: string;
    paragraphs?: string[];
    bullets?: string[];
    defaultOpen?: boolean;
    className?: string;
};

export default function ExpandableResearch ({
    title = "Research description",
    summary,
    paragraphs = [],
    bullets = [],
    defaultOpen = false,
    className = "",
}: Props)
{
    if (!summary && paragraphs.length === 0 && bullets.length === 0) return null;

    const hasBody = paragraphs.length > 0 || bullets.length > 0;
    const panelClass =
        "rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70";

    if (!hasBody && summary) {
        return (
            <div className={[panelClass, className].filter(Boolean).join(" ")}>
                <div className="font-semibold text-white">
                    <span>{title}:</span>{" "}
                    <span className="font-normal text-white/75">{summary}</span>
                </div>
            </div>
        );
    }

    return (
        <details
            open={defaultOpen}
            className={[
                "group/research",
                panelClass,
                "open:[&_summary_.research-chevron]:rotate-180",
                "open:[&_summary_.research-more-hint]:hidden open:[&_summary_.research-less-hint]:inline",
                className,
            ].filter(Boolean).join(" ")}
        >
            <summary className="flex cursor-pointer list-none flex-col gap-2 select-none font-semibold text-white outline-none [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                    <span className="text-white">{title}:</span>{" "}
                    <span className="font-normal text-white/75">{summary}</span>
                </div>
                <div className="flex items-center justify-end gap-1.5 border-t border-white/10 pt-2">
                    <svg
                        className="research-chevron h-4 w-4 shrink-0 text-emerald-400/90 transition-transform duration-200"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className="text-xs font-medium text-emerald-400/90">
                        <span className="research-more-hint">Read more</span>
                        <span className="research-less-hint hidden">Read less</span>
                    </span>
                </div>
            </summary>
            <div className="mt-3 space-y-3 leading-6">
                {paragraphs.map((p, idx) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <p key={idx}>{p}</p>
                ))}
                {bullets.length > 0 && (
                    <ul className="list-disc space-y-1 pl-5">
                        {bullets.map((b, idx) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <li key={idx}>{b}</li>
                        ))}
                    </ul>
                )}
            </div>
        </details>
    );
}


