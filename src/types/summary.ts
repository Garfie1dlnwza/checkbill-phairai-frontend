export type Item = {
  id: string;
  name: string;
  price: number;
  qty: number;
  shareWith: string[];
  includeVat?: boolean;
};

export type PaymentInfo = {
  type: "qr" | "bank" | "none";
  qrCodeUrl?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
};

export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ReceiptType = "minimal" | "color";

export type ReceiptOption = {
  value: string;
  label: string;
  fullLabel: string;
  icon: React.ReactNode;
};
