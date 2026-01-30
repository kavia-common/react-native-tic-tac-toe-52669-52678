import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type Player = 'X' | 'O';
type Cell = Player | null;
type Board = Cell[];

const COLORS = {
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
  secondaryText: '#64748b',
  primary: '#3b82f6',
  success: '#06b6d4',
  error: '#EF4444',
  border: '#e5e7eb',
};

const WINNING_LINES: ReadonlyArray<ReadonlyArray<number>> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => null);
}

function oppositePlayer(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}

function getWinner(board: Board): { winner: Player | null; winningLine: number[] | null } {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const v = board[a];
    if (v && v === board[b] && v === board[c]) {
      return { winner: v, winningLine: [...line] };
    }
  }
  return { winner: null, winningLine: null };
}

function isDraw(board: Board): boolean {
  return board.every((c) => c !== null) && getWinner(board).winner === null;
}

type GameStatus =
  | { kind: 'PLAYING'; nextPlayer: Player }
  | { kind: 'WON'; winner: Player; winningLine: number[] }
  | { kind: 'DRAW' };

/** Compute the current game status from board and next player. */
function computeStatus(board: Board, nextPlayer: Player): GameStatus {
  const { winner, winningLine } = getWinner(board);
  if (winner && winningLine) return { kind: 'WON', winner, winningLine };
  if (isDraw(board)) return { kind: 'DRAW' };
  return { kind: 'PLAYING', nextPlayer };
}

export default function App() {
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [nextPlayer, setNextPlayer] = useState<Player>('X');
  const [scores, setScores] = useState<{ X: number; O: number; draws: number }>({
    X: 0,
    O: 0,
    draws: 0,
  });

  const status = useMemo(() => computeStatus(board, nextPlayer), [board, nextPlayer]);

  const statusText = useMemo(() => {
    if (status.kind === 'WON') return `Player ${status.winner} wins!`;
    if (status.kind === 'DRAW') return `It's a draw.`;
    return `Player ${status.nextPlayer}'s turn`;
  }, [status]);

  const statusColor = useMemo(() => {
    if (status.kind === 'WON') return COLORS.success;
    if (status.kind === 'DRAW') return COLORS.secondaryText;
    return COLORS.text;
  }, [status]);

  function applyMove(index: number) {
    // Coordinate state updates: compute within a single board update and update other state accordingly.
    setBoard((prev) => {
      const currentStatus = computeStatus(prev, nextPlayer);
      if (currentStatus.kind !== 'PLAYING') return prev;
      if (prev[index] !== null) return prev;

      const next = [...prev];
      next[index] = nextPlayer;

      const afterStatus = computeStatus(next, oppositePlayer(nextPlayer));
      if (afterStatus.kind === 'WON') {
        setScores((s) => ({ ...s, [afterStatus.winner]: s[afterStatus.winner] + 1 }));
      } else if (afterStatus.kind === 'DRAW') {
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      }

      setNextPlayer(oppositePlayer(nextPlayer));
      return next;
    });
  }

  function restartRound(startingPlayer: Player = 'X') {
    setBoard(createEmptyBoard());
    setNextPlayer(startingPlayer);
  }

  function resetScoresAndRestart() {
    setScores({ X: 0, O: 0, draws: 0 });
    restartRound('X');
  }

  const winningSet = useMemo(() => {
    if (status.kind !== 'WON') return new Set<number>();
    return new Set<number>(status.winningLine);
  }, [status]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.title}>Tic Tac Toe</Text>

        <View style={styles.scoreRow} accessibilityRole="summary">
          <View style={styles.scorePill}>
            <Text style={styles.scoreLabel}>X</Text>
            <Text style={styles.scoreValue}>{scores.X}</Text>
          </View>
          <View style={styles.scorePill}>
            <Text style={styles.scoreLabel}>Draws</Text>
            <Text style={styles.scoreValue}>{scores.draws}</Text>
          </View>
          <View style={styles.scorePill}>
            <Text style={styles.scoreLabel}>O</Text>
            <Text style={styles.scoreValue}>{scores.O}</Text>
          </View>
        </View>

        <View style={styles.statusCard} accessibilityRole="status">
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          {status.kind === 'PLAYING' && (
            <Text style={styles.subStatus}>Tap an empty square to place {status.nextPlayer}.</Text>
          )}
          {status.kind !== 'PLAYING' && (
            <Text style={styles.subStatus}>Press “Restart Round” to play again.</Text>
          )}
        </View>

        <View style={styles.board} accessibilityLabel="Tic Tac Toe board">
          {board.map((cell, idx) => {
            const isWinningCell = winningSet.has(idx);
            const isDisabled = cell !== null || status.kind !== 'PLAYING';
            return (
              <Pressable
                key={idx}
                onPress={() => applyMove(idx)}
                disabled={isDisabled}
                accessibilityRole="button"
                accessibilityLabel={`Cell ${idx + 1}${cell ? `, ${cell}` : ''}`}
                style={({ pressed }) => [
                  styles.cell,
                  isWinningCell && styles.cellWinning,
                  pressed && !isDisabled ? styles.cellPressed : null,
                  isDisabled ? styles.cellDisabled : null,
                ]}
              >
                <Text
                  style={[
                    styles.cellText,
                    cell === 'X' ? styles.cellTextX : null,
                    cell === 'O' ? styles.cellTextO : null,
                    isWinningCell ? styles.cellTextWinning : null,
                  ]}
                >
                  {cell ?? ''}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => restartRound('X')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
          >
            <Text style={styles.buttonText}>Restart Round</Text>
          </Pressable>

          <Pressable
            onPress={resetScoresAndRestart}
            accessibilityRole="button"
            style={({ pressed }) => [styles.buttonSecondary, pressed ? styles.buttonPressed : null]}
          >
            <Text style={styles.buttonSecondaryText}>Reset Scores</Text>
          </Pressable>
        </View>

        <Text style={styles.footerNote}>Two players, one device. No ads. No fluff.</Text>
      </View>
    </SafeAreaView>
  );
}

const CELL_GAP = 10;
const CELL_SIZE = 96;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  scorePill: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '700',
  },
  scoreValue: {
    marginTop: 4,
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '800',
  },
  statusCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '800',
  },
  subStatus: {
    fontSize: 13,
    color: COLORS.secondaryText,
    lineHeight: 18,
  },
  board: {
    width: CELL_SIZE * 3 + CELL_GAP * 2,
    height: CELL_SIZE * 3 + CELL_GAP * 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CELL_GAP,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignContent: 'center',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  cellPressed: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  cellDisabled: {
    opacity: 0.92,
  },
  cellWinning: {
    borderColor: COLORS.success,
    backgroundColor: '#ecfeff',
  },
  cellText: {
    fontSize: 42,
    fontWeight: '900',
  },
  cellTextX: {
    color: COLORS.primary,
  },
  cellTextO: {
    color: COLORS.error,
  },
  cellTextWinning: {
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonSecondaryText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  footerNote: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.secondaryText,
  },
});
