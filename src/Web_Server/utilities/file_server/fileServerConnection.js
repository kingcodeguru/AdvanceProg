const net = require('net');

const FS_PORT = process.env.FS_PORT || 2385;    // we set the port of file server to 2385
const FS_IP = process.env.FS_IP || 'localhost'; // file_server for docker
const LEN_SIZE = process.env.LEN_SIZE || 12;   // length of length of message

// avoid "magic numbers" inside the code.
const CONFIG = {
    TCP_HOST: FS_IP,
    TCP_PORT: FS_PORT,
    LEN_SIZE: LEN_SIZE,    // Protocol 12 bytes for message length header
    ENCODING: 'utf8',
    PAD_CHAR: '0',
    DECIMAL_BASE: 10, // Base 10 for parseInt
    
    STATUS_CODE_LEN: 3,
    PROTOCOL_DELIMITER: '\n\n', // Separator between status and data (for GET/SEARCH)
    
    // Server Status Codes
    STATUS_OK: 200,          // Response for GET/SEARCH
    STATUS_CREATED: 201,     // Response for POST
    STATUS_NO_CONTENT: 204,  // Response for DELETE/PATCH
    STATUS_NOT_FOUND: 404,
    STATUS_BAD_REQUEST: 400,
    STATUS_ERROR: 500,

    // Command Types
    CMD_GET: 'GET',
    CMD_POST: 'POST',
    CMD_DELETE: 'DELETE',
    CMD_SEARCH: 'SEARCH',
};

/**
 * A simple wrapper class for the server response.
 * Holds the status code and the string data.
 */
class Response {
    constructor(status_code, data) {
        this.status_code = status_code;
        this.data = data;
    }
}

/**
 * Singleton class to manage the TCP connection to the C++ server.
 */
class FileManagerConnection {
    constructor() {
        this.socket = new net.Socket();
        this.isConnected = false;
    }

    /**
     * Sends a POST command.
     */
    async post(fid, content) {
        return await this._executeRequest(`POST ${fid} ${content}`, CONFIG.CMD_POST);
    }

    /**
     * Sends a GET command.
     */
    async get(fid) { 
        return await this._executeRequest(`GET ${fid}`, CONFIG.CMD_GET);
    }

    /**
     * Sends a DELETE command.
     */
    async delete(fid) { 
        return await this._executeRequest(`DELETE ${fid}`, CONFIG.CMD_DELETE);
    }
/**
    
     
    async search(query) {
        return await this._executeRequest(`SEARCH ${query}`, CONFIG.CMD_SEARCH);
    }
    */


    /**
     * Sends a DELETE + POST command (Update file).
     */
    async patch(fid, content) {
        const response1 = await this._executeRequest(`DELETE ${fid}`, CONFIG.CMD_DELETE);
        const response2 = await this._executeRequest(`POST ${fid} ${content}`, CONFIG.CMD_POST);
        if (response1.status_code === CONFIG.STATUS_NO_CONTENT && response2.status_code === CONFIG.STATUS_CREATED) {
            return new Response(CONFIG.STATUS_NO_CONTENT, "");
        } else if (response1.status_code === CONFIG.STATUS_NOT_FOUND || response2.status_code === CONFIG.STATUS_NOT_FOUND) {
            return new Response(CONFIG.STATUS_NOT_FOUND, "");
        } else if (response1.status_code === CONFIG.STATUS_BAD_REQUEST || response2.status_code === CONFIG.STATUS_BAD_REQUEST) {
            return new Response(CONFIG.STATUS_BAD_REQUEST, "");
        } else {
            return new Response(CONFIG.STATUS_ERROR, "");
        }
    }


