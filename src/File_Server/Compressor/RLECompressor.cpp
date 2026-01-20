#include "RLECompressor.h"



// Compress the given text using RLE algorithm
// this algorithm compresses sequences of the same character
// into the format "count" + "char", with a delimiter if the char is a digit or the delimiter itself
// example: "aaabbbcc1|" -> "3a3b2c1|11||"
string RLECompressor::compress(string text) noexcept {
    // init variables
    string compressed = "";
    int n = text.length();
    if (n == 0) {
        return compressed; // return empty string if input is empty
    }
    char current_char = text[0];
    int i = 0;

    // lambda function to append compressed part
    auto appendComp = [&](char c, int countC) {
        compressed += to_string(countC);
        if (isdigit(c) || c == DELIMITER) {
            compressed += DELIMITER; // delimiter for digits and for the delimiter itself
        }
        compressed += c;
    };


    while(i < n) {
        // count occurrences of current_char
        int count = 0;
        while (i < n && text[i] == current_char) {
            count++;
            i++;
        }

        // append the compressed part
        appendComp(current_char, count);

        // update current_char if not at the end
        current_char = text[i];
    }
    return compressed;
}

// Decompress the given RLE compressed string
// example: "3a3b2c1|11||" -> "aaabbbcc1|"
string RLECompressor::decompress(string context) {
    // init variables
    string decompressed = "";
    int n = context.length();
    int i = 0;


    // iterate through the compressed context
    while (i < n) {
        
        // read the count (which may be more than one digit)
        int count = 0;
        while (i < n && isdigit(context[i])) {
            count = count * 10 + (context[i] - '0');
            i++;
        }

        // if the count is zero or we reached the end, invalid format
        if (count == 0 || i >= n) {
            throw invalid_argument("Invalid compressed format: " + context);
        }

        // check for delimiter
        if (context[i] == DELIMITER) {
            i++; // skip delimiter
        }
        // ensure we are not out of bounds after delimiter, because we should read a character
        if (i >= n)
        {
            throw invalid_argument("Invalid compressed format: " + context);
        }

        // read the character
        char current_char = context[i];

        // append the character 'count' times
        decompressed.append(count, current_char);
        i++;
    }
    return decompressed;
}