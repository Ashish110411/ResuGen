@echo off
setlocal
title ResuGen Local Services
echo =======================================================
echo   Starting ResuGen Local Services
echo =======================================================
node "%~dp0start.js" %*
