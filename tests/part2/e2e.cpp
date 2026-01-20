#include <gtest/gtest.h>
#include <utility> // Required for pair
#include <string>
#include <thread>
#include <filesystem> // for directory deleting
namespace fs = std::filesystem;
using namespace std;

#include "Main/Server.h"
#include "Client.h"

#include "CLIManager.h"
#define PATH "DRIVE_APP_DIR"

int PORT = 1225;
#define SERVER_IP "127.0.0.1"

string getOutput(string input) {
    stringstream ss_o;
    input += "exit\n";
    stringstream ss_i(input);

    // We want the command 'exit' to exit the program so that for the tests - the process will not be infinite.
    
    CLIManager *cliPtr = new CLIManager(ss_i, ss_o);
    Client *cPtr = new Client(SERVER_IP, PORT, *cliPtr, *cliPtr, true);
    Client& c = *cPtr;
    c.run();
    return ss_o.str(); // returning exist status and program output
}
void createServer() {
    const char *path = getenv(PATH);
    IFileManager *fmPtr = new FileManager(path);
    IStringCompressor *scPtr = new RLECompressor();
    Server server(PORT, fmPtr, scPtr);
    server.waitForClients();
}
void deleteDirectory() {
    const char *pathPtr = getenv("DRIVE_APP_DIR");
    string path(pathPtr);
    fs::path toDelete = path;
    fs::remove_all(toDelete);
}

class End2EndTests : public ::testing::Test {
protected:
    static void SetUpTestSuite() {
        thread serverThread(createServer);
        serverThread.detach();
    }
    static void TearDownTestSuite() {
        deleteDirectory();
    }
};


TEST_F(End2EndTests, Empty) {
    string actual;
    // give the server some time to start
    this_thread::sleep_for(chrono::milliseconds(100));
    
    // ------------ TEST 1 ------------
    actual = getOutput("A\n");

    EXPECT_EQ(actual, "400 Bad Request\n"); // empty command - not found

    // ------------ TEST 2 ------------
    actual = getOutput("");

    EXPECT_EQ(actual, ""); // totally empty input - empty output
}

TEST_F(End2EndTests, SanityCommands) {
    string actual_output; string expected;
    // give the server some time to start
    this_thread::sleep_for(chrono::milliseconds(100));
    // ------------ TEST 1 ------------
    actual_output = getOutput(""
        "post file1 hello world!\n"
        "get file1\n"
    );
    expected = ""
        "201 Created\n"
        "200 Ok\n\n"
        "hello world!\n";

    EXPECT_EQ(actual_output, expected); // checking if post and get works properly.
    
    // ------------ TEST 2 ------------
    actual_output = getOutput(""
        "get file\n"
    );
    expected = ""
        "404 Not Found\n";

    EXPECT_EQ(actual_output, expected); // empty input - error 404
    // ------------ TEST 3 ------------
    actual_output = getOutput(""
        "post file3-1 NICE hello, how are you?\n"
        "post file3-2 NICE I said to him: hello\n"
        "post file3-3 this sentence doesn't contain the h-word\n"
        "post file3-4 NICE why don't you say hello to me\n"
        "search NICE\n"
    );
    expected = ""
        "201 Created\n"
        "201 Created\n"
        "201 Created\n"
        "201 Created\n"
        "200 Ok\n\nfile3-1 file3-2 file3-4\n";
    
    EXPECT_EQ(actual_output, expected); // test search function
}

TEST_F(End2EndTests, SanityDelete) {
    string actual_output; string expected;
    // give the server some time to start
    this_thread::sleep_for(chrono::milliseconds(100));
    
    // ------------ TEST 1 ------------
    actual_output = getOutput(""
        "POST 3.1-file1 a\n"
        "GET 3.1-file1\n"
        "DELETE 3.1-file1\n"
        "GET 3.1-file1\n"
    );
    expected = ""
        "201 Created\n"
        "200 Ok\n\na\n"
        "204 No Content\n"
        "404 Not Found\n";
    
    EXPECT_EQ(actual_output, expected); // checking if post and get works properly.
    
    // ------------ TEST 2 ------------
    actual_output = getOutput(""
        "POST 3.2-file1 a\n"
        "DELETE 3.2-file1\n"
        "POST 3.2-file1 b\n"
        "GET 3.2-file1\n"
    );
    expected = ""
        "201 Created\n"
        "204 No Content\n"
        "201 Created\n"
        "200 Ok\n\nb\n";

    EXPECT_EQ(actual_output, expected); // checking if post and get works properly.
}

