# Specify the minimum required version of CMake (Consolidated to 3.14)
cmake_minimum_required(VERSION 3.14) 

# Set the project name
project(my_project CXX)

# --- Configuration Section ---

# Set the C++ standard to be used (C++20 as requested)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON) # Optional: Useful for IDEs and tooling

# 1. --- Source File Collection ---

# Recursively find all source files in the current directory and all subdirectories.
# This handles your multi-directory structure.
file(GLOB_RECURSE SERVER_SOURCES
    "*.cpp"
)

# Optional: Print the list of found sources for debugging
# message(STATUS "Found Source Files: ${SERVER_SOURCES}")

# 2. --- Executable Generation ---

# Add the executable target named 'server' using all the collected source files
add_executable(client ${SERVER_SOURCES})

# 3. --- Setting the Key Include Path ---

# IMPORTANT: Add the root 'Server' directory to the include path.
# This allows the compiler to find headers referenced as:
# #include "SubDirName/Header.h" from any source file.
target_include_directories(client PUBLIC 
    ${CMAKE_CURRENT_SOURCE_DIR}
)

# 4. --- Link Libraries ---

# Example for standard libraries (e.g., C++ threads)
# Uncomment and modify as needed for your specific dependencies.
# target_link_libraries(server pthread)