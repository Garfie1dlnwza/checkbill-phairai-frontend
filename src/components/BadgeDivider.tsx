import Chip from "@mui/material/Chip";
import { getColor } from "@/constants/color";

type BadgeDividerProps = {
  name: string;
  color?: string;
  handleDelete: () => void;
};

export default function BadgeDivider({
  name,
  handleDelete,
}: BadgeDividerProps) {
 
  const muiColor = getColor(name);
  const styleMap: Record<string, { bgcolor: string; color: string }> = {
    "bg-red-200 text-red-800": { bgcolor: "#fecaca", color: "#991b1b" },
    "bg-orange-200 text-orange-800": { bgcolor: "#fed7aa", color: "#c2410c" },
    "bg-yellow-200 text-yellow-800": { bgcolor: "#fef08a", color: "#a16207" },
    "bg-green-200 text-green-800": { bgcolor: "#bbf7d0", color: "#166534" },
    "bg-teal-200 text-teal-800": { bgcolor: "#99f6e4", color: "#115e59" },
    "bg-blue-200 text-blue-800": { bgcolor: "#bfdbfe", color: "#1e40af" },
    "bg-purple-200 text-purple-800": { bgcolor: "#ddd6fe", color: "#6d28d9" },
    "bg-pink-200 text-pink-800": { bgcolor: "#fbcfe8", color: "#9d174d" },
  };

  return (
    <Chip
      label={name}
      onDelete={handleDelete}
      variant="outlined"
      sx={{
        ...styleMap[muiColor],
        borderColor: styleMap[muiColor]?.color,
        fontWeight: 600,
        fontSize: "1rem",
        px: 1,
      }}
    />
  );
}
