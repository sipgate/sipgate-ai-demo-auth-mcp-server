export interface Contract {
  id: string;
  customerId: string;
  tariff: string;
  monthlyPrice: number;
  startDate: string;
  endDate: string;
  status: "active" | "cancelled" | "expired";
  options: string[];
}

export interface Customer {
  id: string;
  name: string;
  pin: string;
}

export const customers: Customer[] = [
  { id: "C-1001", name: "Max Mustermann", pin: "1234" },
  { id: "C-1002", name: "Erika Musterfrau", pin: "5678" },
  { id: "C-1003", name: "Hans Beispiel", pin: "9999" },
];

export const contracts: Contract[] = [
  {
    id: "V-2001",
    customerId: "C-1001",
    tariff: "Allnet Flat L",
    monthlyPrice: 29.99,
    startDate: "2024-01-15",
    endDate: "2026-01-14",
    status: "active",
    options: ["5G", "EU-Roaming", "Visual Voicemail"],
  },
  {
    id: "V-2002",
    customerId: "C-1001",
    tariff: "Data Only M",
    monthlyPrice: 14.99,
    startDate: "2024-06-01",
    endDate: "2026-05-31",
    status: "active",
    options: ["5G"],
  },
  {
    id: "V-2003",
    customerId: "C-1002",
    tariff: "Allnet Flat S",
    monthlyPrice: 19.99,
    startDate: "2023-03-01",
    endDate: "2025-02-28",
    status: "expired",
    options: ["EU-Roaming"],
  },
  {
    id: "V-2004",
    customerId: "C-1002",
    tariff: "Allnet Flat XL",
    monthlyPrice: 39.99,
    startDate: "2025-03-01",
    endDate: "2027-02-28",
    status: "active",
    options: ["5G", "EU-Roaming", "StreamOn", "MultiSIM"],
  },
  {
    id: "V-2005",
    customerId: "C-1003",
    tariff: "Prepaid Basic",
    monthlyPrice: 9.99,
    startDate: "2025-01-01",
    endDate: "2026-12-31",
    status: "active",
    options: [],
  },
];
