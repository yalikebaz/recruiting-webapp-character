import { useState } from "react";
import { CLASS_LIST, ATTRIBUTE_LIST } from "../consts";

type Props = {
  classType: string;
  eligible: boolean;
};

const CharacterClassReqs = ({ classType, eligible = false }: Props) => {
  const [showRequirements, setShowRequirements] = useState<boolean>(false);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        width: "120px"
      }}
    >
      <button
        style={{ display: "inline" }}
        onClick={() => setShowRequirements(!showRequirements)}
      >
        {classType}
      </button>
      <span>{eligible ? " ✅" : " ❌"}</span>
      {showRequirements && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "2px",
          }}
        >
          {ATTRIBUTE_LIST.map((attribute, i) => (
            <p style={{margin: 0}} key={`${classType}-${attribute}-${i}`}>
              {attribute}: {CLASS_LIST[classType][attribute]}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterClassReqs;
