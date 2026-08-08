export type DiffLineItem = {
  type: 'same' | 'add' | 'remove' | 'empty'
  text: string
}

/**
 * Computes side-by-side line diff between two text documents using Longest Common Subsequence (LCS).
 * Returns aligned left and right line arrays of identical length for accurate rendering.
 */
export function computeSideBySideDiff(
  leftText: string,
  rightText: string,
): { left: DiffLineItem[]; right: DiffLineItem[] } {
  const leftLines = (leftText || '').split('\n')
  const rightLines = (rightText || '').split('\n')

  const M = leftLines.length
  const N = rightLines.length

  // Build LCS matrix
  const dp: number[][] = Array.from({ length: M + 1 }, () => new Array(N + 1).fill(0))

  for (let i = M - 1; i >= 0; i--) {
    for (let j = N - 1; j >= 0; j--) {
      if (leftLines[i] === rightLines[j]) {
        dp[i][j] = 1 + dp[i + 1]![j + 1]!
      } else {
        dp[i][j] = Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!)
      }
    }
  }

  // Backtrack LCS matrix to build aligned left & right diff arrays
  const left: DiffLineItem[] = []
  const right: DiffLineItem[] = []

  let i = 0
  let j = 0

  while (i < M || j < N) {
    if (i < M && j < N && leftLines[i] === rightLines[j]) {
      left.push({ type: 'same', text: leftLines[i]! })
      right.push({ type: 'same', text: rightLines[j]! })
      i++
      j++
    } else if (i < M && (j >= N || dp[i + 1]![j]! >= dp[i]![j + 1]!)) {
      left.push({ type: 'remove', text: leftLines[i]! })
      right.push({ type: 'empty', text: '' })
      i++
    } else {
      left.push({ type: 'empty', text: '' })
      right.push({ type: 'add', text: rightLines[j]! })
      j++
    }
  }

  return { left, right }
}
