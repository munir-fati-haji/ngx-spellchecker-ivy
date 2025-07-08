export class Levenshtein {
  public static distance(source: string, target: string): number {
    if (source === target) return 0;
    if (source.length === 0) return target.length;
    if (target.length === 0) return source.length;

    const matrix = this.createInitialMatrix(source.length + 1, target.length + 1);

    return this.computeMatrix(source, target, matrix, source.length, target.length, 1, 1)[source.length][target.length];
  }

  private static createInitialMatrix(rows: number, cols: number): number[][] {
    return this.fillRows(0, rows, cols);
  }

  private static fillRows(row: number, totalRows: number, cols: number): number[][] {
    if (row === totalRows) return [];
    return [this.fillCols(row, 0, cols), ...this.fillRows(row + 1, totalRows, cols)];
  }

  private static fillCols(row: number, col: number, totalCols: number): number[] {
    if (col === totalCols) return [];
    if (col === 0) return [row, ...this.fillCols(row, col + 1, totalCols)];
    if (row === 0) return [col, ...this.fillCols(row, col + 1, totalCols)];
    return [0, ...this.fillCols(row, col + 1, totalCols)];
  }

  private static computeMatrix(
    source: string,
    target: string,
    matrix: number[][],
    maxRow: number,
    maxCol: number,
    row: number,
    col: number,
  ): number[][] {
    if (row > maxRow) return matrix;
    if (col > maxCol) return this.computeMatrix(source, target, matrix, maxRow, maxCol, row + 1, 1);

    const cost = this.getCost(source, target, row, col);

    const deletion = matrix[row - 1][col] + 1;
    const insertion = matrix[row][col - 1] + 1;
    const substitution = matrix[row - 1][col - 1] + cost;

    let value = Math.min(deletion, insertion, substitution);

    if (this.isTransposition(source, target, row, col)) {
      const transposition = matrix[row - 2][col - 2] + cost;
      value = Math.min(value, transposition);
    }

    const newMatrix = this.updateMatrix(matrix, row, col, value);

    return this.computeMatrix(source, target, newMatrix, maxRow, maxCol, row, col + 1);
  }

  private static getCost(source: string, target: string, row: number, col: number): number {
    return source[row - 1] === target[col - 1] ? 0 : 1;
  }

  private static isTransposition(source: string, target: string, row: number, col: number): boolean {
    return row > 1 && col > 1 && source[row - 1] === target[col - 2] && source[row - 2] === target[col - 1];
  }

  private static updateMatrix(matrix: number[][], row: number, col: number, value: number): number[][] {
    return matrix.map((r, i) => (i !== row ? r : r.map((cell, j) => (j === col ? value : cell))));
  }
}
