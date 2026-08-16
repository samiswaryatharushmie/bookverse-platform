@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script for Windows
@REM ----------------------------------------------------------------------------

@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar
set MAVEN_WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties

@REM Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

for %%i in (java.exe) do set "JAVACMD=%%~$PATH:i"
if not "%JAVACMD%"=="" goto execute

echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
exit /b 1

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVACMD=%JAVA_HOME%\bin\java.exe

if exist "%JAVACMD%" goto execute

echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
exit /b 1

:execute
@REM Read distributionUrl from maven-wrapper.properties
for /f "usebackq tokens=1,2 delims==" %%a in ("%MAVEN_WRAPPER_PROPERTIES%") do (
    if "%%a"=="distributionUrl" set DOWNLOAD_URL=%%b
)

set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.9
set MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd

@REM Download Maven if not present
if not exist "%MAVEN_CMD%" (
    echo Downloading Maven distribution...
    mkdir "%MAVEN_HOME%" 2>nul

    @REM Try PowerShell download
    powershell -Command "& { $ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%MAVEN_HOME%\maven.zip' }"
    if errorlevel 1 (
        echo ERROR: Failed to download Maven distribution.
        exit /b 1
    )

    @REM Extract
    powershell -Command "& { Expand-Archive -Path '%MAVEN_HOME%\maven.zip' -DestinationPath '%MAVEN_HOME%\tmp' -Force }"

    @REM Move contents up
    for /d %%d in ("%MAVEN_HOME%\tmp\apache-maven-*") do (
        xcopy /s /e /y "%%d\*" "%MAVEN_HOME%\" >nul
    )
    rmdir /s /q "%MAVEN_HOME%\tmp" 2>nul
    del "%MAVEN_HOME%\maven.zip" 2>nul

    echo Maven downloaded successfully.
)

@REM Find classworlds jar
for %%i in ("%MAVEN_HOME%\boot\plexus-classworlds-*.jar") do set CLASSWORLDS_JAR=%%i

@REM Execute Maven
"%JAVACMD%" %MAVEN_OPTS% -classpath "%CLASSWORLDS_JAR%" "-Dclassworlds.conf=%MAVEN_HOME%\bin\m2.conf" "-Dmaven.home=%MAVEN_HOME%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR:~0,-1%" org.codehaus.plexus.classworlds.launcher.Launcher %*

exit /b %ERRORLEVEL%
