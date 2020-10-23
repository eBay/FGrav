/************************************************************************
 Copyright 2020 eBay Inc.
 Author/Developer: Amir Langer

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 **************************************************************************/
function FG_Overlay_Java_Blocking() {
}

FG_Overlay_Java_Blocking.prototype.applyStyle = function(colorScheme, frame, samples) {

    return function (el) {
        var name = frame.name;
        if (blockingJavaCallsPrefixes.find(function (prefix) {
            return name.startsWith(prefix);
        })) {
           mark(el);
        }
        el.setAttribute("fill", colorScheme.colorFor(frame, samples));
    };
};

var blockingJavaCallsPrefixes = [
    "java/lang/Thread.sleep",
    "java/lang/Thread.yield",
    "java/lang/Thread.onSpinWait",
    "java/lang/Object.wait",
    "java/lang/UNIXProcess.forkAndExec",
    "java/lang/ProcessImpl.forkAndExec",
    "java/util/concurrent/locks/LockSupport.park",
    "java/util/concurrent/locks/LockSupport.park",
    "sun/misc/Unsafe.park",
    "jdk/internal/misc/Unsafe.park",
    "java/io/FileInputStream.read",
    "java/io/FileOutputStream.write",
    "java/io/RandomAccessFile.read",
    "java/io/RandomAccessFile.write",
    "java/net/Socket.connect",
    "java/net/DatagramSocket.connect",
    "java/net/PlainDatagramSocketImpl.connect",
    "java/net/PlainDatagramSocketImpl.peekData",
    "java/net/PlainDatagramSocketImpl.send",
    "java/net/PlainSocketImpl.socketAccept",
    "java/net/ServerSocket.implAccept",
    "java/net/SocketInputStream.socketRead0",
    "java/net/Socket$SocketInputStream.read",
    "java/net/SocketOutputStream.socketWrite0",
    "java/net/Socket$SocketOutputStream.write",
];

