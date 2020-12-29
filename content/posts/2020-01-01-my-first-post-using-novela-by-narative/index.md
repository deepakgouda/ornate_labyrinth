---
title: My first post
author: Deepak
date: 2020-12-30
hero: ./images/hero.jpg
excerpt: Will be adding this too
---

# Sample blog on Volatility

1. Imageinfo
```bash
volatility -f Win7mem.raw imageinfo
```
2. Processes
```bash
volatility -f Win7mem.raw --profile=Win7SP1x64 pslist
volatility -f Win7mem.raw --profile=Win7SP1x64 pstree
volatility -f Win7mem.raw --profile=Win7SP1x64 psxview
```
3. CMD
```bash
volatility -f Win7mem.raw --profile=Win7SP1x64 cmdscan
volatility -f Win7mem.raw --profile=Win7SP1x64 consoles
volatility -f Win7mem.raw --profile=Win7SP1x64 cmdline
```
4. Clipboard
```bash
volatility -f Win7mem.raw --profile=Win7SP1x64 clipboard
```
5. Dumps
	1. Process executable
	2. Process addressable memory
```bash
volatility -f Win7mem.raw --profile=Win7SP1x64 procdump -p 1976 --dump-dir ./dumps
volatility -f Win7mem.raw --profile=Win7SP1x64 memdump -p 1976 --dump-dir ./dumps
```
Next, do a `strings` + `grep` for the required keyword on the `.dmp` files.
6. Dump files
```bash
volatility -f Win7mem.raw --profile=Win7SP1x64 dumpfiles -D dumps -r evt$ -i -S dumps/summary.txt # -r flag is regex, evt$ for files ending with evt
```

### Links 
1. [Official Doc](https://github.com/volatilityfoundation/volatility/wiki/Command-Reference) 
2. [Cheatsheet](https://digital-forensics.sans.org/media/volatility-memory-forensics-cheat-sheet.pdf)
3. [Source1](https://medium.com/@zemelusa/first-steps-to-volatile-memory-analysis-dcbd4d2d56a1)
4. [DEFCON DFIR](https://medium.com/@melanijan93/write-up-memory-forensics-in-the-def-con-dfir-ctf-c2b50ed62c6b)
5. [Heap inspection](https://reverseengineering.stackexchange.com/questions/16176/volatility-manually-inspect-heap-of-a-process) of a process
6. [ BSidesDelhi 2020](https://ctftime.org/writeup/24113)