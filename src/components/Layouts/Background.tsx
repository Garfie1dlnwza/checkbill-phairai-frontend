export default function Background() {
  return (
    <div
      className="fixed inset-0 -z-10 opacity-10"
      style={{
        backgroundImage: "url('/logo_checkbill_phairai.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "120px 120px",
        backgroundPosition: "center",
      }}
    />
  );
}