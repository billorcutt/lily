//adaped from http://www.turnstyle.com/baudio/ - scott@turnstyle.com.
//Licensed under the Creative Commons License- http://creativecommons.org/licenses/by-nd-nc/1.0/

var Channels = 1; //2=stereo, 1=mono
var SampleRate = 11025; //in Hz 44100 22050 11025
var BitDepth = 8; //16 8

function chr(num) {
	return String.fromCharCode(num);
}

function strlen(str) {
	return parseInt(str.length);
}

function fourBytes(decval) {
	var fourBytesTemp = chr(decval & (255));
	fourBytesTemp += chr((decval & (255*256))/256);
	fourBytesTemp += chr((decval & (255*256*256))/(256*256));
	fourBytesTemp += chr((decval & (255*256*256*256))/(256*256*256));
	return fourBytesTemp;
}

function makeHeader(data) {
	var WAVheader = "RIFF";
	WAVheader += fourBytes(strlen(data) + 36);
	WAVheader += "WAVEfmt ";
	WAVheader += chr(16) + chr(0) + chr(0) + chr(0);
	WAVheader += chr(1) + chr(0);
	WAVheader += chr(Channels) + chr(0);
	WAVheader += fourBytes(SampleRate);
	WAVheader += fourBytes(SampleRate * (BitDepth / 8) * Channels);
	WAVheader += chr((BitDepth / 8) * Channels) + chr(0);
	WAVheader += chr(BitDepth) + chr(0);
	WAVheader += "data";
	WAVheader += fourBytes(strlen(data));
	return WAVheader;
}

function makeFileBin(data) {
	var tmp = window.atob(data);
	return (makeHeader(tmp) + tmp);
}

function makeFileTxt(data) {
	return (makeHeader(data) + data);
}