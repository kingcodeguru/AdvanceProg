#include "FixedThreadPool.h"

FixedThreadPool::FixedThreadPool(size_t numThreads) : numThreads(numThreads) {
     for (size_t i = 0; i < numThreads; ++i) {
            workers.emplace_back([this]() { workerFunction(); });
        }
}

void FixedThreadPool::execute(Runnable& r) noexcept {
    {
            std::unique_lock<std::mutex> lock(queueMutex);
            tasks.push(&r);
    }
    condition.notify_one();
}

void FixedThreadPool::workerFunction() {
    while (true) {
            Runnable* r;
            {
                std::unique_lock<std::mutex> lock(queueMutex);
                condition.wait(lock, [this]() { return stop || !tasks.empty(); });

                if (stop && tasks.empty())
                    return;

                r = tasks.front();
                tasks.pop(); // Mutex is unlocked here
                // std::unique_lock<std::mutex> lock(queueMutex);

            }

            // Process the client outside the critical section
            r->run();

        }
}

FixedThreadPool::~FixedThreadPool() {
    {
        std::unique_lock<std::mutex> lock(queueMutex);
        stop = true;
    }
    condition.notify_all();
    for (std::thread &worker : workers) {
        if (worker.joinable()) {
            worker.join();
        }
    }
}