cmake_minimum_required(VERSION 3.14)
project(my_project)
# GoogleTest requires at least C++17
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# --- Fetch GoogleTest ---
include(FetchContent)
FetchContent_Declare(
googletest
URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
)
# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)
# ------------------------ 

# --- 1. Compile Source Files into a Library ---

# Collect all source files from both Client and Server
# Corrected: Collect all sources into a single list 'PROJECT_SOURCES'
file(GLOB_RECURSE CLIENT_SOURCES "../src/Client/*.cpp")
file(GLOB_RECURSE SERVER_SOURCES "../src/Server/*.cpp")

# Combine the lists
set(PROJECT_SOURCES ${CLIENT_SOURCES} ${SERVER_SOURCES})

# Create a static library named 'project_lib'
add_library(project_lib STATIC ${PROJECT_SOURCES})

# Specify include directory.
target_include_directories(project_lib PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/../src/Client
    ${CMAKE_CURRENT_SOURCE_DIR}/../src/Server
)
# ----------------------------------------------

# --- 2. Compile and Link Executables ---
# Gather all test files in the 'tests' directory
file(GLOB TEST_SOURCES part2/*.cpp)

# Create an executable named 'runTests'
add_executable(runTests ${TEST_SOURCES})

# Add includes for the executables
target_include_directories(runTests PUBLIC
    # Check this path: it seems like 'src' is one level up relative to CMAKE_CURRENT_SOURCE_DIR
    # It might be better to use the same paths as the library includes:
    ${CMAKE_CURRENT_SOURCE_DIR}/../src/Client
    ${CMAKE_CURRENT_SOURCE_DIR}/../src/Server
    ${CMAKE_CURRENT_SOURCE_DIR}/tests
)

target_link_libraries(runTests gtest_main project_lib)