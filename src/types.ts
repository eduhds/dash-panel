export interface CardData {
  id: string;
  title: string;
  content: string;
  color: string;
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
