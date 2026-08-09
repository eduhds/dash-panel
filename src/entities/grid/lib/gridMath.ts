export const MIN_COLUMN_PERCENT = 10;
export const MIN_ROW_HEIGHT = 60;

export function distributeColumnDelta(
  widths: number[],
  index: number,
  delta: number
): number[] | null {
  const next = [...widths];
  next[index] += delta;
  if (next[index] < MIN_COLUMN_PERCENT) return null;

  // Tentar distribuir delta proporcionalmente entre TODAS as outras colunas
  const otherIndices = Array.from({ length: next.length }, (_, i) => i).filter(i => i !== index);
  const otherWidths = otherIndices.map(i => widths[i]);
  const totalOther = otherWidths.reduce((s, w) => s + w, 0);
  if (totalOther <= 0) return next;

  // Primeiro, tentar aplicar proporcionalmente
  const proposedNext = [...next];
  for (let j of otherIndices) {
    const share = delta * (widths[j] / totalOther);
    proposedNext[j] -= share;
  }

  // Verificar se todas as colunas respeitam o mínimo
  const allValid = proposedNext.every(w => w >= MIN_COLUMN_PERCENT);
  if (allValid) {
    return proposedNext;
  }

  // Se não conseguir manter proporção, reduzir colunas que violam o mínimo
  // enquanto as mantém no mínimo, e distribuir o resto
  const result = [...next];
  let remainingDelta = delta;

  for (let j of otherIndices) {
    const share = delta * (widths[j] / totalOther);
    let newWidth = widths[j] - share;

    if (newWidth < MIN_COLUMN_PERCENT) {
      // Coluna atingiu mínimo
      const excessDelta = newWidth - MIN_COLUMN_PERCENT;
      remainingDelta -= excessDelta;
      result[j] = MIN_COLUMN_PERCENT;
    } else {
      // Coluna OK
      result[j] = newWidth;
    }
  }

  // Distribuir o delta excedente entre as colunas que ainda têm espaço
  if (remainingDelta !== 0) {
    const flexibleIndices = otherIndices.filter(j => result[j] > MIN_COLUMN_PERCENT);
    if (flexibleIndices.length > 0) {
      const deltaPerColumn = remainingDelta / flexibleIndices.length;
      for (let j of flexibleIndices) {
        result[j] -= deltaPerColumn;
        if (result[j] < MIN_COLUMN_PERCENT) {
          result[j] = MIN_COLUMN_PERCENT;
        }
      }
    }
  }

  // Validar resultado final
  const finalValid = result.every(w => w >= MIN_COLUMN_PERCENT);
  return finalValid ? result : null;
}
