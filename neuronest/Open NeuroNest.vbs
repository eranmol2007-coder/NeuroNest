Dim shell, fso, rootDir, backendDir, frontendDir

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the folder where this script lives
rootDir = fso.GetParentFolderName(WScript.ScriptFullName)
backendDir = rootDir & "\backend"
frontendDir = rootDir & "\frontend"

' Kill any old node processes on those ports first (optional cleanup)
shell.Run "cmd /c taskkill /F /IM node.exe >nul 2>&1", 0, True

' Start backend silently (window style 0 = completely hidden)
shell.Run "cmd /c cd /d """ & backendDir & """ && npm run dev", 0, False

' Wait 4 seconds for backend to boot
WScript.Sleep 4000

' Start frontend silently
shell.Run "cmd /c cd /d """ & frontendDir & """ && npm run dev", 0, False

' Wait 6 seconds for frontend to boot
WScript.Sleep 6000

' Open browser
shell.Run "http://localhost:5173"
