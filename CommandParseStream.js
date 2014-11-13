var util = require('util');
var Transform = require('stream').Transform;
var StringDecoder = require('string_decoder').StringDecoder;
util.inherits(CommandParseStream, Transform);

var DEFAULT_COMMAND = 'say';

function CommandParseStream() {
    if (!(this instanceof CommandParseStream))
	return new CommandParseStream();

    //decodeStrings has no effect here; bug in node.js #5580
    Transform.call(this, {decodeStrings: false});
    this._writableState.objectMode = false;
    this._readableState.objectMode = true;
    this._commandPattern = new RegExp(/^\/(\w+)\s?(.*)?$/);
    this._decoder = new StringDecoder('utf8');
}

CommandParseStream.prototype._transform = function(line, encoding, done) {
    var command = DEFAULT_COMMAND;
    var payload = this._decoder.write(line); //bug in node.js #5580
    var commandPatternMatches = payload.match(this._commandPattern);
    if (commandPatternMatches) {
	command = commandPatternMatches[1];
	payload = commandPatternMatches[2];
    }
    this.push({command: command, payload: payload});
    done();
};

module.exports = CommandParseStream;
