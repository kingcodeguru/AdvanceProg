#ifndef RLECOMPRESSOR_H
#define RLECOMPRESSOR_H

#include "IStringCompressor.h"
#include <cctype>
#include <stdexcept>

using namespace std;

class RLECompressor : public IStringCompressor {
private:
    const char DELIMITER = '|';
    
public:
    /**
     * @brief gets a string and returns its RLE compressed version
     * 
     * @param text the string to compress
     * @return the compressed string
     */
    string compress(string text) noexcept override;
    
    /**
     * @brief gets a RLE compressed string and returns its decompressed version
     * 
     * @param context the compressed string
     * @throws invalid_argument if the compressed string is malformed
     * @return the decompressed string
     */
    string decompress(string context) override;
};




#endif
