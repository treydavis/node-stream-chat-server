#A toy chat server

To run:

    npm start

The server accepts socket connections on port 9399. Commands are invoked by preceding a line with '/' followed by a command word.

The commands are:

* `/rooms` lists available chat rooms
* `/join <room>` joins or creates a room
* `/leave` leaves room
* `/pm <username>` sends a private message to a user
* `/say <message>` sends a message to the room
* `/quit`disconnect from the server

Lines without a command will be interpreted as a `/say` message.
