// Case study content per project slug. Block types: p, code, terminal,
// callout, stats, combos, play, list
import kTicTacToeImage from '../assets/tictactoe.svg'
import kProjects from './projects'

const kTicTacToe = {
  slug: 'tictactoe',
  index: '02',
  title: 'TicTacToe',
  tagline:
    'Excepteur sint occaecat cupidatat non proident sunt culpa qui officia ' +
    'deserunt.',
  image: kTicTacToeImage,
  image_alt: 'a won game of tic-tac-toe',
  facts: [
    ['Role', 'Design & development'],
    ['Year', '2026'],
    ['Stack', 'C++17 · g++ · Make'],
    ['Platform', 'Terminal'],
  ],
  summary: [
    [
      'Challenge',
      'Do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ' +
      'ad. Minim veniam quis nostrud exercitation ullamco laboris nisi ' +
      'aliquip ex ea commodo. Consequat.',
    ],
    [
      'Approach',
      'Duis aute irure in reprehenderit voluptate velit esse cillum fugiat ' +
      'nulla pariatur. Excepteur sint occaecat cupidatat non proident sunt ' +
      'culpa qui officia deserunt.',
    ],
    [
      'Outcome',
      'Mollit anim id est laborum lorem ipsum dolor sit amet consectetur ' +
      'adipiscing. Elit sed do eiusmod tempor incididunt ut labore.',
    ],
  ],
  highlights: [
    ['9', 'squares'],
    ['8', 'winning lines'],
    ['3', 'source files'],
    ['0', 'dependencies'],
  ],
  sections: [
    {
      id: 'overview',
      label: 'In reprehenderit',
      title: 'Lorem ipsum dolor sit amet consectetur.',
      blocks: [
        {
          type: 'p',
          text:
            'Mollit anim id est laborum lorem ipsum dolor sit amet ' +
            'consectetur adipiscing. Elit sed do eiusmod tempor incididunt ' +
            'ut labore et dolore magna aliqua. Enim ad minim veniam quis ' +
            'nostrud exercitation ullamco laboris nisi aliquip ex. Ea ' +
            'commodo consequat duis aute irure in reprehenderit voluptate ' +
            'velit esse cillum. Fugiat nulla pariatur excepteur sint ' +
            'occaecat.',
        },
        {
          type: 'p',
          text:
            'Cupidatat non proident sunt culpa qui officia deserunt mollit ' +
            'anim id est. Laborum lorem ipsum dolor sit amet consectetur ' +
            'adipiscing elit sed do eiusmod. Tempor incididunt ut labore et ' +
            'dolore.',
        },
      ],
    },
    {
      id: 'board',
      label: 'Voluptate',
      title: 'Adipiscing elit sed do eiusmod.',
      blocks: [
        {
          type: 'p',
          text:
            'Magna aliqua enim ad minim veniam quis nostrud exercitation ' +
            'ullamco laboris nisi. Aliquip ex ea commodo consequat duis aute ' +
            'irure in reprehenderit voluptate velit. Esse cillum fugiat ' +
            'nulla pariatur excepteur sint occaecat cupidatat non proident ' +
            'sunt. Culpa qui officia deserunt.',
        },
        {
          type: 'code',
          lang: 'cpp',
          file: 'include/board.h',
          code: `class Board {
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
};`,
        },
        {
          type: 'callout',
          label: 'Design decision',
          text:
            'Mollit anim id est laborum lorem ipsum dolor sit amet ' +
            'consectetur adipiscing. Elit sed do eiusmod tempor incididunt ' +
            'ut labore et dolore magna aliqua. Enim ad minim veniam quis.',
        },
        {
          type: 'code',
          lang: 'cpp',
          file: 'src/board.cc',
          code: `Board::Board() {
    squares.fill('.');
}

void Board::Print() const {
    for (int i = 0; i < 9; i++) {
        if (i % 3 == 0) {
            std::cout << "[ ";
        }
        std::cout << squares[i] << ' ';

        if (i % 3 == 2) {
            std::cout << ']' << '\\n';
        }
    }

    std::cout << '\\n';
}`,
        },
      ],
    },
    {
      id: 'winning',
      label: 'Velit',
      title: 'Tempor incididunt ut labore et dolore.',
      blocks: [
        {
          type: 'p',
          text:
            'Nostrud exercitation ullamco laboris nisi aliquip ex ea commodo ' +
            'consequat duis aute. Irure in reprehenderit voluptate velit ' +
            'esse cillum fugiat nulla pariatur excepteur sint. Occaecat ' +
            'cupidatat non proident sunt culpa qui officia.',
        },
        { type: 'combos' },
        {
          type: 'code',
          lang: 'cpp',
          file: 'include/board.h',
          code: `const std::array<std::array<int, 3>, 8> combinations = {{
    {0, 1, 2}, {3, 4, 5}, {6, 7, 8},   // rows
    {0, 3, 6}, {1, 4, 7}, {2, 5, 8},   // columns
    {0, 4, 8}, {2, 4, 6}               // diagonal
}};`,
        },
        {
          type: 'p',
          text:
            'Deserunt mollit anim id est laborum lorem ipsum dolor sit amet ' +
            'consectetur. Adipiscing elit sed do eiusmod tempor incididunt ' +
            'ut labore et dolore magna.',
        },
        {
          type: 'code',
          lang: 'cpp',
          file: 'src/board.cc',
          code: `bool Board::CheckState() {
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
}`,
        },
      ],
    },
    {
      id: 'moves',
      label: 'Esse cillum',
      title: 'Magna aliqua enim ad minim.',
      blocks: [
        {
          type: 'p',
          text:
            'Aliqua enim ad minim veniam quis nostrud exercitation ullamco ' +
            'laboris nisi aliquip. Ex ea commodo consequat duis aute irure ' +
            'in reprehenderit voluptate velit esse. Cillum fugiat nulla ' +
            'pariatur excepteur sint occaecat cupidatat non proident sunt ' +
            'culpa.',
        },
        {
          type: 'code',
          lang: 'cpp',
          file: 'src/board.cc',
          code: `bool Board::Move(int position, char player) {
    // Check if square is already filled
    if (squares[position] == '.') {
        // Change square relative to current player
        squares[position] = (player == 'A') ? 'X' : 'O';

        return true;
    }

    return false;
}`,
        },
        {
          type: 'p',
          text:
            'Qui officia deserunt mollit anim id est laborum lorem ipsum ' +
            'dolor sit. Amet consectetur adipiscing elit sed do eiusmod ' +
            'tempor incididunt ut labore et. Dolore magna aliqua enim ad ' +
            'minim veniam.',
        },
        {
          type: 'code',
          lang: 'cpp',
          file: 'src/main.cc',
          code: `int RequestMove(char player) {
    int position;

    std::cout << "Player " << player << ", choose a square (1-9): ";
    std::cin >> position;

    while (position < 1 || position > 9) {
        std::cout << '\\n' << "Invalid position, try again: ";
        std::cin >> position;
    }

    return position;
}`,
        },
      ],
    },
    {
      id: 'loop',
      label: 'Fugiat',
      title: 'Veniam quis nostrud exercitation ullamco.',
      blocks: [
        {
          type: 'p',
          text:
            'Quis nostrud exercitation ullamco laboris nisi aliquip ex ea ' +
            'commodo consequat duis. Aute irure in reprehenderit voluptate ' +
            'velit esse cillum fugiat nulla pariatur.',
        },
        {
          type: 'code',
          lang: 'cpp',
          file: 'src/main.cc',
          code: `while (!won && moves < 9) {
    int position = RequestMove(player) - 1;

    while (!board.Move(position, player)) {
        std::cout << "Square already filled, try again!" << '\\n';

        position = RequestMove(player) - 1;
    }

    player = (player == 'A' ? 'B' : 'A');
    moves++;
    board.Print();
    won = board.CheckState();
}`,
        },
        {
          type: 'callout',
          label: 'Gotcha',
          tone: 'warn',
          text:
            'Excepteur sint occaecat cupidatat non proident sunt culpa qui ' +
            'officia deserunt mollit. Anim id est laborum lorem ipsum dolor ' +
            'sit amet consectetur adipiscing elit. Sed do eiusmod tempor ' +
            'incididunt ut labore et dolore magna aliqua enim. Ad.',
        },
        {
          type: 'code',
          lang: 'cpp',
          file: 'src/main.cc',
          code: `if (won) {
    player = (player == 'A') ? 'B' : 'A';
    std::cout << "Player " << player << " won!" << '\\n';
    std::cout << "The game took a total of " << moves << " moves." << '\\n';
} else {
    std::cout << "Game is drawn!" << '\\n';
}`,
        },
        {
          type: 'p',
          text: 'Minim veniam quis nostrud exercitation ullamco.',
        },
        {
          type: 'terminal',
          code: `$ make && ./game
[ . . . ]
[ . . . ]
[ . . . ]

Player A, choose a square (1-9): 1
[ X . . ]
[ . . . ]
[ . . . ]

Player B, choose a square (1-9): 2
[ X O . ]
[ . . . ]
[ . . . ]

...

Player A, choose a square (1-9): 9
[ X O . ]
[ . X . ]
[ O . X ]

Player A won!
The game took a total of 5 moves.`,
        },
        {
          type: 'play',
          text:
            'Laboris nisi aliquip ex ea commodo consequat duis aute irure in ' +
            'reprehenderit. Voluptate velit esse cillum.',
        },
      ],
    },
    {
      id: 'build',
      label: 'Nulla',
      title: 'Laboris nisi aliquip ex ea commodo.',
      blocks: [
        {
          type: 'p',
          text:
            'Fugiat nulla pariatur excepteur sint occaecat cupidatat non ' +
            'proident sunt culpa qui. Officia deserunt mollit anim id est ' +
            'laborum lorem ipsum dolor sit amet. Consectetur adipiscing elit ' +
            'sed do eiusmod tempor incididunt ut labore et dolore. Magna ' +
            'aliqua.',
        },
        {
          type: 'code',
          lang: 'make',
          file: 'Makefile',
          code: `CXX      = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -Iinclude -MMD -MP

SRCS = $(wildcard src/*.cc)
OBJS = $(SRCS:src/%.cc=build/%.o)

game: $(OBJS)
	$(CXX) $(OBJS) -o $@

build/%.o: src/%.cc | build
	$(CXX) $(CXXFLAGS) -c $< -o $@

build:
	mkdir -p build

-include $(OBJS:.o=.d)`,
        },
        {
          type: 'list',
          items: [
            [
              'Et dolore',
              'Magna aliqua enim ad minim veniam quis nostrud exercitation ' +
              'ullamco laboris nisi. Aliquip ex ea commodo consequat duis ' +
              'aute irure in reprehenderit voluptate velit. Esse cillum ' +
              'fugiat nulla.',
            ],
            [
              'Pariatur',
              'Excepteur sint occaecat cupidatat non proident sunt culpa qui ' +
              'officia deserunt mollit. Anim id est laborum lorem ipsum ' +
              'dolor sit amet consectetur.',
            ],
            [
              'Adipiscing elit',
              'Sed do eiusmod tempor incididunt ut labore et dolore magna ' +
              'aliqua enim. Ad minim veniam.',
            ],
          ],
        },
      ],
    },
    {
      id: 'next',
      label: 'Pariatur',
      title: 'Consequat duis aute irure.',
      blocks: [
        {
          type: 'p',
          text:
            'Enim ad minim veniam quis nostrud exercitation ullamco laboris ' +
            'nisi aliquip ex. Ea commodo consequat duis aute irure.',
        },
        {
          type: 'list',
          items: [
            [
              'Quis nostrud exercitation',
              'Ullamco laboris nisi aliquip ex ea commodo consequat duis ' +
              'aute irure in. Reprehenderit voluptate velit esse cillum ' +
              'fugiat nulla pariatur excepteur sint occaecat cupidatat. Non ' +
              'proident sunt culpa qui officia.',
            ],
            [
              'Deserunt mollit anim id est',
              'Laborum lorem ipsum dolor sit amet consectetur adipiscing ' +
              'elit sed do eiusmod. Tempor.',
            ],
            [
              'Incididunt ut labore et dolore',
              'Magna aliqua enim ad minim veniam quis nostrud exercitation ' +
              'ullamco laboris nisi. Aliquip ex ea commodo.',
            ],
            [
              'Consequat duis aute',
              'Irure in reprehenderit voluptate velit esse cillum fugiat ' +
              'nulla pariatur excepteur sint. Occaecat cupidatat non ' +
              'proident sunt culpa.',
            ],
          ],
        },
        {
          type: 'code',
          lang: 'cpp',
          file: 'src/main.cc - proposed',
          code: `int RequestMove(char player) {
    int position;

    std::cout << "Player " << player << ", choose a square (1-9): ";

    // Keep asking until we read a number in range
    while (!(std::cin >> position) || position < 1 || position > 9) {
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\\n');
        std::cout << '\\n' << "Invalid position, try again: ";
    }

    return position;
}`,
        },
        {
          type: 'p',
          text:
            'In reprehenderit voluptate velit esse cillum fugiat nulla ' +
            'pariatur excepteur sint occaecat. Cupidatat non proident sunt ' +
            'culpa qui officia deserunt mollit anim id est. Laborum lorem ' +
            'ipsum dolor sit amet consectetur adipiscing elit sed.',
        },
      ],
    },
  ],
}

const kCaseStudies = { [kTicTacToe.slug]: kTicTacToe }

////////////////////////////////////////////////////////////////////////////////
// A project opens only when it is enabled and has a case study written
export function IsProjectOpen(project) {
  return !project.disabled && Boolean(kCaseStudies[project.slug])
} //IsProjectOpen

////////////////////////////////////////////////////////////////////////////////
// Disabled projects have no route. Enabled ones without a written case study
// get a placeholder page built from their project entry
export function GetCaseStudy(slug) {
  const project = kProjects.find((p) => p.slug === slug)
  if (!project || project.disabled) return null
  if (kCaseStudies[slug]) return kCaseStudies[slug]

  const tags = project.meta.split(' · ').filter((tag) => tag !== project.year)
  return {
    slug,
    index: project.index,
    title: project.title,
    tagline: null,
    image: project.image,
    facts: [
      ['Type', tags.join(' · ')],
      ['Year', project.year],
    ],
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        title: 'Write-up in progress.',
        blocks: [
          {
            type: 'p',
            text:
              `The full case study for ${project.title} is still being ` +
              'written. Check back soon, or get in touch if you want the ' +
              'story now.',
          },
        ],
      },
    ],
  }
} //GetCaseStudy

export default kCaseStudies
