# OtherBerry Semi-autonomous rc car

## About
coming eventually

## Building

Building and starting the bot is all managed thru ./bin/appManager.sh. A listing of all available commands are below.

### AppManager CLI Usage 
```sh
./bin/appManager.sh [command] ["list of raspi IDs"] [remotePassword]
```

* [command] - required. See below for the full list of commands
* ["list of raspi IDs"] - (remote only) list of pis to be managed. Does lookup into iplist in global.sh
* [remotePassword] - (remote only) ssh password for the device(s)

## Commands

### Local App Management Commands

#### *Startup*
| Command | Info | 
|---|---|
| **start** | start up both node and swim |
| **startNode** | start up just node |
| **startSwim** | start up just swim |

#### *Shut Down*
| Command | Info | 
|---|---|
| **stop** | stop node, swim, and chromium |
| **stopNode** | stop just node |
| **stopSwim** | stop just swim |

#### *Build*
| Command | Info | 
|---|---|
| **build** | build both node (npm) and swim (gradle) |
| **buildNode** | build node with npm |
| **buildSwim** | build swim with gradle and untar to dist|

#### *Package*
| Command | Info | 
|---|---|
| **package** | creates a gzip package file to the /dist directory of both node and swim codebase which is then used for remote deployment |
| **packageNode** | creates a package of just the node side of the app |
| **packageSwim** | creates a package of just the SWIM side of the app |

### Remote App Management Commands

#### *Misc.*

| Command | Info | 
|---|---|
| **testssh** | used to verify that you are able to use sshpass to ssh into the remote device |


#### *Full Publish*
All publish commands remove and recreate the remote target directory on each publish to ensure a clean build.

| Command | Info | 
|---|---|
| **publish** | Pushes the package file to each device and unpacks it into the runtime folder |
| **publishNode** | Pushes just the node the package file to each device and unpacks it into the runtime folder |
| **publishSwim** | Pushes just the swim the package file to each device and unpacks it into the runtime folder |

#### *Partial Updates*
Update commands do not clean or remove any existing folders or code on the remote device.

| Command | Info | 
|---|---|
| **all** | Does a full package, publish and build to each device. Removes target install and build folders before publish and restarts the device once complete |
| **startRemote** | Stops and restarts target device. Cleans out temp files and swim db before start up. |
| **stopRemote** | Stops target device. |
| **updateRemote** | Pushes the full package file to each remote device, unpacks over the existing runtime, builds swim again and restarts the device |


### Examples 

* Build, package, deploy the app to raspi3, 4, 5 , and 10 followed by restarting each device
```sh
./bin/appManager.sh all "3 10 4 5 6" MyPassWord
```

* Like the 'all' command but does not remove existing files or build node again. Faster then running all.
```sh
./bin/appManager.sh updateRemote "3 10 4 5 6" MyPassWord
```

* Stop and restart raspi3, 4, 5 , and 10
```sh
./bin/appManager.sh startRemote "3 10 4 5 6" MyPassWord
```
* Start up the full app locally
```sh
./bin/appManager.sh start
```

* Build the full app locally
```sh
./bin/appManager.sh build
```

* Build just the swim side of the app locally
```sh
./bin/appManager.sh buildSwim
```