TEST_F(End2EndTests, EdgeCases) {
    string actual_output; string expected;
    // give the server some time to start
    this_thread::sleep_for(chrono::milliseconds(100));
    
    // ------------ TEST 1 ------------
    actual_output = getOutput(""
        "post 4.1-file1 text1\n"
        "post 4.1-file1 text2\n"
        "get 4.1-file1\n"
        "get 4.1-file2\n"
    );
    expected = ""
        "201 Created\n"
        "404 Not Found\n"
        "200 Ok\n\ntext1\n"
        "404 Not Found\n";
    
    EXPECT_EQ(actual_output, expected); // test overwriting (not working) and non-existing files
    // ------------ TEST 2 ------------
    actual_output = getOutput(""
        "post TEST7-file1 aaaaaaaaaa\n"
        "post TEST7-file2 aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n"
        "get TEST7-file1\n"
        "get TEST7-file2\n"
    );
    
    EXPECT_EQ(actual_output, "201 Created\n201 Created\n200 Ok\n\naaaaaaaaaa\n200 Ok\n\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n");
}

TEST_F(End2EndTests, BadRequestsInvalidCommand) {
    string actual_output; string expected;
    // give the server some time to start
    this_thread::sleep_for(chrono::milliseconds(100));
    
    // ------------ TEST 1 ------------
    actual_output = getOutput(""
        "PPOST file1 a\n"
        " POST file1 a\n"
        "GETT file1\n"
        "DELETEE file1\n"
        "SEARCHH a\n"
    );
    expected = ""
        "400 Bad Request\n"
        "400 Bad Request\n"
        "400 Bad Request\n"
        "400 Bad Request\n"
        "400 Bad Request\n";
    
    EXPECT_EQ(actual_output, expected); // test invalid commands
}

TEST_F(End2EndTests, BadRequestsInvalidNumberOfArgs) {
    string actual_output; string expected;
    // give the server some time to start
    this_thread::sleep_for(chrono::milliseconds(100));
    
    // ------------ TEST 1 ------------
    actual_output = getOutput(""
        "add\n"
        "post file1\n"
        "get\n"
        "search\n"
    );
    expected = ""
        "400 Bad Request\n"
        "400 Bad Request\n"
        "400 Bad Request\n"
        "400 Bad Request\n";
    
    EXPECT_EQ(actual_output, expected); // test non-matching number of arguments
}

TEST_F(End2EndTests, KeySensitive) {
    string actual_output;
    // give the server some time to start
    this_thread::sleep_for(chrono::milliseconds(100));
    
    // ------------ TEST 1 ------------
    actual_output = getOutput(""
        "pOST BBB-file1 KeySensitive\n"
        "Post BBB-file2 KeySensitive\n"
        "POST BBB-file3 KeySensitive\n"
        "GET BBB-file1\n"
        "deleTE BBB-file2\n"
        "SeArCh KeySensitive\n"
    );
    string expected = ""
        "201 Created\n"
        "201 Created\n"
        "201 Created\n"
        "200 Ok\n\nKeySensitive\n"
        "204 No Content\n"
        "200 Ok\n\nBBB-file1 BBB-file3\n";
    
    EXPECT_EQ(actual_output, expected); // test case sensitivity
}

TEST_F(End2EndTests, PostGetMultiClients) {
    // give the server some time to start
    this_thread::sleep_for(chrono::milliseconds(100));
    
    // ------------ TEST 1 ------------
    auto actual1 = getOutput(""
        "post PostGetMultiClients-file1 a\n"
    );
    auto actual2 = getOutput(""
        "get PostGetMultiClients-file1\n"
    );
    string expected1 = ""
        "201 Created\n";
    string expected2 = ""
        "200 Ok\n\na\n";

    EXPECT_EQ(actual1, expected1);
    EXPECT_EQ(actual2, expected2);

}

TEST_F(End2EndTests, DeleteSearchMultiClients) {
    // give the server some time to start
    this_thread::sleep_for(chrono::milliseconds(100));
    
    // ------------ TEST 1 ------------
    auto actual1 = getOutput(""
        "post DeleteSearchMultiClients-file1 DeleteSearchMultiClients\n"
    );
    auto actual2 = getOutput(""
        "post DeleteSearchMultiClients-file2 DeleteSearchMultiClients\n"
    );
    auto actual3 = getOutput(""
        "post DeleteSearchMultiClients DeleteSearchMultiClients-file3\n"
    );
    auto actual4 = getOutput(""
        "delete DeleteSearchMultiClients-file1\n"
    );
    auto actual5 = getOutput(""
        "search DeleteSearchMultiClients\n"
    );

    string expected1 = "201 Created\n";
    string expected2 = "201 Created\n";
    string expected3 = "201 Created\n";
    string expected4 = "204 No Content\n";
    string expected5 = "200 Ok\n\nDeleteSearchMultiClients DeleteSearchMultiClients-file2\n";

    EXPECT_EQ(actual1, expected1);
    EXPECT_EQ(actual2, expected2);
    EXPECT_EQ(actual3, expected3);
    EXPECT_EQ(actual4, expected4);
    EXPECT_EQ(actual5, expected5);
}