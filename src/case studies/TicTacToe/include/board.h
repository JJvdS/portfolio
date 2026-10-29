#pragma once
#include <array>

class Board {
    public:
    // Initialization all squares
    Board();

    // Print the board state
    void Print() const;

    // Make a move
    bool Move(int position, char player);

    // Checks whether gamestate is won
    bool CheckState();

    private:
    // Board array
    std::array<char, 9> squares;

    // Winning combinations
    const std::array<std::array<int, 3>, 8> combinations = {{
        {0, 1, 2}, {3, 4, 5}, {6, 7, 8},   // rows
        {0, 3, 6}, {1, 4, 7}, {2, 5, 8},   // columns
        {0, 4, 8}, {2, 4, 6}               // diagonal
    }};
};