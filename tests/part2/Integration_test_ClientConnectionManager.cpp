#include <gtest/gtest.h>
#include <sys/socket.h>
#include <unistd.h>
#include <string>
#include <vector>
#include <filesystem>
#include <iostream>
#include <iomanip>

#include "IOAdapters/ClientConnectionManager.h"
#include "Commands/AddCommand.h"
#include "Commands/GetCommand.h"
#include "Commands/SearchCommand.h"
#include "Commands/DeleteCommand.h"
#include "FileManager/FileManager.h"
#include "Compressor/RLECompressor.h" 


using namespace std;
namespace fs = std::filesystem;

class ServerConnectionIntegrationTest : public ::testing::Test {
private:
    const int N_LEN_BYTE = 12;
protected:
    // sockets[0] is the simulated client, sockets[1] is the server's manager
    int sockets[2]; 
    
    ClientConnectionManager* conn_manager;
    FileManager* file_manager;
    RLECompressor* compressor;

    string temp_path = "./test_files_db"; 

    void SetUp() override {
        // create connected sockets for local communication simulation
        if (socketpair(AF_UNIX, SOCK_STREAM, 0, sockets) < 0) {
            perror("socketpair failed");
            exit(1);
        }

        // make directory
        if (fs::exists(temp_path)) {
            fs::remove_all(temp_path);
        }
        fs::create_directory(temp_path);

        // initialize
        file_manager = new FileManager(temp_path);
        compressor = new RLECompressor();
        conn_manager = new ClientConnectionManager(sockets[1]);
    }

    void TearDown() override {
        // delete allocated resources
        delete conn_manager; 
        delete file_manager;
        delete compressor;
        close(sockets[0]); 
        //fs::remove_all(temp_path); 
    }

    // simulate the client sending a command
    void client_send_cmd(const string& cmd) {
        // length string
        stringstream ss;
        ss << setfill('0') << setw(N_LEN_BYTE) << cmd.length();
        string len_str = ss.str();

        // send length (5 bytes)
        write(sockets[0], len_str.c_str(), N_LEN_BYTE);
        
        // send content
        write(sockets[0], cmd.c_str(), cmd.length());
    }

    // simulate the client reading response from the server
    string client_read_response() {
        char len_buffer[N_LEN_BYTE + 1] = {0}; // 5 chars + null terminator
        
        // read length (5 bytes)
        int bytes = read(sockets[0], len_buffer, N_LEN_BYTE);
        if (bytes <= 0) return "";
        
        int len = atoi(len_buffer); // convert string to integer

        // read content
        vector<char> buffer(len);
        read(sockets[0], buffer.data(), len);
        
        return string(buffer.begin(), buffer.end());
    }
};

// now we can start the tests!!

// Test 1: Full Success Cycle- POST, GET, DELETE
TEST_F(ServerConnectionIntegrationTest, Test_1_Full_Success_Cycle) {
    AddCommand post_cmd(*conn_manager, *file_manager, *compressor);
    GetCommand get_cmd(*conn_manager, *file_manager, *compressor);
    DeleteCommand del_cmd(*conn_manager, *file_manager);
    
    // POST: create file
    client_send_cmd("POST test_file_1.txt hello_world");
    vector<string> args_post_1 = conn_manager->nextCommand();
    args_post_1.erase(args_post_1.begin());

    post_cmd.execute(args_post_1);
    EXPECT_EQ(client_read_response(), "201 Created") 
        << "Expected 201 Created for successful POST.";

    // GET: retrieve file (Check double newline)
    client_send_cmd("GET test_file_1.txt");
    vector<string> args_get_1 = conn_manager->nextCommand();
    args_get_1.erase(args_get_1.begin());

    get_cmd.execute(args_get_1);
    string expected_get = "200 Ok\n\nhello_world";
    EXPECT_EQ(client_read_response(), expected_get) 
        << "GET failed to retrieve or format the output correctly (200 Ok\\n\\n).";

    // DELETE: remove file
    client_send_cmd("DELETE test_file_1.txt");
    vector<string> args_del_1 = conn_manager->nextCommand();
    args_del_1.erase(args_del_1.begin());

    del_cmd.execute(args_del_1);
    EXPECT_EQ(client_read_response(), "204 No Content") 
        << "Expected 204 No Content for successful DELETE.";

    // final check: file should now be missing
    client_send_cmd("GET test_file_1.txt");
    vector<string> args_get_2 = conn_manager->nextCommand();
    args_get_2.erase(args_get_2.begin());

    get_cmd.execute(args_get_2);
    EXPECT_EQ(client_read_response(), "404 Not Found") 
        << "Expected 404 Not Found after successful deletion.";
}

