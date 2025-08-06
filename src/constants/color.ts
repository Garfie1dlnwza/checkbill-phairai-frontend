export function getColor(name: string) {
  const colors = [
    "bg-red-200 text-red-800",
    "bg-orange-200 text-orange-800",
    "bg-yellow-200 text-yellow-800",
    "bg-green-200 text-green-800",
    "bg-teal-200 text-teal-800",
    "bg-blue-200 text-blue-800",
    "bg-purple-200 text-purple-800",
    "bg-pink-200 text-pink-800",
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
}