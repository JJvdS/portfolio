CXX      = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -Iinclude -MMD -MP

SRCS = $(wildcard src/*.cc)
OBJS = $(SRCS:src/%.cc=build/%.o)

game: $(OBJS)
	$(CXX) $(OBJS) -o $@

build/%.o: src/%.cc | build
	$(CXX) $(CXXFLAGS) -c $< -o $@

build:
	mkdir -p build

clean:
	rm -rf build game

.PHONY: clean

-include $(OBJS:.o=.d)