// Test 2: Logical Error- 404 Not Found
TEST_F(ServerConnectionIntegrationTest, Test_2_Error_404_Not_Found) {
    DeleteCommand del_cmd(*conn_manager, *file_manager);
    GetCommand get_cmd(*conn_manager, *file_manager, *compressor);
    
    // try to DELETE a file that not exists
    client_send_cmd("DELETE good_job!.txt");
    vector<string> args_del_2 = conn_manager->nextCommand();
    args_del_2.erase(args_del_2.begin());

    del_cmd.execute(args_del_2);
    EXPECT_EQ(client_read_response(), "404 Not Found") 
        << "DELETE on missing file must return 404 Not Found.";

    // try to GET a file that doesn't exist
    client_send_cmd("GET best_team_ever.txt");
    vector<string> args_get_3 = conn_manager->nextCommand();
    args_get_3.erase(args_get_3.begin());

    get_cmd.execute(args_get_3);
    EXPECT_EQ(client_read_response(), "404 Not Found") 
        << "GET on missing file must return 404 Not Found.";
}

// Test 3: search Command- File and content check
TEST_F(ServerConnectionIntegrationTest, Test_3_Search_File_And_Content) {
    AddCommand post_cmd(*conn_manager, *file_manager, *compressor);
    SearchCommand search_cmd(*conn_manager, *file_manager, *compressor);

    // I create two files for searching
    client_send_cmd("POST data_file_1.txt Hello world");
    vector<string> args_post_2 = conn_manager->nextCommand();
    args_post_2.erase(args_post_2.begin());

    post_cmd.execute(args_post_2);
    client_read_response();

    client_send_cmd("POST lie_file_2.txt We love C++");
    vector<string> args_post_3 = conn_manager->nextCommand();
    args_post_3.erase(args_post_3.begin());

    post_cmd.execute(args_post_3);
    client_read_response();
    
    // search by file name part
    client_send_cmd("SEARCH data_file"); // Searching for part of the name- new in this part
    vector<string> args_search_1 = conn_manager->nextCommand();
    args_search_1.erase(args_search_1.begin());

    search_cmd.execute(args_search_1);

    string response_name_search = client_read_response();
    EXPECT_TRUE(response_name_search.rfind("200 Ok\n\n", 0) == 0) << "Search result must start with '200 Ok\\n\\n'";
    EXPECT_NE(response_name_search.find("data_file_1.txt"), string::npos) << "Search must find files by name part.";
    
    // search by content
    client_send_cmd("SEARCH C++"); 
    vector<string> args_search_2 = conn_manager->nextCommand();
    args_search_2.erase(args_search_2.begin());

    search_cmd.execute(args_search_2);

    string response_content_search = client_read_response();
    EXPECT_TRUE(response_content_search.rfind("200 Ok\n\n", 0) == 0) << "Search result must start with '200 Ok\\n\\n'";
    EXPECT_NE(response_content_search.find("lie_file_2.txt"), string::npos) << "Search must find files by content.";
}

// Test 4: Parsing with a lot of spaces
TEST_F(ServerConnectionIntegrationTest, Test_4_Parsing_With_Extra_Spaces) {
    AddCommand post_cmd(*conn_manager, *file_manager, *compressor);

    // input with a lot of spaces (מתוקן לרווחים רגילים)
    client_send_cmd("POST    file_spaced.txt       file_content   ");
    vector<string> args = conn_manager->nextCommand();
    
    // אנחנו בודקים את הוקטור לפני המחיקה כדי שה-EXPECTS ישארו רלוונטיים לבדיקה
    EXPECT_EQ(args.size(), 15) << "nextCommand should parse exactly 14 arguments."; 
    EXPECT_EQ(args[0], "POST");
    EXPECT_EQ(args[1], "");
    EXPECT_EQ(args[4], "file_spaced.txt");
    EXPECT_EQ(args[11], "file_content");
    
    // מחיקת האיבר הראשון
    args.erase(args.begin());

    post_cmd.execute(args);
    EXPECT_EQ(client_read_response(), "400 Bad Request") 
        << "Expected 400 Bad Request because the filename is an empty string";
}


// Test 5: sequential command handling- TCP Stream
TEST_F(ServerConnectionIntegrationTest, Test_5_Sequential_TCP_Commands) {
    // check if nextCommand reads only one command at a time from the stream.
    AddCommand post_cmd(*conn_manager, *file_manager, *compressor);
    GetCommand get_cmd(*conn_manager, *file_manager, *compressor);

    client_send_cmd("POST file_5.txt data_5");
    client_send_cmd("GET file_5.txt");

    // first Command Execution
    /////////////////////////////////////////////////////////////////
    vector<string> args_post_4 = conn_manager->nextCommand();
    args_post_4.erase(args_post_4.begin());

    

    post_cmd.execute(args_post_4);
    EXPECT_EQ(client_read_response(), "201 Created")
        << "First command fail"; /////////////////////

    // second Command Execution
    vector<string> args_get_4 = conn_manager->nextCommand();
    args_get_4.erase(args_get_4.begin());
 
    get_cmd.execute(args_get_4);
    string expected_get = "200 Ok\n\ndata_5";
    EXPECT_EQ(client_read_response(), expected_get)
        << "Second command failed, nextCommand did not correctly stop at the first \\n."; ///////////////////
    
}
        