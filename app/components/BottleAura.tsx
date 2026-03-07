"use client";

type Props = {
    className?: string;
};

export default function BottleAura ({ className = "" }: Props)
{
    return (
        <div
            aria-hidden="true"
            className={`bottle-aura ${className}`.trim()}
        >
            <div className="bottle-aura__layer bottle-aura__layer--core" />
            <div className="bottle-aura__layer bottle-aura__layer--halo" />
            <div className="bottle-aura__layer bottle-aura__layer--spark" />
        </div>
    );
}
