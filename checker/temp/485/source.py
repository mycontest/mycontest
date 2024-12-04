# Read three integers from input
A, B, C = map(int, input().split())

# Calculate the maximum moves
max_moves = max(B - A, C - B) - 1

# Print the result
print(max_moves)
