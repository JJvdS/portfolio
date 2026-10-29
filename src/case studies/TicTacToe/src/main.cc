#include <iostream>
#include <board.h>

/******************************************************************************/


int RequestMove(char player) {
    int position;
    
    std::cout << "Player " << player << ", choose a square (1-9): ";
    std::cin >> position;

    while (position < 1 || position > 9) {
        std::cout << '\n' << "Invalid position, try again: ";
        std::cin >> position;
    }

    return position;
}

/******************************************************************************/


int main() {
    Board board;
    int moves = 0;
    char player = 'A';
    bool won = false;

    // Print the board
    board.Print();

    // While game is running
    while (!won && moves < 9) {
        int position = RequestMove(player) - 1;

        while (!board.Move(position, player)) {
            std::cout << "Square already filled, try again!" << '\n';
            
            position = RequestMove(player) - 1;
        }

        player = (player == 'A' ? 'B' : 'A');
        moves++;
        board.Print();
        won = board.CheckState();
    }

    // Check if game is won or drawn
    if (won) {
        player = (player == 'A') ? 'B' : 'A';
        std::cout << "Player " << player << " won!" << '\n';
        std::cout << "The game took a total of " << moves << " moves." << '\n';
    } else {
        std::cout << "Game is drawn!" << '\n';
    }

    return 0;
}