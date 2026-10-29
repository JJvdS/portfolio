#include "board.h"
#include <iostream>

/******************************************************************************/

// Initialization all squares
Board::Board() {
    squares.fill('.');
}

/******************************************************************************/

// Print the board state
void Board::Print() const {

    for (int i = 0; i < 9; i++) {
        if (i % 3 == 0) {
            std::cout << "[ ";
        }
        std::cout << squares[i] << ' ';

        if (i % 3 == 2) {
            std::cout << ']' << '\n';
        }
    }

    std::cout << '\n';
}

/******************************************************************************/

// Make a move
bool Board::Move(int position, char player) {
    // Check if square is already filled
    if (squares[position] == '.') {
        // Change square relative to current player
        squares[position] = (player == 'A') ? 'X' : 'O';

        return true;
    }

    return false;
}

/******************************************************************************/

// Checks whether gamestate is won
bool Board::CheckState() {

    // For each winning combination
    for (const auto& combo : combinations) {
        // Check whether all are same character (and not empty)
        if (squares[combo[0]] == squares[combo[1]] &&
            squares[combo[1]] == squares[combo[2]] &&
            squares[combo[0]] != '.') {
                return true;
        }
    }

    return false;
}