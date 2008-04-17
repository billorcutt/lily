@ECHO OFF

FOR /F "tokens=1,2,4" %%I IN ('NETSTAT -ano ') DO (
	IF /I %%I EQU UDP (
		IF /I %%J EQU 0.0.0.0:%1 (
			TASKKILL /F /PID %%K
		)
	)
)