export interface CardData {
  id: string;
  content: string;
}

export interface CellData {
  id: string;
  card: CardData | null;
}

export interface GridState {
  columnCount: number;
  cells: CellData[];
  columnWidths: number[];
  rowHeights: number[];
}
