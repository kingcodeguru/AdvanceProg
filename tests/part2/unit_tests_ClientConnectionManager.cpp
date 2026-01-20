#include <gtest/gtest.h>
#include <sys/socket.h>
#include <unistd.h>
#include <string>
#include <vector>
#include <iomanip>
#include <sstream>

#include "IOAdapters/ClientConnectionManager.h"

using namespace std;

const int N_LEN_BYTE = 12;

class ClientConnectionManagerTest : public ::testing::Test {
protected:
    int sockets[2]; // 0 is the test side (the client), 1 is the manager side (the server)
    ClientConnectionManager* manager;

    void SetUp() override {
        // Create a socket to simulate the connection
        if (socketpair(AF_UNIX, SOCK_STREAM, 0, sockets) < 0) {
            perror("socketpair failed");
            exit(1);
        }
        manager = new ClientConnectionManager(sockets[1]);
    }

    void TearDown() override {
        delete manager; // This will close sockets[1]
        close(sockets[0]);
    }

    // write raw string to the manager's socket
    void send_to_manager(const string& data) {
        // length string
        stringstream ss;
        ss << setfill('0') << setw(N_LEN_BYTE) << data.length();
        string len_str = ss.str();

        // send length
        write(sockets[0], len_str.c_str(), N_LEN_BYTE);
        
        // send content
        write(sockets[0], data.c_str(), data.length());
    }

    // read raw string from the manager's socket
    string read_from_manager() {
        char len_buffer[N_LEN_BYTE] = {0}; // N_LEN_BYTE chars + null terminator
        
        // read length
        int bytes = read(sockets[0], len_buffer, N_LEN_BYTE);
        if (bytes <= 0) return "";
        
        int len = atoi(len_buffer);

        // read content
        vector<char> buffer(len);
        read(sockets[0], buffer.data(), len);
        
        return string(buffer.begin(), buffer.end());
    }
};

// Test 1: simple command parsing
TEST_F(ClientConnectionManagerTest, Parsing_Basic_Command) {
    send_to_manager("GET file.txt");
    
    vector<string> args = manager->nextCommand();
    
    ASSERT_EQ(args.size(), 2);
    EXPECT_EQ(args[0], "GET");
    EXPECT_EQ(args[1], "file.txt");
}

// Test 2: parsing with a lot of spaces
// Input: "POST  file  data", Expects: "POST", "", "file", "", "data"
TEST_F(ClientConnectionManagerTest, Parsing_Multiple_Spaces_Logic) {
    send_to_manager("POST  file  data");
    
    vector<string> args = manager->nextCommand();
    
    ASSERT_EQ(args.size(), 5);
    EXPECT_EQ(args[0], "POST");
    EXPECT_EQ(args[1], ""); 
    EXPECT_EQ(args[2], "file");
    EXPECT_EQ(args[3], "");
    EXPECT_EQ(args[4], "data");
}

// Test 3: parsing with spaces at the start and at the end
// Input: "  cmd  ", Expects: "", "", "cmd", "", ""
TEST_F(ClientConnectionManagerTest, Parsing_Start_End_Spaces) {
    send_to_manager("  cmd  ");
    
    vector<string> args = manager->nextCommand();
    
    ASSERT_EQ(args.size(), 5);
    EXPECT_EQ(args[0], "");
    EXPECT_EQ(args[1], "");
    EXPECT_EQ(args[2], "cmd");
    EXPECT_EQ(args[3], "");
    EXPECT_EQ(args[4], "");
}

// Test 4: socket reading stops at newline
TEST_F(ClientConnectionManagerTest, Socket_Read_Multiple_Commands) {
    // simulate two commands sent together
    send_to_manager("cmd1 args..");
    send_to_manager("cmd2 args..");
    
    // read first command
    vector<string> args1 = manager->nextCommand();
    EXPECT_EQ(args1[0], "cmd1");
    
    // read second command
    vector<string> args2 = manager->nextCommand();
    EXPECT_EQ(args2[0], "cmd2");
}

// Test 5: display() adds newline, new in this part
TEST_F(ClientConnectionManagerTest, Output_Adds_Newline) {
    manager->display("200 Ok");
    
    string output = read_from_manager();
    EXPECT_EQ(output, "200 Ok"); // must have \n at the end
}

// Test 6: displayError() adds newline
TEST_F(ClientConnectionManagerTest, Error_Output_Adds_Newline) {
    manager->displayError("404 Not Found");
    
    string output = read_from_manager();
    EXPECT_EQ(output, "404 Not Found");
}

// Test 7: test on empty line
TEST_F(ClientConnectionManagerTest, Input_Empty_Line) {
    send_to_manager("");
    
    vector<string> args = manager->nextCommand();

    ASSERT_EQ(args.size(), 0);
}