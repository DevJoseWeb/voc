var rewire = require('rewire');
var chai   = require('chai');
var expect = chai.expect;

// setup promise
chai.use(require('chai-as-promised'));

var voicetube = rewire('../src/dic/voicetube');
describe('dic.voicetube', function() {

  before(function () {
    // mock console.log
    voicetube.__set__({
      console: {
        log: function () {}
      }
    });
  });

  it('Hello', function () {
    this.timeout(10000);
    var word = 'Hello';
    return expect(voicetube(word)).to.eventually.equal(
      'https://tw.voicetube.com/player/hello.mp3'
    );
  });

  it('test', function () {
    this.timeout(10000);
    var word = 'test';
    return expect(voicetube(word)).to.eventually.equal(
      'https://tw.voicetube.com/player/test.mp3'
    );
  });

  it('askdjalksjdl', function () {
    this.timeout(10000);
    var word = 'askdjalksjdl';
    return expect(voicetube(word)).to.eventually.be.rejected;
  });

  it('(null)', function () {
    var word = null;
    return expect(voicetube(word)).to.eventually.be.rejectedWith(TypeError);
  });

  it('123 (number)', function () {
    var word = 123;
    return expect(voicetube(word)).to.eventually.be.rejectedWith(TypeError);
  });

  it('123 (string)', function () {
    this.timeout(10000);
    var word = '123';
    return expect(voicetube(word)).to.eventually.be.rejected;
  });

  it('(Empty String)', function () {
    var word = '';
    return expect(voicetube(word)).to.eventually.be.rejectedWith(TypeError);
  });

});