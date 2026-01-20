import socket
import sys

class Client:
    _PADDING_LENGTH = 12
    _PADDING_CHAR = '0'

    def __init__(self, ip: str, port: int):
        """
        Constructor that starts a connection to the server.
        """
        self._server_socket: socket.socket = None
        self._server_address = (ip, port)

        if not self._connect_to_server():
            # couldn't connect, exit the program
            sys.exit(1)

    def _connect_to_server(self) -> bool:
        """
        Helper function that starts the TCP connection.
        (Corresponds to connectToServer in C++)
        """
        try:
            # Create a TCP socket with ipv4
            self._server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        except socket.error as e:
            # couldn't create socket
            return False

        try:
            # try to connect to the server
            self._server_socket.connect(self._server_address)
            return True
        except socket.error as e:
            self._server_socket.close()
            return False

    def _send_message(self, message: str):
        """
        Send a message with the length-padding protocol.
        Exactly like send() in C++
        """
        message_bytes = message.encode('utf-8')
        message_length = len(message_bytes)

        if len(str(message_length)) > self._PADDING_LENGTH:
            raise RuntimeError(f"Too long message length, limit is {self._PADDING_LENGTH}")

        # Format the length string with padding
        message_length_str = f"{message_length:0{self._PADDING_LENGTH}d}"
        
        # concat message to be length_str + message_bytes
        full_msg_bytes = message_length_str.encode('ascii') + message_bytes

        # Send all data using socket.send
        try:
            self._server_socket.send(full_msg_bytes)
        except socket.error as e:
            raise RuntimeError(f"Couldn't send bytes")

    def _recv_message(self) -> str:
        """
        Receive a message with the length-padding protocol.
        Exactly like recv() in C++
        """
        # firstly, we want to receive the length and check that it's valid:
        length_bytes = b''
        try:
            length_bytes = self._server_socket.recv(self._PADDING_LENGTH)
        except socket.error as e:
            raise RuntimeError(f"Couldn't receive length of message: {e}")
        
        message_length = 0
        try:
            message_length = int(length_bytes.decode('ascii'))
        except ValueError:
            raise RuntimeError("Received invalid message length header.")
        # Now, receive the actual message:
        message_bytes = b''
        bytes_remaining = message_length
        while bytes_remaining > 0:
            # we keep receiving until we got all the bytes
            try:
                chunk = self._server_socket.recv(bytes_remaining)
            except socket.error as e:
                raise RuntimeError(f"Couldn't receive message bytes: {e}")
            if not chunk:
                raise RuntimeError("Connection closed while receiving message.")
            message_bytes += chunk
            bytes_remaining -= len(chunk)
        
        # Finally, decode and return the message
        return message_bytes.decode('utf-8')


    def _handle_single_command(self):
        """
        Reads input, sends it, receives response, and displays it.
        """
        command = input()
        try:
            self._send_message(command)
        except RuntimeError as ignore:
            # failed to send message
            return
        response = ""
        try:
            response = self._recv_message()
        except RuntimeError as ignore:
            # failed to receive message
            return

        # display the response
        print(response)

    def run(self):
        """
        Runs the client's command infinite loop
        """
        while True:
            # in an infinite loop, try to handle a single command
            self._handle_single_command()


if __name__ == "__main__":
    argv = sys.argv
    try:
        SERVER_IP = argv[1]
        SERVER_PORT = int(argv[2])
    except (IndexError, ValueError):
        # invalid arguments (number or type)
        sys.exit(1)
    
    client = Client(SERVER_IP, SERVER_PORT)
    client.run()