I competed in UMDCTF for the first time this year. Besides the interesting (and fun) theming, this was a great ctf with a lot of interesting challenges. Here, I am going to write up one particularly interesting challenge _cmsc351_, which let me get some practice with my new [binary ninja](https://binary.ninja/) license.

# cmsc351
![alt text](images/cmsc351.jpg)

In this challenge we are given a stripped binary:
```bash
ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=aa38ce7cf77d92eeebb80e23bf34c8f20bc8d4cb, for GNU/Linux 4.4.0, stripped
```
and running it provides no output. 

Immediately, I open the challenge in binary ninja and look for the main function:
```c
fgets(&buf, 25, stdin);
int32_t result;

if (!sub_4079f0(0x11d, 0xc7, &buf))
{
    puts("sorry, looks like you shouldn't …");
    result = 0;
}
else
{
    FILE* fp = fopen("flag.txt", u"r…");
    
    if (!fp)
    {
        puts("Flag file not found. If you're s…");
        result = -1;
    }
    else
    {
        char buf_1[0x38];
        fgets(&buf_1, 0x32, fp);
        printf("%s", &buf_1);
        result = 0;
    }
}
```
we see that this binary takes a 25 character input, runs some check ```sub_4079f0``` and prints the flag if the check returns any non-zero value.

Now I can see that the binary is waiting for some input before printing out success or failure, so interacting with the binary looks like this:
```bash
$ ./cmsc351
aaaaaaaaaaaaaaaaaaaaaaaaa
sorry, looks like you shouldn't have fallen asleep in lecture.
```
Ok, so the challenge is in the checker function ```sub_4079f0```, taking a look in this function we see the following: 
```c
int64_t sub_4079f0(int64_t arg1, int32_t arg2, char *input_string) {
    char rax_5 = *(uint8_t*)input_string;

    if (rax_5 == 's') //binja display output switched to char
        /* tailcall */
        return sub_4079b0((uint64_t)(arg2 - 3), 
            arg2 - 6, &input_string[1]);

    if (rax_5 == 't') //display switched to char
        /* tailcall */
        return sub_4052b0((uint64_t)(arg2 - 2), 
            arg2 - 4, &input_string[1]);

    return 0;
}
```
It looks like this function checks if the first character of our input is an 's' or 't'. Depending on which letter we give in our input it will choose one of two paths to continue checking our input. If our input is anything other than an 's' or 't' then it immediately returns 0. Similarly, both functions ```sub_4079b0``` and ```sub_4052b0``` have the same structure, checking for 's' or 't', choosing a path, then moving on to the next byte of our input. This structure is then repeated for each subsequent function call.

My first thought is to just follow the 's' path 25 calls through and see what it returns (presumably 0). However, you never reach 25 function calls as there is an infinite loop of function calls. This will eventually return 0 as the input will be checked until reaching a null byte which will return 0. 

Now there are two ways to solve this challenge.
1. **brute force**:  
    I can write a c script to guess all 2^25 strings of 's' and 't' until it finds one string that works. Doing this is probably not the fastest or best way to approach this problem, but it will let me move on to another challenge while my script does it's work.

2. **rev**:  
    I try to find a function that returns a number other than 0 and extract the function call graph with binary ninja.

I chose to brute force during the ctf, but I came back to this challenge after the ctf was over to try the more sophisticated approach.

## brute force
First I wrote all of the possible input strings to a file using c:
```c
#define LENGTH (25)
void generateCombinations(char *str) {
    FILE *fp = fopen("strings.txt", "w");
    if (fp == NULL) {
        perror("Failed to open file");
        return;
    }

    unsigned long long totalCombinations = 1ULL << LENGTH;
    for (unsigned long long i = 0; i < totalCombinations; i++) {
        for (int j = 0; j < LENGTH; j++) {
            str[j] = (i & (1ULL << j)) ? 't' : 's';
        }
        str[LENGTH] = '\0';
        fprintf(fp, "%s\n", str);
    }

    fclose(fp);
}
```
This runs in only a few seconds when compiled with optimization. Now I can run all of these strings through the binary provided and see which one prints out my fake flag file. 
```c
void checkStrings(const char *expectedResult) {
    //expectedResult passed as: "sorry, looks like you shouldn't have fallen asleep in lecture." as this is what is printed when the string fails
    FILE *fp = fopen("strings.txt", "r");
    if (fp == NULL) {
        perror("Failed to open strings.txt");
        return;
    }
    char str[BUFFER_SIZE];
    char command[BUFFER_SIZE];
    char result[BUFFER_SIZE];
    while (fgets(str, BUFFER_SIZE, fp)) {
        str[strcspn(str, "\n")] = '\0';
        snprintf(command, sizeof(command), "echo %s | ./cmsc351", str);
        FILE *pipe = popen(command, "r");
        if (pipe == NULL) {
            perror("Failed to run cmsc351");
            fclose(fp);
            return;
        }
        if (fgets(result, BUFFER_SIZE, pipe)) {
            result[strcspn(result, "\n")] = '\0';
            if (strcmp(result, expectedResult) != 0) {
                printf("Solution found: %s  %s\n", str, result);
                fflush(stdout);
            }
        }

        pclose(pipe);
    }
    fclose(fp);
}
```
There are multiple valid solutions, but the first one my script finds is "ttsstsssstssstttsssssssss", and we retrieve the flag: 
UMDCTF{C4ll_Gr4ph5_ar3_st1ll_gr4ph5}.

This brute actually took significantly less time than I was expecting, taking only a little over two minutes to find a solution.

## rev
The flag suggests that they wanted me to use the call graph, so I came back to this challenge the Monday after UMDCTF was over to try solving it this way. 

The idea is that if I can find the function that returns non-zero values, I can then use some graph search algorithm (DFS or BFS) to find a call chain that will result in a correct solution.

To start, I just went to the first function with the _sub_ prefix in binary ninja and conviently this function returns non-zero values. 
```c
int64_t result;
result = arg1 + arg2 <= 0;
return result;
```
When I look at the cross references in binja, however, I do not see any calls for this function so I needed to look for another function. Based on this function, I think it may be a safe guess that whichever funciton we are looking for includes "return result" so using the search function in binja with type 'Text (Pseudo C)' I searched for all functions with the text "return result". This search returned two other functions: ```sub_40cfb0``` and ```sub_40e5a0```.

The first function:
```c
int64_t sub_4079f0(int64_t arg1, int32_t arg2, char *input_string) {
    char rax_6 = *(uint8_t*)input_string;

    if (rax_6 == 0x73)
        /* tailcall */
        return sub_40bec0((uint64_t)(arg2 - 2), arg2 - 6, &input_string[1]);

    if (rax_6 != 0x74)
        return 0;

    char rcx = input_string[1];

    if (rcx == 0x73)
        /* tailcall */
        return sub_407e40((uint64_t)(arg2 - 0xf), arg2 - 0x1e, 
            &input_string[2]);

    if (rcx != 0x74)
        return 0;

    int32_t result;
    result = arg2 * 2 - 0x37 <= 0;
    return result;
}
```
checks two characters, and if both of them are 't' it will return 
```c
arg2*2-0x37<=0
```
Looking back at these function calls:
```c
int64_t sub_4079f0(int64_t arg1, int32_t arg2, char *input_string) {
    char rax_5 = *(uint8_t*)input_string;

    if (rax_5 == 's') //binja display output switched to char
        /* tailcall */
        return sub_4079b0((uint64_t)(arg2 - 3), 
            arg2 - 6, &input_string[1]);

    if (rax_5 == 't') //display switched to char
        /* tailcall */
        return sub_4052b0((uint64_t)(arg2 - 2), 
            arg2 - 4, &input_string[1]);

    return 0;
}
```
I can see that arg2 is some integer that gets passed through each call layer, reduced by some hard-coded value each time, and it is hard-coded in the first function call in ```main``` as ```0xc7```

Given each function call reduces the value of arg2, we are probably looking for the latest this function can be called. This means we can approach this like a DFS (depth first search) on the function call graph, looking for the greatest depth (from ```main```) that this function can be called.

Given this function, we know that the last two characters of our input will be 'tt' so I will start building the input backwards from here
```bash
tt
```
Then I will just continue to follow the call graph manually by checking the cross references in binja. 

```sub_40cfb0``` is only called in ```sub_407dc0``` with character t.
```bash
ttt
```
```sub_407dc0``` is only called in ```sub_407e00``` with character s
```bash
ttts
```
```sub_407e00``` is called multiple times, so now we will want to start an actual DFS as to not do this all manually. 

Luckily, this is pretty easy in the binary ninja python terminal (am I glazing binja too much?). I can build a call graph by extracting all of the calls and tail calls in each function using the following python script:
```python
from binaryninja import *
call_graph = {}
for func in bv.functions:
 	callees = []
 	if func.mlil == None:
 		continue
 	for block in func.mlil:
 		for instr in block:
 			if instr.operation in {MediumLevelILOperation.MLIL_CALL, MediumLevelILOperation.MLIL_TAILCALL}:
 				target = instr.dest
 				if target.operation == MediumLevelILOperation.MLIL_CONST_PTR:
 					called_func = bv.get_function_at(target.constant)
 					if called_func:
 						callees.append(called_func)
 	call_graph[func] = callees
```
Now that I have a call_graph built, I can write a standard dfs:
```python
def dfs(call_graph, start_func, target_func, path=None, visited=None):
    if path is None:
        path = []
    if visited is None:
        visited = set()

    path.append(start_func)
    visited.add(start_func)

    if start_func == target_func:
        return path

    for callee in call_graph.get(start_func, []):
        if callee not in visited:
            result = dfs(call_graph, callee, target_func, path.copy(), visited.copy())
            if result:
                return result

    return None
```
and run it to get the path:
```
[<func: x86_64@0x401080>, <func: x86_64@0x4079f0>, <func: x86_64@0x4079b0>, <func: x86_64@0x4072f0>, <func: x86_64@0x403920>, <func: x86_64@0x40d240>, <func: x86_64@0x4093c0>, <func: x86_64@0x409380>, <func: x86_64@0x407c90>, <func: x86_64@0x405e20>, <func: x86_64@0x405200>, <func: x86_64@0x406530>, <func: x86_64@0x4064f0>, <func: x86_64@0x4064c0>, <func: x86_64@0x409000>, <func: x86_64@0x408f80>, <func: x86_64@0x408f40>, <func: x86_64@0x406b20>, <func: x86_64@0x4017f0>, <func: x86_64@0x40b510>, <func: x86_64@0x403ce0>, <func: x86_64@0x401490>, <func: x86_64@0x40f300>, <func: x86_64@0x407570>, <func: x86_64@0x4018b0>, <func: x86_64@0x401870>, <func: x86_64@0x402200>, <func: x86_64@0x402a00>, <func: x86_64@0x407830>, <func: x86_64@0x4077f0>, <func: x86_64@0x4077b0>, <func: x86_64@0x407770>, <func: x86_64@0x4076b0>, <func: x86_64@0x407670>, <func: x86_64@0x404c90>, <func: x86_64@0x401630>, <func: x86_64@0x403be0>, <func: x86_64@0x405ba0>, <func: x86_64@0x405b60>, <func: x86_64@0x405ae0>, <func: x86_64@0x405aa0>, <func: x86_64@0x405a20>, <func: x86_64@0x40a4f0>, <func: x86_64@0x402110>, <func: x86_64@0x405100>, <func: x86_64@0x4050c0>, <func: x86_64@0x4075f0>, <func: x86_64@0x4075b0>, <func: x86_64@0x402090>, <func: x86_64@0x402010>, <func: x86_64@0x401fd0>, <func: x86_64@0x404360>, <func: x86_64@0x4042e0>, <func: x86_64@0x40b110>, <func: x86_64@0x408520>, <func: x86_64@0x408e90>, <func: x86_64@0x408e50>, <func: x86_64@0x402900>, <func: x86_64@0x4028c0>, <func: x86_64@0x406730>, <func: x86_64@0x409a00>, <func: x86_64@0x405570>, <func: x86_64@0x405530>, <func: x86_64@0x4054f0>, <func: x86_64@0x40def0>, <func: x86_64@0x4058e0>, <func: x86_64@0x4058a0>, <func: x86_64@0x405860>, <func: x86_64@0x405820>, <func: x86_64@0x4057e0>, <func: x86_64@0x4057a0>, <func: x86_64@0x409580>, <func: x86_64@0x4037e0>, <func: x86_64@0x402c20>, <func: x86_64@0x4035e0>, <func: x86_64@0x408620>, <func: x86_64@0x4085e0>, <func: x86_64@0x4085a0>, <func: x86_64@0x408560>, <func: x86_64@0x402190>, <func: x86_64@0x403460>, <func: x86_64@0x403420>, <func: x86_64@0x408d10>, <func: x86_64@0x406350>, <func: x86_64@0x406310>, <func: x86_64@0x402240>, <func: x86_64@0x40f900>, <func: x86_64@0x402e60>, <func: x86_64@0x402e20>, <func: x86_64@0x402de0>, <func: x86_64@0x402da0>, <func: x86_64@0x402d60>, <func: x86_64@0x402d20>, <func: x86_64@0x409040>, <func: x86_64@0x406aa0>, <func: x86_64@0x404760>, <func: x86_64@0x404720>, <func: x86_64@0x40bc00>, <func: x86_64@0x40ba90>, <func: x86_64@0x40ba50>, <func: x86_64@0x408dd0>, <func: x86_64@0x408d90>, <func: x86_64@0x40aa70>, <func: x86_64@0x4067f0>, <func: x86_64@0x40c4b0>, <func: x86_64@0x40c3f0>, <func: x86_64@0x403520>, <func: x86_64@0x4034e0>, <func: x86_64@0x4034a0>, <func: x86_64@0x407330>, <func: x86_64@0x409e70>, <func: x86_64@0x4090c0>, <func: x86_64@0x409080>, <func: x86_64@0x40a9f0>, <func: x86_64@0x40a970>, <func: x86_64@0x40a930>, <func: x86_64@0x40a870>, <func: x86_64@0x405f60>, <func: x86_64@0x40ca60>, <func: x86_64@0x4082b0>, <func: x86_64@0x404d90>, <func: x86_64@0x409df0>, <func: x86_64@0x409c80>, <func: x86_64@0x409100>, <func: x86_64@0x405430>, <func: x86_64@0x4053f0>, <func: x86_64@0x4053b0>, <func: x86_64@0x405370>, <func: x86_64@0x405330>, <func: x86_64@0x407730>, <func: x86_64@0x4076f0>, <func: x86_64@0x406bd0>, <func: x86_64@0x406a60>, <func: x86_64@0x406a30>, <func: x86_64@0x4069f0>, <func: x86_64@0x403200>, <func: x86_64@0x4031c0>, <func: x86_64@0x403180>, <func: x86_64@0x40b060>, <func: x86_64@0x4074f0>, <func: x86_64@0x4074b0>, <func: x86_64@0x4073f0>, <func: x86_64@0x4073b0>, <func: x86_64@0x407370>, <func: x86_64@0x404e90>, <func: x86_64@0x404e50>, <func: x86_64@0x404e10>, <func: x86_64@0x404dd0>, <func: x86_64@0x403720>, <func: x86_64@0x4052b0>, <func: x86_64@0x405240>, <func: x86_64@0x404aa0>, <func: x86_64@0x404a60>, <func: x86_64@0x404a20>, <func: x86_64@0x40b450>, <func: x86_64@0x40b410>, <func: x86_64@0x403e60>, <func: x86_64@0x403e20>, <func: x86_64@0x403de0>, <func: x86_64@0x403da0>, <func: x86_64@0x403d60>, <func: x86_64@0x409140>, <func: x86_64@0x406ba0>, <func: x86_64@0x402b30>, <func: x86_64@0x402420>, <func: x86_64@0x409c40>, <func: x86_64@0x4098c0>, <func: x86_64@0x408130>, <func: x86_64@0x405da0>, <func: x86_64@0x405d60>, <func: x86_64@0x405d20>, <func: x86_64@0x40c070>, <func: x86_64@0x40be40>, <func: x86_64@0x40be00>, <func: x86_64@0x40bd80>, <func: x86_64@0x402750>, <func: x86_64@0x402710>, <func: x86_64@0x40c170>, <func: x86_64@0x40c130>, <func: x86_64@0x40c0f0>, <func: x86_64@0x40b910>, <func: x86_64@0x40b8d0>, <func: x86_64@0x40b890>, <func: x86_64@0x40b850>, <func: x86_64@0x408920>, <func: x86_64@0x4088e0>, <func: x86_64@0x4087a0>, <func: x86_64@0x401510>, <func: x86_64@0x4014d0>, <func: x86_64@0x402650>, <func: x86_64@0x402610>, <func: x86_64@0x403140>, <func: x86_64@0x403100>, <func: x86_64@0x4030c0>, <func: x86_64@0x403080>, <func: x86_64@0x403040>, <func: x86_64@0x40b190>, <func: x86_64@0x40b150>, <func: x86_64@0x407270>, <func: x86_64@0x407230>, <func: x86_64@0x4071f0>, <func: x86_64@0x4071b0>, <func: x86_64@0x406390>, <func: x86_64@0x404060>, <func: x86_64@0x404020>, <func: x86_64@0x403fe0>, <func: x86_64@0x4059a0>, <func: x86_64@0x401a30>, <func: x86_64@0x4092c0>, <func: x86_64@0x403d20>, <func: x86_64@0x403c60>, <func: x86_64@0x403c20>, <func: x86_64@0x40a430>, <func: x86_64@0x4089a0>, <func: x86_64@0x404320>, <func: x86_64@0x4023b0>, <func: x86_64@0x402370>, <func: x86_64@0x402340>, <func: x86_64@0x402300>, <func: x86_64@0x40dd70>, <func: x86_64@0x405ca0>, <func: x86_64@0x405c60>, <func: x86_64@0x405c20>, <func: x86_64@0x40cb10>, <func: x86_64@0x408c90>, <func: x86_64@0x4044a0>, <func: x86_64@0x404460>, <func: x86_64@0x404420>, <func: x86_64@0x4043e0>, <func: x86_64@0x4043a0>, <func: x86_64@0x404b60>, <func: x86_64@0x404b20>, <func: x86_64@0x404ae0>, <func: x86_64@0x403ca0>, <func: x86_64@0x402f90>, <func: x86_64@0x401ce0>, <func: x86_64@0x401ca0>, <func: x86_64@0x402980>, <func: x86_64@0x409540>, <func: x86_64@0x409500>, <func: x86_64@0x4094c0>, <func: x86_64@0x401ab0>, <func: x86_64@0x401a70>, <func: x86_64@0x4083e0>, <func: x86_64@0x4083a0>, <func: x86_64@0x401e10>, <func: x86_64@0x401dd0>, <func: x86_64@0x40b690>, <func: x86_64@0x408170>, <func: x86_64@0x4080b0>, <func: x86_64@0x408070>, <func: x86_64@0x407ff0>, <func: x86_64@0x407f70>, <func: x86_64@0x407f40>, <func: x86_64@0x407f00>, <func: x86_64@0x40bb80>, <func: x86_64@0x40bb40>, <func: x86_64@0x40bb00>, <func: x86_64@0x40bac0>, <func: x86_64@0x4061d0>, <func: x86_64@0x406190>, <func: x86_64@0x409b40>, <func: x86_64@0x406050>, <func: x86_64@0x406020>, <func: x86_64@0x405fe0>, <func: x86_64@0x4055f0>, <func: x86_64@0x40c9a0>, <func: x86_64@0x40c730>, <func: x86_64@0x40c6f0>, <func: x86_64@0x40c2b0>, <func: x86_64@0x40c270>, <func: x86_64@0x40ae70>, <func: x86_64@0x408fc0>, <func: x86_64@0x408360>, <func: x86_64@0x40a670>, <func: x86_64@0x40a570>, <func: x86_64@0x40a530>, <func: x86_64@0x40a470>, <func: x86_64@0x4041a0>, <func: x86_64@0x404160>, <func: x86_64@0x4040e0>, <func: x86_64@0x40d060>, <func: x86_64@0x4037a0>, <func: x86_64@0x402c60>, <func: x86_64@0x401390>, <func: x86_64@0x401350>, <func: x86_64@0x401310>, <func: x86_64@0x40a370>, <func: x86_64@0x407930>, <func: x86_64@0x4069b0>, <func: x86_64@0x406970>, <func: x86_64@0x406930>, <func: x86_64@0x4068f0>, <func: x86_64@0x4068b0>, <func: x86_64@0x406870>, <func: x86_64@0x40a1b0>, <func: x86_64@0x40a170>, <func: x86_64@0x40a130>, <func: x86_64@0x40a0f0>, <func: x86_64@0x4040a0>, <func: x86_64@0x40b390>, <func: x86_64@0x40b350>, <func: x86_64@0x403f20>, <func: x86_64@0x40dbf0>, <func: x86_64@0x40a2b0>, <func: x86_64@0x40a270>, <func: x86_64@0x40a230>, <func: x86_64@0x4070d0>, <func: x86_64@0x407090>, <func: x86_64@0x406f10>, <func: x86_64@0x40d0a0>, <func: x86_64@0x40d020>, <func: x86_64@0x406110>, <func: x86_64@0x409900>, <func: x86_64@0x405080>, <func: x86_64@0x405040>, <func: x86_64@0x408b90>, <func: x86_64@0x408b50>, <func: x86_64@0x408760>, <func: x86_64@0x408720>, <func: x86_64@0x4086e0>, <func: x86_64@0x4086a0>, <func: x86_64@0x408660>, <func: x86_64@0x409700>, <func: x86_64@0x4096c0>, <func: x86_64@0x402af0>, <func: x86_64@0x403340>, <func: x86_64@0x403300>, <func: x86_64@0x4032c0>, <func: x86_64@0x403f60>, <func: x86_64@0x40e520>, <func: x86_64@0x40c5f0>, <func: x86_64@0x40c000>, <func: x86_64@0x40aa30>, <func: x86_64@0x409c00>, <func: x86_64@0x409bc0>, <func: x86_64@0x407ec0>, <func: x86_64@0x407e40>, <func: x86_64@0x407e00>, <func: x86_64@0x407dc0>, <func: x86_64@0x40cfb0>]
```
This path is way too long. It has 341 function calls when we only have 25 characters in the string. To handle this, I added a depth counter and limited the DFS to 24 function calls. Now we can retrieve the path list:
```
[<func: x86_64@0x401080>, <func: x86_64@0x4079f0>, <func: x86_64@0x4079b0>, <func: x86_64@0x4072f0>, <func: x86_64@0x403920>, <func: x86_64@0x40d240>, <func: x86_64@0x4093c0>, <func: x86_64@0x409380>, <func: x86_64@0x407c90>, <func: x86_64@0x405e20>, <func: x86_64@0x405de0>, <func: x86_64@0x405da0>, <func: x86_64@0x405d60>, <func: x86_64@0x40ba50>, <func: x86_64@0x408dd0>, <func: x86_64@0x408d90>, <func: x86_64@0x40aa70>, <func: x86_64@0x40aa30>, <func: x86_64@0x409c00>, <func: x86_64@0x409bc0>, <func: x86_64@0x407ec0>, <func: x86_64@0x407e40>, <func: x86_64@0x407e00>, <func: x86_64@0x407dc0>, <func: x86_64@0x40cfb0>]
```
this retrieves the string:
```bash
ssssstsstsssssstssssssttt
```
This does not produce the correct answer for some reason, so I decided to play with the depth parameter until I found one that works.
```bash
ttsstsssstsssttt
```
On second thought, I probably could have included the change in arg2 as the weight of edges for the call graph to make a more sophisticated DFS, but this method managed to get a correct solution regardless.

In the end, this solution is cool and makes good use of binary ninja, but it took me significantly longer than the brute-force solution, so I think I chose the right method during the ctf. 
