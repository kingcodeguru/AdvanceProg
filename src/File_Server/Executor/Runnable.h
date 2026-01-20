#ifndef RUNNABLE_H
#define RUNNABLE_H

// Interface for things that can run
class Runnable {
public:
    // destructor
    virtual ~Runnable() = default;

    // the main method to run something
    virtual void run() = 0;
};

#endif // RUNNABLE_H