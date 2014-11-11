var util = require('util');
var Transform = require('stream').Transform;
util.inherits(LineParseStream, Transform);

function LineParseStream() {
    if (!(this instanceof LineParseStream))
	return new LineParseStream();

    Transform.call(this, {decodeStrings: false});
    this._buffer = '';
}

LineParseStream.prototype._transform = function(chunk, encoding, done) {
    this._buffer += chunk;
    var lines = this._buffer.split(/\r?\n/);
    this._buffer = lines.pop();

    for (var l=0; l<lines.length; l++)
	this.push(lines[l]);

    done();
};

module.exports = LineParseStream;
