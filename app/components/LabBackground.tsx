import LabStarfield from "@/app/components/LabStarfield";

export default function LabBackground ()
{
  return (
    <div aria-hidden="true" className="lab-bg">
      <div className="lab-bg__base" />
      <div className="lab-bg__starfield">
        <LabStarfield className="lab-starfield" />
      </div>
    </div>
  );
}

