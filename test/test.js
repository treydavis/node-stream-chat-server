var assert = require('assert');
var net = require('net');
var utf8Decoder = new (require('string_decoder')).StringDecoder('utf8');
var PORT = 9399;

describe('LineParseStream', function() {
  var server;
  var serverSocket;
  var clientSocket;
  
  beforeEach(function(done) {
    server = net.createServer(function(socket) {
      socket.setEncoding('utf8');
      serverSocket = socket;
      done();
    });
    server.listen(PORT, function() {
      clientSocket = new net.Socket();
      clientSocket.connect(PORT);
    });
  });
  afterEach(function(done) {
    clientSocket.end();
    server.close(function() {
      done();
    });
  });
  
  it('should emit on full lines, not partials', function(done){
    var LineParseStream = require('../LineParseStream.js');
    var lineParseStream = new LineParseStream();
    var testLine = 'a test line';
    
    serverSocket.pipe(lineParseStream);
    clientSocket.write(testLine + '\npartial line');

    lineParseStream.on('data', function(line) {
      assert.equal(testLine, utf8Decoder.write(line));
      done();
    });
  });
});

describe('LoginServer', function() {
  var server;
  var serverSocket;
  var clientSocket;
  
  beforeEach(function(done) {
    server = net.createServer(function(socket) {
      socket.setEncoding('utf8');
      serverSocket = socket;
      done();
    });
    server.listen(PORT, function() {
      clientSocket = new net.Socket();
      clientSocket.connect(PORT);
    });
  });
  afterEach(function(done) {
    clientSocket.end();
    server.close(function() {
      done();
    });
  });
  
  it('should login a user', function(done){
    var LoginServer = require('../LoginServer.js');
    var User = require('../User.js');
    
    var testName = 'bobby';
    var users = {};
    var user = new User(serverSocket);
    var loginServer = new LoginServer(user, users);
    
    serverSocket.pipe(loginServer);
    clientSocket.write(testName);

    loginServer.on('login', function() {
      assert(users[testName]);
      assert.equal(users[testName].socket, serverSocket);
      done();
    });
  });
});

describe('CommandParseStream', function() {
  var server;
  var serverSocket;
  var clientSocket;
  
  beforeEach(function(done) {
    server = net.createServer(function(socket) {
      socket.setEncoding('utf8');
      serverSocket = socket;
      done();
    });
    server.listen(PORT, function() {
      clientSocket = new net.Socket();
      clientSocket.connect(PORT);
    });
  });
  afterEach(function(done) {
    clientSocket.end();
    server.close(function() {
      done();
    });
  });
  
  it('should emit commands with message', function(done){
    var CommandParseStream = require('../CommandParseStream.js');
    var commandParseStream = new CommandParseStream();
    
    serverSocket.pipe(commandParseStream);
    var commandName = 'commandname';
    var commandPayload = 'some message would go here';
    clientSocket.write('/' + commandName + ' ' + commandPayload);

    commandParseStream.on('data', function(command) {
      assert.equal(command.command, commandName);
      assert.equal(command.payload, commandPayload);
      done();
    });
  });

  it('should default to /say command', function(done){
    var CommandParseStream = require('../CommandParseStream.js');
    var commandParseStream = new CommandParseStream();
    
    serverSocket.pipe(commandParseStream);
    var commandPayload = 'some message would go here';
    clientSocket.write(commandPayload);

    commandParseStream.on('data', function(command) {
      assert.equal(command.command, 'say');
      assert.equal(command.payload, commandPayload);
      done();
    });
  });
});

describe('ChatServer', function() {
  function TestUser() {
  };
  TestUser.prototype.sendLine = function(line) {
  };
  TestUser.prototype.sendEnd = function(line) {
  };
  
  it('should create a room with /join command', function(done){
    var ChatServer = require('../ChatServer.js');
    
    var user = new TestUser();
    var users = {
      'bobby': user
    };
    var rooms = {};
    var testRoomName = 'aroomwithaview';
    var chatServer = new ChatServer(user, users, rooms);
    chatServer.emit('join', testRoomName);
    assert(rooms[testRoomName]);
    assert.equal(rooms[testRoomName][0], user);
    done();
  });

  it('should leave a room with /leave command', function(done){
    var ChatServer = require('../ChatServer.js');
    
    var jeff = new TestUser();
    var steve = new TestUser();
    var users = {
      'jeff': jeff,
      'steve': steve
    };
    var rooms = {};
    var testRoomName = 'aroomwithaview';
    var jeffChatServer = new ChatServer(jeff, users, rooms);
    jeffChatServer.emit('join', testRoomName);
    var steveChatServer = new ChatServer(steve, users, rooms);
    steveChatServer.emit('join', testRoomName);
    jeffChatServer.emit('leave');
    
    assert(rooms[testRoomName]);
    assert(rooms[testRoomName].length === 1);
    assert.equal(rooms[testRoomName][0], steve);
    done();
  });

  it('should remove user on /quit command', function(done){
    var ChatServer = require('../ChatServer.js');
    
    var user = new TestUser();
    user.name = 'bobby';
    var users = {
      'bobby': user
    };
    var rooms = {};
    var chatServer = new ChatServer(user, users, rooms);
    chatServer.emit('quit');
    assert(users['bobby'] === undefined);
    done();
  });

  it('should send message to room with /say', function(done){
    var ChatServer = require('../ChatServer.js');
    
    var jeff = new TestUser();
    var steve = new TestUser();
    var outsider = new TestUser();
    var users = {
      'jeff': jeff,
      'steve': steve,
      'outsider': outsider
    };
    var rooms = {};
    var testRoomName = 'aroomwithaview';
    var jeffChatServer = new ChatServer(jeff, users, rooms);
    jeffChatServer.emit('join', testRoomName);
    var steveChatServer = new ChatServer(steve, users, rooms);
    steveChatServer.emit('join', testRoomName);

    outsider.sendLine = function() {
      done('outsider got message!');
    };
    steve.sendLine = function() {
      done();
    };

    jeffChatServer.emit('say', 'hi steve');
  });

  it('should send private message with /pm', function(done){
    var ChatServer = require('../ChatServer.js');
    
    var jeff = new TestUser();
    var steve = new TestUser();
    var outsider = new TestUser();
    var users = {
      'jeff': jeff,
      'steve': steve,
      'outsider': outsider
    };
    var rooms = {};
    var testPrivateMessage = 'i love you';
    var jeffChatServer = new ChatServer(jeff, users, rooms);

    outsider.sendLine = function() {
      done('outsider got message!');
    };
    steve.sendLine = function(message) {
      assert(message.indexOf(testPrivateMessage) !== -1);
      done();
    };

    jeffChatServer.emit('pm', 'steve ' + testPrivateMessage);
  });
});

