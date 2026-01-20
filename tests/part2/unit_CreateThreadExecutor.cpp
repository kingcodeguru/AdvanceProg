#include "Executor/CreateThreadExecutor.h"
#include "Executor/Runnable.h"
#include "Executor/Executor.h"

using namespace std;
#include <atomic>
#include <gtest/gtest.h>



TEST(CreateThreadExecutorUnitTests, ExecuteRunsInNewThread) {
    class FakeRunnable : public Runnable {
    
    public:
        ~FakeRunnable() override = default;

        atomic<int> count{0};
        atomic<thread::id> thread_id;

        void run() override {
            count++;
            thread_id.store(this_thread::get_id());
            this_thread::sleep_for(chrono::milliseconds(100));
        }
    };

    CreateThreadExecutor executor;
    FakeRunnable runnable;

    // ------------ TEST 1 ------------
    executor.execute(runnable);
    executor.execute(runnable);

    this_thread::sleep_for(chrono::milliseconds(20));

    EXPECT_EQ(runnable.count.load(), 2) << "Runnable was not executed.";

    // ------------ TEST 2 ------------
    
    executor.execute(runnable);
    this_thread::sleep_for(chrono::milliseconds(20));
    thread::id id1 = runnable.thread_id;
    executor.execute(runnable);
    this_thread::sleep_for(chrono::milliseconds(20));
    thread::id id2 = runnable.thread_id;
    //this_thread::sleep_for(chrono::milliseconds(20));
    EXPECT_NE(id1, id2) << "Runnable was executed in the same thread.";

 
}