    /**
     * The logic for the request response cycle:
     * 1. Connects to server.
     * 2. Sends the command.
     * 3. Receives and parses the response.
     * * @param {string} commandString - The full string to send to the server.
     * @param {string} commandType - The type of command for parsing.
     */
    async _executeRequest(commandString, commandType) {
        try {
            // Ensure connection is open
            await this._connect();
            
            // Send the command to the C++ server
            await this._send(commandString);
            
            // Wait for the raw response string
            const rawResponse = await this._recv();

            // Validation: Response must be at least 3 characters (for the status code)
            if (!rawResponse || rawResponse.length < CONFIG.STATUS_CODE_LEN) {
                return new Response(CONFIG.STATUS_ERROR, "");
            }

            // Extract the status code (first 3 chars)
            const statusCodeStr = rawResponse.substring(0, CONFIG.STATUS_CODE_LEN);
            const statusCode = parseInt(statusCodeStr, CONFIG.DECIMAL_BASE); // Convert to integer, base 10

            var data = ""; // Default data is empty (for POST, DELETE, errors)

            // Parse data ONLY for GET or SEARCH when status is 200.
            // According to Ex2, these responses use "\n\n" to separate status from content.
            if (statusCode === CONFIG.STATUS_OK && 
               (commandType === CONFIG.CMD_GET || commandType === CONFIG.CMD_SEARCH)) {
                
                const separatorIndex = rawResponse.indexOf(CONFIG.PROTOCOL_DELIMITER);
                
                // If the separator exists, take everything after it as data
                if (separatorIndex !== -1) {
                    data = rawResponse.substring(separatorIndex + CONFIG.PROTOCOL_DELIMITER.length).trim();
                }
            }

            // Safety check: if code is not a number, return error
            if (isNaN(statusCode)) {
                return new Response(CONFIG.STATUS_ERROR, "");
            }
            
            return new Response(statusCode, data);

        } catch (connectionError) {
            this.isConnected = false;
            // On connection failure, return 500 status and empty data
            return new Response(CONFIG.STATUS_ERROR, ""); 
        }
    }

    /**
     * Creates the TCP connection if not already connected.
     * Returns a Promise that resolves when connected.
     */
    _connect() {
        return new Promise((resolve, reject) => {
            if (this.isConnected) return resolve(); // Already connected

            // Create connection
            this.socket.connect(CONFIG.TCP_PORT, CONFIG.TCP_HOST, () => {
                this.isConnected = true;
                resolve();
            });
            
            // Handle connection errors
            this.socket.on('error', (err) => {
                this.isConnected = false;
                reject(err);
            });
        });
    }

    /**
     * Wraps the message with the length protocol and sends it.
     * The C++ server expects the first 12 bytes to be the message length.
     */
    _send(message) {
        return new Promise((resolve, reject) => {
            const msgBuf = Buffer.from(message, CONFIG.ENCODING);
            // Create a 12 byte header with the length, padded with zeros
            const header = msgBuf.length.toString().padStart(CONFIG.LEN_SIZE, CONFIG.PAD_CHAR);
            
            // Send header first, then the actual message
            this.socket.write(Buffer.from(header, CONFIG.ENCODING));
            this.socket.write(msgBuf, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Reads data from the socket.
     * Handles packet fragmentation by waiting for the full length.
     */
    _recv() {
        return new Promise((resolve, reject) => {
            let expectedLen = -1;
            let buffer = Buffer.alloc(0);

            // Listener for incoming data chunks
            const onData = (chunk) => {
                buffer = Buffer.concat([buffer, chunk]);

                // Read the header (first 12 bytes) to know message size
                if (expectedLen === -1 && buffer.length >= CONFIG.LEN_SIZE) {
                    const header = buffer.toString(CONFIG.ENCODING, 0, CONFIG.LEN_SIZE);
                    expectedLen = parseInt(header, CONFIG.DECIMAL_BASE); // Base 10 for parseInt
                    
                    // Remove header from buffer to keep only the body
                    buffer = buffer.subarray(CONFIG.LEN_SIZE);
                }

                // Check if we have received the full message body
                if (expectedLen !== -1 && buffer.length >= expectedLen) {
                    const result = buffer.subarray(0, expectedLen).toString(CONFIG.ENCODING);
                    
                    // Cleanup listener to avoid memory leaks or duplicate calls
                    this.socket.removeListener('data', onData);
                    resolve(result);
                }
            };

            this.socket.on('data', onData);
            
            // Handle errors during receive
            this.socket.once('error', (err) => {
                this.socket.removeListener('data', onData);
                reject(err);
            });
        });
    }
}

// Create a single instance (Singleton pattern)
module.exports = new FileManagerConnection();