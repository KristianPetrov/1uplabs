import Starfield from "@/app/components/Starfield";

export default function LabBackground ()
{
  return (
    <div aria-hidden="true" className="lab-bg">
      <div className="lab-bg__base" />
      <div className="lab-bg__starfield">
        <Starfield className="lab-starfield" />
      </div>
    </div>
  );
}

