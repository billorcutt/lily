// the patch
SinOsc s1 => JCRev r1 => dac;
.2 => s1.gain;
.2 => r1.mix;

SinOsc s2 => JCRev r2 => dac;
.2 => s2.gain;
.2 => r2.mix;

SinOsc s3 => JCRev r3 => dac;
.2 => s3.gain;
.2 => r3.mix;

SinOsc s4 => JCRev r4 => dac;
.2 => s4.gain;
.2 => r4.mix;

SinOsc s5 => JCRev r5 => dac;
.2 => s5.gain;
.2 => r5.mix;

SinOsc s6 => JCRev r6 => dac;
.2 => s6.gain;
.2 => r6.mix;

SinOsc s7 => JCRev r7 => dac;
.2 => s7.gain;
.2 => r7.mix;

SinOsc s8 => JCRev r8 => dac;
.2 => s8.gain;
.2 => r8.mix;

SinOsc s9 => JCRev r9 => dac;
.2 => s9.gain;
.2 => r9.mix;

SinOsc s10 => JCRev r10 => dac;
.2 => s10.gain;
.2 => r10.mix;

// create our OSC receiver
OscRecv recv;
// use port 6449 (or whatever)
6449 => recv.port;
// start listening (launch thread)
recv.listen();

// create an address in the receiver, store in new variable
recv.event( "/circle/notes, i i f" ) @=> OscEvent oe;

// infinite event loop
while( true )
{
    // wait for event to arrive
    oe => now;

    // grab the next message from the queue. 
    while( oe.nextMsg() )
    { 
		int id;
        int i;
        float f;

        // getFloat fetches the expected float (as indicated by "i f")
		oe.getInt() => id;
		
		if(id==1) {
	        oe.getInt() => i => Std.mtof => s1.freq;
	        oe.getFloat() => f => s1.gain;
		} else if(id==2) {
	        oe.getInt() => i => Std.mtof => s2.freq;
	        oe.getFloat() => f => s2.gain;	
		} else if(id==3) {
	        oe.getInt() => i => Std.mtof => s3.freq;
	        oe.getFloat() => f => s3.gain;
		} else if(id==4) {
	        oe.getInt() => i => Std.mtof => s4.freq;
	        oe.getFloat() => f => s4.gain;
		} else if(id==5) {
	        oe.getInt() => i => Std.mtof => s5.freq;
	        oe.getFloat() => f => s5.gain;
		} else if(id==6) {
	        oe.getInt() => i => Std.mtof => s6.freq;
	        oe.getFloat() => f => s6.gain;
		} else if(id==7) {
	        oe.getInt() => i => Std.mtof => s7.freq;
	        oe.getFloat() => f => s7.gain;
		} else if(id==8) {
	        oe.getInt() => i => Std.mtof => s8.freq;
	        oe.getFloat() => f => s8.gain;
		} else if(id==9) {
	        oe.getInt() => i => Std.mtof => s9.freq;
	        oe.getFloat() => f => s9.gain;
		} else if(id==10) {
	        oe.getInt() => i => Std.mtof => s10.freq;
	        oe.getFloat() => f => s10.gain;
		}
		
        // print
        //<<< "got (via OSC):", id, i, f >>>;
    }
}
