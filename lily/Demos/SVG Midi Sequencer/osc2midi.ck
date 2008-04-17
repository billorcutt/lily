/*

*/

0 => int midiout;

"localhost" => string host;
6449 => int receiveport;
OscRecv recv; 
receiveport => recv.port; recv.listen();

recv.event("/circle/notes, iii") @=> OscEvent oe;

int x,y,state;
MidiOut mout;
MidiMsg msg; 


fun void button_receiver(OscEvent msg){
	oe.getInt() => x;	
	oe.getInt() => y;
	oe.getInt() => state;
	midi_send(0x90,x,y);
	//controller(74,state,1);							
}

fun void midi_send(int channel, int data1, int data2){
	//<<< "midi-send" ,channel, data1, data2 >>>;
	channel => msg.data1; 
	data1 => msg.data2; 		
	data2 => msg.data3; 
	mout.send( msg );	
}

fun void controller(int controllernum, int value, int channel)
{
	send_3bytes(0xb, channel, controllernum, value);
}

fun void send_3bytes(int command, int channel, int byte1, int byte2)
{

	//<<< "controller-send" ,channel, byte1, byte2 >>>;
	((command & 0xf) << 4) | ((channel - 1) & 0xf) => msg.data1;
	command | channel => command;
	byte1 & 0x7f  => msg.data2;
	byte2 & 0x7f => msg.data3;
	mout.send(msg);

}

if(!mout.open(midiout)) me.exit(); 
		
while (true) {

	while ( oe.nextMsg() != 0 ){
		button_receiver(oe);
	}	

	1::ms => now;
}
