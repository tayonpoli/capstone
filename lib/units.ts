import { Unit } from "@prisma/client";

export const convertUnit = (value: number, fromUnit: Unit, toUnit: Unit): number => {
  // Konversi ke gram dan ml sebagai perantara
  const toBase = (val: number, unit: Unit): number => {
    switch (unit) {
      case 'gram': return val;
      case 'Kg': return val * 1000;
      case 'ml': return val;
      case 'Litre': return val * 1000;
      case 'Pcs': return val; // Tidak dikonversi
      case 'Box': return val; // Asumsi 1 Box = 1 Pcs (sesuaikan jika berbeda)
    }
  };

  // Konversi dari base ke target unit
  const fromBase = (val: number, unit: Unit): number => {
    switch (unit) {
      case 'gram': return val;
      case 'Kg': return val / 1000;
      case 'ml': return val;
      case 'Litre': return val / 1000;
      case 'Pcs': return val;
      case 'Box': return val;
    }
  };

  const valueInBase = toBase(value, fromUnit);
  return fromBase(valueInBase, toUnit);
};