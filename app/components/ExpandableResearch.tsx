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

    return (
        <details
            open={defaultOpen}
            className={[
                "rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70",
                className,
            ].filter(Boolean).join(" ")}
        >
            <summary className="cursor-pointer list-none select-none font-semibold text-white outline-none">
                <span className="text-white">{title}:</span>{" "}
                <span className="text-white/75">{summary}</span>
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


